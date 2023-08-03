import { NotificationRuleResponse } from 'services/cv'

export const mockedNotifications: NotificationRuleResponse[] = [
  {
    notificationRule: {
      conditions: [
        { type: 'ErrorBudgetBurnRate', spec: {} },
        { type: 'HealthScore', spec: {} }
      ],
      identifier: 'notificationIdentifier1',
      name: 'Notification 1',
      notificationMethod: {
        spec: {},
        type: 'Email'
      },
      type: 'MonitoredService'
    }
  },
  {
    notificationRule: {
      conditions: [
        { type: 'DeploymentImpactReport', spec: {} },
        { type: 'ErrorBudgetBurnRate', spec: {} }
      ],
      identifier: 'notificationIdentifier2',
      name: 'Notification 2',
      notificationMethod: {
        spec: {},
        type: 'Email'
      },
      type: 'MonitoredService'
    }
  }
]
