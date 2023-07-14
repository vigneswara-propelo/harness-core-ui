import { NotificationRuleDTO } from 'services/cv'

export interface AnalyseStepNotificationsData {
  identifier: NotificationRuleDTO['identifier']
  name: NotificationRuleDTO['name']
  notificationMethod: NotificationRuleDTO['notificationMethod']
  conditions: NotificationRuleDTO['conditions']
}
