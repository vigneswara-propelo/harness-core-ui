import React from 'react'
import { render } from '@testing-library/react'
import NotificationDetails from '../NotificationDetails'
import { AnalyseStepNotificationsData } from '../../AnalyseStepNotifications.types'

describe('NotificationDetails', () => {
  test('renders conditions correctly', () => {
    const notificationDetails = {
      identifier: 'notification-1',
      name: 'notification-1',
      notificationMethod: {} as AnalyseStepNotificationsData['notificationMethod'],
      conditions: [
        {
          type: 'HealthScore',
          spec: {
            threshold: 50,
            period: '5m'
          }
        },
        {
          type: 'DeploymentImpactReport',
          spec: {}
        },
        {
          type: 'ChangeImpact',
          spec: {}
        }
      ] as AnalyseStepNotificationsData['conditions']
    }

    const { getByText } = render(<NotificationDetails notificationDetails={notificationDetails} />)

    const conditionsHeading = getByText('Conditions')
    expect(conditionsHeading).toBeInTheDocument()

    const thresholdValue = getByText('Threshold Value :')
    expect(thresholdValue).toBeInTheDocument()

    const durationText = getByText('Duration :')
    expect(durationText).toBeInTheDocument()

    const deploymentImpactText = getByText('Deployment Impact')
    expect(deploymentImpactText).toBeInTheDocument()
  })

  test('renders empty when no conditions are provided', () => {
    const notificationDetails = {
      identifier: 'notification-1',
      name: 'notification-1',
      notificationMethod: {} as AnalyseStepNotificationsData['notificationMethod'],
      conditions: [] as AnalyseStepNotificationsData['conditions']
    }

    const { getByText, queryByText } = render(<NotificationDetails notificationDetails={notificationDetails} />)

    const conditionsHeading = getByText('Conditions')
    expect(conditionsHeading).toBeInTheDocument()

    const durationText = queryByText('Duration :')
    expect(durationText).not.toBeInTheDocument()

    const deploymentImpactText = queryByText('Deployment Impact')
    expect(deploymentImpactText).not.toBeInTheDocument()
  })
})
