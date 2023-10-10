import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { NotificationRuleCondition, NotificationRuleResponse } from 'services/cv'
import NotificationConditions from '../components/NotificationConditions/NotificationConditions'
import { getEventTypes } from '../components/NotificationConditions/NotificationConditions.utils'

describe('NotificationConditions Component', () => {
  test('renders correctly with no conditions', () => {
    const notificationDetails = {
      notificationRule: {
        conditions: [],
        identifier: 'notification-1',
        name: 'notification-1',
        notificationMethod: {
          spec: {},
          type: 'Email'
        },
        type: 'MonitoredService'
      }
    } as NotificationRuleResponse

    const { getByText, queryByText } = render(
      <TestWrapper>
        <NotificationConditions notificationDetails={notificationDetails} />
      </TestWrapper>
    )

    expect(getByText('conditions')).toBeInTheDocument()
    expect(queryByText('Trigger :')).toBeNull() // No condition-specific text should be present
  })

  test('renders HealthScore condition correctly', () => {
    const notificationDetails = {
      notificationRule: {
        conditions: [
          {
            type: 'HealthScore',
            spec: {
              threshold: 50,
              period: '5m'
            }
          }
        ],
        identifier: 'notification-1',
        name: 'notification-1',
        notificationMethod: {
          spec: {},
          type: 'Email'
        },
        type: 'MonitoredService'
      }
    } as NotificationRuleResponse
    const { getByText } = render(
      <TestWrapper>
        <NotificationConditions notificationDetails={notificationDetails} />
      </TestWrapper>
    )

    expect(getByText('conditions')).toBeInTheDocument()
    expect(getByText('HealthScore is below')).toBeInTheDocument()
    expect(getByText('50')).toBeInTheDocument()
    expect(getByText('5 minutes')).toBeInTheDocument()
  })

  test('renders DeploymentImpactReport condition correctly', () => {
    const notificationDetails = {
      notificationRule: {
        conditions: [
          {
            type: 'DeploymentImpactReport',
            spec: {}
          }
        ],
        identifier: 'notification-1',
        name: 'notification-1',
        notificationMethod: {
          spec: {},
          type: 'Email'
        },
        type: 'MonitoredService'
      }
    } as NotificationRuleResponse

    const { getByText } = render(
      <TestWrapper>
        <NotificationConditions notificationDetails={notificationDetails} />
      </TestWrapper>
    )

    expect(getByText('conditions')).toBeInTheDocument()
    expect(getByText('cv.changeSource.DeploymentImpactAnalysis')).toBeInTheDocument()
  })

  test('renders ChangeImpact condition correctly', () => {
    const notificationDetails = {
      notificationRule: {
        conditions: [
          {
            type: 'ChangeImpact',
            spec: {
              threshold: 10,
              period: '3m',
              changeCategories: ['Category A', 'Category B']
            }
          }
        ],
        identifier: 'notification-1',
        name: 'notification-1',
        notificationMethod: {
          spec: {},
          type: 'Email'
        },
        type: 'MonitoredService'
      }
    } as NotificationRuleResponse

    const { getByText } = render(
      <TestWrapper>
        <NotificationConditions notificationDetails={notificationDetails} />
      </TestWrapper>
    )

    expect(getByText('conditions')).toBeInTheDocument()
    expect(getByText('cv.monitoredServices.monitoredServiceTabs.changeImpact')).toBeInTheDocument()
    expect(getByText('Category A, Category B')).toBeInTheDocument()
    expect(getByText('10')).toBeInTheDocument()
    expect(getByText('3 minutes')).toBeInTheDocument()
  })

  test('renders ChangeObserved condition correctly', () => {
    const notificationDetails = {
      notificationRule: {
        conditions: [
          {
            type: 'ChangeObserved',
            spec: {
              changeCategories: ['Category C']
            }
          }
        ],
        identifier: 'notification-1',
        name: 'notification-1',
        notificationMethod: {
          spec: {},
          type: 'Email'
        },
        type: 'MonitoredService'
      }
    } as NotificationRuleResponse

    const { getByText } = render(
      <TestWrapper>
        <NotificationConditions notificationDetails={notificationDetails} />
      </TestWrapper>
    )

    expect(getByText('conditions')).toBeInTheDocument()
    expect(getByText('cv.notifications.notificationConditions.changeObserved')).toBeInTheDocument()
    expect(getByText('Category C')).toBeInTheDocument()
  })

  test('renders ErrorBudgetBurnRate condition correctly', () => {
    const notificationDetails = {
      notificationRule: {
        conditions: [
          {
            type: 'ErrorBudgetBurnRate',
            spec: {
              threshold: 30,
              lookBackDuration: '30m'
            }
          }
        ],
        identifier: 'notification-1',
        name: 'notification-1',
        notificationMethod: {
          spec: {},
          type: 'Email'
        },
        type: 'ServiceLevelObjective'
      }
    } as NotificationRuleResponse

    const { getByText } = render(
      <TestWrapper>
        <NotificationConditions notificationDetails={notificationDetails} />
      </TestWrapper>
    )

    expect(getByText('conditions')).toBeInTheDocument()
    expect(getByText('cv.notifications.notificationConditions.errorBudgetBurnRate')).toBeInTheDocument()
    expect(getByText('cv.notifications.notificationConditions.lookBackDuration')).toBeInTheDocument()
    expect(getByText('conditions')).toBeInTheDocument()
  })

  test('renders correctly with unknown condition type', () => {
    const notificationDetails = {
      notificationRule: {
        conditions: [
          {
            type: 'UnknownCondition' as NotificationRuleCondition['type'],
            spec: {}
          }
        ],
        identifier: 'notification-1',
        name: 'notification-1',
        notificationMethod: {
          spec: {},
          type: 'Email'
        },
        type: 'MonitoredService'
      }
    } as NotificationRuleResponse

    const { getByText, queryByText } = render(
      <TestWrapper>
        <NotificationConditions notificationDetails={notificationDetails} />
      </TestWrapper>
    )

    expect(getByText('conditions')).toBeInTheDocument()
    expect(queryByText('Trigger :')).toBeNull()
  })
})

describe('getEventTypes', () => {
  test('should concatenate multiple changeCategories with commas', () => {
    const condition = {
      spec: {
        changeCategories: ['Category1', 'Category2', 'Category3']
      }
    }
    const result = getEventTypes(condition)
    expect(result).toBe('Category1, Category2, Category3')
  })

  test('should handle a single changeCategory', () => {
    const condition = {
      spec: {
        changeCategories: ['SingleCategory']
      }
    }
    const result = getEventTypes(condition)
    expect(result).toBe('SingleCategory')
  })

  test('should return an empty string if condition is undefined', () => {
    const result = getEventTypes()
    expect(result).toBe('')
  })

  test('should return an empty string if condition.spec is undefined', () => {
    const condition = {} as NotificationRuleCondition
    const result = getEventTypes(condition)
    expect(result).toBe('')
  })

  test('should return a concatenated string of changeCategories values', () => {
    const condition = {
      spec: {
        changeCategories: ['Category1', 'Category2', 'Category3']
      }
    }
    const result = getEventTypes(condition)
    expect(result).toBe('Category1, Category2, Category3')
  })
})
