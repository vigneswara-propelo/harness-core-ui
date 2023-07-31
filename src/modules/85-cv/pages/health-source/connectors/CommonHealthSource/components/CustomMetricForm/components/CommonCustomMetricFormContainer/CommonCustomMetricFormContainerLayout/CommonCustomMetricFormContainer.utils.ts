import { MultiTypeInputType, SelectOption } from '@harness/uicore'
import { isEmpty } from 'lodash-es'
import {
  CHART_VISIBILITY_ENUM,
  DEFAULT_VALUE
} from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.constants'
import type {
  HealthSourceParamValuesRequest,
  HealthSourceRecordsRequest,
  QueryRecordsRequest,
  QueryRecordsRequestRequestBody,
  RestResponseHealthSourceParamValuesResponse
} from 'services/cv'
import type {
  CommonCustomMetricFormikInterface,
  FieldMapping
} from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'
import { HealthSourceTypes } from '@cv/pages/health-source/types'
import type { DefineHealthSourceFormInterface } from '@cv/pages/health-source/HealthSourceDrawer/component/defineHealthSource/DefineHealthSource.types'
import type { LogFieldsMultiTypeState } from '../../../CustomMetricForm.types'

export function shouldAutoBuildChart(
  chartConfig: { enabled: boolean; chartVisibilityMode: CHART_VISIBILITY_ENUM } | undefined
): boolean {
  return !!(chartConfig?.enabled && chartConfig?.chartVisibilityMode === CHART_VISIBILITY_ENUM.AUTO)
}

export function shouldShowChartComponent({
  chartConfig,
  isQueryRuntimeOrExpression,
  isConnectorRuntimeOrExpression,
  isAnyFieldToFetchRecordsNonFixed
}: {
  chartConfig: { enabled: boolean; chartVisibilityMode: CHART_VISIBILITY_ENUM } | undefined
  isQueryRuntimeOrExpression?: boolean
  isConnectorRuntimeOrExpression?: boolean
  isAnyFieldToFetchRecordsNonFixed?: boolean
}): boolean {
  return Boolean(
    chartConfig?.enabled &&
      !(isQueryRuntimeOrExpression || isConnectorRuntimeOrExpression) &&
      !isAnyFieldToFetchRecordsNonFixed
  )
}

export function getRecordsRequestBody({
  connectorIdentifier,
  healthSourceType,
  query,
  queryField,
  queryFieldValue,
  fieldsToFetchRecords,
  values
}: {
  connectorIdentifier: any
  healthSourceType: string | undefined
  query: string
  queryField?: FieldMapping
  queryFieldValue?: string
  fieldsToFetchRecords?: FieldMapping[]
  values?: CommonCustomMetricFormikInterface
}): HealthSourceRecordsRequest | QueryRecordsRequestRequestBody {
  const { endTime, startTime } = getStartAndEndTime()
  const { identifier } = (queryField || {}) as FieldMapping

  const recordsRequestBody = {
    connectorIdentifier: connectorIdentifier?.connector?.identifier ?? connectorIdentifier,
    endTime,
    startTime,
    healthSourceType: healthSourceType as QueryRecordsRequest['healthSourceType'],
    query: query || DEFAULT_VALUE,
    healthSourceQueryParams: generateHealthSourceQueryParams({
      identifier,
      queryFieldValue,
      fieldsToFetchRecords,
      values
    })
  } as HealthSourceRecordsRequest | QueryRecordsRequestRequestBody
  return recordsRequestBody
}

export function generateHealthSourceQueryParams({
  identifier,
  queryFieldValue,
  fieldsToFetchRecords,
  values
}: {
  identifier?: string
  queryFieldValue?: string
  fieldsToFetchRecords?: FieldMapping[]
  values?: CommonCustomMetricFormikInterface
}): HealthSourceRecordsRequest['healthSourceQueryParams'] {
  let healthSourceQueryParams: HealthSourceRecordsRequest['healthSourceQueryParams'] = {}
  if (fieldsToFetchRecords) {
    for (const fieldToFetchRecords of fieldsToFetchRecords) {
      const fieldIdentifier = fieldToFetchRecords?.identifier
      const fieldValue = values?.[fieldIdentifier] as string
      healthSourceQueryParams = {
        ...healthSourceQueryParams,
        ...populateHealthSourceQueryParams(fieldIdentifier, fieldValue)
      }
    }
  } else {
    healthSourceQueryParams = {
      ...healthSourceQueryParams,
      ...populateHealthSourceQueryParams(identifier, queryFieldValue)
    }
  }
  return healthSourceQueryParams
}

