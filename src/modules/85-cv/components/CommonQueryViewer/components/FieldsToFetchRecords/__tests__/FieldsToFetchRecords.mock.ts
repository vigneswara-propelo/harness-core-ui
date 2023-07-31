import { FIELD_ENUM } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.constants'
import { FieldMapping } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'

export const fieldsToFetchRecords: FieldMapping[] = [
  {
    type: FIELD_ENUM.TEXT_INPUT,
    label: 'label',
    isTemplateSupportEnabled: true,
    identifier: 'healthSourceMetricName'
  },
  {
    type: FIELD_ENUM.TEXT_INPUT,
    label: 'label',
    isTemplateSupportEnabled: true,
    identifier: 'healthSourceMetricNamespace'
  }
]
