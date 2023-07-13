/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { get, isEmpty } from 'lodash-es'

import { RUNTIME_INPUT_VALUE, SelectOption } from '@harness/uicore'

import { DeploymentStageConfig } from 'services/cd-ng'
import { StageElementWrapperConfig } from 'services/pipeline-ng'

import { isValueRuntimeInput } from '@common/utils/utils'

import { StageType } from '@pipeline/utils/stageHelpers'
import { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'

export interface PropagateSelectOption extends SelectOption {
  infraLabel?: string
}

export function getPropagateStageOptions(
  stages: StageElementWrapperConfig[],
  stageIndex: number,
  templateTypes: {
    [key: string]: string
  }
): PropagateSelectOption[] {
  if (stages.length && stageIndex > 0) {
    const getStagesAllowedforPropagate = (stageItem: StageElementWrapperConfig): boolean => {
      if (stageItem.stage?.template) {
        const isAlreadyPropagatingValue = !!(stageItem?.stage?.template?.templateInputs?.spec as DeploymentStageConfig)
          ?.environment?.useFromStage?.stage
        const stageType = get(templateTypes, stageItem.stage.template.templateRef)
        return stageType === StageType.DEPLOY && !isAlreadyPropagatingValue
      } else {
        const isAlreadyPropagatingValue = !!(stageItem?.stage?.spec as DeploymentStageConfig)?.environment?.useFromStage
          ?.stage
        const stageType = stageItem?.stage?.type
        const isSingleEnvEmpty = isEmpty(
          (stageItem.stage as DeploymentStageElementConfig)?.spec?.environment?.environmentRef
        )
        return stageType === StageType.DEPLOY && !isSingleEnvEmpty && !isAlreadyPropagatingValue
      }
    }

    const stageWithEnvV2 = stages.slice(0, stageIndex).filter(getStagesAllowedforPropagate)
    return stageWithEnvV2.map(stageItem => {
      if (stageItem.stage?.template) {
        return {
          label: `Stage [${stageItem.stage?.name}] - Template [${stageItem.stage.template.templateRef}]`,
          value: stageItem.stage?.identifier as string,
          infraLabel: `Stage [${stageItem.stage?.name}] - Template [${stageItem.stage.template.templateRef}]`
        }
      } else {
        const singleEnvironmentRef = (stageItem.stage as DeploymentStageElementConfig)?.spec?.environment
          ?.environmentRef
        const environmentLabel = `Environment [${singleEnvironmentRef}]`

        const singleInfrastructureRef = isValueRuntimeInput(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (stageItem.stage as DeploymentStageElementConfig)?.spec?.environment?.infrastructureDefinitions as any
        )
          ? RUNTIME_INPUT_VALUE
          : (stageItem.stage as DeploymentStageElementConfig)?.spec?.environment?.infrastructureDefinitions?.[0]
              ?.identifier
        const infrastructureLabel = `Infrastructure [${singleInfrastructureRef}]`

        return {
          label: `Stage [${stageItem.stage?.name}] - ${environmentLabel}`,
          value: stageItem.stage?.identifier as string,
          infraLabel: `Stage [${stageItem.stage?.name}] - ${infrastructureLabel}`
        }
      }
    })
  }
  return []
}
