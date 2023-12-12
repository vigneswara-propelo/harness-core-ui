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
import { useParams } from 'react-router-dom'
import { StepFormikFowardRef, StepViewType, setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { useStrings } from 'framework/strings'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import { validate } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { usePipelineContext } from '@modules/70-pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { BuildStageElementConfig } from '@modules/70-pipeline/utils/pipelineTypes'
import { ProjectPathProps } from '@modules/10-common/interfaces/RouteInterfaces'
import { Connectors } from '@modules/27-platform/connectors/constants'
import { useGitScope } from '@modules/70-pipeline/utils/CIUtils'
import { FormMultiTypeConnectorField } from '@modules/27-platform/connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { editViewValidateFieldsConfig, transformValuesFieldsConfig } from './DirectPushStepFunctionConfigs'
import { getFormValuesInCorrectFormat, getInitialValuesInCorrectFormat } from '../utils'
import css from '../IDPSteps.module.scss'

export interface DirectPushStepData {
  name?: string
  identifier: string
  type: string
  spec: {
    connectorRef: string
    repository: string
    organization: string
    codeDirectory: string
    codeOutputDirectory: string
    branch: string
  }
}

export interface DirectPushStepEditProps {
  initialValues: DirectPushStepData
  template?: DirectPushStepData
  path?: string
  isNewStep?: boolean
  readonly?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: DirectPushStepData) => void
  onChange?: (data: DirectPushStepData) => void
  allowableTypes: AllowedTypes
  formik?: FormikProps<DirectPushStepData>
}

const DirectPushStepEdit = (
  {
    initialValues,
    onUpdate,
    isNewStep = true,
    readonly,
    stepViewType,
    onChange,
    allowableTypes
  }: DirectPushStepEditProps,
  formikRef: StepFormikFowardRef<DirectPushStepData>
): JSX.Element => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const gitScope = useGitScope()

  const isExecutionTimeFieldDisabledForStep = isExecutionTimeFieldDisabled(stepViewType)

  const { getStageFromPipeline, state } = usePipelineContext()
  const { stage: currentStage } = getStageFromPipeline<BuildStageElementConfig>(
    state.selectionState.selectedStageId || ''
  )

  return (
    <Formik<DirectPushStepData>
      initialValues={getInitialValuesInCorrectFormat(initialValues, transformValuesFieldsConfig)}
      formName="DirectPushStep"
      validate={valuesToValidate => {
        const schemaValues = getFormValuesInCorrectFormat<DirectPushStepData, DirectPushStepData>(
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
      onSubmit={(_values: DirectPushStepData) => {
        const schemaValues = getFormValuesInCorrectFormat<DirectPushStepData, DirectPushStepData>(
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
              {getString('idp.directPushStep.provideRepoDetailstoPublish')}
            </Text>

            <Card className={css.repoDetails}>
              <FormMultiTypeConnectorField
                label={getString('idp.directPushStep.codebaseRepoConnector')}
                type={Connectors.GITHUB}
                name="spec.connectorRef"
                placeholder={getString('select')}
                accountIdentifier={accountId}
                projectIdentifier={projectIdentifier}
                orgIdentifier={orgIdentifier}
                multiTypeProps={{
                  expressions,
                  allowableTypes,
                  disabled: readonly
                }}
                gitScope={gitScope}
                setRefValue
                configureOptionsProps={{
                  hideExecutionTimeField: isExecutionTimeFieldDisabledForStep
                }}
              />

              <MultiTypeTextField
                name="spec.organization"
                className={css.publicTemplateUrl}
                label={
                  <Text
                    tooltipProps={{ dataTooltipId: 'organization' }}
                    className={css.formLabel}
                    margin={{ bottom: 'medium' }}
                  >
                    {getString('orgLabel')}
                  </Text>
                }
                multiTextInputProps={{
                  disabled: readonly,
                  placeholder: getString('pipeline.artifactsSelection.organizationPlaceholder'),
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
                name="spec.repository"
                className={css.publicTemplateUrl}
                label={
                  <Text
                    tooltipProps={{ dataTooltipId: 'repository' }}
                    className={css.formLabel}
                    margin={{ bottom: 'medium' }}
                  >
                    {getString('common.repositoryName')}
                  </Text>
                }
                multiTextInputProps={{
                  disabled: readonly,
                  placeholder: getString('pipeline.manifestType.repoNamePlaceholder'),
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
                name="spec.codeDirectory"
                className={css.publicTemplateUrl}
                label={
                  <Text
                    tooltipProps={{ dataTooltipId: 'codeDirectory' }}
                    className={css.formLabel}
                    margin={{ bottom: 'medium' }}
                  >
                    {getString('idp.directPushStep.codeDirectory')}
                  </Text>
                }
                multiTextInputProps={{
                  disabled: readonly,
                  placeholder: getString('idp.directPushStep.codeDirectoryPlaceholder'),
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
                name="spec.branch"
                className={css.publicTemplateUrl}
                label={
                  <Text
                    tooltipProps={{ dataTooltipId: 'branch' }}
                    className={css.formLabel}
                    margin={{ bottom: 'medium' }}
                  >
                    {getString('common.git.branchName')}
                  </Text>
                }
                multiTextInputProps={{
                  disabled: readonly,
                  placeholder: getString('pipeline.manifestType.branchPlaceholder'),
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
            <Text
              font={{ variation: FontVariation.FORM_SUB_SECTION }}
              color={Color.GREY_800}
              margin={{ top: 'xlarge', bottom: 'small' }}
            >
              {getString('advancedTitle')}
            </Text>

            <Card className={css.repoDetails}>
              <MultiTypeTextField
                name="spec.codeOutputDirectory"
                label={
                  <Text tooltipProps={{ dataTooltipId: 'codeOutputDirectory' }} className={css.formLabel}>
                    {`${getString('idp.directPushStep.outputCodeDir')} ${getString('common.optionalLabel')}`}
                  </Text>
                }
                multiTextInputProps={{
                  disabled: readonly,
                  placeholder: getString('idp.directPushStep.outputCodeDirPlaceholder'),
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
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export const DirectPushStepEditWithRef = React.forwardRef(DirectPushStepEdit)
