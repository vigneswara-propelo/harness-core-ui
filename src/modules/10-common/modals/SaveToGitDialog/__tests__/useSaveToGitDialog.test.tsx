import React from 'react'
import { Button } from '@harness/uicore'
import { act, fireEvent, render, findByText, queryByAttribute, waitFor } from '@testing-library/react'
import { TestWrapper, queryByNameAttribute } from '@modules/10-common/utils/testUtils'
import { StoreType } from '@modules/10-common/constants/GitSyncTypes'
import routes from '@modules/10-common/RouteDefinitions'
import { InputTypes, fillAtForm } from '@modules/10-common/utils/JestFormHelper'
import { useSaveToGitDialog } from '../useSaveToGitDialog'
import {
  dummyGitDetails,
  dummyStoreMetadata,
  mockBranches,
  pipelinePayload,
  saveResponseWithOPAError
} from './mockData'

const gitTestPath = routes.toPipelineStudio({
  projectIdentifier: 'harness',
  orgIdentifier: 'TEST_ORG',
  pipelineIdentifier: 'jestTest',
  accountId: 'TEST_ACCOUNT_ID',
  module: 'cd'
})

const gitAppStore = { supportingGitSimplification: true }

const gitPathParams = {
  accountId: 'TEST_ACCOUNT_ID',
  orgIdentifier: 'TEST_ORG',
  projectIdentifier: 'TEST_PROJECT',
  pipelineIdentifier: 'jestTest',
  module: 'cd'
}

const gitQueryParams = {
  branch: 'mainBranchName',
  repoName: 'harnessRepoName',
  connectorRef: 'harness',
  storeType: StoreType.REMOTE
}

const gitSimplificationTestProps = {
  path: gitTestPath,
  pathParams: gitPathParams,
  queryParams: gitQueryParams,
  defaultAppStoreValues: gitAppStore
}

let saveToGitFormV2Handler = jest.fn()
const createPRV2Mock = jest.fn(() => Promise.resolve({ status: 'error' }))

// const saveToGitFormV2Handler = jest.fn(() => async (gitData: GitData, payload?: Record<string, any>): Promise<any> => {
//   console.log('___gitData', gitData)
//   console.log('___ onSuccess : payload', payload)
//   const response = await Promise.resolve()
//   return response
// })

function MockComponentForUseSaveToGitDialogTesting(): React.ReactElement | null {
  const { openSaveToGitDialog } = useSaveToGitDialog({
    onSuccess: saveToGitFormV2Handler
  })

  const saveGitEntity = () => {
    openSaveToGitDialog({
      isEditing: true,
      resource: {
        type: 'Pipelines',
        name: 'jestTest',
        identifier: 'jestTest',
        gitDetails: dummyGitDetails,
        storeMetadata: dummyStoreMetadata
      },
      payload: pipelinePayload
    })
  }

  return <Button text={'save'} data-testid="btnToSaveToGitModal" onClick={saveGitEntity} />
}

const fetchBranches = jest.fn(() => Promise.resolve(mockBranches))

jest.mock('services/cd-ng', () => ({
  useGetListOfBranchesByRefConnectorV2: jest.fn().mockImplementation(() => {
    return { data: mockBranches, refetch: fetchBranches }
  }),
  useCreatePR: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useCreatePRV2: jest.fn().mockImplementation(() => ({ mutate: createPRV2Mock })),
  useGetFileContent: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetFileByBranch: jest.fn().mockImplementation(() => ({ mutate: jest.fn() }))
}))

