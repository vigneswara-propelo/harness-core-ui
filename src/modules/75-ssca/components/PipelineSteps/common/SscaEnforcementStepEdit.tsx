/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color, FontVariation } from '@harness/design-system'
import { Accordion, FormInput, Formik, FormikForm, Icon, Layout, SelectOption, Text } from '@harness/uicore'
import cx from 'classnames'
import type { FormikProps } from 'formik'
import { get, set } from 'lodash-es'
import React from 'react'
import { useParams } from 'react-router-dom'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { ALLOWED_VALUES_TYPE } from '@common/components/ConfigureOptions/constants'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { ConnectorConfigureOptions } from '@platform/connectors/components/ConnectorConfigureOptions/ConnectorConfigureOptions'
import { FormMultiTypeConnectorField } from '@platform/connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { Connectors } from '@platform/connectors/constants'
import { getIconByType } from '@platform/connectors/pages/connectors/utils/ConnectorUtils'
import FileStoreSelectField from '@filestore/components/MultiTypeFileSelect/FileStoreSelect/FileStoreSelectField'
import { StepFormikFowardRef, StepViewType, setFormikRef } from '@pipeline/components/AbstractSteps/Step'
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
import { useStrings } from 'framework/strings'
import type { SbomSource } from 'services/ci'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { isValueRuntimeInput } from '@common/utils/utils'
import MultiTypePolicySetSelector from '@modules/70-pipeline/components/PipelineSteps/Common/PolicySets/MultiTypePolicySetSelector/MultiTypePolicySetSelector'
import { useFeatureFlags } from '@modules/10-common/hooks/useFeatureFlag'
import { editViewValidateFieldsConfig, transformValuesFieldsConfig } from './SscaEnforcementStepFunctionConfigs'
import { SscaCdEnforcementStepData, SscaEnforcementStepData, SscaStepProps } from './types'
import { AllMultiTypeInputTypesForStep, commonDefaultEnforcementSpecValues } from './utils'
import css from './SscaStep.module.scss'

const getTypedOptions = <T extends string>(input: T[]): SelectOption[] => {
  return input.map(item => ({ label: item, value: item }))
}

const artifactTypeOptions = getTypedOptions<SbomSource['type']>(['image'])

const setFormikField = (formik: FormikProps<any>, field: string) => (value: unknown) => {
  formik.setFieldValue(field, value)
}
const SscaEnforcementStepEdit = <T extends SscaEnforcementStepData | SscaCdEnforcementStepData>(
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
  const isExecutionTimeFieldDisabledForStep = isExecutionTimeFieldDisabled(stepViewType)
  const { SSCA_ENFORCEMENT_WITH_BOTH_NATIVE_AND_OPA_POLICIES_ENABLED } = useFeatureFlags()

  const { getStageFromPipeline, state } = usePipelineContext()
  const { stage: currentStage } = getStageFromPipeline<BuildStageElementConfig>(
    state.selectionState.selectedStageId || ''
  )
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const gitScope = useGitScope()

  const _initialValues = getInitialValuesInCorrectFormat<T, T>(initialValues, transformValuesFieldsConfig(stepType))

  // for an existing step set opa true if there isn't a filestore
  if (
    SSCA_ENFORCEMENT_WITH_BOTH_NATIVE_AND_OPA_POLICIES_ENABLED &&
    !get(_initialValues, 'spec.policy.store.spec.file')
  ) {
    set(_initialValues, 'spec.policy.opa', true)
    set(_initialValues, 'spec.policy.store', undefined)
  }

  return (
    <Formik
      initialValues={_initialValues}
      formName={stepType}
      validate={valuesToValidate => {
        const schemaValues = getFormValuesInCorrectFormat<T, T>(valuesToValidate, transformValuesFieldsConfig(stepType))
        onChange?.(schemaValues)
        return validate(
          valuesToValidate,
          editViewValidateFieldsConfig(stepType, !!get(valuesToValidate, 'spec.policy.opa')),
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
        const schemaValues = getFormValuesInCorrectFormat<T, T>(_values, transformValuesFieldsConfig(stepType))
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
                {getString('ssca.enforcementStep.verifyAttestation')}
              </Text>

              <MultiTypeSecretInput
                type="SecretFile"
                name="spec.verifyAttestation.spec.publicKey"
                label={getString('ssca.publicKey')}
                expressions={expressions}
                allowableTypes={allowableTypes}
                enableConfigureOptions
                configureOptionsProps={{
                  isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabledForStep
                }}
                disabled={readonly}
              />

              <Text
                font={{ variation: FontVariation.FORM_SUB_SECTION }}
                color={Color.GREY_900}
                margin={{ top: 'medium' }}
              >
                {getString('ssca.enforcementStep.policyConfiguration')}
              </Text>

              {SSCA_ENFORCEMENT_WITH_BOTH_NATIVE_AND_OPA_POLICIES_ENABLED && (
                <FormInput.Toggle
                  name="spec.policy.opa"
                  label={getString('ssca.useOpaPolicy')}
                  onToggle={enabled => {
                    if (enabled) {
                      set(formik, 'values.spec.policy.store', undefined)
                    } else {
                      set(formik, 'values.spec.policy.policySets', undefined)
                      set(formik, 'values.spec.policy.store', commonDefaultEnforcementSpecValues.policy.store)
                    }
                  }}
                />
              )}

              {get(formik.values, 'spec.policy.opa') ? (
                <MultiTypePolicySetSelector
                  name={'spec.policy.policySets'}
                  label={getString('common.policy.policysets')}
                  disabled={readonly}
                  expressions={expressions}
                />
              ) : (
                <FileStoreSelectField
                  label={getString('common.git.filePath')}
                  name="spec.policy.store.spec.file"
                  onChange={setFormikField(formik, 'spec.policy.store.spec.file')}
                />
              )}

              {stepType === StepType.CdSscaEnforcement && (
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
                        onChange={setFormikField(formik, 'spec.infrastructure.spec.connector')}
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
                        onChange={setFormikField(formik, 'spec.infrastructure.spec.namespace')}
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
                          value={get(formik.values, 'spec.infrastructure.spec.resources.limits.memory')}
                          type="String"
                          variableName="spec.infrastructure.spec.resources.limits.memory"
                          showRequiredField={false}
                          showDefaultField={false}
                          onChange={setFormikField(formik, 'spec.infrastructure.spec.resources.limits.memory')}
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
                          onChange={setFormikField(formik, 'spec.infrastructure.spec.resources.limits.cpu')}
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
                      {stepType === StepType.SscaEnforcement && (
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
                              onChange={setFormikField(formik, 'spec.resources.limits.memory')}
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
                              onChange={setFormikField(formik, 'spec.resources.limits.cpu')}
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

export const SscaEnforcementStepEditWithRef = React.forwardRef(SscaEnforcementStepEdit)
