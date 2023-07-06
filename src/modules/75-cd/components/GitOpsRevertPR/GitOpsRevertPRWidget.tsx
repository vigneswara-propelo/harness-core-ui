/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'
import cx from 'classnames'
import { Formik, FormInput, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { setFormikRef, StepFormikFowardRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ALLOWED_VALUES_TYPE, ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { GitOpsRevertPRProps, RevertPRStepData } from './helper'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

function GitOpsRevertPRWidget(
  props: GitOpsRevertPRProps,
  formikRef: StepFormikFowardRef<RevertPRStepData>
): React.ReactElement {
  const { initialValues, onUpdate, isNewStep = true, onChange, stepViewType, allowableTypes, readonly } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  return (
    <>
      <Formik<RevertPRStepData>
        onSubmit={/* istanbul ignore next */ (values: RevertPRStepData) => onUpdate?.(values)}
        formName="GitRevertPR"
        initialValues={initialValues}
        validate={data => {
          /* istanbul ignore next */
          onChange?.(data)
        }}
        validationSchema={Yup.object().shape({
          ...getNameAndIdentifierSchema(getString, stepViewType),
          timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum'))
        })}
      >
        {(formik: FormikProps<RevertPRStepData>) => {
          setFormikRef(formikRef, formik)
          return (
            <>
              {
                /* istanbul ignore next */ stepViewType !== StepViewType.Template && (
                  <div className={cx(stepCss.formGroup, stepCss.lg)}>
                    <FormInput.InputWithIdentifier inputLabel={getString('name')} isIdentifierEditable={isNewStep} />
                  </div>
                )
              }

              <div className={cx(stepCss.formGroup, stepCss.sm)}>
                <FormMultiTypeDurationField
                  name="timeout"
                  label={getString('pipelineSteps.timeoutLabel')}
                  multiTypeDurationProps={{
                    enableConfigureOptions: true,
                    disabled: readonly,
                    allowableTypes
                  }}
                />
              </div>

              <div className={stepCss.formGroup}>
                <FormInput.MultiTextInput
                  name="spec.commitId"
                  placeholder={getString('common.commitId')}
                  label={getString('common.commitId')}
                  disabled={readonly}
                  multiTextInputProps={{ expressions, disabled: readonly, allowableTypes }}
                />
                {
                  /* istanbul ignore next */ getMultiTypeFromValue(formik.values.spec.commitId) ===
                    MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      value={formik.values.spec.commitId}
                      type="String"
                      variableName="spec.commitId"
                      showRequiredField={false}
                      showDefaultField={false}
                      onChange={value => formik.setFieldValue('spec.commitId', value)}
                      isReadonly={readonly}
                      allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
                    />
                  )
                }
              </div>
            </>
          )
        }}
      </Formik>
    </>
  )
}

export default GitOpsRevertPRWidget
