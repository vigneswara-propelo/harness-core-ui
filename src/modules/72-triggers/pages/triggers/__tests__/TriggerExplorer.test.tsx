/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as pipelineServices from 'services/pipeline-ng'
import TriggerExplorer from '../views/TriggerExplorer'
import { errorLoadingList } from '../TriggerLandingPage/__tests__/TriggerActivityHistoryPageMocks'
import { webhookTriggerData } from './TriggerExplorerMocks'

function WrapperComponent(): JSX.Element {
  return (
    <TestWrapper
      path={
        '/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/pipelines/:pipelineIdentifier/triggers'
      }
      pathParams={{
        accountId: 'testAcc',
        orgIdentifier: 'testOrg',
        projectIdentifier: 'test',
        pipelineIdentifier: 'pipeline',
        module: 'cd'
      }}
      queryParams={{
        sectionId: 'EXPLORER'
      }}
      defaultFeatureFlagValues={{ CDS_TRIGGER_ACTIVITY_PAGE: true }}
    >
      <TriggerExplorer />
    </TestWrapper>
  )
}

const searchEventCorrelationIdTest = async (
  eventCorrelationId: string,
  refetchList: jest.Mock<any, any, any>
): Promise<void> => {
  const searchBox = screen.getByPlaceholderText('triggers.triggerExplorer.searchPlaceholder')
  userEvent.type(searchBox, eventCorrelationId)
  const searchButton = screen.queryByTestId('searchBasedOnEventCorrelationId')
  await waitFor(() => {
    expect(searchButton).not.toBeDisabled()
  })
  userEvent.click(searchButton!)
  await waitFor(() => {
    expect(refetchList).toHaveBeenCalledTimes(1)
  })
}

describe('Trigger Explorer page tests', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('Initial Render with help panel', async () => {
    render(<WrapperComponent />)
    expect(screen.queryByTestId('helpPanelCard')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'execution.triggerType.WEBHOOK' })).toBeChecked()
    expect(screen.queryByTestId('searchBasedOnEventCorrelationId')).toBeDisabled()
  })

  test('Check help panel is hidden on click of button', () => {
    render(<WrapperComponent />)
    const hideShowButton = screen.queryByTestId('panel')
    const helpPanelCard = screen.queryByTestId('helpPanelCard')
    expect(helpPanelCard).toBeInTheDocument()
    expect(hideShowButton).toBeInTheDocument()
    fireEvent.click(hideShowButton!)
    expect(helpPanelCard).not.toBeInTheDocument()
  })

  test('Show page spinner when list is loading', () => {
    jest.spyOn(pipelineServices, 'useTriggerHistoryEventCorrelationV2').mockImplementation((): any => {
      return {
        data: [],
        refetch: jest.fn(),
        error: null,
        loading: true
      }
    })
    const { container } = render(<WrapperComponent />)
    expect(container.querySelector('[data-icon="steps-spinner"]')).toBeInTheDocument()
  })

  test('Show empty state message when no data is present on search and help panel is also hidden', async () => {
    const refetchList = jest.fn()
    jest
      .spyOn(pipelineServices, 'useTriggerHistoryEventCorrelationV2')
      .mockImplementation(
        () => ({ data: { data: { content: [] } }, loading: false, error: null, refetch: refetchList } as any)
      )
    const { getByText } = render(<WrapperComponent />)
    searchEventCorrelationIdTest('randomstring223', refetchList)
    expect(getByText('triggers.triggerExplorer.emptyStateMessage')).toBeInTheDocument()
  })

  test('Show error message and retry button when listing api fails', async () => {
    const refetchList = jest.fn()
    jest.spyOn(pipelineServices, 'useTriggerHistoryEventCorrelationV2').mockImplementation((): any => {
      return {
        data: {},
        refetch: refetchList,
        error: errorLoadingList,
        loading: false
      }
    })
    const { getByText } = render(<WrapperComponent />)
    searchEventCorrelationIdTest('testError', refetchList)
    expect(getByText('Failed to fetch')).toBeDefined()
    const retryButton = getByText(/Retry/)
    expect(retryButton).toBeDefined()
    await userEvent.click(retryButton)
    expect(refetchList).toHaveBeenCalled()
  })

  test('Show matching triggers detail based on search', async () => {
    const refetchList = jest.fn()
    jest.spyOn(pipelineServices, 'useTriggerHistoryEventCorrelationV2').mockImplementation((): any => {
      return {
        data: webhookTriggerData,
        refetch: refetchList,
        error: null,
        loading: false
      }
    })
    const { container } = render(<WrapperComponent />)
    searchEventCorrelationIdTest('64c9636c631aceabcdef', refetchList)
    expect(await screen.findByText('Invalid runtime input yaml')).toBeInTheDocument()
    expect(await screen.findByText('Failed while requesting Pipeline Execution')).toBeInTheDocument()
    const viewPayloadyButton = container.querySelectorAll('[data-icon="main-notes"]')[0]
    await userEvent.click(viewPayloadyButton)
    expect(await screen.findByRole('heading', { name: 'common.payload' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    await waitFor(() => {
      expect(viewPayloadyButton).toBeInTheDocument()
    })
  })
})
