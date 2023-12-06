/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { Container, RUNTIME_INPUT_VALUE, SelectOption } from '@harness/uicore'
import produce from 'immer'
import { defaultTo, get, isEmpty, isEqual, isNil, pick, set, unset } from 'lodash-es'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { ServicesYaml, ServiceYamlV2, StageElementConfig, TemplateLinkConfig } from 'services/cd-ng'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import {
  getFlattenedStages,
  getStageIndexFromPipeline
} from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import DeployServiceErrors from '@cd/components/PipelineStudio/DeployServiceSpecifications/DeployServiceErrors'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { useValidationErrors } from '@pipeline/components/PipelineStudio/PiplineHooks/useValidationErrors'
import { DeployTabs } from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import type { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { Scope } from '@common/interfaces/SecretsInterface'
import { getTemplatePromise, TemplateResponse } from 'services/template-ng'
import { getGitQueryParamsWithParentScope } from '@common/utils/gitSyncUtils'
import { getIdentifierFromValue, getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { setupMode } from '@cd/components/PipelineSteps/PipelineStepsUtil'
import type { StageElementWrapperConfig } from 'services/pipeline-ng'
import { parse } from '@common/utils/YamlHelperMethods'
import type {
  DeployServiceEntityCustomProps,
  DeployServiceEntityData
} from '@cd/components/PipelineSteps/DeployServiceEntityStep/DeployServiceEntityUtils'
import { useStrings } from 'framework/strings'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { isContextTypeTemplateType } from '@pipeline/components/PipelineStudio/PipelineUtils'
import PropagateFromServiceV2 from './PropagateWidget/PropagateFromServiceV2'
import stageCss from '../DeployStageSetupShell/DeployStage.module.scss'

export interface DeployServiceEntitySpecificationsProps {
  setDefaultServiceSchema: () => Promise<void>
  children: React.ReactNode
  customRef?: React.Ref<HTMLDivElement>
}

type DeployServiceWidgetInitValues = {
  service?: ServiceYamlV2
  services?: ServicesYaml
}

type TemplateStageIdVsServiceConfigMap = {
  [key: string]: DeployServiceWidgetInitValues
}

export default function DeployServiceEntitySpecifications({
  setDefaultServiceSchema,
  customRef,
  children
}: DeployServiceEntitySpecificationsProps): JSX.Element {
  const {
    state: {
      pipeline,
      templateTypes,
      templateServiceData,
      selectionState: { selectedStageId },
      storeMetadata,
      gitDetails
    },
    allowableTypes,
    isReadonly,
    scope,
    contextType,
    getStageFromPipeline,
    updateStage
  } = usePipelineContext()
  const domRef = React.useRef<HTMLDivElement | null>(null)
  const scrollRef = customRef || domRef
  const { getString } = useStrings()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateStageCallback = useCallback(
    (changedStage?: StageElementConfig) =>
      changedStage ? updateStage(changedStage) : /* istanbul ignore next */ Promise.resolve(),

    [updateStage]
  )
  const { stages } = getFlattenedStages(pipeline)
  const { stage } = getStageFromPipeline<DeploymentStageElementConfig>(selectedStageId || '')
  const { index: stageIndex } = getStageIndexFromPipeline(pipeline, selectedStageId || '')
  const { submitFormsForTab } = useContext(StageErrorContext)
  const { errorMap } = useValidationErrors()
  const params = useParams<ProjectPathProps>()

  const useFromStageValue = stage?.stage?.spec?.service?.useFromStage || stage?.stage?.spec?.services?.useFromStage

  const [setupModeType, setSetupMode] = useState(isEmpty(useFromStageValue) ? setupMode.DIFFERENT : setupMode.PROPAGATE)

  const [deployServiceWidgetInitValues, setDeployServiceWidgetInitValues] =
    React.useState<DeployServiceWidgetInitValues>(
      setupModeType === setupMode.DIFFERENT
        ? {
            ...pick(stage?.stage?.spec, ['service', 'services']),
            ...(!(scope === Scope.PROJECT && !isContextTypeTemplateType(contextType)) &&
              isEmpty(get(stage, 'stage.spec.service.serviceRef')) &&
              isEmpty(get(stage, 'stage.spec.services.values')) && {
                service: { serviceRef: RUNTIME_INPUT_VALUE }
              })
          }
        : {}
    )

  const [templateStageIdVsServiceConfigMap, setTemplateStageIdVsServiceConfigMap] =
    React.useState<TemplateStageIdVsServiceConfigMap>({})

  const getStagesAllowedforPropogate = (stageItem: StageElementWrapperConfig): boolean => {
    const currentStageType = stage?.stage?.type
    const currentStageDeploymentType = stage?.stage?.spec?.deploymentType
    if (stageItem?.stage?.template) {
      const templateRef = stageItem.stage.template.templateRef
      const stageType = get(templateTypes, templateRef)
      const deploymentType = get(templateServiceData, templateRef)
      return !isEmpty(templateRef) && currentStageType === stageType && deploymentType === currentStageDeploymentType
    } else {
      // Propagate from is support for both Single and Multi Service Stages
      const isSingleSvcEmpty = isEmpty((stageItem.stage as DeploymentStageElementConfig)?.spec?.service?.serviceRef)
      const isMultiSvcEmpty = isEmpty((stageItem.stage as DeploymentStageElementConfig)?.spec?.services?.values)

      const prevStageItemDeploymentType = (stageItem.stage as DeploymentStageElementConfig)?.spec?.deploymentType
      const prevStageItemCustomDeploymentConfig = (stageItem.stage as DeploymentStageElementConfig)?.spec
        ?.customDeploymentRef
      const currentStageCustomDeploymentConfig = stage?.stage?.spec?.customDeploymentRef

      const areDeploymentDetailsSame =
        currentStageDeploymentType === ServiceDeploymentType.CustomDeployment
          ? prevStageItemDeploymentType === currentStageDeploymentType &&
            isEqual(prevStageItemCustomDeploymentConfig, currentStageCustomDeploymentConfig)
          : prevStageItemDeploymentType === currentStageDeploymentType

      const isStageTypeSame = currentStageType === stageItem?.stage?.type

      // Criteria for stages to be allowed for propagation:
      // 1. Service (Single/Multiple) should be non-empty
      // 2. Stage type should be same (example - Both Should be deploy stages)
      // 3. Deployment details such as deployment type or custom deployment config should be same

      return (!isSingleSvcEmpty || !isMultiSvcEmpty) && isStageTypeSame && areDeploymentDetailsSame
    }
  }

  const listOfStagesCurrentStageCanBePropagatedFrom = React.useMemo(
    () => stages.slice(0, stageIndex).filter(getStagesAllowedforPropogate),
    [stages, stageIndex, stage]
  )

  const getPropagatedFromStage = (stageIdentifier: string) => {
    return listOfStagesCurrentStageCanBePropagatedFrom?.find(
      eachStage => eachStage?.stage?.identifier === stageIdentifier
    )
  }

  const previousStageList = useMemo(() => {
    if (stages.length && stageIndex > 0) {
      //stage allowed for use from stage should have service V2 services and the deployment type, stage type should be same as current stage
      return listOfStagesCurrentStageCanBePropagatedFrom.map(stageItem => {
        if (stageItem.stage?.template) {
          return {
            label: `Stage [${stageItem.stage?.name}] - Template [${stageItem.stage.template.templateRef}]`,
            value: stageItem.stage?.identifier || ''
          }
        } else if (!get(stageItem.stage, `spec.serviceConfig.useFromStage`)) {
          const singleServiceRef = (stageItem.stage as DeploymentStageElementConfig)?.spec?.service?.serviceRef
          const multiServiceConfigurationPresent = !isEmpty(
            (stageItem.stage as DeploymentStageElementConfig)?.spec?.services?.values
          )
          const serviceLabelVal =
            isEmpty(singleServiceRef) && multiServiceConfigurationPresent
              ? getString('multipleService')
              : `Service [${singleServiceRef}]`
          return {
            label: `Stage [${stageItem.stage?.name}] - ${serviceLabelVal}`,
            value: stageItem.stage?.identifier
          }
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageIndex, listOfStagesCurrentStageCanBePropagatedFrom])

  const [selectedPropagatedState, setSelectedPropagatedState] = useState<SelectOption | string>(
    previousStageList?.find(v => v?.value === useFromStageValue?.stage) as SelectOption
  )

  useEffect(() => {
    // No need to set default service schema when service propagation
    if (
      typeof stage !== 'undefined' &&
      isEmpty(get(stage, 'stage.spec.service.useFromStage')) &&
      isEmpty(get(stage, 'stage.spec.services.useFromStage'))
    ) {
      setDefaultServiceSchema()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (errorMap.size > 0) {
      submitFormsForTab(DeployTabs.SERVICE)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorMap])

  const updateService = useCallback(
    async (value: DeployServiceEntityData) => {
      const stageData = produce(stage, draft => {
        if (draft) {
          if (!isNil(value.service)) {
            set(draft, 'stage.spec.service', value.service)
            unset(draft, 'stage.spec.services')
          } else if (!isNil(value.services)) {
            set(draft, 'stage.spec.services', value.services)
            unset(draft, 'stage.spec.service')
          }
        }
      })
      await updateStageCallback(stageData?.stage)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stage]
  )

  useEffect(() => {
    if (setupModeType === setupMode.PROPAGATE) {
      if (!previousStageList?.find(item => item === selectedPropagatedState)) {
        onStageServiceChange(setupMode.DIFFERENT)
      }
    }
  }, [stageIndex])

  const { CDS_PIPELINE_STUDIO_UPGRADES } = useFeatureFlags()

  const getInitValuesFromServiceConfiguration = (singleOrMultiServiceConfiguration: DeployServiceWidgetInitValues) => {
    const updatedSingleOrMultiServiceConfiguration = produce(singleOrMultiServiceConfiguration, draft => {
      if (!isEmpty(singleOrMultiServiceConfiguration?.services)) {
        // Metadata -> parallel field should not be propagated
        const currentStageMetadataValue = get(stage?.stage?.spec, 'services.metadata')
        set(draft, 'services.metadata', currentStageMetadataValue)
      }
    })

    return {
      ...updatedSingleOrMultiServiceConfiguration,
      ...(!(scope === Scope.PROJECT && !isContextTypeTemplateType(contextType)) &&
        isEmpty(useFromStageValue) && {
          service: { serviceRef: RUNTIME_INPUT_VALUE }
        })
    }
  }

  const getQueryParamsForTemplateFetch = (templateDetails: TemplateLinkConfig) => {
    const { templateRef, versionLabel } = templateDetails || {}
    const templateScope = getScopeFromValue(defaultTo(templateRef, ''))

    return {
      accountIdentifier: params.accountId,
      projectIdentifier: templateScope === Scope.PROJECT ? params.projectIdentifier : undefined,
      orgIdentifier: templateScope === Scope.PROJECT || templateScope === Scope.ORG ? params.orgIdentifier : undefined,
      versionLabel: versionLabel,
      ...getGitQueryParamsWithParentScope({
        storeMetadata,
        params: {
          accountId: defaultTo(params.accountId, ''),
          orgIdentifier: defaultTo(params.orgIdentifier, ''),
          projectIdentifier: defaultTo(params.projectIdentifier, '')
        },
        repoIdentifier: gitDetails.repoIdentifier,
        branch: defaultTo(templateDetails?.gitBranch, gitDetails.branch),
        sendParentEntityDetails: !templateDetails?.gitBranch
      })
    }
  }

  useEffect(() => {
    if (useFromStageValue?.stage) {
      const propogatedFromStage = getPropagatedFromStage(useFromStageValue?.stage as string)
      // Current stage propagates from a stage template (needs to be resolved)
      if (!isEmpty(propogatedFromStage?.stage?.template)) {
        const templateDetails = propogatedFromStage?.stage?.template || {}
        const { templateRef } = templateDetails as TemplateLinkConfig
        const singleOrMultiServiceConfigurationFromCache = get(
          templateStageIdVsServiceConfigMap,
          useFromStageValue?.stage
        ) as DeployServiceWidgetInitValues

        if (isEmpty(singleOrMultiServiceConfigurationFromCache)) {
          getTemplatePromise({
            templateIdentifier: getIdentifierFromValue(templateRef || ''),
            queryParams: getQueryParamsForTemplateFetch(templateDetails as TemplateLinkConfig),
            requestOptions: { headers: { 'Load-From-Cache': 'true' } }
          }).then(templateResponse => {
            const parsedTemplate = get(
              parse(defaultTo((templateResponse?.data as TemplateResponse)?.yaml, '')),
              'template'
            )
            const singleOrMultiServiceConfiguration = pick(parsedTemplate?.spec?.spec, [
              'service',
              'services'
            ]) as DeployServiceWidgetInitValues

            const updatedStageIdVsServiceConfigMap = produce(templateStageIdVsServiceConfigMap, draft => {
              set(draft, useFromStageValue.stage, singleOrMultiServiceConfiguration)
            })

            setTemplateStageIdVsServiceConfigMap(updatedStageIdVsServiceConfigMap)
            setDeployServiceWidgetInitValues(getInitValuesFromServiceConfiguration(singleOrMultiServiceConfiguration))
          })
        } else {
          setDeployServiceWidgetInitValues(
            getInitValuesFromServiceConfiguration(singleOrMultiServiceConfigurationFromCache)
          )
        }
      } else {
        const singleOrMultiServiceConfiguration = pick(propogatedFromStage?.stage?.spec, [
          'service',
          'services'
        ]) as DeployServiceWidgetInitValues
        setDeployServiceWidgetInitValues(getInitValuesFromServiceConfiguration(singleOrMultiServiceConfiguration))
      }
    } else {
      // This handles the resetting behaviour when setup stage option has been changed to Different or propagate
      setDeployServiceWidgetInitValues({
        ...pick(stage?.stage?.spec, ['service', 'services']),
        ...(!(scope === Scope.PROJECT && !isContextTypeTemplateType(contextType)) &&
          isEmpty(get(stage, 'stage.spec.service.serviceRef')) &&
          isEmpty(get(stage, 'stage.spec.services.values')) && {
            service: { serviceRef: RUNTIME_INPUT_VALUE }
          })
      })
    }
  }, [setupModeType, useFromStageValue, stage, scope, contextType, templateStageIdVsServiceConfigMap])

  const onPropogatedStageSelect = (value: SelectOption): void => {
    const propogatedFromStage = getPropagatedFromStage(value.value as string)
    setSelectedPropagatedState(value)

    if (!isEmpty(propogatedFromStage?.stage?.template)) {
      const templateDetails = propogatedFromStage?.stage?.template || {}
      const { templateRef } = templateDetails as TemplateLinkConfig
      const singleOrMultiServiceConfigurationFromCache = get(
        templateStageIdVsServiceConfigMap,
        value.value as string
      ) as DeployServiceWidgetInitValues

      if (isEmpty(singleOrMultiServiceConfigurationFromCache)) {
        getTemplatePromise({
          templateIdentifier: getIdentifierFromValue(templateRef || ''),
          queryParams: getQueryParamsForTemplateFetch(templateDetails as TemplateLinkConfig),
          requestOptions: { headers: { 'Load-From-Cache': 'true' } }
        }).then(templateResponse => {
          const parsedTemplate = get(
            parse(defaultTo((templateResponse?.data as TemplateResponse)?.yaml, '')),
            'template'
          )
          const singleOrMultiServiceConfiguration = pick(parsedTemplate?.spec?.spec, [
            'service',
            'services'
          ]) as DeployServiceWidgetInitValues

          const updatedStageIdVsServiceConfigMap = produce(templateStageIdVsServiceConfigMap, draft => {
            set(draft, value.value, singleOrMultiServiceConfiguration)
          })

          setTemplateStageIdVsServiceConfigMap(updatedStageIdVsServiceConfigMap)
          const isMultiSvcTemplate = !isEmpty(singleOrMultiServiceConfiguration?.services)

          const stageData = produce(stage, draft => {
            if (draft) {
              if (isMultiSvcTemplate) {
                // Parent stage has multi service configuration
                unset(draft, 'stage.spec.service')
                set(draft, 'stage.spec.services', {
                  useFromStage: { stage: value.value },
                  metadata: { parallel: true }
                })
              } else {
                unset(draft, 'stage.spec.services')
                set(draft, 'stage.spec.service', { useFromStage: { stage: value.value } })
              }
            }
          })
          updateStageCallback(stageData?.stage)
        })
      } else {
        const isMultiSvcTemplate = !isEmpty(singleOrMultiServiceConfigurationFromCache?.services)
        const stageData = produce(stage, draft => {
          if (draft) {
            if (isMultiSvcTemplate) {
              // Parent stage has multi service configuration
              unset(draft, 'stage.spec.service')
              set(draft, 'stage.spec.services', { useFromStage: { stage: value.value }, metadata: { parallel: true } })
            } else {
              unset(draft, 'stage.spec.services')
              set(draft, 'stage.spec.service', { useFromStage: { stage: value.value } })
            }
          }
        })
        updateStageCallback(stageData?.stage)
      }
    } else {
      // Parent stage is non template, no need to resolve
      const stageData = produce(stage, draft => {
        if (draft) {
          if (!isEmpty((propogatedFromStage?.stage as DeploymentStageElementConfig)?.spec?.services?.values)) {
            // Parent stage has multi service configuration
            unset(draft, 'stage.spec.service')
            set(draft, 'stage.spec.services', { useFromStage: { stage: value.value }, metadata: { parallel: true } })
          } else {
            unset(draft, 'stage.spec.services')
            set(draft, 'stage.spec.service', { useFromStage: { stage: value.value } })
          }
        }
      })
      updateStageCallback(stageData?.stage)
    }
  }

  const onStageServiceChange = useCallback(
    (mode: string): void => {
      if (!isReadonly) {
        setSetupMode(mode)
        setSelectedPropagatedState('')
        const stageData = produce(stage, draft => {
          if (draft) {
            if (mode === setupMode.DIFFERENT) {
              unset(draft, 'stage.spec.services')
              set(draft, 'stage.spec.service', { serviceRef: '' })
            } else if (mode === setupMode.PROPAGATE) {
              unset(draft, 'stage.spec.service')
              unset(draft, 'stage.spec.services')
            }
          }
        })
        updateStage(stageData?.stage as StageElementConfig)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return (
    <div className={stageCss.deployStage} ref={scrollRef}>
      {!CDS_PIPELINE_STUDIO_UPGRADES && (
        <DeployServiceErrors domRef={scrollRef as React.MutableRefObject<HTMLElement | undefined>} />
      )}
      <div
        className={cx(stageCss.contentSection, stageCss.paddedSection, {
          [stageCss.paddedSectionNew]: CDS_PIPELINE_STUDIO_UPGRADES
        })}
      >
        {!!previousStageList?.length && (
          <Container margin={{ bottom: 'xlarge', left: 'xlarge' }}>
            <PropagateFromServiceV2
              setupModeType={setupModeType}
              selectedPropagatedState={selectedPropagatedState}
              previousStageList={previousStageList as SelectOption[]}
              isReadonly={isReadonly}
              onStageServiceChange={onStageServiceChange}
              onPropogatedStageSelect={onPropogatedStageSelect}
            />
          </Container>
        )}
        <StepWidget<DeployServiceEntityData, DeployServiceEntityCustomProps>
          type={StepType.DeployServiceEntity}
          readonly={isReadonly || setupModeType === setupMode.PROPAGATE}
          initialValues={deployServiceWidgetInitValues}
          allowableTypes={allowableTypes}
          onUpdate={updateService}
          factory={factory}
          stepViewType={StepViewType.Edit}
          customStepProps={{
            stageIdentifier: defaultTo(stage?.stage?.identifier, ''),
            deploymentType: stage?.stage?.spec?.deploymentType,
            gitOpsEnabled: defaultTo(stage?.stage?.spec?.gitOpsEnabled, false),
            deploymentMetadata: stage?.stage?.spec?.deploymentMetadata,
            setupModeType
          }}
        />
        <Container margin={{ top: 'xxlarge' }}>{children}</Container>
      </div>
    </div>
  )
}
