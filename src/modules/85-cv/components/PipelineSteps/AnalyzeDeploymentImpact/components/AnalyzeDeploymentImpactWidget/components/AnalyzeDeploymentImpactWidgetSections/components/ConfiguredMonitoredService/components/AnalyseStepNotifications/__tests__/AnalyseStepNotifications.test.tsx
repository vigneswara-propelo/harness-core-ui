import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { MemoryRouter, useParams } from 'react-router-dom'
import { useGetNotificationRulesForMonitoredService } from 'services/cv'
import * as cvService from 'services/cv'
import AnalyseStepNotifications from '../AnalyseStepNotifications'

// eslint-disable-next-line jest-no-mock
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn()
}))

const showError = jest.fn()
jest.mock('@harness/uicore', () => ({
  ...jest.requireActual('@harness/uicore'),
  useToaster: jest.fn(() => ({ showError }))
}))

jest.mock('services/cv', () => ({
  useGetNotificationRulesForMonitoredService: jest.fn()
}))

jest.mock('framework/strings', () => ({
  useStrings: () => ({
    getString: (key: string) => key
  })
}))

describe('AnalyseStepNotifications', () => {
  beforeEach(() => {
    ;(useParams as any).mockReturnValue({
      accountId: 'mock-account',
      orgIdentifier: 'mock-org',
      projectIdentifier: 'mock-project'
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('renders loading message while fetching notifications', async () => {
    jest.spyOn(cvService, 'useGetNotificationRulesForMonitoredService').mockReturnValue({
      data: undefined,
      loading: true,
      error: null,
      refetch: jest.fn()
    } as any)

    const { getByText } = render(
      <MemoryRouter>
        <AnalyseStepNotifications identifier="mock-identifier" />
      </MemoryRouter>
    )

    const loadingMessage = getByText('cv.analyzeStep.notifications.fetchingNotifications')
    expect(loadingMessage).toBeInTheDocument()

    await waitFor(() => {
      expect(useGetNotificationRulesForMonitoredService).toHaveBeenCalledWith(
        expect.objectContaining({
          queryParams: expect.objectContaining({
            accountId: 'mock-account',
            orgIdentifier: 'mock-org',
            projectIdentifier: 'mock-project'
          }),
          identifier: 'mock-identifier',
          lazy: true
        })
      )
    })
  })

  test('renders empty state when no notifications are available', async () => {
    jest.spyOn(cvService, 'useGetNotificationRulesForMonitoredService').mockReturnValue({
      data: { data: { content: [] } },
      loading: false,
      error: null,
      refetch: jest.fn()
    } as any)

    const { getByText } = render(
      <MemoryRouter>
        <AnalyseStepNotifications identifier="mock-identifier" />
      </MemoryRouter>
    )

    await waitFor(() => {
      const emptyStateMessage = getByText('cv.analyzeStep.notifications.notificationsNotPresent')
      expect(emptyStateMessage).toBeInTheDocument()

      const configureNotificationLink = getByText('cv.analyzeStep.notifications.configureNotification')
      expect(configureNotificationLink).toBeInTheDocument()
    })

    expect(useGetNotificationRulesForMonitoredService).toHaveBeenCalledWith(
      expect.objectContaining({
        queryParams: expect.objectContaining({
          accountId: 'mock-account',
          orgIdentifier: 'mock-org',
          projectIdentifier: 'mock-project'
        }),
        identifier: 'mock-identifier',
        lazy: true
      })
    )
  })

  test('renders notifications data and configure notification link', async () => {
    const notificationsData = [
      {
        notificationRule: {
          identifier: 'notification-1',
          name: 'Notification 1',
          notificationMethod: { type: 'Email' },
          conditions: []
        }
      },
      {
        notificationRule: {
          identifier: 'notification-2',
          name: 'Notification 2',
          notificationMethod: { type: 'Slack' },
          conditions: []
        }
      }
    ]

    jest.spyOn(cvService, 'useGetNotificationRulesForMonitoredService').mockReturnValue({
      data: { data: { content: notificationsData } },
      loading: false,
      error: null,
      refetch: jest.fn()
    } as any)

    const { getByText } = render(
      <MemoryRouter>
        <AnalyseStepNotifications identifier="mock-identifier" />
      </MemoryRouter>
    )

    await waitFor(() => {
      const notification1Name = getByText('Notification 1')
      expect(notification1Name).toBeInTheDocument()

      const notification2Name = getByText('Notification 2')
      expect(notification2Name).toBeInTheDocument()

      const configureNotificationLink = getByText('cv.analyzeStep.notifications.configureNotification')
      expect(configureNotificationLink).toBeInTheDocument()
    })

    expect(useGetNotificationRulesForMonitoredService).toHaveBeenCalledWith(
      expect.objectContaining({
        queryParams: expect.objectContaining({
          accountId: 'mock-account',
          orgIdentifier: 'mock-org',
          projectIdentifier: 'mock-project'
        }),
        identifier: 'mock-identifier',
        lazy: true
      })
    )
  })
})
