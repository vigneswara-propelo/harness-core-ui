import type { NotificationRuleCondition } from 'services/cv'

export function getEventTypes(condition?: NotificationRuleCondition): string {
  return (
    condition?.spec?.changeCategories?.reduce(
      (accumulator: string, currentValue: string) => `${accumulator}, ${currentValue}`
    ) || ''
  )
}
