/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, findAllByText, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as pipelineNg from 'services/pipeline-ng'
import { mockRepos, mockBranches, gitConnectorMock } from '@gitsync/components/GitSyncForm/__tests__/mockdata'
import { ResourceType } from '@common/interfaces/GitSyncInterface'
import routes from '@common/RouteDefinitions'
import { accountPathProps, orgPathProps, pipelineModuleParams, projectPathProps } from '@common/utils/routeUtils'
import { TestWrapper } from '@common/utils/testUtils'
import MoveResource from '../MoveResource'
import { MigrationType } from '../MigrateUtils'

jest.mock('services/pipeline-ng', () => ({
  moveConfigsPromise: jest.fn().mockImplementation(() => Promise.resolve({ status: 'SUCCESS' })),
  inputSetMoveConfigPromise: jest.fn().mockImplementation(() => Promise.resolve({ status: 'SUCCESS' }))
}))

const getGitConnector = jest.fn(() => Promise.resolve(gitConnectorMock))
const fetchRepos = jest.fn(() => Promise.resolve(mockRepos))
const fetchBranches = jest.fn(() => Promise.resolve(mockBranches))

jest.mock('services/cd-ng', () => ({
  getConnectorListV2Promise: jest.fn(() => Promise.resolve(gitConnectorMock)),
  moveServiceConfigsPromise: jest.fn(() => Promise.resolve({ status: 'SUCCESS' })),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: gitConnectorMock.data.content[0], refetch: getGitConnector, loading: false }
  }),
  useGetListOfReposByRefConnector: jest.fn().mockImplementation(() => {
    return { data: mockRepos, refetch: fetchRepos, loading: false }
  }),
  useGetListOfBranchesByRefConnectorV2: jest.fn().mockImplementation(() => {
    return { data: mockBranches, refetch: fetchBranches }
  }),
  useGetSettingsList: jest.fn().mockImplementation(() => {
    return { data: { data: [] } }
  })
}))

const TEST_PIPELINES_PATH = routes.toPipelines({
  ...accountPathProps,
  ...orgPathProps,
  ...projectPathProps,
  ...pipelineModuleParams
})

const TEST_PATH_PARAMS = {
  accountId: 'testAcc',
  orgIdentifier: 'testOrg',
  projectIdentifier: 'test',
  module: 'cd'
}

const onSuccess = jest.fn()
const onFailure = jest.fn()
const onCancelClick = jest.fn()

const pipelineInitialValues = {
  branch: '',
  connectorRef: '',
  description: '',
  filePath: '',
  identifier: 'test_pipeline',
  name: 'test pipeline'
}

const mockInitialValues = {
  branch: 'master',
  connectorRef: 'account.SunnyAcctScopeRepoTypeGit',
  description: '',
  filePath: '',
  identifier: 'is_2',
  name: 'is 2',
  repoName: 'sunnykesh-gitSync'
}

