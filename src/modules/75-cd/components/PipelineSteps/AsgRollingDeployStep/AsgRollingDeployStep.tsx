/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  IconName,
  Formik,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  AllowedTypes,
  Accordion,
  Text
} from '@harness/uicore'
import * as Yup from 'yup'
import cx from 'classnames'
import { FormikErrors, FormikProps, yupToFormErrors } from 'formik'
import { defaultTo, get, isEmpty, set, toString } from 'lodash-es'
import { StepViewType, StepProps, ValidateInputSetProps, setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import type { AsgRollingDeployStepInfo, StepElementConfig, AsgFixedInstances } from 'services/cd-ng'

import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { ALLOWED_VALUES_TYPE, ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'

import { useStrings } from 'framework/strings'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { StringsMap } from 'stringTypes'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { FormMultiTypeCheckboxField } from '@common/components'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { instanceWarmupSchema, minimumHealthyPercentageSchema } from './utils'
import AsgSelectInstance from '../AsgBlueGreenDeployStep/AsgSelectInstance/AsgSelectInstance'
import { InstancesType } from '../ElastigroupSetupStep/ElastigroupSetupTypes'
import { Instances } from '../AsgBlueGreenDeployStep/AsgBlueGreenDeployStep'
import css from './AsgRollingDeployStep.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import pipelineVariablesCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

export interface AsgRollingDeployData extends StepElementConfig {
  spec: AsgRollingDeployStepInfo
  identifier: string
}

export interface AsgRollingDeployVariableStepProps {
  initialValues: AsgRollingDeployData
  onUpdate?(data: AsgRollingDeployData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: AsgRollingDeployData
}

interface AsgRollingDeployProps {
  initialValues: AsgRollingDeployData
  onUpdate?: (data: AsgRollingDeployData) => void
  onChange?: (data: AsgRollingDeployData) => void
  allowableTypes: AllowedTypes
  stepViewType?: StepViewType
  isNewStep?: boolean
  template?: AsgRollingDeployData
  readonly?: boolean
  path?: string
}

function AsgRollingDeployWidget(
  props: AsgRollingDeployProps,
  formikRef: StepFormikFowardRef<AsgRollingDeployData>
): React.ReactElement {
  const { initialValues, onUpdate, isNewStep, readonly, allowableTypes, stepViewType, onChange } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { CDS_BASIC_ASG } = useFeatureFlags()

  function commonValidation(this: Yup.TestContext, value: any, valueString: string): boolean | Yup.ValidationError {
    if (getMultiTypeFromValue(value) === MultiTypeInputType.FIXED && typeof value !== 'number') {
      return this.createError({
        message: getString('cd.ElastigroupStep.valueCannotBe', {
          value: valueString
        })
      })
    }
    if (value < 0) {
      return this.createError({
        message: getString('cd.ElastigroupStep.valueCannotBeLessThan', {
          value: valueString,
          value2: 0
        })
      })
    }
    return true
  }

  const getInititalValues = React.useCallback(() => {
    return {
      ...initialValues,
      spec: {
        ...initialValues.spec,
        instances:
          !initialValues.spec?.instances && !!initialValues.spec?.useAlreadyRunningInstances
            ? { type: InstancesType.CurrentRunning, spec: {} }
            : !initialValues.spec?.instances && initialValues.spec?.useAlreadyRunningInstances === false
            ? {
                type: InstancesType.Fixed,
                spec: {
                  desired: 1,
                  max: 1,
                  min: 1
                }
              }
            : ({ ...initialValues.spec?.instances } as Instances)
      }
    }
  }, [initialValues])

  const formikRefValues = (): AsgRollingDeployData =>
    (formikRef as React.MutableRefObject<FormikProps<unknown> | null>)?.current?.values as AsgRollingDeployData
  return (
    <>
      <Formik<AsgRollingDeployData>
        onSubmit={(values: AsgRollingDeployData) => {
          /* istanbul ignore next */
          onUpdate?.({ ...values })
        }}
        validate={(values: AsgRollingDeployData) => {
          /* istanbul ignore next */
          onChange?.(values)
        }}
        formName="AsgRollingDeploy"
        initialValues={getInititalValues()}
        validationSchema={Yup.object().shape({
          ...getNameAndIdentifierSchema(getString, stepViewType),
          timeout: getDurationValidationSchema({ minimum: '10s' }).required(
            getString('validation.timeout10SecMinimum')
          ),
          spec: Yup.object().shape({
            minimumHealthyPercentage: minimumHealthyPercentageSchema(getString),
            instanceWarmup: instanceWarmupSchema(getString),
            instances: Yup.object().shape({
              type: Yup.string().trim().required(getString('common.validation.typeIsRequired')),
              spec: Yup.object().when('type', {
                is: 'Fixed',
                then: Yup.object().shape({
                  desired: Yup.mixed().test({
                    test(value): boolean | Yup.ValidationError {
                      const otherValues = formikRefValues()?.spec?.instances?.spec as AsgFixedInstances
                      if (getMultiTypeFromValue(value) === MultiTypeInputType.FIXED) {
                        if (value < otherValues?.min) {
                          return this.createError({
                            message: getString('cd.ElastigroupStep.valueCannotBeLessThan', {
                              value: getString('cd.ElastigroupStep.desiredInstances'),
                              value2: getString('cd.ElastigroupStep.minInstances')
                            })
                          })
                        } else if (value > otherValues?.max) {
                          return this.createError({
                            message: getString('cd.ElastigroupStep.valueCannotBeGreaterThan', {
                              value: getString('cd.ElastigroupStep.desiredInstances'),
                              value2: getString('cd.ElastigroupStep.maxInstances')
                            })
                          })
                        }
                      }
                      return commonValidation.call(this, value, getString('cd.ElastigroupStep.desiredInstances'))
                    }
                  }),
                  min: Yup.mixed().test({
                    test(value): boolean | Yup.ValidationError {
                      const otherValues = formikRefValues()?.spec?.instances?.spec as AsgFixedInstances
                      if (getMultiTypeFromValue(value) === MultiTypeInputType.FIXED) {
                        if (value > otherValues?.desired) {
                          return this.createError({
                            message: getString('cd.ElastigroupStep.valueCannotBeGreaterThan', {
                              value: getString('cd.ElastigroupStep.minInstances'),
                              value2: getString('cd.ElastigroupStep.desiredInstances')
                            })
                          })
                        } else if (value > otherValues?.max) {
                          return this.createError({
                            message: getString('cd.ElastigroupStep.valueCannotBeGreaterThan', {
                              value: getString('cd.ElastigroupStep.minInstances'),
                              value2: getString('cd.ElastigroupStep.maxInstances')
                            })
                          })
                        }
                      }
                      return commonValidation.call(this, value, getString('cd.ElastigroupStep.minInstances'))
                    }
                  }),
                  max: Yup.mixed().test({
                    test(value): boolean | Yup.ValidationError {
                      const otherValues = formikRefValues()?.spec?.instances?.spec as AsgFixedInstances
                      if (getMultiTypeFromValue(value) === MultiTypeInputType.FIXED) {
                        if (value < otherValues?.min) {
                          return this.createError({
                            message: getString('cd.ElastigroupStep.valueCannotBeLessThan', {
                              value: getString('cd.ElastigroupStep.maxInstances'),
                              value2: getString('cd.ElastigroupStep.minInstances')
                            })
                          })
                        } else if (value < otherValues?.desired) {
                          return this.createError({
                            message: getString('cd.ElastigroupStep.valueCannotBeLessThan', {
                              value: getString('cd.ElastigroupStep.maxInstances'),
                              value2: getString('cd.ElastigroupStep.desiredInstances')
                            })
                          })
                        }
                      }
                      return commonValidation.call(this, value, getString('cd.ElastigroupStep.maxInstances'))
                    }
                  })
                })
              })
            })
          })
        })}
      >
        {(formik: FormikProps<AsgRollingDeployData>) => {
          const { values, setFieldValue } = formik
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
              {CDS_BASIC_ASG ? (
                <div className={cx(stepCss.formGroup, stepCss.lg)}>
                  <FormInput.MultiTextInput
                    name="spec.asgName"
                    disabled={readonly}
                    tooltipProps={{
                      dataTooltipId: 'asgName'
                    }}
                    label={getString('cd.serviceDashboard.asgName')}
                    placeholder={getString('cd.asgPlaceholder')}
                    multiTextInputProps={{
                      expressions,
                      allowableTypes
                    }}
                  />
                </div>
              ) : null}
              <Text margin={{ bottom: 'medium' }}>{getString('instanceFieldOptions.instances')}</Text>
              <AsgSelectInstance formik={formik} readonly={readonly} allowableTypes={allowableTypes} />
              <Accordion className={stepCss.accordion}>
                <Accordion.Panel
                  id="optional-config"
                  summary={getString('cd.instanceRefresh')}
                  details={
                    <>
                      <div className={cx(stepCss.formGroup, stepCss.lg)}>
                        <FormInput.MultiTextInput
                          name="spec.minimumHealthyPercentage"
                          tooltipProps={{
                            dataTooltipId: 'asgMinimumHealthyPercentage'
                          }}
                          placeholder={getString('cd.minimumHealthyPercentagePlaceholder')}
                          label={getString('cd.minimumHealthyPercentageLabel')}
                          disabled={readonly}
                          multiTextInputProps={{
                            expressions,
                            disabled: readonly,
                            allowableTypes,
                            textProps: { type: 'number' }
                          }}
                        />
                        {getMultiTypeFromValue(values.spec.minimumHealthyPercentage) === MultiTypeInputType.RUNTIME && (
                          /* istanbul ignore next */
                          <ConfigureOptions
                            value={toString(values.spec.minimumHealthyPercentage)}
                            type="Number"
                            variableName="spec.minimumHealthyPercentage"
                            showRequiredField={false}
                            showDefaultField={false}
                            onChange={
                              /* istanbul ignore next */ value => setFieldValue('spec.minimumHealthyPercentage', value)
                            }
                            isReadonly={readonly}
                            allowedValuesType={ALLOWED_VALUES_TYPE.NUMBER}
                          />
                        )}
                      </div>
                      <div className={cx(stepCss.formGroup, stepCss.lg)}>
                        <FormInput.MultiTextInput
                          name="spec.instanceWarmup"
                          placeholder={getString('cd.instanceWarmupPlaceholder')}
                          label={getString('cd.instanceWarmupLabel')}
                          tooltipProps={{
                            dataTooltipId: 'asgInstanceWarmup'
                          }}
                          disabled={readonly}
                          multiTextInputProps={{
                            expressions,
                            disabled: readonly,
                            allowableTypes,
                            textProps: { type: 'number' }
                          }}
                        />
                        {getMultiTypeFromValue(values.spec.instanceWarmup) === MultiTypeInputType.RUNTIME && (
                          /* istanbul ignore next */
                          <ConfigureOptions
                            value={toString(values.spec.instanceWarmup)}
                            type="Number"
                            variableName="spec.instanceWarmup"
                            showRequiredField={false}
                            showDefaultField={false}
                            onChange={/* istanbul ignore next */ value => setFieldValue('spec.instanceWarmup', value)}
                            isReadonly={readonly}
                            allowedValuesType={ALLOWED_VALUES_TYPE.NUMBER}
                          />
                        )}
                      </div>
                      <div className={cx(stepCss.formGroup, stepCss.md)}>
                        <FormMultiTypeCheckboxField
                          multiTypeTextbox={{ expressions, allowableTypes }}
                          name="spec.skipMatching"
                          label={getString('cd.skipMatchingLabel')}
                          disabled={readonly}
                        />
                      </div>
                    </>
                  }
                />
              </Accordion>
            </>
          )
        }}
      </Formik>
    </>
  )
}

const AsgRollingDeployInputStep: React.FC<AsgRollingDeployProps> = ({
  template,
  readonly,
  path,
  allowableTypes,
  stepViewType
}) => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { CDS_BASIC_ASG } = useFeatureFlags()
  const prefix = isEmpty(path) ? '' : `${path}.`
  return (
    <>
      {getMultiTypeFromValue(get(template, 'timeout')) === MultiTypeInputType.RUNTIME && (
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
      {getMultiTypeFromValue(template?.spec?.asgName) === MultiTypeInputType.RUNTIME && !!CDS_BASIC_ASG && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <TextFieldInputSetView
            name={`${prefix}spec.asgName`}
            label={getString('cd.serviceDashboard.asgName')}
            placeholder={getString('cd.serviceDashboard.asgName')}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
            fieldPath={`spec.asgName`}
            template={template}
          />
        </div>
      )}
      {getMultiTypeFromValue((template?.spec?.instances as Instances)?.spec?.min) === MultiTypeInputType.RUNTIME ? (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTextInput
            name={`${prefix}spec.instances.spec.min`}
            placeholder={getString('cd.ElastigroupStep.minInstances')}
            label={getString('cd.ElastigroupStep.minInstances')}
            disabled={readonly}
            multiTextInputProps={{ expressions, disabled: readonly, allowableTypes, textProps: { type: 'number' } }}
          />
        </div>
      ) : null}
      {getMultiTypeFromValue((template?.spec?.instances as Instances)?.spec?.max) === MultiTypeInputType.RUNTIME ? (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTextInput
            name={`${prefix}spec.instances.spec.max`}
            placeholder={getString('cd.ElastigroupStep.maxInstances')}
            label={getString('cd.ElastigroupStep.maxInstances')}
            disabled={readonly}
            multiTextInputProps={{ expressions, disabled: readonly, allowableTypes, textProps: { type: 'number' } }}
          />
        </div>
      ) : null}
      {getMultiTypeFromValue((template?.spec?.instances as Instances)?.spec?.desired) === MultiTypeInputType.RUNTIME ? (
        <div className={cx(stepCss.formGroup, stepCss.md, stepCss.bottomMargin4)}>
          <FormInput.MultiTextInput
            name={`${prefix}spec.instances.spec.desired`}
            placeholder={getString('cd.ElastigroupStep.desiredInstances')}
            label={getString('cd.ElastigroupStep.desiredInstances')}
            disabled={readonly}
            multiTextInputProps={{ expressions, disabled: readonly, allowableTypes, textProps: { type: 'number' } }}
          />
        </div>
      ) : null}
      {getMultiTypeFromValue(get(template, 'spec.useAlreadyRunningInstances')) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeCheckboxField
            multiTypeTextbox={{
              expressions,
              allowableTypes
            }}
            name={`${prefix}spec.useAlreadyRunningInstances`}
            label={'Use Already Running Instances'}
            disabled={readonly}
            setToFalseWhenEmpty={true}
          />
        </div>
      )}
      {getMultiTypeFromValue(get(template, 'spec.minimumHealthyPercentage')) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <TextFieldInputSetView
            name={`${prefix}spec.minimumHealthyPercentage`}
            multiTextInputProps={{
              textProps: { type: 'number' },
              allowableTypes,
              expressions,
              defaultValueToReset: 0
            }}
            label="Minimum Healthy Percentage"
            disabled={readonly}
            template={template}
            className={css.fieldInputSetView}
            fieldPath={`spec.minimumHealthyPercentage`}
          />
        </div>
      )}
      {getMultiTypeFromValue(get(template, 'spec.instanceWarmup')) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <TextFieldInputSetView
            name={`${prefix}spec.instanceWarmup`}
            multiTextInputProps={{
              textProps: { type: 'number' },
              allowableTypes,
              expressions,
              defaultValueToReset: 0
            }}
            label="Instance Warmup"
            disabled={readonly}
            template={template}
            fieldPath={`spec.instanceWarmup`}
            className={css.fieldInputSetView}
          />
        </div>
      )}
      {getMultiTypeFromValue(get(template, 'spec.skipMatching')) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeCheckboxField
            multiTypeTextbox={{
              expressions,
              allowableTypes
            }}
            name={`${prefix}spec.skipMatching`}
            label={'skip Matching'}
            disabled={readonly}
            setToFalseWhenEmpty={true}
          />
        </div>
      )}
    </>
  )
}

