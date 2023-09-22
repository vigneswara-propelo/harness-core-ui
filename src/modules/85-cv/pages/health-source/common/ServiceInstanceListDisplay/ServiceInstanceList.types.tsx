import { SelectOption } from '@harness/uicore'
import { QueryRecordsRequest } from 'services/cv'
import {
  CommonCustomMetricFormikInterface,
  HealthSourceConfig
} from '../../connectors/CommonHealthSource/CommonHealthSource.types'

export interface ServiceInstanceListDisplayWithFetchProps {
  isCVSelected?: boolean
  healthSourceType: QueryRecordsRequest['healthSourceType']
  connectorIdentifier: string
  healthSourceConfig?: HealthSourceConfig
  isLogHealthSource?: boolean
}

export interface FormikValuesType extends CommonCustomMetricFormikInterface {
  serviceInstance: string | SelectOption
  serviceInstanceIdentifierTag: string | SelectOption
  indexes?: string | SelectOption[]
}
