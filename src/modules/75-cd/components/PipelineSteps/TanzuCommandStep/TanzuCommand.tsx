/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  IconName,
  Formik,
  FormInput,
  Layout,
  getMultiTypeFromValue,
  MultiTypeInputType,
  AllowedTypes,
  Container,
  Label,
  Button,
  ButtonVariation,
  MultiSelectOption,
  SelectOption,
  Accordion
} from '@harness/uicore'
import * as Yup from 'yup'
import cx from 'classnames'
import { FieldArray, FormikErrors, FormikProps, useFormikContext, yupToFormErrors } from 'formik'
import { v4 as uuid } from 'uuid'
import { defaultTo, get, isArray, isEmpty, set } from 'lodash-es'
import { StepViewType, StepProps, ValidateInputSetProps, setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import type { StepElementConfig, StoreConfig, TasCommandStepInfo } from 'services/cd-ng'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import { useStrings } from 'framework/strings'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'

import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import type { StringsMap } from 'stringTypes'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import MultiConfigSelectField from '@pipeline/components/ConfigFilesSelection/ConfigFilesWizard/ConfigFilesSteps/MultiConfigSelectField/MultiConfigSelectField'
import { InstanceScriptTypes } from '@cd/components/TemplateStudio/DeploymentTemplateCanvas/DeploymentTemplateForm/DeploymentInfraWrapper/DeploymentInfraUtils'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { ScriptType, ShellScriptMonacoField } from '@common/components/ShellScriptMonaco/ShellScriptMonaco'
import { FILE_TYPE_VALUES } from '@pipeline/components/ConfigFilesSelection/ConfigFilesHelper'
import { FileUsage } from '@filestore/interfaces/FileStore'
import { ManifestStoreMap } from '@pipeline/components/ManifestSelection/Manifesthelper'
import { useFeatureFlag, useFeatureFlags } from '@modules/10-common/hooks/useFeatureFlag'
import {
  MultiSelectVariableAllowedValues,
  concatValuesWithQuotes,
  isFixedInput
} from '@modules/70-pipeline/components/PipelineSteps/Steps/CustomVariables/MultiSelectVariableAllowedValues/MultiSelectVariableAllowedValues'
import { TextFieldInputSetView } from '@modules/70-pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import {
  getAllowedValuesFromTemplate,
  shouldRenderRunTimeInputViewWithAllowedValues
} from '@modules/70-pipeline/utils/CIUtils'
import { FeatureFlag } from '@modules/10-common/featureFlags'
import MultiTypeListOrFileSelectList from '../K8sServiceSpec/ManifestSource/MultiTypeListOrFileSelectList'
import {
  ScriptStepVariable,
  scriptInputType,
  scriptOutputType,
  variableSchema
} from '../ShellScriptStep/shellScriptTypes'
import { OptionalVariables } from '../ShellScriptStep/OptionalConfiguration'
import { OptionalTypeVariableFormikValue } from '../Common/types'
import pipelineVariablesCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'
import css from './TanzuCommand.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface TanzuCommandData extends StepElementConfig {
  spec: Omit<TasCommandStepInfo, 'inputVariables' | 'outputVariables' | 'source'> & {
    inputVariables?: Array<Omit<OptionalTypeVariableFormikValue, 'id'>>
    outputVariables?: Array<Omit<OptionalTypeVariableFormikValue, 'id'>>
  }
}
interface TanzuCommandFormData extends StepElementConfig {
  spec: Omit<TasCommandStepInfo, 'inputVariables' | 'outputVariables' | 'source'> & {
    inputVariables?: Array<OptionalTypeVariableFormikValue>
    outputVariables?: Array<OptionalTypeVariableFormikValue>
  }
}

