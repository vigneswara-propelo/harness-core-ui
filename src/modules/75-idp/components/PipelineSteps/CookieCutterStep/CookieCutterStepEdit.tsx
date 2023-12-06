/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color, FontVariation } from '@harness/design-system'
import {
  AllowedTypes,
  Button,
  ButtonVariation,
  Card,
  FormInput,
  Formik,
  FormikForm,
  Layout,
  Text
} from '@harness/uicore'
import { FieldArray, FormikProps } from 'formik'
import React from 'react'
import { v4 as uuid } from 'uuid'
import { StepFormikFowardRef, StepViewType, setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { useStrings } from 'framework/strings'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import { validate } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { usePipelineContext } from '@modules/70-pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { BuildStageElementConfig } from '@modules/70-pipeline/utils/pipelineTypes'
import MultiTypeFieldSelector from '@modules/10-common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { editViewValidateFieldsConfig, transformValuesFieldsConfig } from './CookieCutterStepFunctionConfigs'
import { getFormValuesInCorrectFormat, getInitialValuesInCorrectFormat } from '../utils'
import css from './CookieCutterStep.module.scss'

export interface CookieCutterStepData {
  name?: string
  identifier: string
  type: string
  timeout?: string
  spec: {
    templateType: string
    publicTemplateUrl: string
    cookieCutterVariables: Array<Record<string, string>>
    outputDirectory: string
  }
}

export interface CookieCutterStepEditProps {
  initialValues: CookieCutterStepData
  template?: CookieCutterStepData
  path?: string
  isNewStep?: boolean
  readonly?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: CookieCutterStepData) => void
  onChange?: (data: CookieCutterStepData) => void
  allowableTypes: AllowedTypes
  formik?: FormikProps<CookieCutterStepData>
}

