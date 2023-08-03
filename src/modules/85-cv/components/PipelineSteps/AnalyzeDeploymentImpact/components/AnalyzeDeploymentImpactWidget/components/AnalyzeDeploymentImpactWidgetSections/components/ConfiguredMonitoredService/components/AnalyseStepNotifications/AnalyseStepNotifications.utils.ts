import { NotificationRuleResponse } from 'services/cv'
import { AnalyseStepNotificationsData } from './AnalyseStepNotifications.types'

export function getValidNotifications(notifications: NotificationRuleResponse[]): AnalyseStepNotificationsData[] {
  const validNotificationsData = notifications.filter(({ notificationRule: { conditions } }) => {
    return conditions.some(({ type }) => type === 'HealthScore' || type === 'DeploymentImpactReport')
  })
  return validNotificationsData.map(el => {
    const { name, notificationMethod, conditions, identifier: notificationIdentifier } = el.notificationRule
    return {
      identifier: notificationIdentifier,
      name,
      notificationMethod,
      conditions
    }
  })
}
