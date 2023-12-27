/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color, FontVariation } from '@harness/design-system'
import { Accordion, AllowedTypes, FormInput, Formik, FormikForm, SelectOption, Text } from '@harness/uicore'
import cx from 'classnames'
import type { FormikProps } from 'formik'
import React from 'react'
import { useParams } from 'react-router-dom'
import { get } from 'lodash-es'
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
import MultiTypeSecretInput from '@secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'
import { SettingType } from '@modules/10-common/constants/Utils'
import { SettingValueResponseDTO, useGetSettingValue } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import type {
  CosignSlsaVerifyAttestation,
  SlsaDockerSourceSpec,
  SlsaVerificationSource,
  SlsaVerifyAttestation
} from 'services/ci'
import { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { isValueFixed } from '@modules/10-common/utils/utils'
import { AllMultiTypeInputTypesForStep } from '../common/utils'
import {
  editViewValidateFieldsConfig,
  registryConnectedType,
  transformValuesFieldsConfig
} from './SlsaVerificationStepFunctionConfigs'
import css from '../common/SscaStep.module.scss'

const getTypedOptions = <T extends string>(input: T[]): SelectOption[] => {
  return input.map(item => ({ label: item, value: item }))
}

const artifactRegistryOptions = getTypedOptions<string>(Object.keys(registryConnectedType))

type Source =
  | {
      type: SlsaVerificationSource['type']
      spec: SlsaDockerSourceSpec
    }
  | {
      type: 'Gcr'
      spec: {
        connector: string
        host: string
        project_id: string
        image_name: string
        tag: string
      }
    }
export interface SlsaVerificationStepData {
  name?: string
  identifier: string
  type: string
  timeout?: string
  spec: {
    source: Source
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

  const { data: enableBase64Encoding } = useGetSettingValue({
    identifier: SettingType.USE_BASE64_ENCODED_SECRETS_FOR_ATTESTATION,
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier }
  })

  const getBase64EncodingEnabled = (data?: SettingValueResponseDTO): boolean => data?.value === 'true'

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
          editViewValidateFieldsConfig(get(schemaValues, 'spec.source.type')),
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

        const registryType = get(formik.values, 'spec.source.type') as keyof typeof registryConnectedType

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

              <FormInput.Select
                data-testid="registryType"
                items={artifactRegistryOptions}
                name="spec.source.type"
                label={getString('ssca.registryType')}
                placeholder={getString('select')}
                disabled={readonly}
                onChange={() => {
                  if (isValueFixed(get(formik.values, 'spec.source.spec.connector'))) {
                    formik.setFieldValue('spec.source.spec.connector', undefined)
                  }

                  if (registryType === 'Docker') {
                    formik.setFieldValue('spec.source.spec.host', undefined)
                    formik.setFieldValue('spec.source.spec.project_id', undefined)
                    formik.setFieldValue('spec.source.spec.image_name', undefined)
                  } else {
                    formik.setFieldValue('spec.source.spec.image_path', undefined)
                  }
                }}
              />

              <FormMultiTypeConnectorField
                label={getString('pipelineSteps.connectorLabel')}
                type={[registryConnectedType[registryType]]}
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

              {registryType === 'Docker' ? (
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
              ) : (
                <>
                  <MultiTypeTextField
                    name="spec.source.spec.host"
                    label={
                      <Text className={css.formLabel} tooltipProps={{ dataTooltipId: 'gcrHost' }}>
                        {getString('common.hostLabel')}
                      </Text>
                    }
                    multiTextInputProps={{
                      placeholder: getString('pipelineSteps.hostPlaceholder'),
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
                    name="spec.source.spec.project_id"
                    label={
                      <Text className={css.formLabel} tooltipProps={{ dataTooltipId: 'gcrProjectID' }}>
                        {getString('pipelineSteps.projectIDLabel')}
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
                    name="spec.source.spec.image_name"
                    label={
                      <Text className={css.formLabel} tooltipProps={{ dataTooltipId: 'imageName' }}>
                        {getString('imageNameLabel')}
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
                </>
              )}

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
                type={getBase64EncodingEnabled(enableBase64Encoding?.data) ? undefined : 'SecretFile'}
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