export interface TanzuCommandVariableStepProps {
  initialValues: TanzuCommandFormData
  stageIdentifier: string
  onUpdate?(data: TanzuCommandFormData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: TanzuCommandFormData
}

interface TanzuCommandProps {
  initialValues: TanzuCommandData
  onUpdate?: (data: TanzuCommandFormData) => void
  onChange?: (data: TanzuCommandFormData) => void
  allowableTypes: AllowedTypes
  readonly?: boolean
  stepViewType?: StepViewType
  isNewStep?: boolean
  inputSetData?: {
    template?: TanzuCommandData
    path?: string
    readonly?: boolean
  }
  formikRef?: any
}
const scriptType: ScriptType = 'Bash'

function TanzuCommandWidget(
  props: TanzuCommandProps,
  formikRef: StepFormikFowardRef<TanzuCommandFormData>
): React.ReactElement {
  const { initialValues, onUpdate, isNewStep, readonly, allowableTypes, onChange, stepViewType } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { NG_EXPRESSIONS_NEW_INPUT_ELEMENT } = useFeatureFlags()

  const scriptWidgetTitle = React.useMemo(
    (): JSX.Element => (
      <Layout.Vertical>
        <Label>{getString('common.script')}</Label>
      </Layout.Vertical>
    ),
    [getString]
  )

  const getInitialValues = (): TanzuCommandFormData => {
    const initSpec = initialValues?.spec
    return {
      ...initialValues,
      spec: {
        ...initSpec,

        inputVariables: Array.isArray(initialValues.spec?.inputVariables)
          ? initialValues.spec?.inputVariables.map(variable => ({
              ...variable,
              id: uuid()
            }))
          : [],

        outputVariables: Array.isArray(initialValues.spec?.outputVariables)
          ? initialValues.spec?.outputVariables.map(variable => ({
              ...variable,
              id: uuid()
            }))
          : []
      }
    }
  }

  /* istanbul ignore next */
  const onSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    values: TanzuCommandFormData,
    setFieldValue: (field: string, value: any) => void
  ): void => {
    const fieldName = 'spec.script.store'
    if (e.target.value === InstanceScriptTypes.Inline) {
      setFieldValue(fieldName, {
        type: InstanceScriptTypes.Inline,
        spec: {
          content: values?.spec?.script?.store?.spec?.content || ''
        }
      })
    } else {
      setFieldValue(fieldName, {
        type: InstanceScriptTypes.FileStore,
        spec: {
          files: !isEmpty(values?.spec?.script?.store?.spec?.files) ? values?.spec?.script?.store?.spec?.files : ['']
        }
      })
    }
  }

