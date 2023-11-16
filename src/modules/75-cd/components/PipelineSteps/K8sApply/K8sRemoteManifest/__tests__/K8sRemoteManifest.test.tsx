import React from 'react'
import { Form } from 'formik'

import * as uuid from 'uuid'
import { render, findByText, waitFor, findAllByText } from '@testing-library/react'
import { MultiTypeInputType, Formik } from '@harness/uicore'
import userEvent from '@testing-library/user-event'

import { TestWrapper, findDialogContainer } from '@common/utils/testUtils'

import { ManifestDataType } from '@pipeline/components/ManifestSelection/Manifesthelper'
import type {
  ManifestTypes,
  ManifestStepInitData,
  K8sManifest
} from '@pipeline/components/ManifestSelection/ManifestInterface'

import K8sRemoteManifest from '../K8sRemoteManifest'

jest.mock('uuid')

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn().mockImplementation(() => ({ data: {} }))
}))

const commonProps = {
  stepName: 'Manifest details',
  expressions: [],

  handleSubmit: jest.fn(),
  selectedManifest: 'K8sManifest' as ManifestTypes,
  manifestIdsList: []
}
const initialValues: ManifestStepInitData = {
  connectorRef: 'acc.test',
  store: 'Git',
  selectedManifest: ManifestDataType.K8sManifest,
  manifestSource: {
    type: ManifestDataType.K8sManifest as K8sManifest,
    spec: {}
  },
  selectedType: ''
}

interface TestProps {
  initialValues?: {
    spec: ManifestStepInitData
  }
  isReadonly?: boolean
  store: string
  selectedManifest?: string
}

const TestComponent = (props: TestProps): React.ReactElement => (
  <TestWrapper>
    <Formik<{
      spec?: ManifestStepInitData
    }>
      formName="test-form"
      initialValues={{
        spec: { ...props.initialValues, store: props.store, selectedManifest: ManifestDataType.K8sManifest }
      }}
      onSubmit={jest.fn()}
    >
      {formik => (
        <Form>
          <K8sRemoteManifest
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
            {...commonProps}
            formik={formik}
            onSubmit={jest.fn()}
            isReadonly={!!props.isReadonly}
          />
        </Form>
      )}
    </Formik>
  </TestWrapper>
)

describe('Manifest K8sApply Details tests', () => {
  beforeEach(() => jest.spyOn(uuid, 'v5').mockReturnValue('MockedUUID'))

  test('initial rendering', async () => {
    const { container } = render(
      <TestWrapper>
        <TestComponent initialValues={{ spec: { ...initialValues } }} store="Git" isReadonly={false} />
      </TestWrapper>
    )
    const addFileButton = await findByText(container, 'cd.manifestSelectPlaceHolder')
    expect(addFileButton).toBeDefined()
    await userEvent.click(addFileButton)
    const portal = document.getElementsByClassName('bp3-dialog')[0]
    const manifestLabel = await waitFor(() =>
      findByText(portal as HTMLElement, 'pipeline.manifestType.manifestRepoType')
    )
    expect(manifestLabel).toBeDefined()
    const manifestTypes = await waitFor(() =>
      findAllByText(portal as HTMLElement, 'pipeline.manifestTypeLabels.K8sManifest')
    )
    expect(manifestTypes).toBeDefined()
    await userEvent.click(manifestTypes[0])
    const continueButton = await findByText(portal as HTMLElement, 'continue')
    expect(continueButton).toBeDefined()
    const crossIcon = container.querySelector('span[icon="cross"]')!
    await userEvent.click(crossIcon)
    expect(container).toBeDefined()
  })

  test('initial rendering empty', async () => {
    const { container } = render(
      <TestWrapper>
        <TestComponent store="" isReadonly={false} />
      </TestWrapper>
    )

    expect(container).toBeDefined()
  })

  test('initial values, paths/valuesPaths http', async () => {
    const { container } = render(
      <TestWrapper>
        <TestComponent
          store="Github"
          initialValues={{
            spec: {
              store: 'Github',
              selectedManifest: ManifestDataType.K8sManifest,
              manifestSource: {
                type: ManifestDataType.K8sManifest as K8sManifest,
                spec: {
                  store: {
                    type: 'Github',
                    spec: {
                      connectorRef: 'account.autosync',
                      branch: '/branch',
                      paths: ['c', 'd'],
                      gitFetchType: 'Branch'
                    }
                  }
                }
              },
              selectedType: '',
              valuesPaths: ['a', 'b']
            }
          }}
          isReadonly={false}
        />
      </TestWrapper>
    )
    const addFileButton = await findByText(container, 'cd.manifestSelectPlaceHolder')
    expect(addFileButton).toBeDefined()
    await userEvent.click(addFileButton)

    const portal = findDialogContainer()
    const manifestLabel = await waitFor(() =>
      findByText(portal as HTMLElement, 'pipeline.manifestType.manifestRepoType')
    )
    expect(manifestLabel).toBeDefined()
    const manifestTypes = await waitFor(() =>
      findAllByText(portal as HTMLElement, 'pipeline.manifestTypeLabels.K8sManifest')
    )
    expect(manifestTypes).toBeDefined()
    await userEvent.click(manifestTypes[0])
    const continueButton = await findByText(portal as HTMLElement, 'continue')
    expect(continueButton).toBeDefined()
    await userEvent.click(continueButton)

    const continueStoreButton = await findByText(portal as HTMLElement, 'continue')
    expect(continueStoreButton).toBeEnabled()
    await userEvent.click(continueStoreButton)
    const crossIcon = await waitFor(() => container.querySelector('span[icon="cross"]')!)
    await userEvent.click(crossIcon)

    expect(container).toBeDefined()
  })
})
