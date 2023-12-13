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
import MultiTypeSecretInput from '@modules/27-platform/secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'
import { editViewValidateFieldsConfig, transformValuesFieldsConfig } from './SlackNotifyStepFunctionConfigs'
import { getFormValuesInCorrectFormat, getInitialValuesInCorrectFormat } from '../utils'
import css from '../IDPSteps.module.scss'

export interface SlackNotifyStepData {
  name?: string
  identifier: string
  type: string
  spec: {
    slackId: string
    messageContent: string
    token: string
  }
}

export interface SlackNotifyStepEditProps {
  initialValues: SlackNotifyStepData
  template?: SlackNotifyStepData
  path?: string
  isNewStep?: boolean
  readonly?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: SlackNotifyStepData) => void
  onChange?: (data: SlackNotifyStepData) => void
  allowableTypes: AllowedTypes
  formik?: FormikProps<SlackNotifyStepData>
}

const SlackNotifyStepEdit = (
  {
    initialValues,
    onUpdate,
    isNewStep = true,
    readonly,
    stepViewType,
    onChange,
    allowableTypes
  }: SlackNotifyStepEditProps,
  formikRef: StepFormikFowardRef<SlackNotifyStepData>
): JSX.Element => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const isExecutionTimeFieldDisabledForStep = isExecutionTimeFieldDisabled(stepViewType)

  const { getStageFromPipeline, state } = usePipelineContext()
  const { stage: currentStage } = getStageFromPipeline<BuildStageElementConfig>(
    state.selectionState.selectedStageId || ''
  )

  return (
    <Formik<SlackNotifyStepData>
      initialValues={getInitialValuesInCorrectFormat(initialValues, transformValuesFieldsConfig)}
      formName="SlackNotifyStep"
      validate={valuesToValidate => {
        const schemaValues = getFormValuesInCorrectFormat<SlackNotifyStepData, SlackNotifyStepData>(
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
      onSubmit={(_values: SlackNotifyStepData) => {
        const schemaValues = getFormValuesInCorrectFormat<SlackNotifyStepData, SlackNotifyStepData>(
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
              {getString('idp.slackNotifyStep.slackNotifyStepDescription')}
            </Text>

            <Card className={css.repoDetails}>
              <MultiTypeTextField
                name="spec.slackId"
                className={css.publicTemplateUrl}
                label={
                  <Text
                    tooltipProps={{ dataTooltipId: 'slackId' }}
                    className={css.formLabel}
                    margin={{ bottom: 'medium' }}
                  >
                    {getString('idp.slackNotifyStep.slackChannelId')}
                  </Text>
                }
                multiTextInputProps={{
                  disabled: readonly,
                  placeholder: getString('idp.slackNotifyStep.slackIdPlaceholder'),
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
                name="spec.messageContent"
                className={css.publicTemplateUrl}
                label={
                  <Text
                    tooltipProps={{ dataTooltipId: 'messageContent' }}
                    className={css.formLabel}
                    margin={{ bottom: 'medium' }}
                  >
                    {getString('message')}
                  </Text>
                }
                multiTextInputProps={{
                  disabled: readonly,
                  placeholder: getString('pipeline.terraformStep.messagePlaceholder'),
                  multiTextInputProps: {
                    expressions,
                    allowableTypes
                  }
                }}
                configureOptionsProps={{
                  hideExecutionTimeField: isExecutionTimeFieldDisabledForStep
                }}
              />

              <MultiTypeSecretInput
                name="spec.token"
                label={getString('idp.slackNotifyStep.slackSecretKey')}
                expressions={expressions}
                allowableTypes={allowableTypes}
                enableConfigureOptions
                configureOptionsProps={{
                  isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabledForStep
                }}
                disabled={readonly}
              />
            </Card>
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export const SlackNotifyStepEditWithRef = React.forwardRef(SlackNotifyStepEdit)