  return (
    <Formik<TanzuCommandFormData>
      onSubmit={(values: TanzuCommandFormData) => {
        /* istanbul ignore next */
        onUpdate?.(values)
      }}
      formName="TanzuCommandStep"
      initialValues={getInitialValues()}
      validate={data => {
        /* istanbul ignore next */
        onChange?.(data)
      }}
      validationSchema={Yup.object().shape({
        ...getNameAndIdentifierSchema(getString, stepViewType),
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
        spec: Yup.object().shape({
          script: Yup.object().shape({
            store: Yup.object().shape({
              type: Yup.string(),
              spec: Yup.object()
                .when('type', {
                  is: value => value === InstanceScriptTypes.Inline,
                  then: Yup.object().shape({
                    content: Yup.string()
                      .trim()
                      .required(getString('common.validation.fieldIsRequired', { name: getString('common.script') }))
                  })
                })
                .when('type', {
                  is: value => value === InstanceScriptTypes.FileStore,
                  /* istanbul ignore next */
                  then: Yup.object().shape({
                    /* istanbul ignore next */
                    files: Yup.lazy((value): Yup.Schema<unknown> => {
                      /* istanbul ignore next */
                      if (getMultiTypeFromValue(value as string[]) === MultiTypeInputType.FIXED) {
                        return Yup.array().of(
                          Yup.string().required(
                            getString('common.validation.fieldIsRequired', { name: getString('common.file') })
                          )
                        )
                      }
                      /* istanbul ignore next */
                      return Yup.string().required(
                        getString('common.validation.fieldIsRequired', { name: getString('common.file') })
                      )
                    })
                  })
                })
            })
          }),
          inputVariables: variableSchema(getString),
          outputVariables: Yup.array().of(
            Yup.object({
              name: Yup.string().required(getString('common.validation.nameIsRequired')),
              value: Yup.string().required(getString('common.validation.valueIsRequired')),
              type: Yup.string().trim().required(getString('common.validation.typeIsRequired'))
            })
          )
        })
      })}
    >
      {(formik: FormikProps<TanzuCommandFormData>) => {
        const { values, setFieldValue } = formik
        const templateFileType = values?.spec?.script?.store?.type
        setFormikRef(formikRef, formik)

        return (
          <Layout.Vertical padding={{ left: 'xsmall', right: 'xsmall' }}>
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
                multiTypeDurationProps={{
                  enableConfigureOptions: true,
                  expressions,
                  disabled: readonly,
                  allowableTypes,
                  newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
                }}
              />
            </div>

            <Layout.Horizontal flex={{ alignItems: 'flex-start' }}>
              <Container className={css.typeSelect}>
                <select
                  className={css.selectDropdown}
                  name="spec.script.store.type"
                  disabled={readonly}
                  value={templateFileType}
                  onChange={
                    /* istanbul ignore next */ e => {
                      onSelectChange(e, values, setFieldValue)
                    }
                  }
                  data-testid="templateOptions"
                >
                  <option value={InstanceScriptTypes.FileStore}>{getString('resourcePage.fileStore')}</option>
                  <option value={InstanceScriptTypes.Inline}>{getString('inline')}</option>
                </select>
              </Container>
            </Layout.Horizontal>

            {templateFileType === InstanceScriptTypes.FileStore && (
              <div className={cx(stepCss.formGroup, stepCss.md, css.bottomWidth)}>
                <MultiConfigSelectField
                  name="spec.script.store.spec.files"
                  allowableTypes={allowableTypes}
                  fileType={FILE_TYPE_VALUES.FILE_STORE}
                  formik={formik}
                  expressions={expressions}
                  fileUsage={FileUsage.SCRIPT}
                  values={defaultTo(formik.values.spec?.script?.store?.spec?.files, [''])}
                  multiTypeFieldSelectorProps={{
                    disableTypeSelection: false,
                    disabled: readonly,
                    label: scriptWidgetTitle
                  }}
                  restrictToSingleEntry={true}
                />
              </div>
            )}

            {templateFileType === InstanceScriptTypes.Inline && (
              <div>
                <MultiTypeFieldSelector
                  name="spec.script.store.spec.content"
                  label={scriptWidgetTitle}
                  defaultValueToReset=""
                  disabled={readonly}
                  allowedTypes={allowableTypes}
                  disableTypeSelection={readonly}
                  skipRenderValueInExpressionLabel
                  expressionRender={
                    /* istanbul ignore next */ () => {
                      return (
                        <ShellScriptMonacoField
                          name="spec.script.store.spec.content"
                          scriptType={scriptType}
                          disabled={readonly}
                          expressions={expressions}
                        />
                      )
                    }
                  }
                >
                  <ShellScriptMonacoField
                    name="spec.script.store.spec.content"
                    scriptType={scriptType}
                    disabled={readonly}
                    expressions={expressions}
                  />
                </MultiTypeFieldSelector>
              </div>
            )}
            <Accordion className={stepCss.accordion}>
              <Accordion.Panel
                id="optional-config"
                summary={getString('common.optionalConfig')}
                details={
                  <div>
                    <div className={stepCss.formGroup}>
                      <MultiTypeFieldSelector
                        name="spec.inputVariables"
                        label={getString('pipeline.scriptInputVariables')}
                        isOptional
                        optionalLabel={getString('common.optionalLabel')}
                        defaultValueToReset={[]}
                        disableTypeSelection
                        data-tooltip-id={`shellScriptInputVariable_${values?.spec?.shell}`}
                        tooltipProps={{ dataTooltipId: `shellScriptInputVariable_${values?.spec?.shell}` }}
                      >
                        <FieldArray
                          name="spec.inputVariables"
                          render={({ push, remove }) => {
                            return (
                              <div className={css.panel}>
                                <div className={css.environmentVarHeader}>
                                  <span className={css.label}>{getString('name')}</span>
                                  <span className={css.label}>{getString('typeLabel')}</span>
                                  <span className={css.label}>{getString('valueLabel')}</span>
                                </div>
                                {values.spec.inputVariables?.map(
                                  ({ id }: OptionalTypeVariableFormikValue, i: number) => {
                                    return (
                                      <div className={css.environmentVarHeader} key={id}>
                                        <FormInput.Text
                                          name={`spec.inputVariables[${i}].name`}
                                          placeholder={getString('name')}
                                          disabled={readonly}
                                        />
                                        <FormInput.Select
                                          items={scriptInputType}
                                          name={`spec.inputVariables[${i}].type`}
                                          placeholder={getString('typeLabel')}
                                          disabled={readonly}
                                        />
                                        <OptionalVariables
                                          variableSpec={`spec.inputVariables[${i}]`}
                                          allowableTypes={allowableTypes}
                                          readonly={readonly}
                                        />
                                        <Button
                                          variation={ButtonVariation.ICON}
                                          icon="main-trash"
                                          data-testid={`remove-inputVar-${i}`}
                                          onClick={() => remove(i)}
                                          disabled={readonly}
                                        />
                                      </div>
                                    )
                                  }
                                )}
                                <Button
                                  icon="plus"
                                  variation={ButtonVariation.LINK}
                                  data-testid="add-inputVar"
                                  disabled={readonly}
                                  onClick={() => push({ name: '', type: 'String', value: '', id: uuid() })}
                                  className={css.addButton}
                                >
                                  {getString('addInputVar')}
                                </Button>
                              </div>
                            )
                          }}
                        />
                      </MultiTypeFieldSelector>
                    </div>
                    <div className={stepCss.formGroup}>
                      <MultiTypeFieldSelector
                        name="spec.outputVariables"
                        label={getString('pipeline.scriptOutputVariables')}
                        isOptional
                        optionalLabel={getString('common.optionalLabel')}
                        defaultValueToReset={[]}
                        disableTypeSelection
                        data-tooltip-id={`shellScriptOutputVariable_${values?.spec?.shell}`}
                        tooltipProps={{ dataTooltipId: `shellScriptOutputVariable_${values?.spec?.shell}` }}
                      >
                        <FieldArray
                          name="spec.outputVariables"
                          render={({ push, remove }) => {
                            return (
                              <div className={css.panel}>
                                <div className={css.outputVarHeader}>
                                  <span className={css.label}>{getString('name')}</span>
                                  <span className={css.label}>{getString('typeLabel')}</span>
                                  <span className={css.label}>
                                    {getString('cd.steps.shellScriptOutputVariablesLabel', { scriptType: scriptType })}
                                  </span>
                                </div>
                                {values.spec.outputVariables?.map(
                                  ({ id }: OptionalTypeVariableFormikValue, i: number) => {
                                    return (
                                      <div className={css.outputVarHeader} key={id}>
                                        <FormInput.Text
                                          name={`spec.outputVariables[${i}].name`}
                                          placeholder={getString('name')}
                                          disabled={readonly}
                                        />
                                        <FormInput.Select
                                          items={[{ label: 'String', value: 'String' }]}
                                          name={`spec.outputVariables[${i}].type`}
                                          placeholder={getString('typeLabel')}
                                          disabled={readonly}
                                        />

                                        <OptionalVariables
                                          variableSpec={`spec.outputVariables[${i}]`}
                                          allowableTypes={allowableTypes}
                                          readonly={readonly}
                                        />

                                        <Button
                                          minimal
                                          icon="main-trash"
                                          onClick={() => remove(i)}
                                          disabled={readonly}
                                        />
                                      </div>
                                    )
                                  }
                                )}
                                <Button
                                  icon="plus"
                                  variation={ButtonVariation.LINK}
                                  onClick={() => push({ name: '', type: 'String', value: '', id: uuid() })}
                                  disabled={readonly}
                                  className={css.addButton}
                                >
                                  {getString('addOutputVar')}
                                </Button>
                              </div>
                            )
                          }}
                        />
                      </MultiTypeFieldSelector>
                    </div>
                  </div>
                }
              />
            </Accordion>
          </Layout.Vertical>
        )
      }}
    </Formik>
  )
}

