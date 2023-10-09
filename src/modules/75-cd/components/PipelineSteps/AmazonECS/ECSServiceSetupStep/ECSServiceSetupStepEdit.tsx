/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as Yup from 'yup'
import cx from 'classnames'
import type { FormikProps } from 'formik'
import { AllowedTypes, FormInput, Formik, FormikForm } from '@harness/uicore'

import { useStrings } from 'framework/strings'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { FormMultiTypeCheckboxField } from '@common/components'
import { StepViewType, setFormikRef, StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { ECSServiceSetupStepElementConfig } from '@pipeline/utils/types'
import { NameTimeoutField } from '../../Common/GenericExecutionStep/NameTimeoutField'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

enum ResizeStrategy {
  ResizeNewFirst = 'ResizeNewFirst',
  DownsizeOldFirst = 'DownsizeOldFirst'
}

export interface ECSServiceSetupStepProps {
  initialValues: ECSServiceSetupStepElementConfig
  onUpdate?: (data: ECSServiceSetupStepElementConfig) => void
  stepViewType?: StepViewType
  onChange?: (data: ECSServiceSetupStepElementConfig) => void
  allowableTypes: AllowedTypes
  readonly?: boolean
  isNewStep?: boolean
}

const ECSServiceSetupStepEdit = (
  props: ECSServiceSetupStepProps,
  formikRef: StepFormikFowardRef<ECSServiceSetupStepElementConfig>
): React.ReactElement => {
  const { initialValues, onUpdate, isNewStep = true, readonly, onChange, allowableTypes, stepViewType } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const getResizeStrategyOptions = React.useCallback(() => {
    return [
      {
        value: ResizeStrategy.ResizeNewFirst,
        label: getString('cd.steps.ecsServiceSetupStep.resizeNewFirst')
      },
      {
        value: ResizeStrategy.DownsizeOldFirst,
        label: getString('cd.steps.ecsServiceSetupStep.downsizeOldFirst')
      }
    ]
  }, [getString])

  const onSubmit = (values: ECSServiceSetupStepElementConfig): void => {
    onUpdate?.(values)
  }

  return (
    <>
      <Formik<ECSServiceSetupStepElementConfig>
        onSubmit={onSubmit}
        formName="ecsServiceSetupStepEdit"
        initialValues={initialValues}
        validate={data => {
          onChange?.(data)
        }}
        validationSchema={Yup.object().shape({
          ...getNameAndIdentifierSchema(getString, stepViewType),
          timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum'))
        })}
      >
        {(formik: FormikProps<ECSServiceSetupStepElementConfig>) => {
          setFormikRef(formikRef, formik)

          return (
            <FormikForm>
              <NameTimeoutField
                allowableTypes={allowableTypes}
                isNewStep={isNewStep}
                readonly={readonly}
                stepViewType={stepViewType}
              />

              <div className={cx(stepCss.formGroup, stepCss.lg)}>
                <FormInput.Select
                  name="spec.resizeStrategy"
                  label={getString('cd.steps.tas.resizeStrategy')}
                  items={getResizeStrategyOptions()}
                  disabled={readonly}
                />
              </div>

              <div className={cx(stepCss.formGroup, stepCss.lg)}>
                <FormMultiTypeCheckboxField
                  name="spec.sameAsAlreadyRunningInstances"
                  label={getString('cd.ecsRollingDeployStep.sameAsAlreadyRunningInstances')}
                  disabled={readonly}
                  multiTypeTextbox={{
                    expressions,
                    allowableTypes,
                    defaultValueToReset: false
                  }}
                />
              </div>
            </FormikForm>
          )
        }}
      </Formik>
    </>
  )
}

export const ECSServiceSetupStepEditRef = React.forwardRef(ECSServiceSetupStepEdit)
