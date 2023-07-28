/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { isEmpty } from 'lodash-es'
import type { UseStringsReturn } from 'framework/strings'
import type {
  CommonCustomMetricFormikInterface,
  FieldMapping
} from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'
import { getRunQueryButtonTooltip } from './components/CommonQueryContent/CommonQueryContent.utils'

export function getIsQueryButtonDisabledWhenFieldsPresent({
  loading,
  areAllFieldsNotPopulated
}: {
  loading: boolean
  areAllFieldsNotPopulated: boolean
}): boolean {
  return loading || areAllFieldsNotPopulated
}

export function getIsQueryButtonDisabled({
  query,
  loading,
  queryFieldIdentifier,
  values
}: {
  query: string
  loading: boolean
  queryFieldIdentifier: string | undefined
  values: CommonCustomMetricFormikInterface
}): boolean {
  return Boolean(isEmpty(query) || loading || getIsQueryFieldNotPresent(queryFieldIdentifier, values))
}

export function getAreAllFieldsNotPopulated(
  fieldsToFetchRecords: FieldMapping[],
  values: CommonCustomMetricFormikInterface
): boolean {
  let numOfFieldsPopulated = 0
  for (const fieldToFetchRecords of fieldsToFetchRecords) {
    if (!getIsQueryFieldNotPresent(fieldToFetchRecords?.identifier, values)) {
      numOfFieldsPopulated++
    }
  }
  const areAllFieldsNotPopulated = numOfFieldsPopulated !== fieldsToFetchRecords.length
  return areAllFieldsNotPopulated
}

export function getIsQueryFieldNotPresent(
  queryFieldIdentifier: string | undefined,
  values: CommonCustomMetricFormikInterface
): boolean {
  return Boolean(queryFieldIdentifier && !values[queryFieldIdentifier as keyof CommonCustomMetricFormikInterface])
}

export function getRunQueryBtnTooltip({
  queryFieldIdentifier,
  values,
  query,
  getString,
  fieldsToFetchRecords
}: {
  queryFieldIdentifier?: string
  values: CommonCustomMetricFormikInterface
  query: string
  getString: UseStringsReturn['getString']
  fieldsToFetchRecords?: FieldMapping[]
}): string {
  let tooltipMessage = ''
  if (fieldsToFetchRecords) {
    const areAllFieldsNotPopulated = getAreAllFieldsNotPopulated(fieldsToFetchRecords, values)
    tooltipMessage = areAllFieldsNotPopulated
      ? getString('cv.monitoringSources.commonHealthSource.query.selectAllFieldsToFetchRecords')
      : ''
  } else {
    const isQueryFieldNotPresent = getIsQueryFieldNotPresent(queryFieldIdentifier, values)
    tooltipMessage = getRunQueryButtonTooltip(query, isQueryFieldNotPresent, queryFieldIdentifier, getString)
  }
  return tooltipMessage
}

export const shouldShowCommonRecords = ({
  isQueryRuntimeOrExpression,
  isConnectorRuntimeOrExpression,
  hideRecords
}: {
  isQueryRuntimeOrExpression?: boolean
  isConnectorRuntimeOrExpression?: boolean
  hideRecords?: boolean
}): boolean => {
  return !(isQueryRuntimeOrExpression || isConnectorRuntimeOrExpression) && !hideRecords
}
