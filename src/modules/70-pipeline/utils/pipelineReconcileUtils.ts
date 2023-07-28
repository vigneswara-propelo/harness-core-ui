import { flatMap, isArray, isPlainObject, map, concat, keys, get } from 'lodash-es'
import { StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import { PipelineInfoConfig, StageElementConfig } from 'services/pipeline-ng'

// exclude some entities to prevents user to get read-only form in some use cases
const PATHS_TO_EXCLUDE = ['spec.service', 'spec.environment']

// check if there is difference between "pipeline template" and template inputs in the pipeline
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

// check if there is difference between "stage template" and template inputs in the pipeline
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

// this function return paths that equal and does not start with path in pathsForCompare
function removeNestedPaths(paths: string[], pathsForCompare: string[]): string[] {
  return paths.filter(path => {
    return !pathsForCompare.some(pathForCompare => {
      return path.startsWith(pathForCompare) && path !== pathForCompare
    })
  })
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

  const pipelinePaths = getPaths(pipelineOrStage).map(path => path.replace(new RegExp(`^${removePrefix}`), ''))
  const pipelinePaths_RuntimeOnly = filterRuntimeInputs(pipelineOrStage, pipelinePaths, removePrefix)
  const pipelinePaths_RuntimeOnly_WithoutNested = removeNestedPaths(
    pipelinePaths_RuntimeOnly,
    templatePaths_RuntimeOnly
  )

  let hasDifference = false
  // NOTE: When we change from runtime input to fixed value, property will be deleted. This will cause a difference in pipeline and template.
  // To prevent this, if yaml is changed (isUpdated) we are not checking if there are more fileds in template than in pipeline.
  // This means that in some edge cases algorithm will not work as expected.
  if (!isUpdated) {
    templatePaths_RuntimeOnly.forEach((tlPath: string) => {
      if (pipelinePaths.indexOf(tlPath) === -1) {
        hasDifference = true
      }
    })
  }

  pipelinePaths_RuntimeOnly_WithoutNested.forEach((plPath: string) => {
    if (plPath.startsWith(processOnlyPrefix)) {
      if (templatePaths.indexOf(plPath) === -1) {
        hasDifference = true
      }
    }
  })

  return { hasDifference }
}

function filterRuntimeInputs(obj: { [key: string]: unknown }, allPaths: string[], prefix?: string): string[] {
  return allPaths.filter(path => {
    const fullPath = prefix ? `${prefix}${path}` : path
    return `${get(obj, fullPath)}`.startsWith('<+input>') && !excludePath(fullPath)
  })
}

function excludePath(path: string): boolean {
  return PATHS_TO_EXCLUDE.some(pathToExclude => {
    if (path.includes(pathToExclude)) {
      return true
    }
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