type variablesInfo = {
  selectOption: SelectOption[]
  variableType: 'String' | 'Number' | 'Secret'
  variableValue: string
}
const getMultiSelectProps = (
  template: TanzuCommandData,
  initialValues: TanzuCommandData | undefined,
  path: string
): variablesInfo => {
  const selectOpt = defaultTo(getAllowedValuesFromTemplate(template, `${path}.value`), [])
  const variableValue = get(initialValues, `${path}.value`, '')
  const variableType = get(initialValues, `${path}.type`, 'String') as 'String' | 'Number' | 'Secret'

  return {
    selectOption: selectOpt,
    variableType,
    variableValue
  }
}

const TanzuCommandInputStep: React.FC<TanzuCommandProps> = props => {
  const { inputSetData, allowableTypes, stepViewType, readonly, initialValues } = props
  const multiSelectSupportForAllowedValues = useFeatureFlag(FeatureFlag.PIE_MULTISELECT_AND_COMMA_IN_ALLOWED_VALUES)
  const isExecutionTimeFieldDisabledForStep = isExecutionTimeFieldDisabled(stepViewType)
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { NG_EXPRESSIONS_NEW_INPUT_ELEMENT } = useFeatureFlags()
  /* istanbul ignore next */
  const getNameEntity = (fieldName: string): string =>
    `${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}${fieldName}`
  const prefix = isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`
  const formik = useFormikContext()

  return (
    <>
      {getMultiTypeFromValue(inputSetData?.template?.timeout) === MultiTypeInputType.RUNTIME && (
        <TimeoutFieldInputSetView
          name={getNameEntity('timeout')}
          label={getString('pipelineSteps.timeoutLabel')}
          multiTypeDurationProps={{
            configureOptionsProps: {
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            },
            allowableTypes: allowableTypes,
            expressions,
            disabled: inputSetData?.readonly,
            newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
          }}
          disabled={inputSetData?.readonly}
          fieldPath={'timeout'}
          template={inputSetData?.template}
          className={cx(stepCss.formGroup, stepCss.md)}
        />
      )}

      {getMultiTypeFromValue(inputSetData?.template?.spec?.script?.store?.spec?.files) ===
      MultiTypeInputType.RUNTIME ? (
        <div className={cx(stepCss.formGroup, stepCss.alignStart, stepCss.md)}>
          <MultiTypeListOrFileSelectList
            fieldPath={`${prefix}spec.script.store.spec.files`}
            label={getString('common.script')}
            name={`${prefix}spec.script.store.spec.files`}
            placeholder={getString('select')}
            disabled={!!inputSetData?.readonly}
            allowableTypes={allowableTypes}
            stepViewType={stepViewType}
            formik={formik}
            manifestStoreType={ManifestStoreMap.Harness}
            allowOnlyOne
            isNameOfArrayType
          />
        </div>
      ) : null}

      {getMultiTypeFromValue(inputSetData?.template?.spec?.script?.store?.spec?.content) ===
      MultiTypeInputType.RUNTIME ? (
        <div className={cx(stepCss.formGroup, stepCss.alignStart, stepCss.md)}>
          <MultiTypeFieldSelector
            name={`${prefix}spec.script.store.spec.content`}
            label={
              <Layout.Vertical>
                <Label>{getString('common.script')}</Label>
              </Layout.Vertical>
            }
            defaultValueToReset=""
            allowedTypes={allowableTypes}
            skipRenderValueInExpressionLabel
            disabled={inputSetData?.readonly}
            expressionRender={
              /* istanbul ignore next */ () => (
                <ShellScriptMonacoField
                  name={`${prefix}spec.script.store.spec.content`}
                  scriptType={scriptType}
                  disabled={inputSetData?.readonly}
                  expressions={expressions}
                />
              )
            }
          >
            <ShellScriptMonacoField
              name={`${prefix}spec.script.store.spec.content`}
              scriptType={scriptType}
              disabled={inputSetData?.readonly}
              expressions={expressions}
            />
          </MultiTypeFieldSelector>
        </div>
      ) : null}
      {isArray(inputSetData?.template?.spec?.inputVariables) && inputSetData?.template?.spec?.inputVariables ? (
        <div className={stepCss.formGroup}>
          <MultiTypeFieldSelector
            name="spec.inputVariables"
            label={getString('pipeline.scriptInputVariables')}
            defaultValueToReset={[]}
            disableTypeSelection
          >
            <FieldArray
              name="spec.inputVariables"
              render={() => {
                const formikInputVariablesPath = `${prefix}spec.inputVariables`
                const formikInputVariables = defaultTo(get(formik?.values, formikInputVariablesPath), [])
                return (
                  <div className={css.panel}>
                    <div className={css.outputVarHeader}>
                      <span className={css.label}>{getString('name')}</span>
                      <span className={css.label}>{getString('typeLabel')}</span>
                      <span className={css.label}>{getString('common.inputVariables')}</span>
                    </div>
                    {inputSetData?.template?.spec.inputVariables?.map((inputVariable: any, i: number) => {
                      // find Index from values, not from template variables
                      // because the order of the variables might not be the same
                      const formikInputVariableIndex = formikInputVariables.findIndex(
                        (formikInputVariable: ScriptStepVariable) => inputVariable.name === formikInputVariable.name
                      )
                      const formikInputVariablePath = `${formikInputVariablesPath}[${formikInputVariableIndex}]`
                      const variableInfo = getMultiSelectProps(
                        inputSetData.template!,
                        initialValues,
                        `spec.inputVariables[${i}]`
                      )
                      const allowMultiSelectAllowedValues =
                        multiSelectSupportForAllowedValues &&
                        variableInfo.variableType === 'String' &&
                        shouldRenderRunTimeInputViewWithAllowedValues(
                          `spec.inputVariables[${i}].value`,
                          inputSetData.template
                        ) &&
                        isFixedInput(formik, `${formikInputVariablePath}.value`)

                      return (
                        <div className={css.runtimeVarHeader} key={inputVariable.value}>
                          <FormInput.Text
                            name={`${formikInputVariablePath}.name`}
                            placeholder={getString('name')}
                            disabled={true}
                          />

                          <FormInput.Select
                            items={scriptInputType}
                            name={`${formikInputVariablePath}.type`}
                            placeholder={getString('typeLabel')}
                            disabled={true}
                          />
                          {allowMultiSelectAllowedValues ? (
                            <MultiSelectVariableAllowedValues
                              name={`${formikInputVariablePath}.value`}
                              allowableTypes={allowableTypes}
                              disabled={readonly}
                              selectOption={variableInfo.selectOption}
                              onChange={val => {
                                const finalValue =
                                  getMultiTypeFromValue(val) === MultiTypeInputType.FIXED
                                    ? concatValuesWithQuotes(val as MultiSelectOption[])
                                    : val
                                formik.setFieldValue(`${formikInputVariablePath}.value`, finalValue)
                              }}
                              label=""
                            />
                          ) : (
                            <TextFieldInputSetView
                              name={`${formikInputVariablePath}.value`}
                              multiTextInputProps={{
                                allowableTypes,
                                expressions,
                                disabled: readonly,
                                defaultValueToReset: '',
                                newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
                              }}
                              label=""
                              placeholder={getString('valueLabel')}
                              fieldPath={`spec.inputVariables[${i}].value`}
                              template={inputSetData.template}
                              enableConfigureOptions
                              configureOptionsProps={{
                                isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabledForStep
                              }}
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              }}
            />
          </MultiTypeFieldSelector>
        </div>
      ) : null}
      {isArray(inputSetData?.template?.spec?.outputVariables) && inputSetData?.template?.spec?.outputVariables ? (
        <div className={stepCss.formGroup}>
          <MultiTypeFieldSelector
            name="spec.outputVariables"
            label={getString('pipeline.scriptOutputVariables')}
            defaultValueToReset={[]}
            disableTypeSelection
          >
            <FieldArray
              name="spec.outputVariables"
              render={() => {
                const formikOutputVariablesPath = `${prefix}spec.outputVariables`
                const formikOutputVariables = defaultTo(get(formik?.values, formikOutputVariablesPath), [])
                return (
                  <div className={css.panel}>
                    <div className={css.outputVarHeader}>
                      <span className={css.label}>{getString('name')}</span>
                      <span className={css.label}>{getString('typeLabel')}</span>
                      <span className={css.label}>{getString('pipelineSteps.outputVariablesLabel')}</span>
                    </div>
                    {inputSetData?.template?.spec.outputVariables?.map((outputVariable: any, i: number) => {
                      // find Index from values, not from template variables
                      // because the order of the variables might not be the same
                      const formikOutputVariableIndex = formikOutputVariables.findIndex(
                        (formikOutputVariable: ScriptStepVariable) => outputVariable.name === formikOutputVariable.name
                      )
                      const formikOutputVariablePath = `${formikOutputVariablesPath}[${formikOutputVariableIndex}]`
                      const variableInfo = getMultiSelectProps(
                        inputSetData?.template as any,
                        initialValues,
                        `spec.outputVariables[${i}]`
                      )
                      const allowMultiSelectAllowedValues =
                        multiSelectSupportForAllowedValues &&
                        variableInfo.variableType === 'String' &&
                        shouldRenderRunTimeInputViewWithAllowedValues(
                          `spec.outputVariables[${i}].value`,
                          inputSetData?.template
                        ) &&
                        isFixedInput(formik, `${formikOutputVariablePath}.value`)
                      return (
                        <div className={css.outputVarHeader} key={outputVariable.name}>
                          <FormInput.Text
                            name={`${formikOutputVariablePath}.name`}
                            placeholder={getString('name')}
                            disabled={true}
                          />

                          <FormInput.Select
                            items={scriptOutputType}
                            name={`${formikOutputVariablePath}.type`}
                            placeholder={getString('typeLabel')}
                            disabled={true}
                          />

                          {allowMultiSelectAllowedValues ? (
                            <MultiSelectVariableAllowedValues
                              name={`${formikOutputVariablePath}.value`}
                              allowableTypes={allowableTypes}
                              disabled={readonly}
                              selectOption={variableInfo.selectOption}
                              onChange={val => {
                                const finalValue =
                                  getMultiTypeFromValue(val) === MultiTypeInputType.FIXED
                                    ? concatValuesWithQuotes(val as MultiSelectOption[])
                                    : val
                                formik.setFieldValue(`${formikOutputVariablePath}.value`, finalValue)
                              }}
                              label=""
                            />
                          ) : (
                            <TextFieldInputSetView
                              name={`${formikOutputVariablePath}.value`}
                              multiTextInputProps={{
                                allowableTypes,
                                expressions,
                                disabled: readonly,
                                defaultValueToReset: '',
                                newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
                              }}
                              label=""
                              placeholder={getString('valueLabel')}
                              fieldPath={`spec.outputVariables[${i}].value`}
                              template={inputSetData?.template}
                              enableConfigureOptions
                              configureOptionsProps={{
                                isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabledForStep
                              }}
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              }}
            />
          </MultiTypeFieldSelector>
        </div>
      ) : null}
    </>
  )
}

const TanzuCommandWidgetWithRef = React.forwardRef(TanzuCommandWidget)
export class TanzuCommandStep extends PipelineStep<TanzuCommandData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  renderStep(props: StepProps<TanzuCommandData>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      stepViewType,
      inputSetData,
      formikRef,
      customStepProps,
      isNewStep,
      readonly,
      onChange,
      allowableTypes
    } = props
    if (this.isTemplatizedView(stepViewType)) {
      return (
        <TanzuCommandInputStep
          allowableTypes={allowableTypes}
          initialValues={initialValues}
          onUpdate={/* istanbul ignore next */ data => onUpdate?.(this.processFormData(data))}
          stepViewType={stepViewType}
          inputSetData={inputSetData}
          formikRef={formikRef}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      const { variablesData, metadataMap } = customStepProps as TanzuCommandVariableStepProps
      /* istanbul ignore else */
      if ((variablesData.spec.script.store as StoreConfig)?.spec.files) {
        variablesData.spec['spec.script.store.spec.files'] = defaultTo(
          (variablesData.spec.script.store as StoreConfig)?.spec.files,

          ''
        )
      }
      return (
        <VariablesListTable
          className={pipelineVariablesCss.variablePaddingL3}
          data={variablesData.spec}
          originalData={initialValues.spec}
          metadataMap={metadataMap}
        />
      )
    }
    return (
      <TanzuCommandWidgetWithRef
        initialValues={initialValues}
        onUpdate={data => onUpdate?.(this.processFormData(data))}
        onChange={data => onChange?.(this.processFormData(data))}
        isNewStep={isNewStep}
        allowableTypes={allowableTypes}
        stepViewType={defaultTo(stepViewType, StepViewType.Edit)}
        readonly={readonly}
        ref={formikRef}
      />
    )
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<TanzuCommandFormData>): FormikErrors<TanzuCommandFormData> {
    /* istanbul ignore next */
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errors = { spec: {} } as any
    /* istanbul ignore else */
    if (getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME) {
      let timeoutSchema = getDurationValidationSchema({ minimum: '10s' })
      /* istanbul ignore else */
      if (isRequired) {
        /* istanbul ignore next */
        timeoutSchema = timeoutSchema.required(getString?.('validation.timeout10SecMinimum'))
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

    /* istanbul ignore else */
    if (
      getMultiTypeFromValue(template?.spec?.script?.store?.spec?.files) === MultiTypeInputType.RUNTIME &&
      isRequired &&
      isEmpty(data?.spec?.script?.store?.spec?.files)
    ) {
      set(errors, 'spec.script.store.spec.files', getString?.('fieldRequired', { field: 'File path' }))
    }
    /* istanbul ignore else */
    if (
      getMultiTypeFromValue(template?.spec?.script?.store?.spec?.content) === MultiTypeInputType.RUNTIME &&
      isRequired &&
      isEmpty(data?.spec?.script?.store?.spec?.content)
    ) {
      set(errors, 'spec.script.store.spec.content', getString?.('fieldRequired', { field: 'Script' }))
    }
    /* istanbul ignore else */
    if (
      (isArray(template?.spec?.inputVariables) || isArray(template?.spec?.outputVariables)) &&
      isRequired &&
      getString
    ) {
      try {
        const schema = Yup.object().shape({
          spec: Yup.object().shape({
            inputVariables: variableSchema(getString),
            outputVariables: Yup.array().of(
              Yup.object({
                name: Yup.string().required(getString('common.validation.nameIsRequired')),
                value: Yup.string().required(getString('common.validation.valueIsRequired')),
                type: Yup.string().trim().required(getString('common.validation.typeIsRequired'))
              })
            )
          })
        })
        schema.validateSync(data)
      } catch (e) {
        /* istanbul ignore else */
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)

          Object.assign(errors, err)
        }
      }
    }

    /* istanbul ignore else */
    if (isEmpty(errors.spec)) {
      delete errors.spec
    }
    return errors
  }

  protected type = StepType.TanzuCommand
  protected stepName = 'Tanzu Command'
  protected stepIcon: IconName = 'tanzuCommand'
  protected referenceId = 'TanzuCommandStep'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.TanzuCommandScript'

  processFormData(values: TanzuCommandFormData): TanzuCommandData {
    const fileFormData = values.spec.script.store.spec?.files
    const templateFile = values.spec.script.store.type
    return {
      ...values,
      spec: {
        ...values.spec,
        script: {
          ...values.spec.script,
          store: {
            ...values.spec.script.store,
            type: templateFile,
            spec:
              templateFile === InstanceScriptTypes.Inline
                ? {
                    content: values.spec.script.store?.spec?.content
                  }
                : {
                    files: fileFormData
                  }
          }
        },
        inputVariables: Array.isArray(values.spec?.inputVariables)
          ? values.spec?.inputVariables.map(({ id, ...variable }) => ({
              ...variable,
              value: defaultTo(variable.value, '')
            }))
          : undefined,
        outputVariables: Array.isArray(values.spec?.outputVariables)
          ? values.spec?.outputVariables.map(({ id, ...variable }) => ({
              ...variable,
              value: defaultTo(variable.value, '')
            }))
          : undefined
      }
    }
  }
  protected defaultValues: TanzuCommandFormData = {
    identifier: '',
    name: '',
    type: StepType.TanzuCommand,
    timeout: '',
    spec: {
      script: {
        store: {
          type: 'Harness',
          spec: {
            files: ['']
          }
        }
      }
    }
  }
}
