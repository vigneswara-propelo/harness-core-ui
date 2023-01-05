/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FormikErrors, FormikProps } from 'formik'
import { cloneDeep, set } from 'lodash-es'
import { RUNTIME_INPUT_VALUE, getMultiTypeFromValue, MultiTypeInputType, SelectOption } from '@harness/uicore'
import type { UseStringsReturn } from 'framework/strings'
import type { NextGenHealthSourceSpec, QueryRecordsRequest, RiskProfile } from 'services/cv'
import { initializeSelectedMetricsMap } from '../../common/CommonCustomMetric/CommonCustomMetric.utils'
import type { UpdatedHealthSource } from '../../HealthSourceDrawer/HealthSourceDrawerContent.types'
import { HealthSourceTypes } from '../../types'
import {
  initCustomForm,
  ProviderTypes,
  FIELD_ENUM,
  DEFAULT_HEALTH_SOURCE_QUERY,
  CustomMetricFormFieldNames
} from './CommonHealthSource.constants'
import type {
  HealthSourcePayload,
  HealthSourceConfig,
  CommonCustomMetricFormikInterface,
  FieldMapping,
  CommonHealthSourceConfigurations
} from './CommonHealthSource.types'
import { DEFAULT_LOGS_GROUP_NAME } from './components/CustomMetricForm/CustomMetricForm.constants'
import {
  getFilteredMetricThresholdValuesV2,
  getMetricThresholdsForCustomMetric
} from '../../common/MetricThresholds/MetricThresholds.utils'
import { MetricThresholdTypes } from '../../common/MetricThresholds/MetricThresholds.constants'
import type { MetricThresholdType } from '../../common/MetricThresholds/MetricThresholds.types'

export const initHealthSourceCustomForm = () => {
  return {
    ...initCustomForm,
    groupName: { label: '', value: '' }
  }
}

export const resetShowCustomMetric = (
  selectedMetric: string,
  mappedMetrics: Map<string, CommonCustomMetricFormikInterface>,
  setShowCustomMetric: (value: React.SetStateAction<boolean | undefined>) => void
): void => {
  if (!selectedMetric && !mappedMetrics.size) {
    setShowCustomMetric(false)
  }
}

/**
 * Common health source config relates helper functions
 *
 */

/**
 *
 * @param healthSourceConfig
 * @returns boolean
 *
 * It returns true if
 * custom metrics is enabled (AND)
 * Has fieldMappings in the configs (AND)
 * Atleast one field in fieldMappings contains component type as JsonSelector.
 */
export function getIsLogsTableVisible(healthSourceConfig: HealthSourceConfig): boolean {
  const { customMetrics } = healthSourceConfig || {}

  if (!customMetrics?.enabled || !customMetrics?.logsTable?.enabled || !customMetrics?.fieldMappings) {
    return false
  }

  return customMetrics?.fieldMappings.some(field => field.type === FIELD_ENUM.JSON_SELECTOR)
}

export function getFieldsDefaultValuesFromConfig(
  values: CommonCustomMetricFormikInterface,
  logsTableConfig?: FieldMapping[]
): Partial<CommonCustomMetricFormikInterface> {
  if (!Array.isArray(logsTableConfig) || !values) {
    return {}
  }

  const valuesToUpdate: Partial<CommonCustomMetricFormikInterface> = {}

  for (const field of logsTableConfig) {
    if (!values[field.identifier] && field.defaultValue) {
      ;(valuesToUpdate[field.identifier] as string) = field.defaultValue
    }
  }

  return valuesToUpdate
}

export function getTemplateValuesForConfigFields(
  values: CommonCustomMetricFormikInterface,
  logsTableConfig?: FieldMapping[]
): Partial<CommonCustomMetricFormikInterface> {
  if (!Array.isArray(logsTableConfig) || !values) {
    return {}
  }

  const valuesToUpdate: Partial<CommonCustomMetricFormikInterface> = {}

  for (const field of logsTableConfig) {
    const isCurrentValueIsExpression = getMultiTypeFromValue(values[field.identifier]) === MultiTypeInputType.EXPRESSION
    if (!isCurrentValueIsExpression) {
      ;(valuesToUpdate[field.identifier] as string) = RUNTIME_INPUT_VALUE
    }
  }

  return valuesToUpdate
}

// 🚨 TODO: Type it correctly
export function getProviderType(sourceData: any): QueryRecordsRequest['providerType'] | null {
  if (!sourceData) {
    return null
  }

  const { product } = sourceData
  const { value } = product || {}

  return ProviderTypes[value]
}

