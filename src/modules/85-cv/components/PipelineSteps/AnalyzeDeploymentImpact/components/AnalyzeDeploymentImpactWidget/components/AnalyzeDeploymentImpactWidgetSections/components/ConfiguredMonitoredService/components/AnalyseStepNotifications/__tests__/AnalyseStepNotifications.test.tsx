import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { MemoryRouter, useParams } from 'react-router-dom'
import { NotificationRuleResponse, useGetNotificationRulesForMonitoredService } from 'services/cv'
import * as cvService from 'services/cv'
import AnalyseStepNotifications from '../AnalyseStepNotifications'
import { AnalyseStepNotificationsData } from '../AnalyseStepNotifications.types'
import { getValidNotifications } from '../AnalyseStepNotifications.utils'
import { mockedNotifications } from './AnalyseStepNotifications.mock'

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
    jest.spyOn(cvService, 'useGetNotificationRulesForMonitoredService').mockReturnValue({
      data: { data: { content: mockedNotifications } },
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

describe('getValidNotifications', () => {
  test('should return an empty array when notifications array is empty', () => {
    const emptyNotifications: NotificationRuleResponse[] = []

    const result: AnalyseStepNotificationsData[] = getValidNotifications(emptyNotifications)

    expect(result).toEqual([])
  })

  test('should return an empty array when there are no valid notifications', () => {
    const notifications: NotificationRuleResponse[] = [
      {
        notificationRule: {
          conditions: [
            { type: 'ErrorBudgetBurnRate', spec: {} },
            { type: 'ErrorBudgetRemainingMinutes', spec: {} }
          ],
          identifier: 'notificationIdentifier1',
          name: 'Notification 1',
          notificationMethod: {
            spec: {},
            type: 'Email'
          },
          type: 'MonitoredService'
        }
      }
    ]

    const result: AnalyseStepNotificationsData[] = getValidNotifications(notifications)

    expect(result).toEqual([])
  })

  test('should return an array of valid notifications', () => {
    const result: AnalyseStepNotificationsData[] = getValidNotifications(mockedNotifications)

    expect(result).toEqual([
      {
        conditions: [
          { spec: {}, type: 'ErrorBudgetBurnRate' },
          { spec: {}, type: 'HealthScore' }
        ],
        identifier: 'notificationIdentifier1',
        name: 'Notification 1',
        notificationMethod: { spec: {}, type: 'Email' }
      },
      {
        conditions: [
          { spec: {}, type: 'DeploymentImpactReport' },
          { spec: {}, type: 'ErrorBudgetBurnRate' }
        ],
        identifier: 'notificationIdentifier2',
        name: 'Notification 2',
        notificationMethod: { spec: {}, type: 'Email' }
      }
    ])
  })
})