describe('Move Resource to Remote', () => {
  beforeEach(() => {
    onSuccess.mockReset()
    onFailure.mockReset()
    onCancelClick.mockReset()
  })

  test('initial rendering snapshot testing for pipeline', async () => {
    const { container, getByText } = render(
      <TestWrapper path={TEST_PIPELINES_PATH} pathParams={TEST_PATH_PARAMS}>
        <MoveResource
          resourceType={ResourceType.PIPELINES}
          migrationType={MigrationType.INLINE_TO_REMOTE}
          initialValues={pipelineInitialValues}
        />
      </TestWrapper>
    )
    expect(getByText('name')).toBeInTheDocument()
    // Git fields should be enabled for pipelines
    const connectorSelector = container.querySelector('button[data-testid="cr-field-connectorRef"]')
    expect(connectorSelector).not.toHaveAttribute('disabled')
    const moveButton = getByText('common.moveToGit')
    await userEvent.click(moveButton)
    await waitFor(() => expect(getByText('validation.sshConnectorRequired')).toBeInTheDocument())

    expect(container).toMatchSnapshot()
  })

  test('Validating connector selection and form validation for new branch input', async () => {
    const { container, getByText } = render(
      <TestWrapper path={TEST_PIPELINES_PATH} pathParams={TEST_PATH_PARAMS}>
        <MoveResource
          resourceType={ResourceType.PIPELINES}
          migrationType={MigrationType.INLINE_TO_REMOTE}
          initialValues={pipelineInitialValues}
        />
      </TestWrapper>
    )
    expect(getByText('name')).toBeInTheDocument()
    // Git fields should be enabled for pipelines
    const connectorSelector = container.querySelector('button[data-testid="cr-field-connectorRef"]')
    expect(connectorSelector).not.toHaveAttribute('disabled')
    fireEvent.click(connectorSelector!)
    // selecting a git connector
    await act(async () => {
      const connectorSelectorDialog = document.getElementsByClassName('bp3-dialog')[0]
      const githubConnector = await findAllByText(connectorSelectorDialog as HTMLElement, 'ValidGithubRepo')
      expect(githubConnector).toBeTruthy()
      fireEvent.click(githubConnector?.[0])
      const applySelected = getByText('entityReference.apply')
      await act(async () => {
        fireEvent.click(applySelected)
      })
    })
    expect(connectorSelector).toMatchSnapshot()
    expect(screen.queryByText('gitsync.baseBranchToFork')).not.toBeInTheDocument()
    // Clicking new branch radio button
    const newBranchRadioBtn = document.querySelector('[data-test="newBranchRadioBtn"]')
    act(() => {
      fireEvent.click(newBranchRadioBtn!)
    })
    expect(screen.queryByText('gitsync.baseBranchToFork')).toBeInTheDocument()
    const moveButton = getByText('common.moveToGit')
    await userEvent.click(moveButton)
    expect(screen.queryByText('common.git.validation.branchRequired')).toBeInTheDocument()
  })

  test('testing for Input set should have pre-filled and disabled git info and call move API', async () => {
    const { container, getByText } = render(
      <TestWrapper path={TEST_PIPELINES_PATH} pathParams={TEST_PATH_PARAMS}>
        <MoveResource
          resourceType={ResourceType.INPUT_SETS}
          migrationType={MigrationType.INLINE_TO_REMOTE}
          initialValues={mockInitialValues}
          extraQueryParams={{
            inputSetIdentifier: 'is_2',
            name: 'is 2',
            pipelineIdentifier: 'bugbash_test'
          }}
          onSuccess={onSuccess}
        />
      </TestWrapper>
    )
    expect(getByText('name')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
    // Git fields should be also disabled for input set
    const connectorSelector = container.querySelector('button[data-testid="cr-field-connectorRef"]')
    expect(connectorSelector).toHaveAttribute('disabled')

    const moveButton = getByText('common.moveToGit')
    await userEvent.click(moveButton)
    await waitFor(() => expect(getByText('pipeline.moveSuccessMessage')).toBeDefined())
    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  test('clicking on cancel button should call onCancelClick prop function', async () => {
    const { getByText } = render(
      <TestWrapper path={TEST_PIPELINES_PATH} pathParams={TEST_PATH_PARAMS}>
        <MoveResource
          resourceType={ResourceType.PIPELINES}
          migrationType={MigrationType.INLINE_TO_REMOTE}
          onCancelClick={onCancelClick}
        />
      </TestWrapper>
    )

    const cancelButton = getByText('cancel')
    await userEvent.click(cancelButton)
    expect(onCancelClick).toHaveBeenCalled()
    expect(onCancelClick).toHaveBeenCalledTimes(1)
  })

  test('when onCancelClick prop is not passed - clicking on cancel button should call onCancelClick prop function', async () => {
    const { getByText } = render(
      <TestWrapper path={TEST_PIPELINES_PATH} pathParams={TEST_PATH_PARAMS}>
        <MoveResource resourceType={ResourceType.PIPELINES} migrationType={MigrationType.INLINE_TO_REMOTE} />
      </TestWrapper>
    )

    const cancelButton = getByText('cancel')
    await userEvent.click(cancelButton)
    expect(onCancelClick).not.toHaveBeenCalled()
    expect(onCancelClick).toHaveBeenCalledTimes(0)
  })

  test('onSuccess should not be called on click on moveToGit button without succcesHandler', async () => {
    const { getByText } = render(
      <TestWrapper path={TEST_PIPELINES_PATH} pathParams={TEST_PATH_PARAMS}>
        <MoveResource
          resourceType={ResourceType.PIPELINES}
          migrationType={MigrationType.INLINE_TO_REMOTE}
          onCancelClick={onCancelClick}
          initialValues={pipelineInitialValues}
          extraQueryParams={{
            pipelineIdentifier: 'bugbash_test'
          }}
        />
      </TestWrapper>
    )

    const moveButton = getByText('common.moveToGit')
    await userEvent.click(moveButton)

    await waitFor(() => expect(onSuccess).not.toHaveBeenCalled())
    expect(onSuccess).toHaveBeenCalledTimes(0)
  })

  test('when move throws error without responseMessages', async () => {
    jest.spyOn(pipelineNg, 'inputSetMoveConfigPromise').mockImplementation((): any => {
      return Promise.reject({
        status: 'ERROR',
        code: 'INVALID_REQUEST',
        message: 'Invalid Request: Error while moving inputSet'
      })
    })

    const { getByText } = render(
      <TestWrapper path={TEST_PIPELINES_PATH} pathParams={TEST_PATH_PARAMS}>
        <MoveResource
          resourceType={ResourceType.INPUT_SETS}
          migrationType={MigrationType.INLINE_TO_REMOTE}
          onCancelClick={onCancelClick}
          onSuccess={onSuccess}
          onFailure={onFailure}
          initialValues={mockInitialValues}
        />
      </TestWrapper>
    )

    const moveButton = getByText('common.moveToGit')
    await userEvent.click(moveButton)
    await waitFor(() => expect(getByText('Invalid Request: Error while moving inputSet')).toBeDefined())
    await waitFor(() => expect(onFailure).toHaveBeenCalled())
    expect(onFailure).toHaveBeenCalledTimes(1)
  })

  test('when move throws error without message and responseMessages', async () => {
    jest.spyOn(pipelineNg, 'inputSetMoveConfigPromise').mockImplementation((): any => {
      return Promise.reject({
        status: 'ERROR'
      })
    })

    const { getByText } = render(
      <TestWrapper path={TEST_PIPELINES_PATH} pathParams={TEST_PATH_PARAMS}>
        <MoveResource
          resourceType={ResourceType.INPUT_SETS}
          migrationType={MigrationType.INLINE_TO_REMOTE}
          onCancelClick={onCancelClick}
          onSuccess={onSuccess}
          onFailure={onFailure}
          initialValues={mockInitialValues}
        />
      </TestWrapper>
    )

    const moveButton = getByText('common.moveToGit')
    await userEvent.click(moveButton)
    await waitFor(() => expect(getByText('somethingWentWrong')).toBeDefined())
    await waitFor(() => expect(onFailure).toHaveBeenCalled())
    expect(onFailure).toHaveBeenCalledTimes(1)
    expect(onSuccess).toHaveBeenCalledTimes(0)
  })

  test('when move throws error with responseMessages', async () => {
    const errorResponse = {
      status: 'ERROR',
      code: 'INVALID_REQUEST',
      message: 'Invalid Request: Error while moving pipeline',
      responseMessages: [
        {
          code: 'HINT',
          level: 'INFO',
          message: 'Please check if pipeline you are trying to move exist in Github'
        },
        {
          code: 'EXPLANATION',
          level: 'INFO',
          message: 'File you are trying to move already exists in git'
        },
        {
          code: 'SCM_CONFLICT_ERROR_V2',
          level: 'ERROR',
          message: 'Error while moving pipeline to remote because file already exist'
        }
      ]
    }

    jest.spyOn(pipelineNg, 'inputSetMoveConfigPromise').mockImplementation((): any => {
      return Promise.reject(errorResponse)
    })

    const { getByText, container } = render(
      <TestWrapper path={TEST_PIPELINES_PATH} pathParams={TEST_PATH_PARAMS}>
        <MoveResource
          resourceType={ResourceType.INPUT_SETS}
          migrationType={MigrationType.INLINE_TO_REMOTE}
          onCancelClick={onCancelClick}
          onSuccess={onSuccess}
          onFailure={onFailure}
          initialValues={mockInitialValues}
        />
      </TestWrapper>
    )

    const moveButton = getByText('common.moveToGit')
    await userEvent.click(moveButton)
    await waitFor(() =>
      expect(getByText('Error while moving pipeline to remote because file already exist')).toBeDefined()
    )
    expect(getByText('common.errorHandler.issueCouldBe')).toBeDefined()
    expect(getByText('Error while moving pipeline to remote because file already exist')).toBeDefined()
    expect(container).toMatchSnapshot()
    expect(onFailure).toHaveBeenCalledTimes(1)
    expect(onSuccess).toHaveBeenCalledTimes(0)
  })

  test('Test for move service', async () => {
    const { getByText } = render(
      <TestWrapper path={TEST_PIPELINES_PATH} pathParams={TEST_PATH_PARAMS}>
        <MoveResource
          resourceType={ResourceType.SERVICE}
          migrationType={MigrationType.INLINE_TO_REMOTE}
          onCancelClick={onCancelClick}
          onSuccess={onSuccess}
          onFailure={onFailure}
          initialValues={mockInitialValues}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('common.git.commitMessage')).toBeDefined())
    const moveButton = getByText('common.moveToGit')
    act(async () => {
      await userEvent.click(moveButton)
      expect(onFailure).toHaveBeenCalledTimes(0)
      expect(onSuccess).toHaveBeenCalledTimes(1)
    })
  })
})
