import React from 'react'
import { fireEvent, render, waitFor, within } from '@testing-library/react'
import { AllowedTypes, MultiTypeInputType } from '@harness/uicore'
import userEvent from '@testing-library/user-event'
import { Formik } from 'formik'
import * as codeServices from 'services/code'
import { findDialogContainer, findPopoverContainer } from '@modules/10-common/utils/testUtils'
import { TestWrapper } from '@common/utils/testUtils'
import { ConnectionType } from '@modules/70-pipeline/components/PipelineInputSetForm/CICodebaseInputSetForm'
import CloneCodebaseForm from '../CloneCodebaseForm'
import { getConnectorWidth } from '../CloneCodebaseForm.utils'

const getString = (key: any): any => {
  return key
}

export const gitnessRepos = [
  {
    uid: 'nextgenui'
  },
  {
    uid: 'learning'
  }
]

jest.mock('services/code', () => ({
  useListRepos: jest.fn().mockImplementation(() => {
    return {
      data: gitnessRepos,
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  })
}))

function WrapperComponent({ isCodeEnabled }: { isCodeEnabled: boolean }): JSX.Element {
  const initialValues = {
    identifier: '',
    name: '',
    description: '',
    cloneCodebase: true
  }
  return (
    <TestWrapper>
      <Formik initialValues={initialValues} onSubmit={jest.fn()}>
        {({ values, setFieldValue }) => (
          <CloneCodebaseForm
            {...{
              values,
              setFieldValue,
              connectorUrl: '',
              connectionType: ConnectionType.Account,
              setConnectionType: jest.fn(),
              setConnectorUrl: jest.fn(),
              connector: undefined,
              connectorWidth: 402,
              getString,
              errors: {},
              loading: false,
              accountId: 'accountId',
              projectIdentifier: 'projectIdentifier',
              orgIdentifier: 'orgIdentifier',
              repoIdentifier: undefined,
              branch: undefined,
              expressions: [''],
              isReadonly: false,
              setCodebaseRuntimeInputs: jest.fn(),
              codebaseRuntimeInputs: {},
              allowableTypes: [
                MultiTypeInputType.FIXED,
                MultiTypeInputType.EXPRESSION,
                MultiTypeInputType.RUNTIME
              ] as AllowedTypes,
              configureOptionsProps: { hideExecutionTimeField: true },
              isCodeEnabled
            }}
          />
        )}
      </Formik>
    </TestWrapper>
  )
}

describe('CloneCodebaseForm utils tests', () => {
  test('getConnectorWidth with some connectorWidth and connectoreRef values', () => {
    expect(getConnectorWidth({ connectorWidth: 460, connectorRef: 'gitsync2' })).toBe(460)
    expect(getConnectorWidth({ connectorWidth: 460, connectorRef: '<+input>' })).toBe(402)
    expect(getConnectorWidth({ connectorRef: '<+input>' })).toBe(undefined)
  })
})

describe('CloneCodebaseForm tests', () => {
  test('initial render with ff on', async () => {
    const { container, getByText } = render(<WrapperComponent isCodeEnabled />)
    expect(container).toMatchSnapshot()

    expect(getByText('common.gitProvider')).toBeInTheDocument()
    expect(getByText('common.harnessCodeRepo')).toBeInTheDocument()
    expect(getByText('common.thirdPartyGitProvider')).toBeInTheDocument()
    expect(getByText('common.selectRepository')).toBeInTheDocument()
  })

  test('initial render with ff off', async () => {
    const { queryByText } = render(<WrapperComponent isCodeEnabled={false} />)

    expect(queryByText('common.harnessCodeRepo')).not.toBeInTheDocument()
    expect(queryByText('common.thirdPartyGitProvider')).not.toBeInTheDocument()
    expect(queryByText('connector')).toBeInTheDocument()
    expect(queryByText('common.repositoryName')).toBeInTheDocument()
  })

  test('harness code repos still loading', async () => {
    jest.spyOn(codeServices, 'useListRepos').mockImplementationOnce(() => ({ loading: true } as any))
    const { container } = render(<WrapperComponent isCodeEnabled />)

    const selectRepo = container.querySelector('input[name="repositoryName"]')
    await userEvent.click(selectRepo as HTMLElement)
    const popover = findPopoverContainer() as HTMLElement
    const repo = within(popover).getByText('common.loading')
    expect(repo).toBeInTheDocument()
  })

  test('select repository when harness code selected', async () => {
    const { container, getByText } = render(<WrapperComponent isCodeEnabled />)

    const selectRepo = container.querySelector('input[name="repositoryName"]')
    await userEvent.click(selectRepo as HTMLElement)
    const popover = findPopoverContainer() as HTMLElement
    const repo = within(popover).getByText('nextgenui')
    await userEvent.click(repo as HTMLElement)
    expect(getByText('nextgenui')).toBeInTheDocument()
  })

  test('set repository as runtime input harness code selected', async () => {
    const { getByText, getAllByTestId } = render(<WrapperComponent isCodeEnabled />)

    expect(getAllByTestId('multi-type-button')).toHaveLength(1)
    fireEvent.click(getAllByTestId('multi-type-button')[0])

    expect(getByText('Runtime input')).toBeInTheDocument()
    fireEvent.click(getByText('Runtime input'))
    waitFor(() => {
      expect(getByText('<+input>')).toBeInTheDocument()
    })
  })

  test('switch to third-party git provider and open connector modal', async () => {
    const { container, getByText } = render(<WrapperComponent isCodeEnabled />)

    fireEvent.click(getByText('common.thirdPartyGitProvider'))
    expect(getByText('connector')).toBeInTheDocument()
    expect(getByText('common.repositoryName')).toBeInTheDocument()

    const selectConnector = container.querySelector('[data-testid="cr-field-connectorRef"]')!
    fireEvent.click(selectConnector)
    const dialog = findDialogContainer() as HTMLElement
    expect(dialog).toBeInTheDocument()
  })

  test('switch to third-party git provider and type repo name', async () => {
    const { container, getByText } = render(<WrapperComponent isCodeEnabled />)

    fireEvent.click(getByText('common.thirdPartyGitProvider'))
    fireEvent.change(container.querySelector('input[name="repoName"]')!, { target: { value: 'repo1' } })
    waitFor(() => {
      expect(getByText('repo1')).toBeInTheDocument()
    })
  })
})
