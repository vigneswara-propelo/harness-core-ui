import type { QueryRecordsRequest } from 'services/cv'
import type { HealthSourceProductsType } from './CommonHealthSource.types'

export const BasePathKeyPrefix = 'basePathDropdown_'
export const BasePathInitValue = { basePathDropdown_0: { value: '', path: '' } }

export const MetricPathKeyPrefix = 'metricPathDropdown_'
export const MetricPathInitValue = { metricPathDropdown_0: { value: '', path: '', isMetric: false } }

export const DEFAULT_HEALTH_SOURCE_QUERY = 'Health Source Query'
export const METRICS = 'METRICS'
export const HealthSourceProducts: HealthSourceProductsType = {
  SUMOLOGIC_METRICS: {
    label: 'SumoLogic Cloud Metrics',
    value: 'SUMOLOGIC_METRICS'
  },
  SUMOLOGIC_LOG: {
    label: 'SumoLogic Cloud Logs',
    value: 'SUMOLOGIC_LOG'
  }
}

export const initConfigurationsForm = {
  customMetricsMap: new Map(),
  selectedMetric: '',
  ignoreThresholds: [],
  failFastThresholds: []
}

export const initCustomForm = {
  sli: false,
  healthScore: false,
  continuousVerification: false,
  serviceInstanceMetricPath: ''
}

export const ThresholdTypes: Record<string, 'IgnoreThreshold' | 'FailImmediately'> = {
  IgnoreThreshold: 'IgnoreThreshold',
  FailImmediately: 'FailImmediately'
}

export const CommonHealthSourceFieldNames = {
  METRIC_NAME: 'metricName',
  METRIC_IDENTIFIER: 'identifier',
  GROUP_NAME: 'groupName',

  QUERY: 'query',

  METRIC_VALUE: 'metricValue',
  TIMESTAMP_LOCATOR: 'timestamp',
  TIMESTAMP_FORMAT: 'timestampFormat',
  SERVICE_INSTANCE: 'serviceInstance',

  SLI: 'sli',
  HEALTH_SCORE: 'healthScore',
  CONTINUOUS_VERIFICATION: 'continuousVerification',

  RISK_CATEGORY: 'riskCategory',
  HIGHER_BASELINE_DEVIATION: 'higherBaselineDeviation',
  LOWER_BASELINE_DEVIATION: 'lowerBaselineDeviation'
}

export enum FIELD_ENUM {
  JSON_SELECTOR = 'JsonSelector',
  TEXT_INPUT = 'TextInput',
  DROPDOWN = 'Dropdown'
}

export enum CHART_VISIBILITY_ENUM {
  AUTO = 'auto',
  DEFAULT = 'default'
}
// Logs table constants

export enum FieldMappingInputTypes {
  JsonSelector = 'JsonSelector'
}

export const logsTableDefaultConfigs = {
  size: '40%'
}

export const ProviderTypes: Record<string, QueryRecordsRequest['providerType']> = {
  SumoLogic_LOGS: 'SUMOLOGIC_LOG'
}

export enum CommonHealthSourceContextFields {
  SelectedMetric = 'selectedMetric',
  CustomMetricsMap = 'customMetricsMap'
}
