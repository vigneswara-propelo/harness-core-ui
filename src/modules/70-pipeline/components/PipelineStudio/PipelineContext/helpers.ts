/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import stableStringify from 'fast-json-stable-stringify'
import { filter, isEmpty } from 'lodash-es'
import type { PipelineStageWrapper } from '@pipeline/utils/pipelineTypes'
import type { PipelineInfoConfig, StageElementConfig, StageElementWrapperConfig } from 'services/pipeline-ng'
import { ExecutionWrapperConfig } from 'services/cd-ng'

export function getStageFromPipeline<T extends StageElementConfig = StageElementConfig>(
  stageId: string,
  localPipeline: PipelineInfoConfig
): PipelineStageWrapper<T> {
  let stage: StageElementWrapperConfig | undefined = undefined
  let parent: StageElementWrapperConfig | undefined = undefined
  const stages = localPipeline?.template
    ? (localPipeline.template.templateInputs as PipelineInfoConfig)?.stages
    : localPipeline?.stages
  if (stages) {
    stages.some?.(item => {
      if (item?.stage && item.stage.identifier === stageId) {
        stage = item
        return true
      } else if (item?.parallel) {
        stage = getStageFromPipeline(stageId, { stages: item.parallel } as unknown as PipelineInfoConfig).stage
        if (stage) {
          parent = item
          return true
        }
      }
    })
  }
  return { stage, parent }
}

export function getStagePathFromPipeline(stageId: string, prefix: string, pipeline: PipelineInfoConfig): string {
  if (Array.isArray(pipeline.stages)) {
    for (let i = 0; i < pipeline.stages.length; i++) {
      const item = pipeline.stages[i]

      if (item?.stage?.identifier === stageId) {
        return `${prefix}.${i}`
      }

      if (item.parallel) {
        const parallelIndex = item.parallel.findIndex(parallelStage => parallelStage.stage?.identifier === stageId)
        if (parallelIndex !== -1) {
          return `${prefix}.${i}.parallel.${parallelIndex}`
        }
      }

      if (item.stage) {
        const stagePath = getStagePathFromPipeline(stageId, `${prefix}.${i}`, item.stage)
        if (stagePath !== `${prefix}.${i}`) {
          return stagePath
        }
      }
    }
  }

  return prefix
}

export function comparePipelines(
  pipeline1: PipelineInfoConfig | undefined,
  pipeline2: PipelineInfoConfig | undefined
): boolean {
  return stableStringify(pipeline1) !== stableStringify(pipeline2)
}

export type SampleJSON = {
  steps: ExecutionWrapperConfig[]
  rollbackSteps?: ExecutionWrapperConfig[]
}

interface DotNotationObject {
  dotNotation: string
  relativePath: string
}

function generatePaths(
  config: ExecutionWrapperConfig[],
  baseDotNotation = 'steps',
  baseRelativePath = 'steps'
): DotNotationObject[] {
  // Filter out null and undefined elements from the array
  const filteredConfig = filter(config, Boolean)
  if (isEmpty(filteredConfig)) {
    return []
  }

  const paths: DotNotationObject[] = []

  config.forEach((item, index) => {
    const dotNotation = `${baseDotNotation}.${index}`

    if (item.step) {
      paths.push({
        dotNotation: `${dotNotation}.step.${item.step.identifier}`,
        relativePath: `${baseRelativePath}.step.${item.step.identifier}`
      })
    } else if (item.stepGroup) {
      const relativePath = `${baseRelativePath}.stepGroup.${item.stepGroup.identifier}`
      paths.push({
        dotNotation: `${dotNotation}.stepGroup.${item.stepGroup.identifier}`,
        relativePath
      })

      const nestedPaths = generatePaths(
        item.stepGroup.steps || [],
        `${dotNotation}.stepGroup.steps`,
        `${relativePath}.steps`
      )
      paths.push(...nestedPaths)
    } else if (item.parallel) {
      const nestedPaths = generatePaths(item.parallel, `${dotNotation}.parallel`, `${baseRelativePath}`)
      paths.push(...nestedPaths)
    }
  })

  return paths
}

export function generateCombinedPaths(json: SampleJSON): DotNotationObject[] {
  const paths: DotNotationObject[] = []

  if (json?.steps) {
    const stepPaths = generatePaths(json.steps)
    paths.push(...stepPaths)
  }

  if (json?.rollbackSteps) {
    const rollbackPaths = generatePaths(json.rollbackSteps, 'rollbackSteps', 'rollbackSteps')
    paths.push(...rollbackPaths)
  }

  return paths
}

export function findDotNotationByRelativePath(
  dotNotationObjects: DotNotationObject[],
  relativePath: string,
  fullPath?: string
): string {
  const foundItem = dotNotationObjects.find(
    item => item.relativePath === relativePath && (!fullPath || item.dotNotation === fullPath)
  )

  return foundItem ? foundItem.dotNotation : ''
}
