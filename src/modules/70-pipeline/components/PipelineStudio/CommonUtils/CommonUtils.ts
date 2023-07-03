/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo, flatMap, get, isEmpty } from 'lodash-es'
import type { MultiSelectOption, SelectOption } from '@harness/uicore'
import type {
  ExecutionElementConfig,
  PipelineInfoConfig,
  StageElementWrapperConfig,
  StepGroupElementConfig,
  TemplateStepNode
} from 'services/pipeline-ng'
import type { ExecutionWrapperConfig, StepElementConfig } from 'services/cd-ng'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { EmptyStageName } from '../PipelineConstants'
import type { SelectedStageData, StageSelectionData } from '../../../utils/runPipelineUtils'

export interface StageSelectOption extends SelectOption {
  node: any
  type: string
}

export function getStagesMultiSelectOptionFromPipeline(pipeline: PipelineInfoConfig): MultiSelectOption[] {
  return getStagesFromPipeline(pipeline).map(node => ({
    label: defaultTo(node.stage?.name, ''),
    value: defaultTo(node.stage?.identifier, '')
  }))
}

export function getSelectStageOptionsFromPipeline(pipeline: PipelineInfoConfig): StageSelectOption[] {
  return getStagesFromPipeline(pipeline).map(node => ({
    label: defaultTo(node.stage?.name, ''),
    value: defaultTo(node.stage?.identifier, ''),
    node: node,
    type: defaultTo(node.stage?.type, '')
  }))
}

export function getStagesFromPipeline(pipeline: PipelineInfoConfig): StageElementWrapperConfig[] {
  const stages: StageElementWrapperConfig[] = []
  if (pipeline.stages) {
    pipeline.stages.forEach((node: StageElementWrapperConfig) => {
      if (node.stage && node.stage.name !== EmptyStageName) {
        stages.push(node)
      } else if (node.parallel) {
        node.parallel.forEach((parallelNode: StageElementWrapperConfig) => {
          if (parallelNode.stage && parallelNode.stage.name !== EmptyStageName) {
            stages.push(parallelNode)
          }
        })
      }
    })
  }
  return stages
}

export function getSelectedStagesFromPipeline(
  pipeline?: PipelineInfoConfig,
  selectedStageData?: StageSelectionData
): StageElementWrapperConfig[] {
  return selectedStageData?.selectedStages?.map((selectedStage: SelectedStageData) =>
    pipeline?.stages?.find(
      stage =>
        stage?.stage?.identifier === selectedStage.stageIdentifier ||
        stage?.parallel?.some(parallelStage => parallelStage.stage?.identifier === selectedStage.stageIdentifier)
    )
  ) as StageElementWrapperConfig[]
}

export const getFlattenedSteps = (allSteps?: ExecutionWrapperConfig[]): StepElementConfig[] => {
  let allFlattenedSteps = []
  allFlattenedSteps = flatMap(allSteps, (currStep: ExecutionWrapperConfig) => {
    const steps: StepElementConfig[] = []
    if (currStep.parallel) {
      steps.push(...getFlattenedSteps(currStep.parallel))
    } else if (currStep.stepGroup) {
      steps.push(...getFlattenedSteps(currStep.stepGroup.steps))
    } else if (currStep.step) {
      steps.push(currStep.step)
    }
    return steps
  })
  return allFlattenedSteps
}

export const updateStepWithinStage = (
  execution: ExecutionElementConfig | StepGroupElementConfig,
  processingNodeIdentifier: string,
  processedNode: StepElementConfig | TemplateStepNode,
  isRollback: boolean
): void => {
  // Finds the step in the stage, and updates with the processed node
  const executionSteps = get(execution, isRollback ? 'rollbackSteps' : 'steps') as ExecutionWrapperConfig[]
  executionSteps?.forEach((stepWithinStage: ExecutionWrapperConfig) => {
    if (stepWithinStage.stepGroup) {
      // If stage has a step group, loop over the step group steps and update the matching identifier with node
      if (stepWithinStage.stepGroup?.identifier === processingNodeIdentifier) {
        stepWithinStage.stepGroup = processedNode as any
      } else {
        // For current Step Group, go through all steps and find out if all steps are of Command type
        // If yes, and new step is also of Command type then add repeat looping strategy to Step Group
        const allSteps = stepWithinStage.stepGroup.steps
        const allFlattenedSteps = getFlattenedSteps(allSteps)
        if (!isEmpty(allFlattenedSteps)) {
          const commandSteps = allFlattenedSteps.filter(
            (currStep: StepElementConfig) => currStep.type === StepType.Command
          )
          if (
            (commandSteps.length === allFlattenedSteps.length &&
              (processedNode as StepElementConfig)?.type === StepType.Command &&
              !isEmpty(stepWithinStage.stepGroup.strategy) &&
              !stepWithinStage.stepGroup.strategy?.repeat) ||
            (commandSteps.length === allFlattenedSteps.length &&
              (processedNode as StepElementConfig)?.type === StepType.Command &&
              isEmpty(stepWithinStage.stepGroup.strategy))
          ) {
            stepWithinStage.stepGroup['strategy'] = {
              repeat: {
                items: '<+stage.output.hosts>' as any, // used any because BE needs string variable while they can not change type
                maxConcurrency: 1,
                start: 0,
                end: 1,
                unit: 'Count'
              }
            }
          }
        }
        updateStepWithinStage(stepWithinStage.stepGroup, processingNodeIdentifier, processedNode, false)
      }
    } else if (stepWithinStage.parallel) {
      // If stage has a parallel steps, loop over and update the matching identifier with node
      stepWithinStage.parallel.forEach(parallelStep => {
        if (parallelStep?.stepGroup?.identifier === processingNodeIdentifier) {
          parallelStep.stepGroup = processedNode as any
        } else if (parallelStep.step?.identifier === processingNodeIdentifier) {
          parallelStep.step = processedNode as any
        } else if (parallelStep?.stepGroup) {
          updateStepWithinStage(parallelStep?.stepGroup, processingNodeIdentifier, processedNode, false)
        }
      })
    } else if (stepWithinStage.step?.identifier === processingNodeIdentifier) {
      // Else simply find the matching step ad update the node
      stepWithinStage.step = processedNode as any
    }
  })
}
