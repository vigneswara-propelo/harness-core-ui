import React, { useCallback } from 'react'
import { useFormikContext } from 'formik'
import { useStrings } from 'framework/strings'
import { MemoisedCheckBoxWithPrompt } from '../CheckboxWithPrompt/CheckboxWithPrompt'
import { isGivenMetricNameContainsThresholds } from '../MetricThresholds/MetricThresholds.utils'
import type { CVPromptCheckboxProps, CommonHealthSourceProperties } from './CVPromptCheckbox.types'

export default function CVPromptCheckbox({
  checkboxName,
  checkboxLabel,
  checked,
  contentText,
  filterRemovedMetricNameThresholds,
  formikValues,
  selectedMetric,
  isFormikCheckbox,
  helperText
}: CVPromptCheckboxProps): JSX.Element {
  const { getString } = useStrings()

  const { setFieldValue } = useFormikContext<CommonHealthSourceProperties>()

  const getShowPromptOnUnCheck = useCallback((): boolean => {
    return Boolean(isGivenMetricNameContainsThresholds(formikValues, selectedMetric))
  }, [formikValues, selectedMetric])

  const handleCVChange = useCallback(
    (updatedValue: boolean, identifier?: string) => {
      if (identifier) {
        setFieldValue(identifier, updatedValue)
        if (!updatedValue && getShowPromptOnUnCheck()) {
          filterRemovedMetricNameThresholds(selectedMetric)
        }
      }
    },
    [setFieldValue, getShowPromptOnUnCheck, filterRemovedMetricNameThresholds, selectedMetric]
  )

  return (
    <MemoisedCheckBoxWithPrompt
      checkboxName={checkboxName}
      checkboxLabel={checkboxLabel ?? getString('cv.monitoredServices.continuousVerification')}
      checked={checked}
      key={checkboxName}
      checkBoxKey={checkboxName}
      contentText={contentText ?? getString('cv.metricThresholds.cvUncheckPromptContent')}
      popupTitleText={getString('common.warning')}
      onChange={handleCVChange}
      showPromptOnUnCheck={getShowPromptOnUnCheck()}
      isFormikCheckbox={isFormikCheckbox}
      helperText={helperText}
    />
  )
}
