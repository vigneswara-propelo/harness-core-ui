import { getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import {
  CommonCustomMetricFormikInterface,
  FieldMapping
} from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'

export function getIsFetchRecordsHidden(
  fieldsToFetchRecords: FieldMapping[],
  values: CommonCustomMetricFormikInterface,
  isConnectorRuntimeOrExpression: boolean
): boolean {
  const isAnyFieldToFetchRecordsNonFixed = getIsAnyFieldNonFixed(fieldsToFetchRecords, values)
  return isConnectorRuntimeOrExpression || isAnyFieldToFetchRecordsNonFixed
}

export function getIsAnyFieldNonFixed(
  fieldsToFetchRecords: FieldMapping[],
  values: CommonCustomMetricFormikInterface
): boolean {
  return fieldsToFetchRecords.some(
    field => getMultiTypeFromValue(values[field.identifier]) !== MultiTypeInputType.FIXED
  )
}
