import { SelectOption } from '@harness/uicore'
import type {
  CommonCustomMetricFormikInterface,
  FieldMapping
} from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'
import type { QueryRecordsRequest, QueryRecordsRequestRequestBody } from 'services/cv'
import { getRecordsRequestBody } from '../../connectors/CommonHealthSource/components/CustomMetricForm/components/CommonCustomMetricFormContainer/CommonCustomMetricFormContainerLayout/CommonCustomMetricFormContainer.utils'
import { FormikValuesType } from './ServiceInstanceList.types'
import { getRequestBodyForSampleLogs } from '../../connectors/CommonHealthSource/CommonHealthSource.utils'

export function getRecordsRequestBodyWithServiceInstance({
  connectorIdentifier,
  healthSourceType,
  query,
  fieldsToFetchRecords,
  values
}: {
  connectorIdentifier: string
  healthSourceType: string | undefined
  query: string
  queryField?: FieldMapping
  queryFieldValue?: string
  fieldsToFetchRecords?: FieldMapping[]
  values?: CommonCustomMetricFormikInterface
}): QueryRecordsRequestRequestBody {
  const fetchMetricsRecordsRequestBody = getRecordsRequestBody({
    connectorIdentifier,
    healthSourceType,
    query,
    fieldsToFetchRecords,
    values
  })

  const { serviceInstanceField } = values ?? {}

  const serviceInstanceFieldValue =
    typeof serviceInstanceField === 'string' ? serviceInstanceField : (serviceInstanceField?.value as string)

  const serviceInstanceAddedQueryParams = {
    ...fetchMetricsRecordsRequestBody,
    healthSourceQueryParams: {
      ...fetchMetricsRecordsRequestBody.healthSourceQueryParams,
      serviceInstanceField: serviceInstanceFieldValue
    }
  }

  return serviceInstanceAddedQueryParams
}

export const getServiceInstanceIdentifierValue = (formValue: FormikValuesType): string | SelectOption => {
  const { serviceInstance, serviceInstanceIdentifierTag, serviceInstanceField } = formValue || {}

  return serviceInstanceField ?? serviceInstance ?? serviceInstanceIdentifierTag
}

const getIndexesValues = (indexes?: string | SelectOption[]): Array<string> | undefined => {
  if (Array.isArray(indexes) && indexes.length) {
    return indexes.map(index => index.value as string)
  }

  return undefined
}

export const getLogRecordsRequestBody = ({
  healthSourceType,
  connectorIdentifier,
  query,
  formValues
}: {
  healthSourceType: QueryRecordsRequest['healthSourceType']
  query?: string
  connectorIdentifier: string | { connector: { identifier: string } }
  formValues: FormikValuesType
}): QueryRecordsRequest => {
  const fetchSampleLogsPayload = getRequestBodyForSampleLogs(healthSourceType, {
    connectorIdentifier,
    query,
    formValues
  })

  const { indexes } = formValues || {}

  const sampleLogsPayloadWithServiceInstance = {
    ...fetchSampleLogsPayload,
    healthSourceQueryParams: {
      ...fetchSampleLogsPayload?.healthSourceQueryParams,
      serviceInstanceField: formValues.serviceInstanceField,
      indexes: getIndexesValues(indexes)
    }
  }

  return sampleLogsPayloadWithServiceInstance as QueryRecordsRequest
}
