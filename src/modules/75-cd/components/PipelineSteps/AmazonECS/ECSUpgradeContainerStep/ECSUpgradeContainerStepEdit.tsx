/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as Yup from 'yup'
import cx from 'classnames'
import { FormikErrors, FormikProps, yupToFormErrors } from 'formik'
import { AllowedTypes, FormInput, Formik, FormikForm, Layout } from '@harness/uicore'

import { useStrings } from 'framework/strings'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { isValueRuntimeInput } from '@common/utils/utils'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { StepViewType, setFormikRef, StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { ECSUpgradeContainerStepElementConfig, InstanceUnit } from '@pipeline/utils/types'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useFeatureFlags } from '@modules/10-common/hooks/useFeatureFlag'
import { NameTimeoutField } from '../../Common/GenericExecutionStep/NameTimeoutField'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface ECSUpgradeContainerStepProps {
  initialValues: ECSUpgradeContainerStepElementConfig
  onUpdate?: (data: ECSUpgradeContainerStepElementConfig) => void
  stepViewType?: StepViewType
  onChange?: (data: ECSUpgradeContainerStepElementConfig) => void
  allowableTypes: AllowedTypes
  readonly?: boolean
  isNewStep?: boolean
}

const ECSUpgradeContainerStepEdit = (
  props: ECSUpgradeContainerStepProps,
  formikRef: StepFormikFowardRef<ECSUpgradeContainerStepElementConfig>
): React.ReactElement => {
  const { initialValues, onUpdate, isNewStep = true, readonly, onChange, allowableTypes, stepViewType } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { NG_EXPRESSIONS_NEW_INPUT_ELEMENT } = useFeatureFlags()

  const getInstanceUnitList = React.useCallback(() => {
    return [
      { value: InstanceUnit.Count, label: getString('instanceFieldOptions.instanceHolder') },
      { value: InstanceUnit.Percentage, label: getString('instanceFieldOptions.percentage') }
    ]
  }, [getString])

  const onSubmit = (values: ECSUpgradeContainerStepElementConfig): void => {
    onUpdate?.(values)
  }

  const upgradeContainerStepValidationSchema = Yup.object().shape({
    ...getNameAndIdentifierSchema(getString, stepViewType),
    timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
    spec: Yup.object().shape({
      newServiceInstanceCount: Yup.lazy(value =>
        typeof value === 'number'
          ? Yup.number()
              .min(0)
              .max(100)
              .required(
                getString('common.validation.fieldIsRequired', {
                  name: getString('instanceFieldOptions.instanceText')
                })
              )
          : Yup.string().required(
              getString('common.validation.fieldIsRequired', {
                name: getString('instanceFieldOptions.instanceText')
              })
            )
      ),
      newServiceInstanceUnit: Yup.string().required(
        getString('common.validation.fieldIsRequired', {
          name: getString('cd.steps.ecsUpgradeContainerStep.instanceUnit')
        })
      ),
      downsizeOldServiceInstanceCount: Yup.lazy(value =>
        typeof value === 'number' ? Yup.number().min(0).max(100).notRequired() : Yup.string().notRequired()
      )
    })
  })

  const checkForErrors = (
    formValues: ECSUpgradeContainerStepElementConfig
  ): FormikErrors<ECSUpgradeContainerStepElementConfig> => {
    try {
      upgradeContainerStepValidationSchema.validateSync(formValues)
    } catch (e) {
      if (e instanceof Yup.ValidationError) {
        const err = yupToFormErrors(e)
        return err
      }
    }
    return {}
  }

  return (
    <>
      <Formik<ECSUpgradeContainerStepElementConfig>
        onSubmit={onSubmit}
        formName="ecsUpgradeContainerStepEdit"
        initialValues={initialValues}
        validate={data => {
          onChange?.(data)
          return checkForErrors(data)
        }}
        validationSchema={upgradeContainerStepValidationSchema}
      >
        {(formik: FormikProps<ECSUpgradeContainerStepElementConfig>) => {
          setFormikRef(formikRef, formik)

          return (
            <FormikForm>
              <NameTimeoutField
                allowableTypes={allowableTypes}
                isNewStep={isNewStep}
                readonly={readonly}
                stepViewType={stepViewType}
              />

              <div className={stepCss.formGroup}>
                <Layout.Horizontal flex={{ alignItems: 'center' }}>
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <FormInput.MultiTextInput
                      name="spec.newServiceInstanceCount"
                      label={getString('instanceFieldOptions.instanceText')}
                      disabled={readonly}
                      multiTextInputProps={{
                        textProps: { type: 'number', min: 0 },
                        expressions,
                        disabled: readonly,
                        allowableTypes,
                        newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
                      }}
                    />
                    {isValueRuntimeInput(formik.values.spec.newServiceInstanceCount) && !readonly && (
                      <ConfigureOptions
                        value={'' + formik.values.spec.newServiceInstanceCount}
                        type="String"
                        variableName="spec.newServiceInstanceCount"
                        showRequiredField={false}
                        showDefaultField={false}
                        onChange={value => {
                          formik.setFieldValue('spec.newServiceInstanceCount', value)
                        }}
                        isReadonly={readonly}
                      />
                    )}
                  </div>
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <FormInput.DropDown
                      name="spec.newServiceInstanceUnit"
                      label={getString('cd.steps.ecsUpgradeContainerStep.instanceUnit')}
                      items={getInstanceUnitList()}
                      disabled={readonly}
                      usePortal={true}
                      dropDownProps={{
                        filterable: false
                      }}
                    />
                  </div>
                </Layout.Horizontal>
              </div>

              <div className={stepCss.formGroup}>
                <Layout.Horizontal flex>
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <FormInput.MultiTextInput
                      name="spec.downsizeOldServiceInstanceCount"
                      label={getString('cd.steps.ecsUpgradeContainerStep.downsizeInstanceCount')}
                      placeholder={getString('cd.steps.ecsUpgradeContainerStep.downsizeInstanceUnitPlaceholder')}
                      disabled={readonly}
                      multiTextInputProps={{
                        textProps: { type: 'number', min: 0 },
                        expressions,
                        disabled: readonly,
                        allowableTypes,
                        newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
                      }}
                    />
                    {isValueRuntimeInput(formik.values.spec?.downsizeOldServiceInstanceCount) && !readonly && (
                      <ConfigureOptions
                        value={'' + formik.values.spec?.downsizeOldServiceInstanceCount}
                        type="String"
                        variableName="spec.downsizeOldServiceInstanceCount"
                        showRequiredField={false}
                        showDefaultField={false}
                        onChange={value => {
                          formik.setFieldValue('spec.downsizeOldServiceInstanceCount', value)
                        }}
                        isReadonly={readonly}
                      />
                    )}
                  </div>
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <FormInput.DropDown
                      name="spec.downsizeOldServiceInstanceUnit"
                      label={getString('cd.steps.ecsUpgradeContainerStep.downsizeInstanceUnit')}
                      placeholder={getString('common.entityPlaceholderText')}
                      items={getInstanceUnitList()}
                      disabled={readonly}
                      usePortal={true}
                      addClearBtn={true}
                      dropDownProps={{
                        filterable: false
                      }}
                    />
                  </div>
                </Layout.Horizontal>
              </div>
            </FormikForm>
          )
        }}
      </Formik>
    </>
  )
}

export const ECSUpgradeContainerStepEditRef = React.forwardRef(ECSUpgradeContainerStepEdit)
