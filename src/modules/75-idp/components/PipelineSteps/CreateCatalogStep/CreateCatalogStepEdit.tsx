/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Color, FontVariation } from '@harness/design-system'
import { AllowedTypes, Card, FormInput, Formik, FormikForm, Text } from '@harness/uicore'
import { FormikProps } from 'formik'
import { StepFormikFowardRef, StepViewType, setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { useStrings } from 'framework/strings'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import { validate } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { usePipelineContext } from '@modules/70-pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { BuildStageElementConfig } from '@modules/70-pipeline/utils/pipelineTypes'
import MultiTypeFieldSelector from '@modules/10-common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { MonacoTextField } from '@modules/10-common/components/MonacoTextField/MonacoTextField'
import { editViewValidateFieldsConfig, transformValuesFieldsConfig } from './CreateCatalogStepFunctionConfigs'
import { getFormValuesInCorrectFormat, getInitialValuesInCorrectFormat } from '../utils'
import css from '../IDPSteps.module.scss'

export interface CreateCatalogStepData {
  name?: string
  identifier: string
  type: string
  spec: {
    fileName: string
    fileContent: string
    filePath: string
  }
}

export interface CreateCatalogStepEditProps {
  initialValues: CreateCatalogStepData
  template?: CreateCatalogStepData
  path?: string
  isNewStep?: boolean
  readonly?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: CreateCatalogStepData) => void
  onChange?: (data: CreateCatalogStepData) => void
  allowableTypes: AllowedTypes
  formik?: FormikProps<CreateCatalogStepData>
}

const CreateCatalogStepEdit = (
  {
    initialValues,
    onUpdate,
    isNewStep = true,
    readonly,
    stepViewType,
    onChange,
    allowableTypes
  }: CreateCatalogStepEditProps,
  formikRef: StepFormikFowardRef<CreateCatalogStepData>
): JSX.Element => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const isExecutionTimeFieldDisabledForStep = isExecutionTimeFieldDisabled(stepViewType)

  const { getStageFromPipeline, state } = usePipelineContext()
  const { stage: currentStage } = getStageFromPipeline<BuildStageElementConfig>(
    state.selectionState.selectedStageId || ''
  )

  return (
    <Formik<CreateCatalogStepData>
      initialValues={getInitialValuesInCorrectFormat(initialValues, transformValuesFieldsConfig)}
      formName="CreateCatalogStep"
      validate={valuesToValidate => {
        const schemaValues = getFormValuesInCorrectFormat<CreateCatalogStepData, CreateCatalogStepData>(
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
      onSubmit={(_values: CreateCatalogStepData) => {
        const schemaValues = getFormValuesInCorrectFormat<CreateCatalogStepData, CreateCatalogStepData>(
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
              color={Color.GREY_800}
              margin={{ bottom: 'small' }}
            >
              {getString('idp.createCatalogStep.createCatalogFormHeader')}
            </Text>

            <Card className={css.repoDetails}>
              <MultiTypeTextField
                name="spec.fileName"
                className={css.publicTemplateUrl}
                label={
                  <Text
                    tooltipProps={{ dataTooltipId: 'fileName' }}
                    className={css.formLabel}
                    margin={{ bottom: 'medium' }}
                  >
                    {getString('common.filename')}
                  </Text>
                }
                multiTextInputProps={{
                  disabled: readonly,
                  multiTextInputProps: {
                    expressions,
                    allowableTypes
                  }
                }}
                configureOptionsProps={{
                  hideExecutionTimeField: isExecutionTimeFieldDisabledForStep
                }}
              />
              <MultiTypeTextField
                name="spec.filePath"
                className={css.publicTemplateUrl}
                label={
                  <Text
                    tooltipProps={{ dataTooltipId: 'filePath' }}
                    className={css.formLabel}
                    margin={{ bottom: 'medium' }}
                  >
                    {`${getString('common.path')} ${getString('common.optionalLabel')}`}
                  </Text>
                }
                multiTextInputProps={{
                  disabled: readonly,
                  placeholder: getString('pipeline.manifestType.pathPlaceholder'),
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
                name="spec.fileContent"
                label={getString('gitsync.fileContent')}
                defaultValueToReset=""
                allowedTypes={allowableTypes}
                skipRenderValueInExpressionLabel
                disabled={readonly}
                disableTypeSelection={readonly}
                expressionRender={
                  /* istanbul ignore next */ () => {
                    return (
                      <MonacoTextField
                        name={'spec.fileContent'}
                        expressions={expressions}
                        height={300}
                        disabled={readonly}
                        fullScreenAllowed
                        fullScreenTitle={getString('gitsync.fileContent')}
                      />
                    )
                  }
                }
              >
                <MonacoTextField
                  name={'spec.fileContent'}
                  expressions={expressions}
                  height={300}
                  disabled={readonly}
                  fullScreenAllowed
                  fullScreenTitle={getString('gitsync.fileContent')}
                />
              </MultiTypeFieldSelector>
            </Card>
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export const CreateCatalogStepEditWithRef = React.forwardRef(CreateCatalogStepEdit)
