/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as pipelineServices from 'services/pipeline-ng'
import routes from '@modules/10-common/RouteDefinitions'
import TriggerExplorer from '../views/TriggerExplorer'
import { errorLoadingList } from '../TriggerLandingPage/__tests__/TriggerActivityHistoryPageMocks'
import { dockerArtifactTriggerData, webhookTriggerData } from './TriggerExplorerMocks'

jest.mock('react-timeago', () => () => 'dummy date')

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

const artifactTriggerListing = async (): Promise<void> => {
  userEvent.click(screen.getByRole('radio', { name: 'pipeline.artifactTriggerConfigPanel.artifact' }))
  await waitFor(() => {
    expect(screen.getByRole('radio', { name: 'pipeline.artifactTriggerConfigPanel.artifact' })).toBeChecked()
    expect(document.querySelector('input[name="artifactTriggerType"]')).toBeVisible()
  })
  await userEvent.click(document.querySelector('input[name="artifactTriggerType"]') as HTMLElement)
  const dockerRegistryArtifactTrigger = document.querySelectorAll('li[class*="Select--menuItem')
  await waitFor(() => expect(dockerRegistryArtifactTrigger).toHaveLength(16))
  userEvent.click(dockerRegistryArtifactTrigger[2])
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

  test('Show artifact help panel when artifact triggers is chosen', async () => {
    render(<WrapperComponent />)
    const artifactOption = screen.getByRole('radio', { name: 'pipeline.artifactTriggerConfigPanel.artifact' })
    expect(screen.getByRole('radio', { name: 'execution.triggerType.WEBHOOK' })).toBeChecked()
    expect(artifactOption).toBeVisible()
    userEvent.click(artifactOption)
    await waitFor(() => {
      expect(screen.queryByTestId('helpPanelCard')).toBeInTheDocument()
      expect(document.querySelector('input[name="artifactTriggerType"]')).toBeVisible()
    })
  })

  test('Show error message and retry button when artifact trigger listing api fails', async () => {
    const refetchList = jest.fn()
    jest.spyOn(pipelineServices, 'useTriggerEventHistoryBuildSourceType').mockImplementation((): any => {
      return {
        data: {},
        refetch: refetchList,
        error: errorLoadingList,
        loading: false
      }
    })
    const { getByText } = render(<WrapperComponent />)

    artifactTriggerListing()

    await waitFor(() => {
      expect(refetchList).toHaveBeenCalledTimes(1)
    })
    expect(getByText('Failed to fetch')).toBeDefined()
    const retryButton = getByText(/Retry/)
    expect(retryButton).toBeDefined()
    await userEvent.click(retryButton)
    expect(refetchList).toHaveBeenCalledWith({
      queryParams: {
        accountIdentifier: 'testAcc',
        artifactType: 'DockerRegistry',
        page: 0,
        size: 10,
        sort: ['createdAt,DESC']
      }
    })
  })

  test('Show matching artifact triggers when artifact trigger type is chosen', async () => {
    const refetchList = jest.fn()
    jest.spyOn(pipelineServices, 'useTriggerEventHistoryBuildSourceType').mockImplementation((): any => {
      return {
        data: dockerArtifactTriggerData,
        refetch: refetchList,
        error: null,
        loading: false
      }
    })

    render(<WrapperComponent />)

    artifactTriggerListing()

    await waitFor(() => {
      expect(refetchList).toHaveBeenCalledTimes(1)
    })
    const rows = await screen.findAllByRole('row')
    expect(rows).toHaveLength(3)
    const artifactTriggerRow = rows[1]

    expect(within(artifactTriggerRow).getByText('dummy date')).toBeInTheDocument()
    expect(
      within(artifactTriggerRow).getByRole('link', {
        name: /testDockerTrigger/i
      })
    ).toHaveAttribute(
      'href',
      routes.toTriggersActivityHistoryPage({
        accountId: 'testAcc',
        orgIdentifier: 'NgTriggersOrg',
        projectIdentifier: 'projectTest',
        pipelineIdentifier: 'ThreeStagesPipeline',
        triggerIdentifier: 'testDockerTrigger'
      } as any)
    )
    expect(within(artifactTriggerRow).getByText('pipeline.executionStatus.Success')).toBeInTheDocument()
  })
})
