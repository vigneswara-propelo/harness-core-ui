/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { render, waitFor, within } from '@testing-library/react'
import React from 'react'
import userEvent from '@testing-library/user-event'
import { useListGitxWebhookEventsRefQuery } from '@harnessio/react-ng-manager-client'
import { TestWrapper, findPopoverContainer } from '@modules/10-common/utils/testUtils'
import * as useUpdateQueryParams from '@common/hooks'
import { DEFAULT_PAGE_INDEX } from '@modules/70-pipeline/utils/constants'
import WebhookEvents from '../WebhookEvents'
import { webhookEventsList, webhooksList } from './mocks'

const refetch = jest.fn()

jest.mock('@harnessio/react-ng-manager-client', () => ({
  useListGitxWebhooksRefQuery: jest.fn(() => ({ data: webhooksList, isInitialLoading: false })),
  useListGitxWebhookEventsRefQuery: jest.fn(() => ({
    data: webhookEventsList,
    isInitialLoading: false,
    refetch
  }))
}))

describe('Webhook Events Listing Page tests', () => {
  test('list page rendering', async () => {
    const { container, getByPlaceholderText, getByText, getByTestId } = render(
      <TestWrapper>
        <WebhookEvents />
      </TestWrapper>
    )
    expect(getByPlaceholderText('pipeline.webhooks.searchEventId')).toBeInTheDocument()
    expect(getByText('total: 1')).toBeInTheDocument()
    const reloadBtn = container.querySelector('span[data-icon="command-rollback"]')
    await userEvent.click(reloadBtn!)
    expect(refetch).toHaveBeenCalled()
    expect(getByText('harness-automation')).toBeInTheDocument()
    expect(getByText('309OCtkkSuGmc1FwLn-vGQ')).toBeInTheDocument()
    expect(getByText('sync1')).toBeInTheDocument()
    expect(getByText('pipeline.executionFilters.labels.Success')).toBeInTheDocument()
    const payloadDetails = getByText('pipeline.webhookEvents.payloadDetails')
    expect(payloadDetails).toBeInTheDocument()
    await userEvent.click(payloadDetails!)
    expect(getByTestId('payload-details-timestamp')).toBeInTheDocument()
    expect(getByTestId('payload-details-event-id')).toBeInTheDocument()
  })

  test('list page loading state', () => {
    ;(useListGitxWebhookEventsRefQuery as jest.Mock).mockImplementation(() => ({
      isInitialLoading: true
    }))
    const { getByText, queryByText } = render(
      <TestWrapper>
        <WebhookEvents />
      </TestWrapper>
    )
    expect(getByText('Loading, please wait...')).toBeInTheDocument()
    expect(queryByText('total')).not.toBeInTheDocument()
  })
  test('list page error state', () => {
    ;(useListGitxWebhookEventsRefQuery as jest.Mock).mockImplementation(() => ({
      error: { message: 'Something went wrong' }
    }))
    const { getByText, queryByText } = render(
      <TestWrapper>
        <WebhookEvents />
      </TestWrapper>
    )
    expect(getByText('Something went wrong')).toBeInTheDocument()
    expect(queryByText('total')).not.toBeInTheDocument()
  })
  test('no data page state', () => {
    ;(useListGitxWebhookEventsRefQuery as jest.Mock).mockImplementation(() => ({
      data: { content: [] }
    }))
    const { getByText } = render(
      <TestWrapper>
        <WebhookEvents />
      </TestWrapper>
    )

    expect(getByText('auditTrail.emptyStateMessage')).toBeInTheDocument()
  })

  test('webhook events page filters', async () => {
    const updateQueryParams = jest.fn()
    jest.spyOn(useUpdateQueryParams, 'useUpdateQueryParams').mockReturnValue({
      updateQueryParams,
      replaceQueryParams: jest.fn()
    })
    const { container, getByPlaceholderText, getByTestId } = render(
      <TestWrapper>
        <WebhookEvents />
      </TestWrapper>
    )

    const searchBar = getByPlaceholderText('pipeline.webhooks.searchEventId')
    await userEvent.type(searchBar, 'webhooktest')
    await waitFor(() => {
      expect(updateQueryParams).toHaveBeenCalledWith({ page: DEFAULT_PAGE_INDEX, eventId: 'webhooktest' })
    })

    const statusSelect = getByTestId('status-select')
    await userEvent.click(statusSelect!)

    const menuContent = findPopoverContainer() as HTMLElement
    const optionFailed = within(menuContent).getByText('pipeline.executionFilters.labels.Failed')
    await userEvent.click(optionFailed)

    await waitFor(() => {
      expect(updateQueryParams).toHaveBeenCalledWith({ eventStatus: ['FAILED'] })
    })

    const webhooksBtn = getByTestId('dropdown-button')
    await userEvent.click(webhooksBtn)

    const webhookSyncOption = container.querySelector('li[class="DropDown--menuItem"]')
    await userEvent.click(webhookSyncOption!)

    await waitFor(() => {
      expect(updateQueryParams).toHaveBeenCalledWith({ page: DEFAULT_PAGE_INDEX, webhookIdentifier: 'sync1' })
    })
  })

  test('webhook page date filters', () => {
    const { getByText } = render(
      <TestWrapper
        queryParams={{ dateFilter: { startTime: 1701541800000, endTime: 1701628199999 }, eventStatus: ['FAILED'] }}
      >
        <WebhookEvents />
      </TestWrapper>
    )
    expect(getByText('12/2/2023 - 12/3/2023')).toBeInTheDocument()
    expect(getByText('01')).toBeInTheDocument()
  })
})
