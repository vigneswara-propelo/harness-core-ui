import { CHART_VISIBILITY_ENUM } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.constants'
import type { HealthSourceRecordsRequest, QueryRecordsRequestRequestBody } from 'services/cv'

export function shouldAutoBuildChart(
  chartConfig: { enabled: boolean; chartVisibilityMode: CHART_VISIBILITY_ENUM } | undefined
): boolean {
  return !!(chartConfig?.enabled && chartConfig?.chartVisibilityMode === CHART_VISIBILITY_ENUM.AUTO)
}

export function shouldShowChartComponent(
  chartConfig: { enabled: boolean; chartVisibilityMode: CHART_VISIBILITY_ENUM } | undefined,
  records: Record<string, any>[],
  fetchingSampleRecordLoading: boolean,
  query: string
): boolean {
  return !!(query && chartConfig?.enabled && records && records?.length && !fetchingSampleRecordLoading)
}

export function getRecordsRequestBody(
  connectorIdentifier: any,
  providerType: string,
  query: string
): HealthSourceRecordsRequest | QueryRecordsRequestRequestBody {
  const { endTime, startTime } = getStartAndEndTime()

  const recordsRequestBody = {
    connectorIdentifier,
    endTime,
    startTime,
    providerType: providerType as HealthSourceRecordsRequest['providerType'],
    query
  }
  return recordsRequestBody
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

export const getCanShowSampleLogButton = ({
  isTemplate,
  isQueryRuntimeOrExpression,
  isConnectorRuntimeOrExpression
}: {
  isTemplate?: boolean
  isQueryRuntimeOrExpression?: boolean
  isConnectorRuntimeOrExpression?: boolean
}): boolean => {
  return Boolean(!isTemplate || (!isQueryRuntimeOrExpression && !isConnectorRuntimeOrExpression))
}
