/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, {
  MutableRefObject,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  Ref,
  useRef
} from 'react'
import { debounce, defaultTo, get } from 'lodash-es'
import produce from 'immer'
import cx from 'classnames'

import { Container, RUNTIME_INPUT_VALUE } from '@harness/uicore'

import type { DeploymentStageConfig, StageElementConfig } from 'services/cd-ng'

import { Scope } from '@common/interfaces/SecretsInterface'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'

import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { DeployTabs } from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import { useValidationErrors } from '@pipeline/components/PipelineStudio/PiplineHooks/useValidationErrors'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { getFlattenedStages } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'

import ErrorsStripBinded from '@cd/components/PipelineStudio/DeployServiceSpecifications/DeployServiceErrors'
import {
  DeployServiceEntityData,
  getAllFixedServices
} from '@cd/components/PipelineSteps/DeployServiceEntityStep/DeployServiceEntityUtils'
import type { DeployEnvironmentEntityConfig } from '@cd/components/PipelineSteps/DeployEnvironmentEntityStep/types'
import { StageType } from '@pipeline/utils/stageHelpers'

import { isContextTypeTemplateType } from '@pipeline/components/PipelineStudio/PipelineUtils'
import stageCss from '../DeployStageSetupShell/DeployStage.module.scss'

export default function DeployEnvSpecifications(
  props: PropsWithChildren<{ customRef?: Ref<HTMLDivElement> }>
): JSX.Element {
  const domRef = useRef<HTMLDivElement | null>(null)
  const scrollRef = props?.customRef || domRef
  const { submitFormsForTab } = useContext(StageErrorContext)
  const { errorMap } = useValidationErrors()

  const { CDS_PIPELINE_STUDIO_UPGRADES, CDS_SERVICE_OVERRIDES_2_0: isOverridesEnabled } = useFeatureFlags()

  useEffect(() => {
    if (errorMap.size > 0) {
      submitFormsForTab(DeployTabs.ENVIRONMENT)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorMap])

  const {
    state: {
      pipeline,
      selectionState: { selectedStageId }
    },
    scope,
    isReadonly,
    allowableTypes,
    contextType,
    getStageFromPipeline,
    updateStage
  } = usePipelineContext()

  const { stage } = getStageFromPipeline<DeploymentStageElementConfig>(selectedStageId || '')
  const isCustomStage = React.useMemo(() => stage?.stage?.type === StageType.CUSTOM, [stage])
  const { stages } = getFlattenedStages(pipeline)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceUpdateStage = useCallback(
    debounce(
      (changedStage?: StageElementConfig) =>
        changedStage ? updateStage(changedStage) : /* istanbul ignore next */ Promise.resolve(),
      300
    ),
    [updateStage]
  )

  const updateEnvStep = useCallback(
    /* istanbul ignore next */ (value: DeploymentStageConfig) => {
      const stageData = produce(stage, draft => {
        const specObject: DeploymentStageConfig = get(draft, 'stage.spec', {})

        // istanbul ignore else
        if (specObject) {
          // istanbul ignore else
          if (value.environment) {
            if (isCustomStage && !value.environment?.environmentRef) {
              delete specObject.environment
            } else {
              specObject.environment = value.environment
            }
            delete specObject.environments
            delete specObject.environmentGroup
          } else if (value.environments) {
            specObject.environments = value.environments
            delete specObject.environment
            delete specObject.environmentGroup
          } else if (value.environmentGroup) {
            specObject.environmentGroup = value.environmentGroup
            delete specObject.environment
            delete specObject.environments
          }
        }
      })
      debounceUpdateStage(stageData?.stage)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stage, debounceUpdateStage, isCustomStage]
  )

  const initialValues = useMemo(() => {
    const stageSpec = get(stage, 'stage.spec', {})
    // istanbul ignore else
    if (stageSpec) {
      const { environments, environmentGroup, environment } = stageSpec
      // istanbul ignore else
      if (environments) {
        return {
          environments
        }
      } else if (environmentGroup) {
        return {
          environmentGroup
        }
      } else if (environment) {
        return {
          environment
        }
      }
    }
    // Env ref should be initialised as runtime in the following scenarios -
    // 1. When stage type is not custom - since it is optional for custom stage
    // 2. When configuring within Pipeline/Stage template of any scope
    const shouldEnvRefBeInitialisedAsRuntime =
      !isCustomStage && !(scope === Scope.PROJECT && !isContextTypeTemplateType(contextType))

    return {
      environment: {
        environmentRef: shouldEnvRefBeInitialisedAsRuntime ? RUNTIME_INPUT_VALUE : ''
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage?.stage?.spec, isCustomStage])

  const getStageSpec = (): DeployServiceEntityData => {
    const propagatedStageId = stage?.stage?.spec?.service?.useFromStage?.stage
    if (propagatedStageId) {
      const { stage: propagatedStage } = getStageFromPipeline<DeploymentStageElementConfig>(propagatedStageId || '')
      if (propagatedStage) return defaultTo(propagatedStage?.stage?.spec, {})
    }
    return defaultTo(stage?.stage?.spec, {})
  }

  return (
    <div className={stageCss.deployStage} key="1">
      {!CDS_PIPELINE_STUDIO_UPGRADES && (
        <ErrorsStripBinded domRef={scrollRef as MutableRefObject<HTMLElement | undefined>} />
      )}
      <div
        className={cx(stageCss.contentSection, stageCss.paddedSection, {
          [stageCss.paddedSectionNew]: CDS_PIPELINE_STUDIO_UPGRADES
        })}
        ref={scrollRef}
      >
        <StepWidget<DeployEnvironmentEntityConfig>
          type={StepType.DeployEnvironmentEntity}
          readonly={isReadonly}
          initialValues={initialValues}
          allowableTypes={allowableTypes}
          onUpdate={updateEnvStep}
          factory={factory}
          stepViewType={StepViewType.Edit}
          customStepProps={{
            serviceIdentifiers: getAllFixedServices(getStageSpec()),
            stageIdentifier: defaultTo(stage?.stage?.identifier, ''),
            deploymentType: stage?.stage?.spec?.deploymentType,
            gitOpsEnabled: defaultTo(stage?.stage?.spec?.gitOpsEnabled, false),
            customDeploymentRef: stage?.stage?.spec?.customDeploymentRef,
            isOverridesEnabled,
            stages,
            isCustomStage
          }}
        />
        <Container margin={{ top: 'xxlarge' }}>{props.children}</Container>
      </div>
    </div>
  )
}