const CookieCutterStepEdit = (
  {
    initialValues,
    onUpdate,
    isNewStep = true,
    readonly,
    stepViewType,
    onChange,
    allowableTypes
  }: CookieCutterStepEditProps,
  formikRef: StepFormikFowardRef<CookieCutterStepData>
): JSX.Element => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const isExecutionTimeFieldDisabledForStep = isExecutionTimeFieldDisabled(stepViewType)

  const { getStageFromPipeline, state } = usePipelineContext()
  const { stage: currentStage } = getStageFromPipeline<BuildStageElementConfig>(
    state.selectionState.selectedStageId || ''
  )

  return (
    <Formik<CookieCutterStepData>
      initialValues={getInitialValuesInCorrectFormat(initialValues, transformValuesFieldsConfig)}
      formName="CookieCutterStep"
      validate={valuesToValidate => {
        const schemaValues = getFormValuesInCorrectFormat<CookieCutterStepData, CookieCutterStepData>(
          valuesToValidate,
          transformValuesFieldsConfig
        )
        onChange?.(schemaValues)

        return validate(
          valuesToValidate,
          editViewValidateFieldsConfig,
          {
            initialValues,
            steps: currentStage?.stage?.spec?.execution?.steps || {},
            serviceDependencies: currentStage?.stage?.spec?.serviceDependencies || {},
            getString
          },
          stepViewType
        )
      }}
      onSubmit={(_values: CookieCutterStepData) => {
        const schemaValues = getFormValuesInCorrectFormat<CookieCutterStepData, CookieCutterStepData>(
          _values,
          transformValuesFieldsConfig
        )
        onUpdate?.(schemaValues)
      }}
    >
      {formik => {
        setFormikRef?.(formikRef, formik)

        return (
          <FormikForm>
            <div>
              {stepViewType !== StepViewType.Template && (
                <FormInput.InputWithIdentifier
                  inputName="name"
                  idName="identifier"
                  inputLabel={getString('pipelineSteps.stepNameLabel')}
                  isIdentifierEditable={isNewStep}
                  inputGroupProps={{ disabled: readonly }}
                />
              )}

              <Text
                font={{ variation: FontVariation.FORM_SUB_SECTION }}
                color={Color.GREY_900}
                margin={{ bottom: 'small' }}
              >
                {getString('idp.cookieCutterStep.provideRepoDetails')}
              </Text>

              <Card className={css.repoDetails}>
                <FormInput.RadioGroup
                  name="spec.templateType"
                  label={getString('repositoryType')}
                  items={[
                    {
                      label: getString('idp.cookieCutterStep.public'),
                      value: 'public'
                    },
                    {
                      label: getString('idp.cookieCutterStep.private'),
                      value: 'private'
                    }
                  ]}
                  radioGroup={{ inline: true }}
                  disabled={readonly}
                />
                <MultiTypeTextField
                  name="spec.publicTemplateUrl"
                  className={css.publicTemplateUrl}
                  label={
                    <Text
                      tooltipProps={{ dataTooltipId: 'publicTemplateUrl' }}
                      className={css.formLabel}
                      margin={{ bottom: 'medium' }}
                    >
                      {getString('idp.cookieCutterStep.cookieCutterTemplateURL')}
                    </Text>
                  }
                  multiTextInputProps={{
                    disabled: readonly,
                    placeholder: getString('idp.cookieCutterStep.cookieCutterTemplateURLDesc'),
                    multiTextInputProps: {
                      expressions,
                      allowableTypes
                    }
                  }}
                  configureOptionsProps={{
                    hideExecutionTimeField: isExecutionTimeFieldDisabledForStep
                  }}
                />

                <MultiTypeFieldSelector
                  defaultValueToReset={['']}
                  name={'spec.cookieCutterVariables'}
                  label={getString('idp.cookieCutterStep.configureTemplate')}
                  disableTypeSelection
                >
                  <FieldArray
                    name={'spec.cookieCutterVariables'}
                    render={({ push, remove }) => {
                      return (
                        <div className={css.panel}>
                          <div className={css.cookieCutterVarHeader}>
                            <span className={css.label}>{getString('keyLabel')}</span>
                            <span className={css.label}>{getString('valueLabel')}</span>
                          </div>
                          {formik.values.spec.cookieCutterVariables?.map((val: Record<string, string>, idx: number) => {
                            return (
                              <Layout.Horizontal key={val.key} spacing="medium">
                                <FormInput.Text
                                  name={`spec.cookieCutterVariables[${idx}].name`}
                                  placeholder={getString('name')}
                                  disabled={readonly}
                                />

                                <FormInput.MultiTextInput
                                  name={`spec.cookieCutterVariables[${idx}].value`}
                                  placeholder={getString('valueLabel')}
                                  multiTextInputProps={{
                                    allowableTypes,
                                    expressions,
                                    disabled: readonly
                                  }}
                                  label=""
                                  disabled={readonly}
                                />

                                <Button minimal icon="main-trash" onClick={() => remove(idx)} disabled={readonly} />
                              </Layout.Horizontal>
                            )
                          })}
                          <Button
                            icon="plus"
                            variation={ButtonVariation.LINK}
                            onClick={() => push({ key: '', value: '', id: uuid() })}
                            disabled={readonly}
                            className={css.addButton}
                          >
                            {getString('idp.newKeyValue')}
                          </Button>
                        </div>
                      )
                    }}
                  />
                </MultiTypeFieldSelector>
              </Card>

              <Text
                font={{ variation: FontVariation.FORM_SUB_SECTION }}
                color={Color.GREY_900}
                margin={{ top: 'xlarge', bottom: 'small' }}
              >
                {getString('advancedTitle')}
              </Text>

              <Card className={css.repoDetails}>
                <MultiTypeTextField
                  name="spec.outputDirectory"
                  label={
                    <Text tooltipProps={{ dataTooltipId: 'outputDirectory' }} className={css.formLabel}>
                      {getString('idp.cookieCutterStep.outputDir')}
                    </Text>
                  }
                  multiTextInputProps={{
                    disabled: readonly,
                    placeholder: getString('idp.cookieCutterStep.outputDirPlaceHolder'),
                    multiTextInputProps: {
                      expressions,
                      allowableTypes
                    }
                  }}
                  configureOptionsProps={{
                    hideExecutionTimeField: isExecutionTimeFieldDisabledForStep
                  }}
                />
              </Card>
            </div>
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export const CookieCutterStepEditWithRef = React.forwardRef(CookieCutterStepEdit)
