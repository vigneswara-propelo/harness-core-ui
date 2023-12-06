/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, screen, waitFor, getAllByRole, within } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, executionPathProps, pipelinePathProps } from '@common/utils/routeUtils'
import taskLogsResponse from '@common/components/DelegateTaskLogs/jsonpayload.json'
import { StepDetails } from '../StepDetails'

const refetchLogs = jest.fn()
jest.mock('services/portal', () => ({
  useGetTasksLog: jest.fn(() => ({ loading: false, data: taskLogsResponse, refetch: refetchLogs }))
}))

const accountId = 'testAccount'
const orgIdentifier = 'testOrg'
const projectIdentifier = 'testProject'

const TEST_PATH = routes.toExecution({
  ...accountPathProps,
  ...pipelinePathProps,
  ...executionPathProps,
  source: 'executions'
})
const TEST_PATH_PARAMS = {
  accountId,
  orgIdentifier,
  projectIdentifier,
  pipelineIdentifier: 'testPipeline',
  executionIdentifier: 'testExec'
}

describe('StepDetails tests', () => {
  test('should render fine when delegateInfoList IS NOT empty inside step prop', async () => {
    render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS}>
        <StepDetails
          step={{ startTs: 123, endTs: 456, name: 'step name', delegateInfoList: [{ taskId: 'abc', taskName: 'ABC' }] }}
          executionMetadata={{
            accountId,
            orgIdentifier,
            projectIdentifier
          }}
        />
      </TestWrapper>
    )

    const delegateTaskName = screen.getByText('common.delegateForTask')
    expect(delegateTaskName).toBeInTheDocument()

    const delegateSelectionLogsLink = screen.getByText('common.logs.delegateSelectionLogs')
    expect(delegateSelectionLogsLink).toBeInTheDocument()

    const viewDelegateTaskLogsBtn = screen.getByText('common.viewText common.logs.delegateTaskLogs')
    expect(viewDelegateTaskLogsBtn).toBeInTheDocument()

    const dialogs = document.getElementsByClassName('bp3-dialog')
    expect(dialogs).toHaveLength(0)
    fireEvent.click(viewDelegateTaskLogsBtn)
    await waitFor(() => expect(dialogs).toHaveLength(1))

    const delegateTaskLogsDialog = dialogs[0] as HTMLElement

    expect(getAllByRole(delegateTaskLogsDialog, 'row')).toHaveLength(taskLogsResponse.resource.content.length + 1)
  })

  test('should render fine when delegateInfoList IS empty inside step prop and stepDetails IS NOT empty', async () => {
    render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS}>
        <StepDetails
          step={{
            startTs: 123,
            endTs: 456,
            name: 'step name',
            delegateInfoList: [],
            stepDetails: {
              'Artifact Step': {
                stepDelegateInfos: [
                  {
                    taskId: 'KJOruTLPQfq35VaR_j5abc',
                    taskName: 'Artifact Task: primary'
                  }
                ]
              },
              'Config Files Step': {
                stepDelegateInfos: [
                  {
                    taskId: 'KJOruTLPQfq35VaR_j5def',
                    taskName: 'Config File Task: config'
                  }
                ]
              }
            }
          }}
          executionMetadata={{
            accountId,
            orgIdentifier,
            projectIdentifier
          }}
        />
      </TestWrapper>
    )

    const delegateTaskNames = screen.getAllByText('common.delegateForTask')
    expect(delegateTaskNames).toHaveLength(2)

    const delegateSelectionLogsLinks = screen.getAllByText('common.logs.delegateSelectionLogs')
    expect(delegateSelectionLogsLinks).toHaveLength(2)

    const viewDelegateTaskLogsBtn = screen.getByText('common.viewText common.logs.delegateTaskLogs')
    expect(viewDelegateTaskLogsBtn).toBeInTheDocument()

    const dialogs = document.getElementsByClassName('bp3-dialog')
    expect(dialogs).toHaveLength(0)
    fireEvent.click(viewDelegateTaskLogsBtn)
    await waitFor(() => expect(dialogs).toHaveLength(1))

    const delegateTaskLogsDialog = dialogs[0] as HTMLElement

    expect(getAllByRole(delegateTaskLogsDialog, 'row')).toHaveLength(taskLogsResponse.resource.content.length + 1)

    expect(getAllByRole(delegateTaskLogsDialog, 'columnheader')).toHaveLength(3)
    const allRows = getAllByRole(delegateTaskLogsDialog, 'row')
    expect(allRows).toHaveLength(4)
  })

  test('should render post timeout action and manual intervention information', async () => {
    const { getByText } = render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS}>
        <StepDetails
          step={{
            startTs: 123,
            endTs: 456,
            name: 'step name'
          }}
          executionMetadata={{
            accountId,
            orgIdentifier,
            projectIdentifier
          }}
          interruptHistoryData={{
            interruptId: 'dGR1K0cSQpa66pIVB80tTA',
            tookEffectAt: 1696536143668,
            interruptType: 'IGNORE',
            interruptConfig: {
              issuedBy: {
                issueTime: 1696536143000,
                manualIssuer: {
                  email_id: 'user@abc.com',
                  user_id: 'User Name',
                  type: 'USER',
                  identifier: 'qUaLKpHcTOS3ThJVG2bwIw'
                }
              }
            }
          }}
        />
      </TestWrapper>
    )

    expect(getByText('pipeline.failureStrategies.fieldLabels.failureStrategyApplied:')).toBeInTheDocument()
    expect(getByText('pipeline.failureStrategies.appliedBy:')).toBeInTheDocument()
    expect(getByText('IGNORE')).toBeInTheDocument()
    expect(getByText(/user@abc\.com/)).toBeInTheDocument()
  })
  test('should render fine when retryInterval IS NOT empty inside step prop', async () => {
    render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS}>
        <StepDetails
          step={{
            startTs: 123,
            endTs: 456,
            name: 'step name',
            stepParameters: { spec: { retryInterval: { timeoutString: '10m' } } },
            delegateInfoList: [{ taskId: 'abc', taskName: 'ABC' }]
          }}
          executionMetadata={{
            accountId,
            orgIdentifier,
            projectIdentifier
          }}
        />
      </TestWrapper>
    )
    const retryInterval = screen.getByText('pipeline.customApprovalStep.retryInterval' + ':')
    expect(retryInterval).toBeInTheDocument()
    const parent = screen.getByTestId('retry-interval-row') as HTMLElement
    const retryIntervalValue = within(parent).getByText('10m')
    expect(retryIntervalValue).toBeInTheDocument()
  })
})
