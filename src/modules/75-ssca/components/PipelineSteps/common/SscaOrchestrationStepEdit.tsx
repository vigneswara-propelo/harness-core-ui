/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color, FontVariation } from '@harness/design-system'
import {
  Accordion,
  Checkbox,
  Container,
  Formik,
  FormikForm,
  FormInput,
  Icon,
  Layout,
  SelectOption,
  Text
} from '@harness/uicore'
import cx from 'classnames'
import type { FormikProps } from 'formik'
import { get, set } from 'lodash-es'
import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ALLOWED_VALUES_TYPE, ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { ConnectorConfigureOptions } from '@platform/connectors/components/ConnectorConfigureOptions/ConnectorConfigureOptions'
import { FormMultiTypeConnectorField } from '@platform/connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { Connectors } from '@platform/connectors/constants'
import { getIconByType } from '@platform/connectors/pages/connectors/utils/ConnectorUtils'
import { setFormikRef, StepFormikFowardRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import {
  getFormValuesInCorrectFormat,
  getInitialValuesInCorrectFormat
} from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import { validate } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useGitScope } from '@pipeline/utils/CIUtils'
import type { BuildStageElementConfig } from '@pipeline/utils/pipelineTypes'
import MultiTypeSecretInput from '@secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'
import { StringKeys, useStrings } from 'framework/strings'
import type {} from 'services/ci'
import { SbomOrchestrationTool, SbomSource, SyftSbomOrchestration } from 'services/pipeline-ng'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { isValueRuntimeInput } from '@common/utils/utils'
import { useFeatureFlags } from '@modules/10-common/hooks/useFeatureFlag'
import { SettingType } from '@modules/10-common/constants/Utils'
import { SettingValueResponseDTO, useGetSettingValue } from 'services/cd-ng'
import { editViewValidateFieldsConfig, transformValuesFieldsConfig } from './SscaOrchestrationStepFunctionConfigs'
import { SscaCdOrchestrationStepData, SscaOrchestrationStepData, SscaStepProps } from './types'
import { AllMultiTypeInputTypesForStep } from './utils'
import css from './SscaStep.module.scss'

const getTypedOptions = <T extends string>(input: T[]): SelectOption[] => {
  return input.map(item => ({ label: item, value: item }))
}

const SbomStepModes: { label: string; value: string }[] = [
  { label: 'Generation', value: 'generation' },
  { label: 'Ingestion', value: 'ingestion' }
]

export const getSbomDriftModes = (getString: (key: StringKeys) => string): { label: string; value: string }[] => {
  return [
    { label: getString('ssca.orchestrationStep.detectDriftFrom.lastExecution'), value: 'last_generated_sbom' },
    { label: getString('ssca.orchestrationStep.detectDriftFrom.baseline'), value: 'baseline' }
  ]
}

const artifactTypeOptions = getTypedOptions<SbomSource['type']>(['image'])
const sbomGenerationToolOptions = getTypedOptions<SbomOrchestrationTool['type']>(['Syft'])
const syftSbomFormats: { label: string; value: SyftSbomOrchestration['format'] }[] = [
  { label: 'SPDX', value: 'spdx-json' },
  { label: 'CycloneDX', value: 'cyclonedx-json' }
]

