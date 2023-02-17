import { isEmpty } from 'lodash-es'
import type { CommonCustomMetricFormikInterface } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'

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

export function getIsQueryFieldNotPresent(
  queryFieldIdentifier: string | undefined,
  values: CommonCustomMetricFormikInterface
): boolean {
  return Boolean(queryFieldIdentifier && !values[queryFieldIdentifier as keyof CommonCustomMetricFormikInterface])
}
