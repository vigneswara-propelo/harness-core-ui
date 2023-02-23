/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { isEmpty } from 'lodash-es'
import * as Yup from 'yup'
import cx from 'classnames'
import type { FormikErrors, FormikProps } from 'formik'
import { AllowedTypes, Formik, FormInput, getMultiTypeFromValue, IconName, MultiTypeInputType } from '@harness/uicore'
import type { StepElementConfig, TerraformCloudRollbackStepInfo } from 'services/cd-ng'
import {
  setFormikRef,
  StepFormikFowardRef,
  StepViewType,
  ValidateInputSetProps
} from '@pipeline/components/AbstractSteps/Step'
import { PipelineStep, StepProps } from '@pipeline/components/PipelineSteps/PipelineStep'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { useStrings } from 'framework/strings'
import { isValueRuntimeInput } from '@common/utils/utils'
import { FormMultiTypeTextArea } from '@common/components/MultiTypeTextArea/MultiTypeTextArea'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { getNameAndIdentifierSchema } from '@pipeline/utils/tempates'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/helper'
import { IdentifierSchemaWithOutName } from '@common/utils/Validation'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { FormMultiTypeCheckboxField, FormMultiTypeTextAreaField } from '@common/components'
import { ALLOWED_VALUES_TYPE, ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { validateGenericFields } from '../Common/GenericExecutionStep/utils'
import { NameTimeoutField } from '../Common/GenericExecutionStep/NameTimeoutField'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import pipelineVariablesCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'
import css from './TerraformCloudRollbackStep.module.scss'

export interface TerraformCloudRollbackData extends StepElementConfig {
  spec: TerraformCloudRollbackStepInfo
}

export interface TerraformCloudRollbackVariableStepProps {
  initialValues: TerraformCloudRollbackData
  onUpdate?(data: TerraformCloudRollbackData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: TerraformCloudRollbackData
}

interface TerraformCloudRollbackProps {
  initialValues: TerraformCloudRollbackData
  onUpdate?: (data: TerraformCloudRollbackData) => void
  onChange?: (data: TerraformCloudRollbackData) => void
  allowableTypes: AllowedTypes
  stepViewType?: StepViewType
  isNewStep?: boolean
  template?: TerraformCloudRollbackData
  readonly?: boolean
  path?: string
}

function TerraformCloudRollbackWidget(
  props: TerraformCloudRollbackProps,
  formikRef: StepFormikFowardRef<TerraformCloudRollbackData>
): React.ReactElement {
  const { initialValues, onUpdate, isNewStep, readonly, allowableTypes, stepViewType, onChange } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  return (
    <>
      <Formik<TerraformCloudRollbackData>
        onSubmit={(values: TerraformCloudRollbackData) => {
          onUpdate?.(values)
        }}
        validate={(values: TerraformCloudRollbackData) => {
          onChange?.(values)
        }}
        formName="terraformCloudRollback"
        initialValues={initialValues}
        validationSchema={Yup.object().shape({
          ...getNameAndIdentifierSchema(getString, stepViewType),
          timeout: getDurationValidationSchema({ minimum: '10s' }).required(
            getString('validation.timeout10SecMinimum')
          ),
          spec: Yup.object().shape({
            provisionerIdentifier: Yup.lazy((value): Yup.Schema<unknown> => {
              if (getMultiTypeFromValue(value as any) === MultiTypeInputType.FIXED) {
                return IdentifierSchemaWithOutName(getString, {
                  requiredErrorMsg: getString('common.validation.provisionerIdentifierIsRequired'),
                  regexErrorMsg: getString('common.validation.provisionerIdentifierPatternIsNotValid')
                })
              }
              return Yup.string().required(getString('common.validation.provisionerIdentifierIsRequired'))
            })
          })
        })}
      >
        {(formik: FormikProps<TerraformCloudRollbackData>) => {
          const { values, setFieldValue } = formik
          setFormikRef(formikRef, formik)
          return (
            <>
              <NameTimeoutField
                allowableTypes={allowableTypes}
                isNewStep={isNewStep}
                readonly={readonly}
                stepViewType={stepViewType}
              />
              <div className={stepCss.divider} />
              <div className={stepCss.formGroup}>
                <FormMultiTypeTextAreaField
                  placeholder={getString('pipeline.terraformStep.messagePlaceholder')}
                  name="spec.message"
                  label={getString('pipeline.terraformStep.messageLabel')}
                  className={css.message}
                  multiTypeTextArea={{
                    enableConfigureOptions: false,
                    expressions,
                    disabled: readonly,
                    allowableTypes,
                    textAreaProps: { growVertically: true }
                  }}
                />
                {getMultiTypeFromValue(values.spec?.message) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={values.spec?.message as string}
                    type="String"
                    variableName="spec.message"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={/* istanbul ignore next */ value => setFieldValue('spec.message', value)}
                    isReadonly={readonly}
                  />
                )}
              </div>
              <div className={cx(stepCss.formGroup, stepCss.md)}>
                <FormMultiTypeCheckboxField
                  name="spec.discardPendingRuns"
                  label={getString('pipeline.terraformStep.discardPendingRuns')}
                  disabled={readonly}
                  multiTypeTextbox={{ expressions, allowableTypes }}
                  className={css.addMarginTop}
                />
                {getMultiTypeFromValue(values.spec?.discardPendingRuns) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={(values.spec?.discardPendingRuns || '') as string}
                    type="String"
                    variableName="spec.discardPendingRuns"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => setFieldValue('spec.discardPendingRuns', value)}
                    style={{ alignSelf: 'center', marginTop: 11 }}
                    className={css.addMarginTop}
                    isReadonly={readonly}
                  />
                )}
              </div>

              <div className={cx(stepCss.formGroup, stepCss.md)}>
                <FormInput.MultiTextInput
                  name="spec.provisionerIdentifier"
                  placeholder={getString('pipeline.terraformStep.provisionerIdentifier')}
                  label={getString('pipelineSteps.provisionerIdentifier')}
                  multiTextInputProps={{ expressions, allowableTypes }}
                  disabled={readonly}
                  className={css.addMarginTop}
                />
                {getMultiTypeFromValue(values.spec.provisionerIdentifier) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={values.spec.provisionerIdentifier as string}
                    type="String"
                    variableName="spec.provisionerIdentifier"
                    showRequiredField={false}
                    showDefaultField={false}
                    allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
                    showAdvanced={true}
                    onChange={
                      /* istanbul ignore next */ value => {
                        setFieldValue('spec.provisionerIdentifier', value)
                      }
                    }
                    isReadonly={readonly}
                  />
                )}
              </div>
            </>
          )
        }}
      </Formik>
    </>
  )
}