export function getRequestBodyForSampleLogs(
  providerType: QueryRecordsRequest['providerType'],
  otherValues: {
    query: string
    connectorIdentifier: string
    serviceInstance: string
  }
): QueryRecordsRequest | null {
  switch (providerType) {
    case ProviderTypes.SUMOLOGIC_LOG: {
      const currentTime = new Date()
      const startTime = currentTime.setHours(currentTime.getHours() - 2)

      const { connectorIdentifier, query, serviceInstance } = otherValues

      return {
        startTime,
        endTime: Date.now(),
        providerType,
        query,
        connectorIdentifier,
        healthSourceQueryParams: {
          serviceInstanceField: serviceInstance
        }
      }
    }
    default: {
      return null
    }
  }
}

export const getIsConnectorRuntimeOrExpression = (
  connectorRef?: HealthSourcePayload['spec']['connectorRef']
): boolean => {
  if (!connectorRef) {
    return false
  }

  const connectorValue = ((connectorRef as unknown as SelectOption)?.value || connectorRef) as string
  return getMultiTypeFromValue(connectorValue) !== MultiTypeInputType.FIXED
}

export const getIsQueryRuntimeOrExpression = (query?: string): boolean => {
  if (!query) {
    return false
  }

  return getMultiTypeFromValue(query) !== MultiTypeInputType.FIXED
}

// Validation functions
export const handleValidateCustomMetricForm = (
  formData: CommonCustomMetricFormikInterface,
  getString: UseStringsReturn['getString']
): FormikErrors<CommonCustomMetricFormikInterface> => {
  const errors: FormikErrors<CommonCustomMetricFormikInterface> = {}
  const { query = '' } = formData

  if (!query) {
    set(errors, CustomMetricFormFieldNames.QUERY, getString('fieldRequired', { field: 'Query' }))
  }

  // validation for assign section can be added here.
  return errors
}

export const handleValidateHealthSourceConfigurationsForm = (): FormikErrors<CommonHealthSourceConfigurations> => {
  const errors: FormikErrors<CommonHealthSourceConfigurations> = {}
  // const { ignoreThresholds = [], failFastThresholds = [] } = formData || {}

  // TODO - validations for metric threshold section can be added here.
  return errors
}

export function checkIfCurrentCustomMetricFormIsValid(
  customMetricFormRef: React.MutableRefObject<FormikProps<CommonCustomMetricFormikInterface> | undefined>
): boolean {
  return Boolean(customMetricFormRef?.current && customMetricFormRef?.current.isValid)
}

export const createHealthSourcePayload = (
  defineHealthSourcedata: {
    product: SelectOption
    sourceType: string
    healthSourceIdentifier: string
    healthSourceName: string
    connectorRef: string
  },
  consfigureHealthSourceData: CommonHealthSourceConfigurations,
  isTemplate?: boolean
): UpdatedHealthSource => {
  const isMetricThresholdEnabled = !isTemplate
  const { product, healthSourceName, healthSourceIdentifier, connectorRef } = defineHealthSourcedata
  const productValue = (product?.value ?? product) as string
  const { customMetricsMap = new Map(), ignoreThresholds, failFastThresholds } = consfigureHealthSourceData

  const healthSourcePayload = {
    type: HealthSourceTypes.NextGenHealthSource as UpdatedHealthSource['type'],
    identifier: healthSourceIdentifier,
    name: healthSourceName,
    spec: {
      connectorRef: connectorRef as string,
      dataSourceType: productValue as NextGenHealthSourceSpec['dataSourceType'],
      queryDefinitions: [] as NextGenHealthSourceSpec['queryDefinitions']
    }
  }

  for (const entry of customMetricsMap.entries()) {
    const {
      identifier,
      metricName,
      groupName,
      query,
      sli,
      continuousVerification,
      healthScore,
      serviceInstance
    }: CommonCustomMetricFormikInterface = entry[1]
    const groupNameValue = ((groupName as SelectOption)?.value ?? groupName) as string

    healthSourcePayload?.spec?.queryDefinitions &&
      healthSourcePayload?.spec?.queryDefinitions.push({
        identifier,
        name: metricName,
        groupName: groupNameValue,
        query,
        queryParams: {
          ...(serviceInstance && { serviceInstanceField: serviceInstance as string })
        },
        liveMonitoringEnabled: Boolean(healthScore),
        continuousVerificationEnabled: Boolean(continuousVerification),
        sliEnabled: Boolean(sli),
        metricThresholds:
          Array.isArray(ignoreThresholds) && Array.isArray(failFastThresholds)
            ? getMetricThresholdsForCustomMetric({
                metricName,
                isMetricThresholdEnabled,
                metricThresholds: [...ignoreThresholds, ...failFastThresholds]
              })
            : [],

        // TODO this will be taken from assign section when the section is implemented
        riskProfile: {
          category: 'Performance' as RiskProfile['category'],
          metricType: 'INFRA' as RiskProfile['metricType'],
          riskCategory: 'Errors' as RiskProfile['riskCategory'],
          thresholdTypes: ['ACT_WHEN_LOWER'] as RiskProfile['thresholdTypes']
        }
      })
  }

  return healthSourcePayload
}

