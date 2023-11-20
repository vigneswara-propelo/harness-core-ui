/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { useFormikContext } from 'formik'
import { defaultTo, get, isEmpty, isNil, omit, pick, set } from 'lodash-es'

import { Container, getMultiTypeFromValue, MultiTypeInputType, SelectOption, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'

import { useStrings } from 'framework/strings'
import type { DeploymentStageConfig, EnvironmentYamlV2, Infrastructure, ServiceSpec } from 'services/cd-ng'

import { isMultiTypeExpression, isValueExpression, isValueFixed, isValueRuntimeInput } from '@common/utils/utils'

import { getStepTypeByDeploymentType, infraDefinitionTypeMapping, StageType } from '@pipeline/utils/stageHelpers'
import {
  getFlattenedStages,
  getStageIndexFromPipeline
} from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'

// eslint-disable-next-line no-restricted-imports
import PropagateFromEnvironment from '@cd/components/PipelineSteps/DeployEnvironmentEntityStep/PropagateWidget/PropagateFromEnvironment'
// eslint-disable-next-line no-restricted-imports
import { setupMode } from '@cd/components/PipelineSteps/PipelineStepsUtil'

import { StepWidget } from '../../AbstractSteps/StepWidget'
import factory from '../../PipelineSteps/PipelineStepFactory'
import { StepType } from '../../PipelineSteps/PipelineStepInterface'
import type { StageInputSetFormProps } from '../StageInputSetForm'
import { getPropagateStageOptions, PropagateSelectOption } from './utils'

import css from '../PipelineInputSetForm.module.scss'

interface SingleEnvironmentInputSetFormProps
  extends Omit<StageInputSetFormProps, 'formik' | 'executionIdentifier' | 'stageType'> {
  stageType?: StageType
}

export default function SingleEnvironmentInputSetForm({
  // This is the resolved pipeline yaml
  deploymentStage,
  // This is the resolved/updated template yaml
  deploymentStageTemplate,
  path,
  readonly,
  viewType,
  stageIdentifier,
  allowableTypes,
  stageType
}: SingleEnvironmentInputSetFormProps): React.ReactElement {
  const {
    state: { pipeline, templateTypes }
  } = usePipelineContext()

  const { index: stageIndex } = getStageIndexFromPipeline(pipeline, stageIdentifier)

  const isCustomStage = stageType && stageType === StageType.CUSTOM

  const { getString } = useStrings()
  const formik = useFormikContext<DeploymentStageConfig>()

  const deploymentType = defaultTo(deploymentStage?.deploymentType, '')
  const environmentTemplate = deploymentStageTemplate?.environment
  const environmentInDeploymentStage = deploymentStage?.environment

  const deploymentStageInputSet: DeploymentStageConfig = get(formik?.values, path, {})
  const environment: EnvironmentYamlV2 = get(deploymentStageInputSet, `environment`, {})

  const originalService = deploymentStage?.service
  const originalMultiServices = deploymentStage?.services
  const serviceInForm = deploymentStageInputSet?.service
  const multiServicesInForm = deploymentStageInputSet?.services

  const singleServiceIdentifier = isValueRuntimeInput(originalService?.serviceRef)
    ? serviceInForm?.serviceRef
    : originalService?.serviceRef

  const multiServiceIdentifiers = isValueRuntimeInput(originalMultiServices?.values as unknown as string)
    ? multiServicesInForm?.values
    : originalMultiServices?.values?.map(serviceObj => serviceObj.serviceRef)

  const [environmentRefType, setEnvironmentRefType] = useState<MultiTypeInputType>(
    getMultiTypeFromValue(environment.environmentRef)
  )

  const useFromStageInputSetValue = get(deploymentStageInputSet, 'environment.useFromStage.stage')
  const [setupModeType, setSetupMode] = useState(
    // Do not add isEmpty check here. This will move to DIFFERENT when propagate is selected and focus moved away
    isNil(useFromStageInputSetValue) ? setupMode.DIFFERENT : setupMode.PROPAGATE
  )

  /** If the template has environmentRef marked as runtime, then we need to give user the option to select environment at runtime.
   * The below StepWidget handles fetching the environments, and then rendering the input field for the same. */
  const showEnvironmentsSelectionInputField =
    isValueRuntimeInput(environmentTemplate?.environmentRef) && setupModeType === setupMode.DIFFERENT

  // This state is required to prevent parallel formik updates with environments and infrastructures
  const [isEnvironmentLoading, setIsEnvironmentLoading] = useState(showEnvironmentsSelectionInputField)

  const environmentIdentifier = showEnvironmentsSelectionInputField
    ? deploymentStageInputSet?.environment?.environmentRef
    : environmentInDeploymentStage?.environmentRef

  const showEnvironmentVariables = Array.isArray(environmentTemplate?.environmentInputs?.variables)
  const showEnvironmentOverrides = !isEmpty(environmentTemplate?.environmentInputs?.overrides)

  const showServiceOverrides =
    !isEmpty(environmentTemplate?.serviceOverrideInputs) &&
    !isValueRuntimeInput(environmentTemplate?.serviceOverrideInputs as unknown as string)

  /** Show the infrastructures selection field in the following scenarios
   * 1. environmentTemplate.infrastructureDefinitions is a runtime value - condition 1
   * 2. When 1 is true and the user selects the infrastructures, we need to still continue to show it - condition 2
   *    a. The check for infrastructureDefinitions in 'deploymentStage' is required to show the field in case of 1 and 2 */
  const showInfrastructuresSelectionInputField = isMultiTypeExpression(environmentRefType)
    ? isValueExpression(environment.environmentRef)
    : isValueRuntimeInput(environmentTemplate?.infrastructureDefinitions as unknown as string) ||
      (Array.isArray(environmentTemplate?.infrastructureDefinitions) &&
        !Array.isArray(environmentInDeploymentStage?.infrastructureDefinitions))

  /** Show the clusters selection field in the following scenarios
   * 1. pathToEnvironments is a runtime value - condition 1
   * 2. When 1 is true and the user selects the environments, we need to still continue to show it - condition 2
   *    a. The check for deployToAll of false in 'deploymentStage' is required to show the field in case of 1 and 2,
   *      as then the values of deployToAll in the above scenarios is either <input> or true, and not false */
  const showClustersSelectionInputField =
    isValueRuntimeInput(environmentTemplate?.gitOpsClusters as unknown as string) ||
    (Array.isArray(environmentTemplate?.gitOpsClusters) &&
      isValueRuntimeInput(environmentInDeploymentStage?.environmentRef))

  /* If infrastructureDefinitions are selected in the pipeline or in the input view, list the inputs under them */
  const showInfrastructuresInputSetForm =
    Array.isArray(environmentTemplate?.infrastructureDefinitions) &&
    environmentTemplate?.infrastructureDefinitions?.some(infraTemplate => !isNil(infraTemplate.inputs))

  const propagateStageOptions: SelectOption[] = useMemo(() => {
    const { stages } = getFlattenedStages(pipeline)
    return getPropagateStageOptions(stages, stageIndex, templateTypes)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageIndex])

  // This is for prefilling the selected value in the field
  const [selectedPropagatedState, setSelectedPropagatedState] = useState<PropagateSelectOption | string>(
    propagateStageOptions?.find(v => v?.value === useFromStageInputSetValue) as SelectOption
  )

  const onPropogatedStageSelect = (value: SelectOption): void => {
    setSelectedPropagatedState(value)
    formik.setFieldValue(`${path}.environment`, { useFromStage: { stage: value.value } })
  }

  const onStageEnvironmentChange = (mode: string): void => {
    if (!readonly) {
      setSetupMode(mode)
      setSelectedPropagatedState('')

      if (mode === setupMode.DIFFERENT) {
        formik.setFieldValue(`${path}.environment`, { environmentRef: '' })
      } else {
        formik.setFieldValue(`${path}.environment`, {
          useFromStage: {
            stage: ''
          }
        })
      }
    }
  }

  const shouldShowPropagateFromStage =
    !isEmpty(propagateStageOptions) &&
    // using deploymentStage as deploymentStageTemplate is not reliable in case of optional fields
    (isValueRuntimeInput(deploymentStage?.environment?.environmentRef) ||
      isValueRuntimeInput(deploymentStage?.environment?.useFromStage as unknown as string))

  const showEnvironmentPrefix =
    environmentIdentifier &&
    !isValueRuntimeInput(environmentIdentifier) &&
    (showEnvironmentVariables ||
      showEnvironmentOverrides ||
      showServiceOverrides ||
      showClustersSelectionInputField ||
      showInfrastructuresSelectionInputField ||
      showInfrastructuresInputSetForm) &&
    setupModeType === setupMode.DIFFERENT

  return (
    <div id={`${path}.Environment`} className={css.accordionSummary}>
      {shouldShowPropagateFromStage && (
        <>
          <Container
            margin={{
              left: 'xxlarge',
              bottom: setupModeType === setupMode.DIFFERENT || !isEmpty(selectedPropagatedState) ? 'large' : 'none'
            }}
          >
            <PropagateFromEnvironment
              setupModeType={setupModeType}
              selectedPropagatedState={selectedPropagatedState}
              propagateStageOptions={propagateStageOptions as SelectOption[]}
              readonly={!!readonly}
              onStageEnvironmentChange={onStageEnvironmentChange}
              onPropogatedStageSelect={onPropogatedStageSelect}
              subscribeToForm={false}
            />
          </Container>
          {get(formik.values, `${path}.environment.useFromStage.stage`) && (
            <Text color={Color.BLACK}>
              {getString('pipeline.infrastructurePropagatedFrom')}{' '}
              {(selectedPropagatedState as PropagateSelectOption)?.infraLabel}
            </Text>
          )}
        </>
      )}

      {showEnvironmentsSelectionInputField && (
        <StepWidget
          factory={factory}
          initialValues={pick(deploymentStageInputSet, 'environment')}
          template={pick(deploymentStageTemplate, 'environment')}
          type={StepType.DeployEnvironmentEntity}
          stepViewType={viewType}
          path={path}
          allowableTypes={allowableTypes}
          readonly={readonly}
          customStepProps={{
            gitOpsEnabled: deploymentStage?.gitOpsEnabled,
            pathToEnvironments: 'environment',
            isMultiEnvironment: false,
            setEnvironmentRefType,
            serviceIdentifiers: isValueFixed(singleServiceIdentifier) ? [singleServiceIdentifier] : []
          }}
          onUpdate={data => {
            formik.setFieldValue(
              `${path}.environment`,
              // only omit 'deployToAll' in case of single infrastructure
              // as 'deployToAll' would be set to false in that case
              omit(
                get(data, 'environment'),
                deploymentStage?.gitOpsEnabled ? ['envIdForValues'] : ['envIdForValues', 'deployToAll']
              )
            )

            setIsEnvironmentLoading(false)
          }}
        />
      )}

      {(deploymentType || isCustomStage) && showEnvironmentPrefix && !isEnvironmentLoading && (
        <React.Fragment key={`${path}_${environment.environmentRef}`}>
          {isValueFixed(environmentIdentifier) && (
            <Text
              font={{ size: 'normal', weight: 'bold' }}
              lineClamp={1}
              margin={{ bottom: 'medium' }}
              color={Color.GREY_700}
            >
              {getString('common.environmentPrefix', { name: environmentIdentifier })}
            </Text>
          )}
          <Container padding={{ left: 'medium' }}>
            {/* If there are runtime environment inputs */}
            {showEnvironmentVariables && (
              <>
                <Text font={{ size: 'normal', weight: 'bold' }} padding={{ bottom: 'medium' }} color={Color.GREY_600}>
                  {getString('environmentVariables')}
                </Text>
                <Container padding={{ left: 'medium' }}>
                  <StepWidget<ServiceSpec>
                    factory={factory}
                    initialValues={get(deploymentStageInputSet, `environment.environmentInputs`, {
                      variables: []
                    })}
                    allowableTypes={allowableTypes}
                    template={get(deploymentStageTemplate, `environment.environmentInputs`, {})}
                    type={getStepTypeByDeploymentType(deploymentType)}
                    stepViewType={viewType}
                    path={`${path}.environment.environmentInputs`}
                    readonly={readonly}
                    customStepProps={{
                      stageIdentifier,
                      allValues: get(environmentInDeploymentStage, `environmentInputs`, {
                        variables: []
                      })
                    }}
                  />
                </Container>
              </>
            )}

            {showEnvironmentOverrides && (
              <>
                <Text font={{ size: 'normal', weight: 'bold' }} padding={{ bottom: 'medium' }} color={Color.GREY_600}>
                  {getString('common.environmentOverrides')}
                </Text>
                <Container padding={{ left: 'medium' }}>
                  <StepWidget<ServiceSpec>
                    factory={factory}
                    initialValues={get(deploymentStageInputSet, `environment.environmentInputs.overrides`, {
                      variables: []
                    })}
                    allowableTypes={allowableTypes}
                    template={get(deploymentStageTemplate, `environment.environmentInputs.overrides`, {})}
                    type={getStepTypeByDeploymentType(deploymentType)}
                    stepViewType={viewType}
                    path={`${path}.environment.environmentInputs.overrides`}
                    readonly={readonly}
                    customStepProps={{
                      stageIdentifier
                    }}
                  />
                </Container>
              </>
            )}

            {showServiceOverrides && (
              <>
                {isValueFixed(singleServiceIdentifier) && (
                  <Text font={{ size: 'normal', weight: 'bold' }} padding={{ bottom: 'medium' }} color={Color.GREY_600}>
                    {getString('common.serviceOverridePrefix', { name: singleServiceIdentifier })}
                  </Text>
                )}
                <Container padding={{ left: 'medium' }}>
                  <StepWidget<ServiceSpec>
                    factory={factory}
                    initialValues={get(deploymentStageInputSet, `environment.serviceOverrideInputs`, {})}
                    allowableTypes={allowableTypes}
                    template={get(deploymentStageTemplate, `environment.serviceOverrideInputs`, {})}
                    type={getStepTypeByDeploymentType(deploymentType)}
                    stepViewType={viewType}
                    path={`${path}.environment.serviceOverrideInputs`}
                    readonly={readonly}
                    customStepProps={{
                      stageIdentifier
                    }}
                  />
                </Container>
              </>
            )}

            {showClustersSelectionInputField && (
              <StepWidget
                factory={factory}
                initialValues={environment}
                template={environmentTemplate}
                type={StepType.DeployClusterEntity}
                stepViewType={viewType}
                path={`${path}.environment`}
                allowableTypes={allowableTypes}
                readonly={readonly}
                customStepProps={{
                  environmentIdentifier,
                  isMultipleCluster: true,
                  deployToAllClusters: environmentInDeploymentStage?.deployToAll,
                  showEnvironmentsSelectionInputField
                }}
                onUpdate={data => {
                  const environmentAtIndex = get(formik.values, `${path}.environment`)

                  formik.setFieldValue(`${path}.environment`, {
                    ...omit(environmentAtIndex, ['deployToAll', 'gitOpsClusters']),
                    ...pick(data, ['deployToAll', 'gitOpsClusters'])
                  })
                }}
              />
            )}

            {showInfrastructuresSelectionInputField && (
              <StepWidget
                factory={factory}
                initialValues={environment}
                template={environmentTemplate}
                type={StepType.DeployInfrastructureEntity}
                stepViewType={viewType}
                path={`${path}.environment`}
                allowableTypes={allowableTypes}
                readonly={readonly}
                customStepProps={{
                  deploymentType,
                  environmentIdentifier,
                  serviceIdentifiers: isEmpty(singleServiceIdentifier)
                    ? [singleServiceIdentifier]
                    : multiServiceIdentifiers,
                  isMultipleInfrastructure: false,
                  customDeploymentRef: deploymentStage?.customDeploymentRef,
                  showEnvironmentsSelectionInputField,
                  lazyInfrastructure:
                    isMultiTypeExpression(environmentRefType) ||
                    isValueExpression(environmentInDeploymentStage?.environmentRef),
                  environmentBranch: environmentInDeploymentStage?.gitBranch
                }}
                onUpdate={data => {
                  const environmentAtIndex = get(formik.values, `${path}.environment`)

                  formik.setFieldValue(`${path}.environment`, {
                    ...omit(environmentAtIndex, ['deployToAll', 'infrastructureDefinitions']),
                    ...pick(data, 'infrastructureDefinitions')
                  })
                }}
              />
            )}

            {showInfrastructuresInputSetForm
              ? environmentTemplate?.infrastructureDefinitions?.map((infrastructureDefinitionTemplate, infraIndex) => {
                  const infraInputs = infrastructureDefinitionTemplate.inputs

                  return infraInputs?.identifier ? (
                    <React.Fragment key={infraInputs.identifier}>
                      <Text
                        font={{ size: 'normal', weight: 'bold' }}
                        padding={{ bottom: 'medium' }}
                        color={Color.GREY_700}
                        lineClamp={1}
                      >
                        {getString('common.infrastructurePrefix', {
                          name: infraInputs.identifier
                        })}
                      </Text>
                      <Container padding={{ left: 'medium' }}>
                        <StepWidget<Infrastructure>
                          key={infraInputs.identifier}
                          factory={factory}
                          template={infraInputs?.spec}
                          initialValues={{
                            ...deploymentStageInputSet?.environment?.infrastructureDefinitions?.[infraIndex]?.inputs
                              ?.spec,
                            environmentRef: environment.environmentRef,
                            infrastructureRef: infraInputs.identifier
                          }}
                          allowableTypes={allowableTypes}
                          allValues={{
                            ...deploymentStage?.environment?.infrastructureDefinitions?.[infraIndex]?.inputs?.spec,
                            environmentRef: deploymentStage?.environment?.environmentRef,
                            infrastructureRef: infraInputs.identifier
                          }}
                          type={
                            (infraDefinitionTypeMapping[infraInputs.type as StepType] || infraInputs?.type) as StepType
                          }
                          path={`${path}.environment.infrastructureDefinitions.${infraIndex}.inputs.spec`}
                          readonly={readonly}
                          stepViewType={viewType}
                          customStepProps={{
                            environmentRef: environment.environmentRef,
                            infrastructureRef: infraInputs.identifier,
                            provisioner: deploymentStage?.environment?.provisioner?.steps || undefined
                          }}
                          onUpdate={data => {
                            /* istanbul ignore next */
                            if (
                              get(
                                deploymentStageInputSet,
                                `environment.infrastructureDefinitions.[${infraIndex}].inputs.spec`
                              )
                            ) {
                              set(
                                deploymentStageInputSet,
                                `environment.infrastructureDefinitions.[${infraIndex}].inputs.spec`,
                                data
                              )
                              formik?.setValues(
                                set(formik?.values, `${path}.environment`, get(deploymentStageInputSet, 'environment'))
                              )
                            }
                          }}
                        />
                      </Container>
                    </React.Fragment>
                  ) : null
                })
              : null}
          </Container>
        </React.Fragment>
      )}
    </div>
  )
}