const SscaOrchestrationStepEdit = <T extends SscaOrchestrationStepData | SscaCdOrchestrationStepData>(
  {
    initialValues,
    onUpdate,
    isNewStep = true,
    readonly,
    stepViewType,
    onChange,
    allowableTypes,
    stepType
  }: SscaStepProps<T>,
  formikRef: StepFormikFowardRef<T>
): JSX.Element => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { SSCA_SBOM_DRIFT } = useFeatureFlags()

  const [detectSbomDrift, setDetectSbomDrift] = useState(
    isNewStep ? SSCA_SBOM_DRIFT : SSCA_SBOM_DRIFT && !!get(initialValues, 'spec.sbom_drift.base')
  )

  const isExecutionTimeFieldDisabledForStep = isExecutionTimeFieldDisabled(stepViewType)
  const { getStageFromPipeline, state } = usePipelineContext()
  const { stage: currentStage } = getStageFromPipeline<BuildStageElementConfig>(
    state.selectionState.selectedStageId || ''
  )
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const gitScope = useGitScope()

  const _initialValues = getInitialValuesInCorrectFormat<T, T>(
    initialValues,
    transformValuesFieldsConfig(stepType, initialValues)
  )

  if (isNewStep && detectSbomDrift && !get(_initialValues, 'spec.sbom_drift.base')) {
    set(_initialValues, 'spec.sbom_drift.base', 'last_generated_sbom')
  }

  const { data: enableBase64Encoding } = useGetSettingValue({
    identifier: SettingType.USE_BASE64_ENCODED_SECRETS_FOR_ATTESTATION,
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier }
  })

  const getBase64EncodingEnabled = (data?: SettingValueResponseDTO): boolean => data?.value === 'true'

  return (
    <Formik
      initialValues={_initialValues}
      formName={stepType}
      validate={valuesToValidate => {
        const schemaValues = getFormValuesInCorrectFormat<T, T>(
          valuesToValidate,
          transformValuesFieldsConfig(stepType, valuesToValidate)
        )
        onChange?.(schemaValues)
        return validate(
          valuesToValidate,
          editViewValidateFieldsConfig(stepType),
          {
            initialValues,
            steps: currentStage?.stage?.spec?.execution?.steps || {},
            serviceDependencies: currentStage?.stage?.spec?.serviceDependencies || {},
            getString
          },
          stepViewType
        )
      }}
      onSubmit={(_values: T) => {
        const schemaValues = getFormValuesInCorrectFormat<T, T>(_values, transformValuesFieldsConfig(stepType, _values))
        onUpdate?.(schemaValues)
      }}
    >
      {(formik: FormikProps<T>) => {
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

              {stepType !== StepType.CdSscaOrchestration && (
                <>
                  <Text font={{ variation: FontVariation.FORM_SUB_SECTION }} color={Color.GREY_900}>
                    {getString('ssca.orchestrationStep.sbomMethod')}
                  </Text>

                  <FormInput.RadioGroup
                    items={SbomStepModes}
                    name="spec.mode"
                    label={getString('ssca.orchestrationStep.stepMode')}
                    disabled={readonly}
                    radioGroup={{ inline: true }}
                  />
                </>
              )}

              {get(formik.values, 'spec.mode') === 'ingestion' ? (
                <>
                  <Text font={{ variation: FontVariation.FORM_SUB_SECTION }} color={Color.GREY_900}>
                    {getString('ssca.orchestrationStep.sbomIngestion')}
                  </Text>

                  <MultiTypeTextField
                    name="spec.ingestion.file"
                    label={<Text className={css.formLabel}>{getString('ssca.orchestrationStep.ingestion.file')}</Text>}
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
              ) : (
                <>
                  <Text font={{ variation: FontVariation.FORM_SUB_SECTION }} color={Color.GREY_900}>
                    {getString('ssca.orchestrationStep.sbomGeneration')}
                  </Text>

                  <FormInput.Select
                    items={sbomGenerationToolOptions}
                    name="spec.tool.type"
                    label={getString('ssca.orchestrationStep.sbomTool')}
                    placeholder={getString('select')}
                    disabled={readonly}
                  />

                  <FormInput.RadioGroup
                    items={syftSbomFormats}
                    name="spec.tool.spec.format"
                    label={getString('ssca.orchestrationStep.sbomFormat')}
                    disabled={readonly}
                    radioGroup={{ inline: true }}
                  />
                </>
              )}

              <Text
                font={{ variation: FontVariation.FORM_SUB_SECTION }}
                color={Color.GREY_900}
                margin={{ top: 'medium' }}
              >
                {getString('ssca.orchestrationStep.artifactSource')}
              </Text>

              <FormInput.Select
                items={artifactTypeOptions}
                name="spec.source.type"
                label={getString('pipeline.artifactsSelection.artifactType')}
                placeholder={getString('select')}
                disabled={readonly}
              />

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
                name="spec.source.spec.image"
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

              <Text
                font={{ variation: FontVariation.FORM_SUB_SECTION }}
                color={Color.GREY_900}
                margin={{ top: 'medium' }}
              >
                {getString('ssca.orchestrationStep.sbomAttestation')}
              </Text>

              <MultiTypeSecretInput
                type={getBase64EncodingEnabled(enableBase64Encoding?.data) ? undefined : 'SecretFile'}
                name="spec.attestation.spec.privateKey"
                label={getString('platform.connectors.serviceNow.privateKey')}
                expressions={expressions}
                allowableTypes={allowableTypes}
                enableConfigureOptions
                configureOptionsProps={{
                  isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabledForStep
                }}
                disabled={readonly}
              />

              <MultiTypeSecretInput
                name="spec.attestation.spec.password"
                label={getString('password')}
                expressions={expressions}
                allowableTypes={allowableTypes}
                enableConfigureOptions
                configureOptionsProps={{
                  isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabledForStep
                }}
                disabled={readonly}
              />

              {SSCA_SBOM_DRIFT && (
                <>
                  <Text font={{ variation: FontVariation.FORM_SUB_SECTION }} color={Color.GREY_900}>
                    {getString('ssca.orchestrationStep.sbomDrift')}
                  </Text>
                  <Checkbox
                    label={getString('ssca.orchestrationStep.detectSbomDrift')}
                    checked={detectSbomDrift}
                    onChange={e => {
                      const isChecked = e.currentTarget.checked
                      setDetectSbomDrift(isChecked)

                      if (isChecked) {
                        set(formik.values, 'spec.sbom_drift.base', 'last_generated_sbom')
                      } else {
                        set(formik.values, 'spec.sbom_drift', undefined)
                      }
                    }}
                  />
                  {detectSbomDrift && (
                    <Container margin={{ left: 'xlarge' }}>
                      <FormInput.RadioGroup
                        items={getSbomDriftModes(getString)}
                        name="spec.sbom_drift.base"
                        disabled={readonly}
                      />
                    </Container>
                  )}
                </>
              )}

              {stepType === StepType.CdSscaOrchestration && (
                <>
                  <Text
                    font={{ variation: FontVariation.FORM_SUB_SECTION }}
                    color={Color.GREY_900}
                    margin={{ top: 'medium' }}
                  >
                    {getString('infrastructureText')}
                  </Text>

                  <div className={css.formGroup}>
                    <FormMultiTypeConnectorField
                      name="spec.infrastructure.spec.connectorRef"
                      label={getString('connector')}
                      placeholder={getString('common.entityPlaceholderText')}
                      disabled={readonly}
                      accountIdentifier={accountId}
                      multiTypeProps={{ expressions, disabled: readonly, allowableTypes }}
                      projectIdentifier={projectIdentifier}
                      orgIdentifier={orgIdentifier}
                      enableConfigureOptions={false}
                      setRefValue
                      gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
                    />
                    {isValueRuntimeInput(get(formik.values, 'spec.infrastructure.spec.connectorRef')) && !readonly && (
                      <ConnectorConfigureOptions
                        style={{ marginTop: 10 }}
                        value={get(formik.values, 'spec.infrastructure.spec.connectorRef')}
                        type={
                          <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                            <Icon name={getIconByType('K8sCluster')}></Icon>
                            <Text>{getString('pipelineSteps.kubernetesInfraStep.kubernetesConnector')}</Text>
                          </Layout.Horizontal>
                        }
                        variableName="spec.infrastructure.spec.connector"
                        showRequiredField={false}
                        showDefaultField={false}
                        onChange={value => {
                          formik.setFieldValue('spec.infrastructure.spec.connector', value)
                        }}
                        isReadonly={readonly}
                        connectorReferenceFieldProps={{
                          accountIdentifier: accountId,
                          projectIdentifier,
                          orgIdentifier,
                          label: getString('connector'),
                          disabled: readonly,
                          gitScope: { repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true },
                          tooltipProps: {
                            dataTooltipId: 'k8InfraConnector'
                          }
                        }}
                      />
                    )}
                  </div>
                  <div className={css.formGroup}>
                    <FormInput.MultiTextInput
                      name="spec.infrastructure.spec.namespace"
                      style={{ width: '400px' }}
                      disabled={readonly}
                      label={getString('common.namespace')}
                      placeholder={getString('pipeline.infraSpecifications.namespacePlaceholder')}
                      multiTextInputProps={{ expressions, textProps: { disabled: readonly }, allowableTypes }}
                    />
                    {isValueRuntimeInput(get(formik.values, 'spec.infrastructure.spec.namespace')) && !readonly && (
                      <ConfigureOptions
                        value={get(formik.values, 'spec.infrastructure.spec.namespace')}
                        type="String"
                        variableName="spec.infrastructure.spec.namespace"
                        showRequiredField={false}
                        showDefaultField={false}
                        onChange={value => {
                          formik.setFieldValue('spec.infrastructure.spec.namespace', value)
                        }}
                        isReadonly={readonly}
                        allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
                      />
                    )}
                  </div>

                  <Layout.Horizontal spacing="small">
                    <FormInput.MultiTextInput
                      name="spec.infrastructure.spec.resources.limits.memory"
                      label={getString('pipelineSteps.limitMemoryLabel')}
                      multiTextInputProps={{
                        expressions,
                        textProps: { disabled: readonly },
                        allowableTypes
                      }}
                      tooltipProps={{ dataTooltipId: 'setContainerResources' }}
                    />
                    {isValueRuntimeInput(get(formik.values, 'spec.infrastructure.spec.resources.limits.memory')) &&
                      !readonly && (
                        <ConfigureOptions
                          style={{ marginTop: 18 }}
                          value={get(formik.values, 'spec.infrastructure.spec.resources.limits.memory ')}
                          type="String"
                          variableName="spec.infrastructure.spec.resources.limits.memory"
                          showRequiredField={false}
                          showDefaultField={false}
                          onChange={value => {
                            formik.setFieldValue('spec.infrastructure.spec.resources.limits.memory', value)
                          }}
                          isReadonly={readonly}
                          allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
                        />
                      )}

                    <FormInput.MultiTextInput
                      name="spec.infrastructure.spec.resources.limits.cpu"
                      label={getString('pipelineSteps.limitCPULabel')}
                      multiTextInputProps={{
                        expressions,
                        allowableTypes,
                        disabled: readonly
                      }}
                      tooltipProps={{ dataTooltipId: 'setContainerResources' }}
                    />
                    {isValueRuntimeInput(get(formik.values, 'spec.infrastructure.spec.resources.limits.cpu')) &&
                      !readonly && (
                        <ConfigureOptions
                          style={{ marginTop: 18 }}
                          value={get(formik.values, 'spec.infrastructure.spec.resources.limits.cpu')}
                          type="String"
                          variableName="spec.infrastructure.spec.resources.limits.cpu"
                          showRequiredField={false}
                          showDefaultField={false}
                          onChange={value => {
                            formik.setFieldValue('spec.infrastructure.spec.resources.limits.cpu', value)
                          }}
                          isReadonly={readonly}
                          allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
                        />
                      )}
                  </Layout.Horizontal>
                </>
              )}

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
                      {stepType === StepType.SscaOrchestration && (
                        <Layout.Horizontal spacing="small">
                          <FormInput.MultiTextInput
                            name="spec.resources.limits.memory"
                            label={getString('pipelineSteps.limitMemoryLabel')}
                            multiTextInputProps={{
                              expressions,
                              textProps: { disabled: readonly },
                              allowableTypes
                            }}
                            tooltipProps={{ dataTooltipId: 'setContainerResources' }}
                          />
                          {isValueRuntimeInput(get(formik.values, 'spec.resources.limits.memory')) && !readonly && (
                            <ConfigureOptions
                              style={{ marginTop: 18 }}
                              value={get(formik.values, 'spec.resources.limits.memory')}
                              type="String"
                              variableName="spec.resources.limits.memory"
                              showRequiredField={false}
                              showDefaultField={false}
                              onChange={value => {
                                formik.setFieldValue('spec.resources.limits.memory', value)
                              }}
                              isReadonly={readonly}
                              allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
                            />
                          )}
                          <FormInput.MultiTextInput
                            name="spec.resources.limits.cpu"
                            label={getString('pipelineSteps.limitCPULabel')}
                            multiTextInputProps={{
                              expressions,
                              allowableTypes,
                              disabled: readonly
                            }}
                            tooltipProps={{ dataTooltipId: 'setContainerResources' }}
                          />
                          {isValueRuntimeInput(get(formik.values, 'spec.resources.limits.cpu')) && !readonly && (
                            <ConfigureOptions
                              style={{ marginTop: 18 }}
                              value={get(formik.values, 'spec.resources.limits.cpu')}
                              type="String"
                              variableName="spec.resources.limits.cpu"
                              showRequiredField={false}
                              showDefaultField={false}
                              onChange={value => {
                                formik.setFieldValue('spec.resources.limits.cpu', value)
                              }}
                              isReadonly={readonly}
                              allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
                            />
                          )}
                        </Layout.Horizontal>
                      )}
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

export const SscaOrchestrationStepEditWithRef = React.forwardRef(SscaOrchestrationStepEdit)
