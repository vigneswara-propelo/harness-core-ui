/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color, FontVariation } from '@harness/design-system'
import { Accordion, AllowedTypes, FormInput, Formik, FormikForm, Text } from '@harness/uicore'
import cx from 'classnames'
import type { FormikProps } from 'formik'
import React from 'react'
import { useParams } from 'react-router-dom'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import { StepFormikFowardRef, StepViewType, setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import {
  getFormValuesInCorrectFormat,
  getInitialValuesInCorrectFormat
} from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import { validate } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useGitScope } from '@pipeline/utils/CIUtils'
import type { BuildStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { FormMultiTypeConnectorField } from '@platform/connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { Connectors } from '@platform/connectors/constants'
import MultiTypeSecretInput from '@secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'
import { useStrings } from 'framework/strings'
import type {
  CosignSlsaVerifyAttestation,
  SlsaDockerSourceSpec,
  SlsaVerificationSource,
  SlsaVerifyAttestation
} from 'services/ci'
import { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { AllMultiTypeInputTypesForStep } from '../common/utils'
import { editViewValidateFieldsConfig, transformValuesFieldsConfig } from './SlsaVerificationStepFunctionConfigs'
import css from '../common/SscaStep.module.scss'

export interface SlsaVerificationStepData {
  name?: string
  identifier: string
  type: string
  timeout?: string
  spec: {
    source: {
      type: SlsaVerificationSource['type']
      spec: SlsaDockerSourceSpec
    }
    verify_attestation: {
      type: SlsaVerifyAttestation['type']
      spec: CosignSlsaVerifyAttestation
    }
  }
}

export interface SlsaVerificationStepProps {
  initialValues: SlsaVerificationStepData
  template?: SlsaVerificationStepData
  path?: string
  isNewStep?: boolean
  readonly?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: SlsaVerificationStepData) => void
  onChange?: (data: SlsaVerificationStepData) => void
  allowableTypes: AllowedTypes
  formik?: FormikProps<SlsaVerificationStepData>
}

const SlsaVerificationStepEdit = (
  {
    initialValues,
    onUpdate,
    isNewStep = true,
    readonly,
    stepViewType,
    onChange,
    allowableTypes
  }: SlsaVerificationStepProps,
  formikRef: StepFormikFowardRef<SlsaVerificationStepData>
): JSX.Element => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const isExecutionTimeFieldDisabledForStep = isExecutionTimeFieldDisabled(stepViewType)

  const { getStageFromPipeline, state } = usePipelineContext()
  const { stage: currentStage } = getStageFromPipeline<BuildStageElementConfig>(
    state.selectionState.selectedStageId || ''
  )
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  const gitScope = useGitScope()

  return (
    <Formik<SlsaVerificationStepData>
      initialValues={getInitialValuesInCorrectFormat(initialValues, transformValuesFieldsConfig)}
      formName="SlsaVerificationStep"
      validate={valuesToValidate => {
        const schemaValues = getFormValuesInCorrectFormat<SlsaVerificationStepData, SlsaVerificationStepData>(
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
      onSubmit={(_values: SlsaVerificationStepData) => {
        const schemaValues = getFormValuesInCorrectFormat<SlsaVerificationStepData, SlsaVerificationStepData>(
          _values,
          transformValuesFieldsConfig
        )
        onUpdate?.(schemaValues)
      }}
    >
      {formik => {
        // This is required
        setFormikRef?.(formikRef, formik)

        return (
          <FormikForm>
            <div className={css.stepContainer}>
              {stepViewType !== StepViewType.Template && (
                <FormInput.InputWithIdentifier
                  inputName="name"
                  idName="identifier"
                  inputLabel={getString('pipelineSteps.stepNameLabel')}
                  isIdentifierEditable={isNewStep}
                  inputGroupProps={{ disabled: readonly }}
                />
              )}

              <Text font={{ variation: FontVariation.FORM_SUB_SECTION }} color={Color.GREY_900}>
                {getString('ssca.orchestrationStep.artifactSource')}
              </Text>

              <FormMultiTypeConnectorField
                label={getString('pipelineSteps.connectorLabel')}
                type={[Connectors.GCP, Connectors.AWS, Connectors.DOCKER, Connectors.AZURE]}
                name="spec.source.spec.connector"
                placeholder={getString('select')}
                accountIdentifier={accountId}
                projectIdentifier={projectIdentifier}
                orgIdentifier={orgIdentifier}
                multiTypeProps={{
                  expressions,
                  allowableTypes: AllMultiTypeInputTypesForStep,
                  disabled: readonly
                }}
                gitScope={gitScope}
                setRefValue
                configureOptionsProps={{
                  hideExecutionTimeField: isExecutionTimeFieldDisabledForStep
                }}
              />

              <MultiTypeTextField
                name="spec.source.spec.image_path"
                label={
                  <Text className={css.formLabel} tooltipProps={{ dataTooltipId: 'image' }}>
                    {getString('imageLabel')}
                  </Text>
                }
                multiTextInputProps={{
                  disabled: readonly,
                  multiTextInputProps: {
                    expressions,
                    allowableTypes: AllMultiTypeInputTypesForStep
                  }
                }}
                configureOptionsProps={{
                  hideExecutionTimeField: isExecutionTimeFieldDisabledForStep
                }}
              />

              <MultiTypeTextField
                name="spec.source.spec.tag"
                label={
                  <Text className={css.formLabel} tooltipProps={{ dataTooltipId: 'tag' }} margin={{ top: 'small' }}>
                    {getString('tagLabel')}
                  </Text>
                }
                multiTextInputProps={{
                  disabled: readonly,
                  multiTextInputProps: {
                    expressions,
                    allowableTypes: AllMultiTypeInputTypesForStep
                  }
                }}
                configureOptionsProps={{
                  hideExecutionTimeField: isExecutionTimeFieldDisabledForStep
                }}
              />

              <Text
                font={{ variation: FontVariation.FORM_SUB_SECTION }}
                color={Color.GREY_900}
                margin={{ top: 'medium' }}
              >
                {getString('ssca.enforcementStep.verifyAttestation')}
              </Text>

              <MultiTypeSecretInput
                type="SecretFile"
                name="spec.verify_attestation.spec.public_key"
                label={getString('ssca.publicKey')}
                expressions={expressions}
                allowableTypes={allowableTypes}
                enableConfigureOptions
                configureOptionsProps={{
                  isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabledForStep
                }}
                disabled={readonly}
              />

              <Accordion>
                <Accordion.Panel
                  id="optional-config"
                  summary={getString('common.optionalConfig')}
                  details={
                    <div className={cx(css.stepContainer)}>
                      <FormMultiTypeDurationField
                        name="timeout"
                        label={getString('pipelineSteps.timeoutLabel')}
                        multiTypeDurationProps={{ enableConfigureOptions: true, expressions, allowableTypes }}
                        disabled={readonly}
                      />
                    </div>
                  }
                />
              </Accordion>
            </div>
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export const SlsaVerificationStepEditWithRef = React.forwardRef(SlsaVerificationStepEdit)
