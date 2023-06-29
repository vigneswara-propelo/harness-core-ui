import React, { useCallback } from 'react'
import { Intent } from '@harness/design-system'
import { Checkbox, FormInput, useConfirmationDialog } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { CheckboxWithPromptProps } from './CheckboxWithPrompt.types'
import css from './CheckboxWithPrompt.module.scss'

export default function CheckboxWithPrompt(props: CheckboxWithPromptProps): JSX.Element {
  const { getString } = useStrings()

  const {
    popupTitleText,
    checkBoxKey,
    checked,
    checkboxName,
    contentText,
    confirmButtonText,
    cancelButtonText,
    checkboxLabel,
    showPromptOnUnCheck,
    onChange,
    isFormikCheckbox = false,
    helperText
  } = props

  const handleOnClose = useCallback(
    didConfirm => {
      if (didConfirm) {
        onChange(false, checkboxName)
      } else {
        onChange(true, checkboxName)
      }
    },
    [checkboxName, onChange]
  )

  const { openDialog } = useConfirmationDialog({
    contentText: contentText ?? getString('common.confirmText'),
    titleText: popupTitleText ?? getString('common.confirmAction'),
    confirmButtonText: confirmButtonText ?? getString('confirm'),
    cancelButtonText: cancelButtonText ?? getString('cancel'),
    intent: Intent.WARNING,
    onCloseDialog: handleOnClose,
    className: css.popupContent
  })

  const handleCheckboxChange = useCallback(() => {
    if (checked && showPromptOnUnCheck) {
      openDialog()
    } else {
      onChange(!checked, checkboxName)
    }
  }, [checkboxName, checked, onChange, openDialog, showPromptOnUnCheck])

  if (isFormikCheckbox) {
    return (
      <FormInput.CheckBox
        name={checkboxName as string}
        checked={checked}
        key={checkBoxKey}
        label={checkboxLabel}
        onChange={handleCheckboxChange}
        helperText={helperText}
        data-testid="formikCheckbox"
      />
    )
  }

  return (
    <Checkbox
      name={checkboxName as string}
      checked={checked}
      key={checkBoxKey}
      label={checkboxLabel}
      onChange={handleCheckboxChange}
    />
  )
}

const MemoisedCheckBoxWithPrompt = React.memo(CheckboxWithPrompt)
export { MemoisedCheckBoxWithPrompt }