export function populateHealthSourceQueryParams(
  fieldIdentifier?: string,
  fieldValue?: string
): HealthSourceRecordsRequest['healthSourceQueryParams'] {
  return { ...(fieldIdentifier && { [fieldIdentifier]: fieldValue }) }
}

export function getStartAndEndTime(): { endTime: number; startTime: number } {
  const currentTime = new Date()
  const startTime = currentTime.setHours(currentTime.getHours() - 2)
  const endTime = Date.now()
  return { endTime, startTime }
}

export const getIsLogsCanBeShown = ({
  isLogsTableEnabled,
  isDataAvailableForLogsTable,
  isQueryRuntimeOrExpression,
  isConnectorRuntimeOrExpression
}: {
  isLogsTableEnabled: boolean
  isDataAvailableForLogsTable: boolean
  isQueryRuntimeOrExpression?: boolean
  isConnectorRuntimeOrExpression?: boolean
}): boolean => {
  return Boolean(
    isLogsTableEnabled && (isDataAvailableForLogsTable || isQueryRuntimeOrExpression || isConnectorRuntimeOrExpression)
  )
}

const getAreAllLogFieldsAreFixed = (multiTypeRecord: LogFieldsMultiTypeState | null): boolean => {
  if (!multiTypeRecord || isEmpty(multiTypeRecord)) {
    return true
  }

  return Object.keys(multiTypeRecord).every(
    fieldName => multiTypeRecord[fieldName as keyof LogFieldsMultiTypeState] === MultiTypeInputType.FIXED
  )
}

export const getCanShowSampleLogButton = ({
  isTemplate,
  isQueryRuntimeOrExpression,
  isConnectorRuntimeOrExpression,
  multiTypeRecord
}: {
  isTemplate?: boolean
  isQueryRuntimeOrExpression?: boolean
  isConnectorRuntimeOrExpression?: boolean
  multiTypeRecord: LogFieldsMultiTypeState | null
}): boolean => {
  return Boolean(
    !isTemplate ||
      (!isQueryRuntimeOrExpression && !isConnectorRuntimeOrExpression && getAreAllLogFieldsAreFixed(multiTypeRecord))
  )
}

export function getHealthsourceType(
  product: DefineHealthSourceFormInterface['product'],
  sourceType: DefineHealthSourceFormInterface['sourceType']
): QueryRecordsRequest['healthSourceType'] {
  const sourceTypeInfo = product?.value || sourceType
  switch (sourceTypeInfo) {
    case HealthSourceTypes.ElasticSearch_Logs:
      return 'ElasticSearch'
    default:
      return sourceTypeInfo as QueryRecordsRequest['healthSourceType']
  }
}

export function generateRequestBodyForParamValues({
  fieldsToFetchRecords,
  values,
  connectorIdentifier,
  providerType,
  identifier
}: {
  fieldsToFetchRecords?: FieldMapping[]
  values: CommonCustomMetricFormikInterface
  connectorIdentifier: string
  providerType: string
  identifier: string
}): HealthSourceParamValuesRequest {
  const healthSourceQueryParams = generateHealthSourceQueryParams({
    fieldsToFetchRecords,
    values
  })
  const requestBody = {
    connectorIdentifier,
    providerType: providerType as HealthSourceParamValuesRequest['providerType'],
    paramName: identifier,
    ...(healthSourceQueryParams && { healthSourceQueryParams })
  }
  return requestBody
}

export function getListOptionsFromParams(data?: RestResponseHealthSourceParamValuesResponse): SelectOption[] {
  const paramValues = data?.resource?.paramValues || []
  const listOptionsData = paramValues.map(el => {
    const { name = '', value = '' } = el
    return {
      label: (name || value) as string,
      value
    }
  })
  return listOptionsData
}