const TerraformCloudRollbackInputStep: React.FC<TerraformCloudRollbackProps> = ({
  template,
  readonly,
  path,
  allowableTypes,
  stepViewType
}) => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const prefix = isEmpty(path) ? '' : `${path}.`
  return (
    <>
      {isValueRuntimeInput(template?.timeout) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeDurationField
            multiTypeDurationProps={{
              configureOptionsProps: {
                isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
              },
              allowableTypes,
              expressions,
              disabled: readonly
            }}
            label={getString('pipelineSteps.timeoutLabel')}
            name={`${prefix}timeout`}
            disabled={readonly}
          />
        </div>
      )}
      {isValueRuntimeInput(template?.spec?.message) && (
        <FormMultiTypeTextArea
          label={getString('pipeline.terraformStep.messageLabel')}
          name={`${prefix}spec.message`}
          disabled={readonly}
          multiTypeTextArea={{
            configureOptionsProps: {
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            },
            expressions,
            allowableTypes
          }}
          className={css.deploymentViewMedium}
        />
      )}
      {isValueRuntimeInput(template?.spec?.discardPendingRuns) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeCheckboxField
            multiTypeTextbox={{
              expressions,
              allowableTypes
            }}
            name={`${prefix}spec.discardPendingRuns`}
            label={getString('pipeline.terraformStep.discardPendingRuns')}
            disabled={readonly}
            setToFalseWhenEmpty={true}
          />
        </div>
      )}
      {isValueRuntimeInput(template?.spec?.provisionerIdentifier) && (
        <TextFieldInputSetView
          name={`${prefix}spec.provisionerIdentifier`}
          fieldPath={'spec.provisionerIdentifier'}
          template={template}
          multiTextInputProps={{
            expressions,
            allowableTypes
          }}
          className={cx(stepCss.formGroup, stepCss.md)}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          label={getString('pipelineSteps.provisionerIdentifier')}
          disabled={readonly}
        />
      )}
    </>
  )
}

const TerraformCloudRollbackVariableStep: React.FC<TerraformCloudRollbackVariableStepProps> = ({
  variablesData,
  metadataMap,
  initialValues
}) => {
  return (
    <VariablesListTable
      data={variablesData.spec}
      originalData={initialValues.spec}
      metadataMap={metadataMap}
      className={pipelineVariablesCss.variablePaddingL3}
    />
  )
}

const TerraformCloudRollbackWidgetWithRef = React.forwardRef(TerraformCloudRollbackWidget)

export class TerraformCloudRollback extends PipelineStep<any> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }
  protected type = StepType.TerraformCloudRollback
  protected referenceId = 'TerraformCloudRollbackStep'
  protected defaultValues: TerraformCloudRollbackData = {
    identifier: '',
    timeout: '10m',
    name: '',
    type: StepType.TerraformCloudRollback,
    spec: {
      provisionerIdentifier: '',
      discardPendingRuns: false,
      message: ''
    }
  }
  protected stepIcon: IconName = 'terraform-cloud-rollback'
  protected stepName = 'Terraform Cloud Rollback'

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<StepElementConfig>): FormikErrors<StepElementConfig> {
    const errors = validateGenericFields({
      data,
      template,
      getString,
      viewType
    })

    /* istanbul ignore else */
    if (isEmpty(errors.spec)) {
      delete errors.spec
    }

    return errors
  }

  renderStep(props: StepProps<TerraformCloudRollbackData>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      onChange,
      allowableTypes,
      stepViewType,
      inputSetData,
      formikRef,
      customStepProps,
      isNewStep,
      readonly
    } = props

    if (this.isTemplatizedView(stepViewType)) {
      return (
        <TerraformCloudRollbackInputStep
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          readonly={readonly}
          path={inputSetData?.path}
          allowableTypes={allowableTypes}
          template={inputSetData?.template}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <TerraformCloudRollbackVariableStep
          {...(customStepProps as TerraformCloudRollbackVariableStepProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }
    return (
      <TerraformCloudRollbackWidgetWithRef
        initialValues={initialValues}
        onUpdate={data => onUpdate?.(this.processFormData(data))}
        onChange={data => onChange?.(this.processFormData(data))}
        allowableTypes={allowableTypes}
        isNewStep={isNewStep}
        stepViewType={stepViewType}
        ref={formikRef}
      />
    )
  }
}