export function createHealthSourceConfigurationsData(
  sourceData: any,
  isTemplate?: boolean
): CommonHealthSourceConfigurations {
  const {
    healthSourceList = [],
    isEdit = false,
    healthSourceIdentifier = '',
    customMetricsMap = new Map(),
    selectedMetric = ''
  } = sourceData
  let customMetricsMapData = cloneDeep(customMetricsMap)

  let ignoreThresholds: MetricThresholdType[] = []
  let failFastThresholds: MetricThresholdType[] = []

  if (isEdit && customMetricsMap.size === 0) {
    const currentHealthSource = healthSourceList.find(
      (healthSource: { identifier: string }) => healthSource?.identifier === healthSourceIdentifier
    )
    const { queryDefinitions = [] } = currentHealthSource?.spec || {}
    customMetricsMapData = cloneDeep(getUpdatedCustomMetrics(queryDefinitions))

    if (!isTemplate) {
      ignoreThresholds = getFilteredMetricThresholdValuesV2(MetricThresholdTypes.IgnoreThreshold, [], queryDefinitions)
      failFastThresholds = getFilteredMetricThresholdValuesV2(
        MetricThresholdTypes.FailImmediately,
        [],
        queryDefinitions
      )
    }
  }

  return {
    customMetricsMap: customMetricsMapData,
    selectedMetric: getSelectedMetric(selectedMetric, customMetricsMapData),

    // metric thresholds section can be updated here.
    ignoreThresholds,
    failFastThresholds
  }
}

function getUpdatedCustomMetrics(
  queryDefinitions: NextGenHealthSourceSpec['queryDefinitions']
): CommonHealthSourceConfigurations['customMetricsMap'] {
  const updatedCustomMetricsMap = new Map()
  if (queryDefinitions?.length) {
    for (const queryDefinition of queryDefinitions) {
      if (queryDefinition?.name) {
        updatedCustomMetricsMap.set(queryDefinition.name, {
          identifier: queryDefinition.identifier,
          metricName: queryDefinition.name,
          query: queryDefinition.query || '',
          riskCategory: queryDefinition?.riskProfile?.category,
          serviceInstance: queryDefinition?.queryParams?.serviceInstanceField,
          lowerBaselineDeviation: queryDefinition?.riskProfile?.thresholdTypes?.includes('ACT_WHEN_LOWER') || false,
          higherBaselineDeviation: queryDefinition?.riskProfile?.thresholdTypes?.includes('ACT_WHEN_HIGHER') || false,
          groupName: queryDefinition?.groupName
            ? { label: queryDefinition?.groupName, value: queryDefinition?.groupName }
            : DEFAULT_LOGS_GROUP_NAME,
          continuousVerification: queryDefinition?.continuousVerificationEnabled,
          healthScore: queryDefinition?.liveMonitoringEnabled,
          sli: queryDefinition?.sliEnabled
        } as CommonCustomMetricFormikInterface)
      }
    }
  }

  return updatedCustomMetricsMap
}

export function getSelectedMetric(
  selectedMetric: string,
  customMetricsMapData: CommonHealthSourceConfigurations['customMetricsMap']
): string {
  let selectedMetricData = ''
  if (selectedMetric) {
    selectedMetricData = selectedMetric
  } else {
    if (customMetricsMapData?.size > 0) {
      selectedMetricData = customMetricsMapData.entries().next().value[0]
    }
  }
  return selectedMetricData
}

export function getInitialValuesForHealthSourceConfigurations(
  configurationsPageData: CommonHealthSourceConfigurations
): CommonHealthSourceConfigurations {
  const { selectedMetric, mappedMetrics } = initializeSelectedMetricsMap(
    DEFAULT_HEALTH_SOURCE_QUERY,
    initHealthSourceCustomForm(),
    configurationsPageData?.customMetricsMap || new Map(),
    configurationsPageData?.selectedMetric
  )

  const healthSourceConfigurationsInitialValues = getHealthSourceConfigurations(
    configurationsPageData,
    mappedMetrics,
    selectedMetric
  )
  return healthSourceConfigurationsInitialValues
}

export function getHealthSourceConfigurations(
  configurationsPageData: CommonHealthSourceConfigurations,
  mappedMetrics: Map<string, CommonCustomMetricFormikInterface>,
  selectedMetric: string
): CommonHealthSourceConfigurations {
  const { ignoreThresholds = [], failFastThresholds = [] } = configurationsPageData

  return {
    // Custom metric fields
    customMetricsMap: mappedMetrics,
    selectedMetric,

    // metric threshold section
    ignoreThresholds,
    failFastThresholds
  }
}

export function getCurrentQueryData(
  customMetricsMap: Map<string, CommonCustomMetricFormikInterface>,
  currentSelectedMetric: string
): CommonCustomMetricFormikInterface {
  return (
    currentSelectedMetric && customMetricsMap.has(currentSelectedMetric)
      ? customMetricsMap?.get(currentSelectedMetric)
      : {}
  ) as CommonCustomMetricFormikInterface
}
