/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { useListGitxWebhooksRefQuery, useUpdateGitxWebhookRefMutation } from '@harnessio/react-ng-manager-client'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as useUpdateQueryParams from '@common/hooks'
import { DEFAULT_PAGE_INDEX } from '@modules/70-pipeline/utils/constants'
import { Webhooks } from '../Webhooks'
import { webhookListResponse } from './mocks'

jest.mock('@harnessio/react-ng-manager-client', () => ({
  useListGitxWebhooksRefQuery: jest.fn(() => ({ data: {}, isInitialLoading: false })),
  useUpdateGitxWebhookRefMutation: jest.fn(() => ({}))
}))

describe('Webhooks List Test', () => {
  test('render webhooks list page with no data', () => {
    const { getByText, getByPlaceholderText, getAllByText, queryByText } = render(
      <TestWrapper>
        <Webhooks />
      </TestWrapper>
    )
    expect(getByText('common.webhooks')).toBeInTheDocument()
    expect(getAllByText('pipeline.webhooks.newWebhook')).toHaveLength(2)
    expect(getByPlaceholderText('pipeline.webhooks.searchWebhooks')).toBeInTheDocument()
    expect(getByText('pipeline.webhooks.noWebhook')).toBeInTheDocument()
    expect(queryByText('total')).not.toBeInTheDocument()
  })

  test('render webhooks list page with data', () => {
    ;(useListGitxWebhooksRefQuery as jest.Mock).mockImplementation(() => ({
      data: webhookListResponse,
      isInitialLoading: false
    }))
    const { container, getByText, getByTestId } = render(
      <TestWrapper>
        <Webhooks />
      </TestWrapper>
    )
    expect(getByText('vikrant-test-webhook')).toBeInTheDocument()
    expect(getByText('account.DoNotDeleteVikrantGithubConnector')).toBeInTheDocument()
    expect(getByText('vikrant-gitsync')).toBeInTheDocument()
    expect(getByText('test/abc')).toBeInTheDocument()
    expect(container.querySelector('input[type="checkbox"]')).toBeChecked()
    expect(getByTestId('webhooks-total')).toHaveTextContent('total: 1')
  })

  test('render webhooks list page with loading state', () => {
    ;(useListGitxWebhooksRefQuery as jest.Mock).mockImplementation(() => ({
      data: {},
      isInitialLoading: true
    }))
    const { getByText, queryByText } = render(
      <TestWrapper>
        <Webhooks />
      </TestWrapper>
    )
    expect(getByText('Loading, please wait...')).toBeInTheDocument()
    expect(queryByText('total')).not.toBeInTheDocument()
  })

  test('render webhooks list page with error state', () => {
    ;(useListGitxWebhooksRefQuery as jest.Mock).mockImplementation(() => ({
      data: {},
      isInitialLoading: false,
      error: { message: 'Error Occured while loading webhooks' }
    }))
    const { getByText } = render(
      <TestWrapper>
        <Webhooks />
      </TestWrapper>
    )
    expect(getByText('Error Occured while loading webhooks')).toBeInTheDocument()
  })

  test('render webhooks list page and update the enabled state of the webhook', async () => {
    const refetch = jest.fn()
    ;(useListGitxWebhooksRefQuery as jest.Mock).mockImplementation(() => ({
      data: webhookListResponse,
      isInitialLoading: false,
      refetch
    }))
    ;(useUpdateGitxWebhookRefMutation as jest.Mock).mockImplementation(() => ({
      mutate: jest.fn(),
      data: { content: { webhook_identifier: 'vikranttestwebhook' } },
      isInitialLoading: false
    }))
    const { container, getByText } = render(
      <TestWrapper>
        <Webhooks />
      </TestWrapper>
    )
    const isEnabledCheckbox = container.querySelector('input[type="checkbox"]') as HTMLElement
    expect(isEnabledCheckbox).toBeChecked()
    await userEvent.click(isEnabledCheckbox)
    expect(getByText('pipeline.webhooks.successUpdateMessage')).toBeInTheDocument()
    expect(refetch).toHaveBeenCalled()
  })

  test('render webhooks list page and error on update the enabled state of the webhook', async () => {
    const refetch = jest.fn()
    ;(useListGitxWebhooksRefQuery as jest.Mock).mockImplementation(() => ({
      data: webhookListResponse,
      isInitialLoading: false,
      refetch
    }))
    ;(useUpdateGitxWebhookRefMutation as jest.Mock).mockImplementation(() => ({
      mutate: jest.fn(),
      isInitialLoading: false,
      error: { message: 'Error Occured' }
    }))
    const { container, getByText } = render(
      <TestWrapper>
        <Webhooks />
      </TestWrapper>
    )
    const isEnabledCheckbox = container.querySelector('input[type="checkbox"]') as HTMLElement
    expect(isEnabledCheckbox).toBeChecked()
    await userEvent.click(isEnabledCheckbox)
    expect(getByText('Error Occured')).toBeInTheDocument()
    expect(refetch).not.toHaveBeenCalled()
  })

  test('check the query params update on search text change', async () => {
    const updateQueryParams = jest.fn()
    jest.spyOn(useUpdateQueryParams, 'useUpdateQueryParams').mockReturnValue({
      updateQueryParams,
      replaceQueryParams: jest.fn()
    })
    const { getByPlaceholderText } = render(
      <TestWrapper>
        <Webhooks />
      </TestWrapper>
    )
    const $searchBar = getByPlaceholderText('pipeline.webhooks.searchWebhooks')
    await userEvent.type($searchBar, 'test')
    expect($searchBar).toHaveValue('test')
    await waitFor(() => {
      expect(updateQueryParams).toHaveBeenCalledWith({ page: DEFAULT_PAGE_INDEX, searchTerm: 'test' })
    })
  })
})
