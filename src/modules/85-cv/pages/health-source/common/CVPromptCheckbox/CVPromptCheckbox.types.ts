import type {
  CommonFormTypesForMetricThresholds,
  MetricThresholdType
} from '../MetricThresholds/MetricThresholds.types'

export interface CVPromptCheckboxProps {
  checkboxLabel?: string
  checked: boolean
  onChange?: (updatedValue: boolean, identifier?: string) => void
  checkboxName: string
  checkBoxKey?: React.Key | null
  confirmButtonText?: string
  cancelButtonText?: string
  contentText?: string
  showPromptOnUnCheck?: boolean
  filterRemovedMetricNameThresholds: (metricName: string) => void
  isFormikCheckbox?: boolean
  helperText?: string
  formikValues: CommonFormTypesForMetricThresholds
  selectedMetric: string
}

export interface CommonHealthSourceProperties {
  ignoreThresholds: MetricThresholdType[]
  failFastThresholds: MetricThresholdType[]
  continuousVerification?: boolean
  metricName: string
}