const AsgRollingDeployVariableStep: React.FC<AsgRollingDeployVariableStepProps> = ({
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

const AsgRollingDeployWidgetWithRef = React.forwardRef(AsgRollingDeployWidget)
export class AsgRollingDeploy extends PipelineStep<AsgRollingDeployData> {
  protected type = StepType.AsgRollingDeploy
  protected stepName = 'ASG Rolling Deploy'
  protected referenceId = 'AsgRollingDeploy'
  protected stepIcon: IconName = 'asg-deploy'
  protected stepDescription: keyof StringsMap = 'cd.asgRollingDeployStepDescription'
  protected isHarnessSpecific = false
  protected defaultValues: AsgRollingDeployData = {
    identifier: '',
    timeout: '10m',
    name: '',
    type: StepType.AsgRollingDeploy,
    spec: {
      useAlreadyRunningInstances: false,
      skipMatching: true,
      asgName: ''
    }
  }

  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }
  renderStep(props: StepProps<AsgRollingDeployData>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      stepViewType,
      inputSetData,
      formikRef,
      customStepProps,
      isNewStep,
      readonly,
      allowableTypes,
      onChange
    } = props
    if (this.isTemplatizedView(stepViewType)) {
      return (
        <AsgRollingDeployInputStep
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          template={get(inputSetData, 'template')}
          readonly={get(inputSetData, 'readonly')}
          path={get(inputSetData, 'path')}
          allowableTypes={allowableTypes}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <AsgRollingDeployVariableStep
          {...(customStepProps as AsgRollingDeployVariableStepProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }
    return (
      <AsgRollingDeployWidgetWithRef
        initialValues={initialValues}
        onUpdate={onUpdate}
        isNewStep={isNewStep}
        stepViewType={defaultTo(stepViewType, StepViewType.Edit)}
        allowableTypes={allowableTypes}
        onChange={onChange}
        ref={formikRef}
        readonly={readonly}
      />
    )
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<AsgRollingDeployData>): FormikErrors<AsgRollingDeployData> {
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errors = { spec: {} } as any
    if (getMultiTypeFromValue(get(template, 'timeout')) === MultiTypeInputType.RUNTIME) {
      let timeoutSchema = getDurationValidationSchema({ minimum: '10s' })
      /* istanbul ignore else */
      if (isRequired) {
        timeoutSchema = timeoutSchema.required(/* istanbul ignore next */ getString?.('validation.timeout10SecMinimum'))
      }
      const timeout = Yup.object().shape({
        timeout: timeoutSchema
      })

      try {
        timeout.validateSync(data)
      } catch (e) {
        /* istanbul ignore else */
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)

          Object.assign(errors, err)
        }
      }
    }
    if (getMultiTypeFromValue(get(template, 'spec.minimumHealthyPercentage')) === MultiTypeInputType.RUNTIME) {
      try {
        const schema = Yup.object().shape({
          spec: Yup.object().shape({
            minimumHealthyPercentage: minimumHealthyPercentageSchema(getString!)
          })
        })
        schema.validateSync(data)
      } catch (error: any) {
        set(errors, 'spec.minimumHealthyPercentage', error.message)
      }
    }
    if (getMultiTypeFromValue(get(template, 'spec.instanceWarmup')) === MultiTypeInputType.RUNTIME) {
      try {
        const schema = Yup.object().shape({
          spec: Yup.object().shape({
            instanceWarmup: instanceWarmupSchema(getString!)
          })
        })
        schema.validateSync(data)
      } catch (error: any) {
        set(errors, 'spec.instanceWarmup', error.message)
      }
    }
    /* istanbul ignore next  */
    if (isEmpty(errors.spec)) {
      delete errors.spec
    }

    return errors
  }
}
