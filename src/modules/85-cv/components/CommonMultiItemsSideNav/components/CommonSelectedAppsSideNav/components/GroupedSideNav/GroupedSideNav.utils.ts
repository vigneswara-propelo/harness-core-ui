import type { FormikTouched } from 'formik'
import { isEmpty } from 'lodash-es'
import type { GroupedMetric } from './GroupedSideNav.types'

export function showWarningIcon({
  touched,
  isValidInput,
  selectedApp,
  selectedItem
}: {
  touched: FormikTouched<unknown>
  isValidInput?: boolean
  selectedApp: GroupedMetric
  selectedItem?: string
}): boolean {
  return !isEmpty(touched) && !isValidInput && selectedApp?.metricName === selectedItem
}
