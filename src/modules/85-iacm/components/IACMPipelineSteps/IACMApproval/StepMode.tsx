import React, { ReactElement } from 'react'
import { Formik, FormikForm, FormInput } from '@harness/uicore'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'

import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { setFormikRef, StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { useStrings } from 'framework/strings'

import type { IACMApprovalData, IACMApprovalStepProps } from './types'

const IACMApprovalStepMode = (
  props: IACMApprovalStepProps,
  ref: StepFormikFowardRef<IACMApprovalData>
): ReactElement => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const { initialValues, allowableTypes, stepViewType, readonly, isNewStep, onUpdate } = props

  const handleSubmit = (value: IACMApprovalData): void => {
    if (onUpdate) {
      onUpdate(value)
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
    >
      {(formik: FormikProps<IACMApprovalData>) => {
        setFormikRef(ref, formik)
        return (
          <FormikForm>
            <FormInput.InputWithIdentifier
              isIdentifierEditable={isNewStep}
              inputGroupProps={{
                placeholder: getString('pipeline.stepNamePlaceholder'),
                disabled: readonly
              }}
            />
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
          </FormikForm>
        )
      }}
    </Formik>
  )
}

const IACMApprovalStepModeWithRef = React.forwardRef(IACMApprovalStepMode)
export default IACMApprovalStepModeWithRef
