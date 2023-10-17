import React, { ReactElement } from 'react'
import { Formik, FormikForm, FormInput } from '@harness/uicore'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'

import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { setFormikRef, StepFormikFowardRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { useStrings } from 'framework/strings'

import type { IACMApprovalData, IACMApprovalStepProps } from './types'

import styles from './styles.module.scss'

const IACMApprovalStepMode = (
  props: IACMApprovalStepProps,
  ref: StepFormikFowardRef<IACMApprovalData>
): ReactElement => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const { initialValues, allowableTypes, stepViewType, readonly, isNewStep, onUpdate, onChange } = props

  const handleSubmit = (value: IACMApprovalData): void => {
    if (onUpdate) {
      onUpdate(value)
    }
  }

  const handleValidate = (values: IACMApprovalData): void => {
    if (onChange) {
      onChange(values)
    }
  }

  const validationSchema = Yup.object({
    ...getNameAndIdentifierSchema(getString, stepViewType),
    timeout: getDurationValidationSchema({
      minimum: '10s',
      maximum: '1h',
      maximumErrorMessage: getString('iacm.betaMaxTimeoutMessage')
    }).required(getString('validation.timeout10SecMinimum'))
  })

  return (
    <Formik<IACMApprovalData>
      onSubmit={handleSubmit}
      initialValues={initialValues}
      formName="iacmApproval"
      validationSchema={validationSchema}
      validate={handleValidate}
    >
      {(formik: FormikProps<IACMApprovalData>) => {
        setFormikRef(ref, formik)
        return (
          <FormikForm>
            {stepViewType !== StepViewType.Template && (
              <FormInput.InputWithIdentifier
                isIdentifierEditable={isNewStep}
                inputGroupProps={{
                  placeholder: getString('pipeline.stepNamePlaceholder'),
                  disabled: readonly
                }}
              />
            )}
            <FormMultiTypeDurationField
              label={getString('pipelineSteps.timeoutLabel')}
              name="timeout"
              multiTypeDurationProps={{
                enableConfigureOptions: false,
                expressions,
                allowableTypes,
                disabled: readonly
              }}
            />
            <FormInput.CheckBox
              className={styles.checkBox}
              label={getString('iacm.autoApproveStep')}
              name="spec.autoApprove"
              disabled={readonly}
            />
          </FormikForm>
        )
      }}
    </Formik>
  )
}

const IACMApprovalStepModeWithRef = React.forwardRef(IACMApprovalStepMode)
export default IACMApprovalStepModeWithRef
