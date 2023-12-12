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
import { FormMultiTypeConnectorField } from '@modules/27-platform/connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { Connectors } from '@modules/27-platform/connectors/constants'
import { useGitScope } from '@modules/70-pipeline/utils/CIUtils'
import { editViewValidateFieldsConfig, transformValuesFieldsConfig } from './RegisterCatalogStepFunctionConfigs'
import { getFormValuesInCorrectFormat, getInitialValuesInCorrectFormat } from '../utils'
import css from '../IDPSteps.module.scss'

export interface RegisterCatalogStepData {
  name?: string
  identifier: string
  type: string
  spec: {
    connectorRef: string
    repository: string
    organization: string
    filePath: string
    branch: string
  }
}

export interface RegisterCatalogStepEditProps {
  initialValues: RegisterCatalogStepData
  template?: RegisterCatalogStepData
  path?: string
  isNewStep?: boolean
  readonly?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: RegisterCatalogStepData) => void
  onChange?: (data: RegisterCatalogStepData) => void
  allowableTypes: AllowedTypes
  formik?: FormikProps<RegisterCatalogStepData>
}

const RegisterCatalogStepEdit = (
  {
    initialValues,
    onUpdate,
    isNewStep = true,
    readonly,
    stepViewType,
    onChange,
    allowableTypes
  }: RegisterCatalogStepEditProps,
  formikRef: StepFormikFowardRef<RegisterCatalogStepData>
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
    <Formik<RegisterCatalogStepData>
      initialValues={getInitialValuesInCorrectFormat(initialValues, transformValuesFieldsConfig)}
      formName="RegisterCatalogStep"
      validate={valuesToValidate => {
        const schemaValues = getFormValuesInCorrectFormat<RegisterCatalogStepData, RegisterCatalogStepData>(
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
      onSubmit={(_values: RegisterCatalogStepData) => {
        const schemaValues = getFormValuesInCorrectFormat<RegisterCatalogStepData, RegisterCatalogStepData>(
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
              {getString('idp.registerCatalogStep.registerCatalogStepDescription')}
            </Text>

            <Card className={css.repoDetails}>
              <FormMultiTypeConnectorField
                label={getString('platform.connectors.selectConnector')}
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
              <MultiTypeTextField
                name="spec.filePath"
                className={css.publicTemplateUrl}
                label={
                  <Text
                    tooltipProps={{ dataTooltipId: 'filePath' }}
                    className={css.formLabel}
                    margin={{ bottom: 'medium' }}
                  >
                    {getString('common.git.filePath')}
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
            </Card>
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export const RegisterCatalogStepEditWithRef = React.forwardRef(RegisterCatalogStepEdit)