describe('Git simplication without OPA warning/error', () => {
  test('Save to git with createPR option without OPA warning/error', async () => {
    saveToGitFormV2Handler = jest.fn(() => Promise.resolve({ ...saveResponseWithOPAError, governanceMetadata: {} }))
    const { getByTestId } = render(
      <TestWrapper {...gitSimplificationTestProps}>
        <MockComponentForUseSaveToGitDialogTesting />
      </TestWrapper>
    )

    const btnToChangeVal = getByTestId('btnToSaveToGitModal')
    await act(async () => {
      fireEvent.click(btnToChangeVal!)
    })

    const saveToGitDialog = document?.querySelector('.gitDialog') as HTMLFormElement
    const saveToGitForm = document?.querySelector('form') as HTMLFormElement
    const gitModalHeader = await findByText(saveToGitDialog, 'common.git.saveResourceLabel')
    const selectedBranch = await findByText(saveToGitDialog, dummyGitDetails?.branch)
    const createPRCheckbox = document.querySelectorAll('[type="checkbox"]')[0] as HTMLInputElement

    expect(gitModalHeader).toBeInTheDocument()
    expect(selectedBranch).toBeInTheDocument()

    expect(createPRCheckbox).toBeEnabled()
    expect(createPRCheckbox).not.toBeChecked()

    const newBranchRadioBtn = document.querySelector('[data-test="newBranchRadioBtn"]')
    act(() => {
      fireEvent.click(newBranchRadioBtn!)
    })
    // New branch input should be autofilled with default value
    expect((queryByNameAttribute('branch', saveToGitForm) as HTMLInputElement)?.value).toBe('jest-testing-patch')
    await act(async () => {
      fillAtForm([
        {
          container: saveToGitForm,
          fieldId: 'branch',
          type: InputTypes.TEXTFIELD,
          value: 'testBranch'
        },
        {
          container: saveToGitForm,
          fieldId: 'createPr',
          type: InputTypes.CHECKBOX,
          value: true
        }
      ])
      const submitBtn = await findByText(saveToGitForm, 'save')
      fireEvent.click(submitBtn)
    })
    // Create PR should be enabled
    const prCheckbox = queryByAttribute('name', saveToGitForm, 'createPr')
    expect(prCheckbox).not.toBeDisabled()
    expect(saveToGitFormV2Handler).toBeCalled()
    await waitFor(() => expect(createPRV2Mock).toBeCalled())

    const createPRLabel = await findByText(document.body, 'common.gitSync.unableToCreatePR')
    expect(createPRLabel).toBeInTheDocument()
    const modalCloseButon = document?.querySelector('[data-icon="cross"]')
    act(() => {
      fireEvent.click(modalCloseButon!)
    })
    expect(createPRLabel).not.toBeInTheDocument()
  })

  test('Save to git with createPR option should not create PR with OPA warning', async () => {
    saveToGitFormV2Handler = jest.fn(() => Promise.resolve({ ...saveResponseWithOPAError }))
    const { getByTestId } = render(
      <TestWrapper {...gitSimplificationTestProps}>
        <MockComponentForUseSaveToGitDialogTesting />
      </TestWrapper>
    )

    const btnToChangeVal = getByTestId('btnToSaveToGitModal')
    await act(async () => {
      fireEvent.click(btnToChangeVal!)
    })

    const saveToGitDialog = document?.querySelector('.gitDialog') as HTMLFormElement
    const saveToGitForm = document?.querySelector('form') as HTMLFormElement
    const gitModalHeader = await findByText(saveToGitDialog, 'common.git.saveResourceLabel')
    const selectedBranch = await findByText(saveToGitDialog, dummyGitDetails?.branch)
    const createPRCheckbox = document.querySelectorAll('[type="checkbox"]')[0] as HTMLInputElement

    expect(gitModalHeader).toBeInTheDocument()
    expect(selectedBranch).toBeInTheDocument()

    expect(createPRCheckbox).toBeEnabled()
    expect(createPRCheckbox).not.toBeChecked()

    const newBranchRadioBtn = document.querySelector('[data-test="newBranchRadioBtn"]')
    act(() => {
      fireEvent.click(newBranchRadioBtn!)
    })
    // New branch input should be autofilled with default value
    expect((queryByNameAttribute('branch', saveToGitForm) as HTMLInputElement)?.value).toBe('jest-testing-patch')
    await act(async () => {
      fillAtForm([
        {
          container: saveToGitForm,
          fieldId: 'branch',
          type: InputTypes.TEXTFIELD,
          value: 'testBranch'
        },
        {
          container: saveToGitForm,
          fieldId: 'createPr',
          type: InputTypes.CHECKBOX,
          value: true
        }
      ])
      const submitBtn = await findByText(saveToGitForm, 'save')
      fireEvent.click(submitBtn)
    })
    // Create PR should be enabled
    const prCheckbox = queryByAttribute('name', saveToGitForm, 'createPr')
    expect(prCheckbox).not.toBeDisabled()
    expect(saveToGitFormV2Handler).toBeCalled()
    await waitFor(() => expect(createPRV2Mock).toBeCalled())

    const createPRLabel = await findByText(document.body, 'common.gitSync.unableToCreatePR')
    expect(createPRLabel).toBeInTheDocument()
    const modalCloseButon = document?.querySelector('[data-icon="cross"]')
    act(() => {
      fireEvent.click(modalCloseButon!)
    })
    expect(createPRLabel).not.toBeInTheDocument()
  })
})
