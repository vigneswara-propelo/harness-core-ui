/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IOptionProps } from '@blueprintjs/core'
import { MultiTypeInputType, getMultiTypeFromValue } from '@harness/uicore'
import { RadioGroupProps } from '@harness/uicore/dist/components/FormikForm/FormikForm'
import { HealthSourceTypes } from '@cv/pages/health-source/types'
import type { MetricPackDTO, QueryRecordsRequest, RiskCategoryDTO } from 'services/cv'
import { DatadogProduct } from '@cv/pages/health-source/connectors/DatadogMetricsHealthSource/DatadogMetricsHealthSource.utils'

export function getRiskCategoryOptions(metricPacks?: MetricPackDTO[]): IOptionProps[] {
  if (!metricPacks?.length) {
    return []
  }

  const riskCategoryOptions: IOptionProps[] = []
  for (const metricPack of metricPacks) {
    if (metricPack?.identifier && metricPack.metrics?.length) {
      for (const metric of metricPack.metrics) {
        if (!metric?.name) {
          continue
        }

        riskCategoryOptions.push({
          label: metricPack.category !== metric.name ? `${metricPack.category}/${metric.name}` : metricPack.category,
          value: `${metricPack.category}/${metric.type}`
        })
      }
    }
  }

  return riskCategoryOptions
}

export function getRiskCategoryOptionsV2(riskCategories?: RiskCategoryDTO[]): RadioGroupProps['items'] {
  if (!Array.isArray(riskCategories) || !riskCategories?.length) {
    return []
  }

  const riskCategoryOptions: RadioGroupProps['items'] = []
  for (const riskCategory of riskCategories) {
    const { identifier, displayName } = riskCategory || {}
    if (identifier && displayName) {
      riskCategoryOptions.push({
        label: displayName,
        value: identifier,
        tooltipId: `RiskCategory_${identifier}`
      })
    }
  }

  return riskCategoryOptions
}

export const getCanShowServiceInstanceNames = ({
  showServiceInstanceNames,
  serviceInstance,
  isConnectorRuntimeOrExpression,
  sourceType,
  dataSourceType,
  metricType,
  query
}: {
  showServiceInstanceNames?: boolean
  serviceInstance?: string
  isConnectorRuntimeOrExpression?: boolean
  sourceType: HealthSourceTypes
  dataSourceType?: string
  metricType?: string
  query?: string
}): boolean => {
  const isQueryRuntimeOrExpression = getMultiTypeFromValue(query) !== MultiTypeInputType.FIXED
  const isServiceInstanceRuntimeOrExpression = getMultiTypeFromValue(serviceInstance) !== MultiTypeInputType.FIXED

  /**
   * 💡 Service instance names section is enabled only for Prometheus and Datadog in metrics
   */
  return Boolean(
    showServiceInstanceNames &&
      query &&
      serviceInstance &&
      !isConnectorRuntimeOrExpression &&
      !isServiceInstanceRuntimeOrExpression &&
      !isQueryRuntimeOrExpression &&
      ((sourceType === HealthSourceTypes.Prometheus && dataSourceType === HealthSourceTypes.Prometheus) ||
        sourceType === HealthSourceTypes.DatadogMetrics ||
        metricType === DatadogProduct.CLOUD_METRICS)
  )
}

export const getHealthSourceTypeForServiceInstanceNames = (
  healthSourceType: QueryRecordsRequest['healthSourceType']
): QueryRecordsRequest['healthSourceType'] => {
  if (healthSourceType === HealthSourceTypes.Prometheus || healthSourceType === HealthSourceTypes.DatadogMetrics) {
    return healthSourceType
  } else if (healthSourceType === (HealthSourceTypes.Datadog as QueryRecordsRequest['healthSourceType'])) {
    return HealthSourceTypes.DatadogMetrics
  }
}
