import React from 'react'
import type { FormikProps } from 'formik'
import * as Yup from 'yup'
import { get } from 'lodash-es'
import { Formik, FormInput, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import cx from 'classnames'
import { setFormikRef, StepFormikFowardRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useStrings } from 'framework/strings'
import { FormMultiTypeCheckboxField } from '@common/components/MultiTypeCheckbox/MultiTypeCheckbox'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { ALLOWED_VALUES_TYPE } from '@common/components/ConfigureOptions/constants'

import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import type { AsgTrafficShiftData, AsgTrafficShiftProps } from './AsgTrafficShiftStep'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const AsgTrafficShiftWidget = (
  props: AsgTrafficShiftProps,
  formikRef: StepFormikFowardRef<AsgTrafficShiftData>
): React.ReactElement => {
  const { initialValues, onUpdate, isNewStep, readonly, allowableTypes, stepViewType, onChange } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  return (
    <>
      <Formik<AsgTrafficShiftData>
        onSubmit={(values: AsgTrafficShiftData) => {
          if (onUpdate) {
            onUpdate(values)
          }
        }}
        validate={(values: AsgTrafficShiftData) => {
          if (onChange) {
            onChange(values)
          }
        }}
        formName="AsgTrafficShift"
        initialValues={initialValues}
        validationSchema={Yup.object().shape({
          ...getNameAndIdentifierSchema(getString, stepViewType),
          timeout: getDurationValidationSchema({ minimum: '10s' }).required(
            getString('validation.timeout10SecMinimum')
          ),
          spec: Yup.object().shape({
            weight: Yup.mixed().required(
              getString('common.validation.fieldIsRequired', {
                name: getString('cd.asgWeight')
              })
            )
          })
        })}
      >
        {(formik: FormikProps<AsgTrafficShiftData>) => {
          setFormikRef(formikRef, formik)
          return (
            <>
              {stepViewType !== StepViewType.Template && (
                <div className={cx(stepCss.formGroup, stepCss.lg)}>
                  <FormInput.InputWithIdentifier
                    inputLabel={getString('name')}
                    isIdentifierEditable={isNewStep}
                    inputGroupProps={{
                      placeholder: getString('pipeline.stepNamePlaceholder'),
                      disabled: readonly
                    }}
                  />
                </div>
              )}
              <div className={cx(stepCss.formGroup, stepCss.sm)}>
                <FormMultiTypeDurationField
                  name="timeout"
                  disabled={readonly}
                  label={getString('pipelineSteps.timeoutLabel')}
                  className={stepCss.duration}
                  multiTypeDurationProps={{
                    expressions,
                    enableConfigureOptions: true,
                    disabled: readonly,
                    allowableTypes
                  }}
                />
              </div>
              <div className={stepCss.divider} />
              <div className={cx(stepCss.formGroup, stepCss.lg)}>
                <FormInput.MultiTextInput
                  name="spec.weight"
                  placeholder={getString('cd.asgWeight')}
                  label={getString('cd.asgWeight')}
                  disabled={readonly}
                  multiTextInputProps={{
                    expressions,
                    disabled: readonly,
                    allowableTypes,
                    textProps: { type: 'number' }
                  }}
                />
                {getMultiTypeFromValue(get(formik.values, 'spec.weight')) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={get(formik?.values, 'spec.weight')}
                    type="Number"
                    variableName="spec.weight"
                    showRequiredField={false}
                    showDefaultField={false}
                    onChange={/* istanbul ignore next */ value => formik.setFieldValue('spec.weight', value)}
                    isReadonly={readonly}
                    allowedValuesType={ALLOWED_VALUES_TYPE.NUMBER}
                  />
                )}
              </div>
              <div className={cx(stepCss.formGroup, stepCss.md)}>
                <FormMultiTypeCheckboxField
                  name="spec.downsizeOldAsg"
                  label={getString('cd.downsizeOldAsg')}
                  disabled={readonly}
                  multiTypeTextbox={{ expressions, allowableTypes }}
                />
              </div>
            </>
          )
        }}
      </Formik>
    </>
  )
}
