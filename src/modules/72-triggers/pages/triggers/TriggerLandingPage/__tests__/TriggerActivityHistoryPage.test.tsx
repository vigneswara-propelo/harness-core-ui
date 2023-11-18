/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import routes from '@common/RouteDefinitions'
import { accountPathProps, pipelineModuleParams, triggerPathProps } from '@common/utils/routeUtils'
import * as pipelineServices from 'services/pipeline-ng'
import MonacoEditor from '@common/components/MonacoEditor/__mocks__/MonacoEditor'
import TriggerActivityHistoryPage from '../TriggerActivityHistoryPage/TriggerActivityHistoryPage'
import {
  artifactTriggerActivityHistoryList,
  errorLoadingList,
  webookTriggerActivityHistoryList
} from './TriggerActivityHistoryPageMocks'

jest.mock('react-monaco-editor', () => ({
  MonacoDiffEditor: MonacoEditor
}))

jest.mock('@common/components/MonacoEditor/MonacoEditor', () => MonacoEditor)

const TEST_PATH = routes.toTriggersActivityHistoryPage({
  ...accountPathProps,
  ...triggerPathProps,
  ...pipelineModuleParams
})

function TestComponent(): React.ReactElement {
  return (
    <TestWrapper
      path={TEST_PATH}
      pathParams={{
        accountId: 'testAcc',
        orgIdentifier: 'testOrg',
        projectIdentifier: 'test',
        pipelineIdentifier: 'pipeline',
        triggerIdentifier: 'triggerIdentifier',
        module: 'cd'
      }}
      defaultAppStoreValues={defaultAppStoreValues}
    >
      <TriggerActivityHistoryPage />
    </TestWrapper>
  )
}

describe('Test Trigger Detail Page Test', () => {
  test('Show page spinner when list is loading', () => {
    jest.spyOn(pipelineServices, 'useTriggerEventHistoryNew').mockImplementation((): any => {
      return {
        data: [],
        refetch: jest.fn(),
        error: null,
        loading: true
      }
    })
    const { container, getByText } = render(<TestComponent />)
    expect(container.querySelector('[data-icon="steps-spinner"]')).toBeDefined()
    expect(getByText('Loading, please wait...')).toBeDefined()
  })

  test('Show empty state message when no data is present', () => {
    jest.spyOn(pipelineServices, 'useTriggerEventHistoryNew').mockImplementation((): any => {
      return {
        data: [],
        refetch: jest.fn(),
        error: null,
        loading: false
      }
    })
    const { getByText } = render(<TestComponent />)
    expect(getByText('triggers.activityHistory.emptyStateMessage')).toBeDefined()
  })

  test('Show error message and retry button when listing api fails', async () => {
    const refetchList = jest.fn()
    jest.spyOn(pipelineServices, 'useTriggerEventHistoryNew').mockImplementation((): any => {
      return {
        data: [],
        refetch: refetchList,
        error: errorLoadingList,
        loading: false
      }
    })
    const { getByText } = render(<TestComponent />)

    expect(getByText('Failed to fetch')).toBeDefined()
    const retryButton = getByText(/Retry/)
    expect(retryButton).toBeDefined()
    await userEvent.click(retryButton)
    expect(refetchList).toHaveBeenCalled()
  })

  test('Should render webhook activity history list and open specific pipeline execution', async () => {
    jest.spyOn(pipelineServices, 'useTriggerEventHistoryNew').mockImplementation((): any => {
      return { data: webookTriggerActivityHistoryList, refetch: jest.fn(), error: null, loading: false }
    })
    render(<TestComponent />)
    const rows = await screen.findAllByRole('row')
    const triggerActivityRow = rows[1]
    expect(
      within(triggerActivityRow).getByRole('link', {
        name: /djhsuhd/i
      })
    ).toHaveAttribute(
      'href',
      routes.toExecutionPipelineView({
        accountId: 'testAcc',
        orgIdentifier: 'testOrg',
        projectIdentifier: 'test',
        pipelineIdentifier: 'pipeline',
        module: 'cd',
        executionIdentifier: 'MRhKMvFoR5ykglKxe56-FA',
        source: 'executions'
      } as any)
    )
  })

  test('Should open and close Payload drawer', async () => {
    jest.spyOn(pipelineServices, 'useTriggerEventHistoryNew').mockImplementation((): any => {
      return { data: webookTriggerActivityHistoryList, refetch: jest.fn(), error: null, loading: false }
    })
    render(<TestComponent />)
    const viewPayloadyButton = document.querySelectorAll('[data-icon="main-notes"]')[1]
    await userEvent.click(viewPayloadyButton)
    expect(await screen.findByRole('heading', { name: 'common.payload' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    await waitFor(() => {
      expect(viewPayloadyButton).toBeInTheDocument()
    })
  })

  test('Should show empty payload when invalid json is passed', async () => {
    jest.spyOn(pipelineServices, 'useTriggerEventHistoryNew').mockImplementation((): any => {
      return { data: webookTriggerActivityHistoryList, refetch: jest.fn(), error: null, loading: false }
    })
    render(<TestComponent />)
    const viewPayloadyButton = document.querySelectorAll('[data-icon="main-notes"]')[2]
    await userEvent.click(viewPayloadyButton)
    expect(await screen.findByRole('heading', { name: 'common.payload' })).toBeInTheDocument()
  })

  test('Should render artifact activity history list and open specific pipeline execution', async () => {
    jest.spyOn(pipelineServices, 'useTriggerEventHistoryNew').mockImplementation((): any => {
      return { data: artifactTriggerActivityHistoryList, refetch: jest.fn(), error: null, loading: false }
    })
    render(<TestComponent />)
    const rows = await screen.findAllByRole('row')
    const triggerActivityRow = rows[1]
    expect(within(triggerActivityRow).getByText('dummy date')).toBeInTheDocument()
    expect(within(triggerActivityRow).getByText('test.20231024.8')).toBeInTheDocument()
    expect(within(triggerActivityRow).getByText('pipeline.executionStatus.Success')).toBeInTheDocument()
    expect(
      within(triggerActivityRow).getByRole('link', {
        name: /threeStagesPipeline/i
      })
    ).toHaveAttribute(
      'href',
      routes.toExecutionPipelineView({
        accountId: 'testAcc',
        orgIdentifier: 'testOrg',
        projectIdentifier: 'test',
        pipelineIdentifier: 'pipeline',
        module: 'cd',
        executionIdentifier: 'gHfclx3lSSKLP3RxY5grqQ',
        source: 'executions'
      } as any)
    )

    expect(within(rows[2]).getByText('pipeline.executionStatus.Failed')).toBeInTheDocument()
  })
})
