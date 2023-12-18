/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { render } from '@testing-library/react'
import React from 'react'
import {
  useGetGitxWebhookRefQuery,
  useListGitxWebhookEventsRefQuery,
  useUpdateGitxWebhookRefMutation
} from '@harnessio/react-ng-manager-client'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@modules/10-common/utils/testUtils'
import WebhookLandingPage from '../WebhookLandingPage'
import { webhookEventsResponse, webhooksGetResponse, webhooksGetResponseWithNoFolderPaths } from './mocks'

jest.mock('@harnessio/react-ng-manager-client', () => ({
  useGetGitxWebhookRefQuery: jest.fn(() => ({ data: webhooksGetResponse, isInitialLoading: false })),
  useUpdateGitxWebhookRefMutation: jest.fn(() => ({})),
  useListGitxWebhookEventsRefQuery: jest.fn(() => ({}))
}))

const mockHistoryReplace = jest.fn()
// eslint-disable-next-line jest-no-mock
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    replace: mockHistoryReplace
  }),
  useParams: () => ({
    accountId: 'dummy',
    webhookIdentifier: 'vikranttestwebhook'
  })
}))

describe('Webhook Landing Page tests', () => {
  test('render webhook details page with correct data', () => {
    const { getByTestId, getByText } = render(
      <TestWrapper>
        <WebhookLandingPage />
      </TestWrapper>
    )
    expect(getByTestId('webhook-title')).toHaveTextContent('vikrant-test-webhook')
    expect(getByTestId('webhook-id')).toHaveTextContent('common.ID: vikranttestwebhook')
    expect(getByTestId('webhook-enable-toggle')).not.toBeChecked()
    expect(getByText('common.triggerName')).toBeInTheDocument()
    expect(getByText('platform.connectors.title.gitConnector')).toBeInTheDocument()
    expect(getByText('account.DoNotDeleteVikrantGithubConnector')).toBeInTheDocument()
    expect(getByText('repository')).toBeInTheDocument()
    expect(getByText('vikrant-gitsync')).toBeInTheDocument()
    expect(getByText('1. pipeline.webhooks.allFolders')).toBeInTheDocument()
  })

  test('render folderPaths with empty array', () => {
    ;(useGetGitxWebhookRefQuery as jest.Mock).mockImplementation(() => ({
      data: webhooksGetResponseWithNoFolderPaths,
      isInitialLoading: false
    }))
    const { getByText } = render(
      <TestWrapper>
        <WebhookLandingPage />
      </TestWrapper>
    )
    expect(getByText('vikrant-gitsync')).toBeInTheDocument()
    expect(getByText('1. pipeline.webhooks.allFolders')).toBeInTheDocument()
  })

  test('route back to webhooks list page if the get API errors out', () => {
    ;(useGetGitxWebhookRefQuery as jest.Mock).mockImplementation(() => ({
      error: { message: 'Something went wrong' }
    }))
    render(
      <TestWrapper>
        <WebhookLandingPage />
      </TestWrapper>
    )

    expect(mockHistoryReplace).toHaveBeenCalledWith('/account/dummy/settings/resources/webhooks')
  })

  test('Success state for webhook update from details page', async () => {
    const mutate = jest.fn()
    const refetch = jest.fn()
    ;(useGetGitxWebhookRefQuery as jest.Mock).mockImplementation(() => ({
      data: webhooksGetResponse,
      isInitialLoading: false,
      refetch
    }))
    ;(useUpdateGitxWebhookRefMutation as jest.Mock).mockImplementation(() => ({
      mutate,
      data: { content: { webhook_identifier: 'sync1' } }
    }))
    const { getByTestId, getByText } = render(
      <TestWrapper>
        <WebhookLandingPage />
      </TestWrapper>
    )
    const isEnabledCheckbox = getByTestId('webhook-enable-toggle')
    await userEvent.click(isEnabledCheckbox)
    expect(mutate).toHaveBeenCalledWith({
      body: {
        is_enabled: true,
        folder_paths: ['']
      },
      pathParams: {
        'gitx-webhook': 'vikranttestwebhook',
        org: undefined,
        project: undefined
      }
    })
    expect(refetch).toHaveBeenCalled()
    expect(getByText('pipeline.webhooks.successUpdateMessage')).toBeInTheDocument()
  })

  test('Events section for webhook details', async () => {
    ;(useListGitxWebhookEventsRefQuery as jest.Mock).mockImplementation(() => ({
      data: webhookEventsResponse,
      isInitialLoading: false
    }))
    const { getByText, getByTestId } = render(
      <TestWrapper>
        <WebhookLandingPage />
      </TestWrapper>
    )

    expect(getByText('pipeline.webhookEvents.lastEventDetails')).toBeInTheDocument()
    expect(getByText('pipeline.webhookEvents.dateTime')).toBeInTheDocument()
    expect(getByText('11:33 am Nov 27, 2023')).toBeInTheDocument()

    expect(getByText('pipeline.webhookEvents.eventId')).toBeInTheDocument()
    expect(getByText('1dZrcudYSHK9rf4kcXBNXw')).toBeInTheDocument()

    const viewAllEvents = getByTestId('view-all-events')
    await userEvent.click(viewAllEvents)
    expect(mockHistoryReplace).toBeCalledWith(
      '/account/dummy/settings/resources/webhooks/events?webhookIdentifier=vikranttestwebhook'
    )
  })
  test('error state events api', async () => {
    ;(useListGitxWebhookEventsRefQuery as jest.Mock).mockImplementation(() => ({
      error: { message: 'Something Went wrong' }
    }))
    const { getByText } = render(
      <TestWrapper>
        <WebhookLandingPage />
      </TestWrapper>
    )
    expect(getByText('Something Went wrong')).toBeInTheDocument()
  })
})
