import { flatMap, isArray, isPlainObject, map, concat, keys, get } from 'lodash-es'
import { StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import { PipelineInfoConfig, StageElementConfig } from 'services/pipeline-ng'

// chek if there is difference between "pipeline template" and template inputs in the pipeline
export function comparePipelineTemplateAndPipeline(
  templateInputs: PipelineInfoConfig,
  pipeline: PipelineInfoConfig,
  isUpdated = false
): { hasDifference: boolean } {
  return hasDiffTemplateInputsAndStageOrPipeline(
    templateInputs,
    pipeline,
    'template.templateInputs.',
    'stages[',
    isUpdated
  )
}

// chek if there is difference between "stage template" and template inputs in the pipeline
export function compareStageTemplateAndStage(
  templateInputs: StageElementConfig,
  stage: StageElementWrapper<StageElementConfig>,
  isUpdated = false
): { hasDifference: boolean } {
  return hasDiffTemplateInputsAndStageOrPipeline(
    templateInputs,
    stage,
    'stage.template.templateInputs.',
    'spec.',
    isUpdated
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function hasDiffTemplateInputsAndStageOrPipeline<T extends { [key: string]: any }, M extends { [key: string]: any }>(
  templateInputs: T,
  pipelineOrStage: M,
  removePrefix: string,
  processOnlyPrefix: string,
  isUpdated = false
): { hasDifference: boolean } {
  const templatePaths = getPaths(templateInputs)
  const templatePaths_RuntimeOnly = filterRuntimeInputs(templateInputs, templatePaths)
  const templatePaths_WithoutIndex = templatePaths
  const templatePaths_WithoutIndex_RuntimeOnly = templatePaths_RuntimeOnly

  const pipelinePaths = getPaths(pipelineOrStage).map(path => path.replace(new RegExp(`^${removePrefix}`), ''))
  const pipelinePaths_RuntimeOnly = filterRuntimeInputs(pipelineOrStage, pipelinePaths, removePrefix)
  const pipelinePaths_WithoutIndex = pipelinePaths
  const pipelinePaths_WithoutIndex_RuntimeOnly = pipelinePaths_RuntimeOnly

  let hasDifference = false
  // NOTE: When we change from runtime input to fixed value, property will be deleted. This will cause a difference in pipeline and template.
  // To prevent this, if yaml is changed (isUpdated) we are not checking if there are more fileds in template than in pipeline.
  // This means that in some edge cases algorithm will not work as expected.
  if (!isUpdated) {
    templatePaths_WithoutIndex_RuntimeOnly.forEach((tlPath: string) => {
      if (pipelinePaths_WithoutIndex.indexOf(tlPath) === -1) {
        hasDifference = true
      }
    })
  }

  pipelinePaths_WithoutIndex_RuntimeOnly.forEach((plPath: string) => {
    if (plPath.startsWith(processOnlyPrefix)) {
      if (templatePaths_WithoutIndex.indexOf(plPath) === -1) {
        hasDifference = true
      }
    }
  })

  return { hasDifference }
}

function filterRuntimeInputs(obj: { [key: string]: unknown }, allPaths: string[], prefix?: string): string[] {
  return allPaths.filter(path => {
    return `${get(obj, prefix ? `${prefix}${path}` : path)}`.startsWith('<+input>')
  })
}

function getPaths<T = Array<unknown> | Record<string, unknown>>(obj: T, parentKey = ''): string[] {
  let result: string[]
  if (isArray(obj)) {
    let idx = 0
    result = flatMap(obj, function (inner) {
      return getPaths(inner, `${parentKey}[${idx++}]`)
    })
  } else if (isPlainObject(obj)) {
    result = flatMap(keys(obj), function (key) {
      return map(getPaths((obj as Record<string, unknown>)[key], key), function (subkey) {
        return (parentKey ? `${parentKey}.` : '') + subkey
      })
    })
  } else {
    result = []
  }
  return concat(result, parentKey || [])
}
