/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { v4 as nameSpace, v5 as uuid, version } from 'uuid'
import { get, isNil, isObject, set } from 'lodash-es'
import type { IconName } from '@harness/uicore'
import type {
  ExecutionElementConfig,
  ExecutionWrapperConfig,
  ParallelStepElementConfig,
  StepElementConfig,
  StepGroupElementConfig
} from 'services/cd-ng'
import type { DependencyElement } from 'services/ci'
import { StepType as PipelineStepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StageType } from '@pipeline/utils/stageHelpers'
import { DiagramType } from '@pipeline/components/PipelineDiagram/Constants'
import {
  NodeWrapperEntity,
  getBaseDotNotationWithoutEntityIdentifier
} from '@pipeline/components/PipelineDiagram/Nodes/utils'
import { SampleJSON, findDotNotationByRelativePath, generateCombinedPaths } from '../PipelineContext/helpers'

export interface DependenciesWrapper {
  [key: string]: any
}

export type ExecutionWrapper = {
  [key: string]: any
}
export interface ExecutionGraphState {
  isRollback: boolean
  states: StepStateMap
  stepsData: ExecutionElementConfig
  dependenciesData: DependencyElement[]
}

export const generateRandomString = (name: string): string => uuid(name, nameSpace())

export const isCustomGeneratedString = (name: string): boolean => {
  try {
    return version(name) === 5
  } catch (_e) {
    return false
  }
}

export enum StepType {
  STEP = 'STEP',
  STEP_GROUP = 'STEP_GROUP',
  SERVICE = 'SERVICE',
  SERVICE_GROUP = 'SERVICE_GROUP'
}
export interface StepState {
  stepType: StepType
  isRollback?: boolean
  isStepGroupRollback?: boolean
  isStepGroupCollapsed?: boolean
  isStepGroup?: boolean
  isSaved: boolean
  inheritedSG?: number
}

export const getDefaultStepGroupState = (): StepState => ({
  isSaved: false,
  isStepGroupCollapsed: false,
  isStepGroupRollback: false,
  isStepGroup: true,
  isRollback: false,
  stepType: StepType.STEP_GROUP
})

export const getDefaultStepState = (): StepState => ({ isSaved: false, isStepGroup: false, stepType: StepType.STEP })

export const getDefaultDependencyServiceState = (): StepState => ({
  isSaved: false,
  isStepGroup: false,
  stepType: StepType.SERVICE
})

export interface GetStepFromNodeProps {
  stepData: ExecutionWrapper | undefined
  node?: any
  isComplete: boolean
  isFindParallelNode: boolean
  nodeId?: string
  parentId?: string
  isRollback?: boolean
}

interface RemoveStepOrGroupProps {
  state: ExecutionGraphState
  entity: any
  skipFlatten?: boolean
  isRollback?: boolean
  nodeDotNotationPath?: string
}

export type StepStateMap = Map<string, StepState>

export const getDependencyFromNode = (
  servicesData: DependencyElement[] | undefined,
  node: any
): { node: DependencyElement | undefined; parent: DependencyElement[] | undefined } => {
  const _service = servicesData?.find((service: DependenciesWrapper) => node.getIdentifier() === service.identifier)
  return { node: _service, parent: servicesData }
}

export const getDependencyFromNodeV1 = (
  servicesData: DependencyElement[] | undefined,
  nodeId: string
): { node: DependencyElement | undefined; parent: DependencyElement[] | undefined } => {
  const _service = servicesData?.find((service: DependenciesWrapper) => nodeId === service.identifier)
  return { node: _service, parent: servicesData }
}

export function getNodeAndParent(
  stepData: ExecutionWrapper | undefined,
  dotNotation: string,
  isComplete = false
): { node: ExecutionWrapper | undefined; parent: ExecutionWrapper[] } {
  const node = get(stepData, dotNotation)
  let parent = []

  const dotNotationWithEntityTypeRemoved = getBaseDotNotationWithoutEntityIdentifier(dotNotation)

  const path = dotNotationWithEntityTypeRemoved.split('.')
  const lastIndex = path.length - 1

  for (let i = lastIndex; i >= 0; i--) {
    const currentPath = path.slice(0, i).join('.') || dotNotationWithEntityTypeRemoved // for base level if splice returns "", use dotNotationWithEntityTypeRemoved ( for steps or rollbackSteps)
    const currentObject = get(stepData, currentPath) as ExecutionWrapperConfig

    if (currentObject) {
      if (isComplete) {
        parent = currentObject?.parallel || (currentObject as any)?.steps || currentObject
        break
      }
      if (Array.isArray(currentObject)) {
        parent = currentObject
        break
      } else if (isObject(currentObject)) {
        if (currentObject?.parallel || currentObject?.stepGroup) {
          parent = currentObject as any
          break
        }
      }
    }
  }

  return { node, parent: parent || [] }
}

export function getNodeAndParentForDestinationDrop(
  stepData: ExecutionWrapper,
  dotNotation: string,
  isRollback = false
): {
  node: ExecutionWrapper | undefined
  parent: ExecutionWrapper[]
} {
  // Split the path into an array of parts
  const paths = dotNotation.split('.')

  let stepsPathIndex = paths.lastIndexOf('steps')
  if (isRollback) {
    // For rollback steps, it could be nested stepGroup steps or base path is rollbackSteps instead of steps
    if (stepsPathIndex === -1) {
      stepsPathIndex = paths.lastIndexOf('rollbackSteps')
    }
  }
  // While dropping destination nodePath would be till last steps.{index} path
  const nodePaths = paths.slice(0, stepsPathIndex + 2).join('.')
  // While dropping destination parent would be till last steps path
  const parentPaths = paths.slice(0, stepsPathIndex + 1).join('.')

  const node = get(stepData, nodePaths)
  const parent = get(stepData, parentPaths, [])

  return { node, parent }
}

// Used for only stepSuffix
/** @deprecated use getNodeAndParent() */
export const getStepFromId = (
  stageData: ExecutionWrapper | undefined,
  id: string,
  isComplete = false,
  isFindParallelNode = false,
  isRollback?: boolean
): {
  node: ExecutionWrapper | undefined
  parent: ExecutionWrapper[]
  parallelParent?: ExecutionWrapper
  parallelParentIdx?: number
  parallelParentParent?: ExecutionWrapper[]
} => {
  return getStepFromIdInternal(
    (stageData as ExecutionElementConfig)?.[isRollback ? 'rollbackSteps' : 'steps'],
    id,
    isComplete,
    isFindParallelNode,
    Boolean(isRollback)
  )
}

/** @deprecated use getNodeAndParent() */
const getStepFromIdInternal = (
  stepData: ExecutionWrapperConfig[] | undefined,
  id: string,
  isComplete = false,
  isFindParallelNode = false,
  isRollback = false
): {
  node: ExecutionWrapper | undefined
  parent: ExecutionWrapper[]
} => {
  let stepResp: ExecutionWrapper | StepElementConfig | ParallelStepElementConfig | StepGroupElementConfig | undefined =
    undefined
  let parent: ExecutionWrapper[] = []
  stepData?.every((node, _idx) => {
    if (node.step && node.step.identifier === id) {
      if (isComplete) {
        stepResp = node
      } else {
        stepResp = node.step
      }
      parent = stepData
      return false
    } else if (node.parallel) {
      if (isFindParallelNode) {
        node.parallel?.every(nodeP => {
          if (nodeP.step && nodeP.step.identifier === id) {
            if (isComplete) {
              stepResp = node
            } else {
              stepResp = node.parallel
            }
            parent = stepData
            return false
          } else if (nodeP.stepGroup) {
            if (nodeP.stepGroup?.identifier === id) {
              if (isComplete) {
                stepResp = node
              } else {
                stepResp = node.parallel
              }
              parent = stepData
              return false
            } else {
              const response = getStepFromId(nodeP.stepGroup, id, isComplete, isFindParallelNode, isRollback)
              if (response.node) {
                parent = response.parent
                stepResp = response.node
                return false
              }
            }
          }
          return true
        })
        if (stepResp) {
          return false
        }
      } else {
        const response = getStepFromIdInternal(node.parallel, id, isComplete, false, isRollback)
        if (response.node) {
          stepResp = response.node
          parent = response.parent
          return false
        }
      }
    } else if (node.stepGroup) {
      if (node.stepGroup?.identifier === id) {
        if (isComplete) {
          stepResp = node
        } else {
          stepResp = node.stepGroup
        }
        parent = stepData
        return false
      } else {
        const response = getStepFromId(node.stepGroup, id, isComplete, isFindParallelNode)
        if (response.node) {
          parent = response.parent
          stepResp = response.node
          return false
        }
      }
    }
    return true
  })
  return {
    parent,
    node: stepResp
  }
}

// identifier for Dependencies/Services group that is always present
export const STATIC_SERVICE_GROUP_NAME = 'static_service_group'

export const getDependenciesState = (services: DependenciesWrapper[], mapState: StepStateMap): void => {
  // we have one service group
  mapState.set(STATIC_SERVICE_GROUP_NAME, {
    isSaved: false,
    isStepGroupCollapsed: false,
    isStepGroupRollback: false,
    isStepGroup: true,
    isRollback: false,
    stepType: StepType.SERVICE_GROUP
  })

  services.forEach((service: DependenciesWrapper) => {
    mapState.set(service.identifier, getDefaultDependencyServiceState())
  })
}

export const applyExistingStates = (newMap: Map<string, StepState>, existingMap: Map<string, StepState>): void => {
  newMap.forEach((_value, identifier) => {
    const existingState = existingMap.get(identifier)
    if (existingState) {
      //NOTE: reset isSaved
      newMap.set(identifier, { ...existingState, isSaved: false })
    }
  })
}

export const updateDependenciesState = (services: DependenciesWrapper[], mapState: StepStateMap): void => {
  // we have one service group
  const serviceGroupData = mapState.get(STATIC_SERVICE_GROUP_NAME)
  if (serviceGroupData) {
    mapState.set(STATIC_SERVICE_GROUP_NAME, {
      ...serviceGroupData,
      isSaved: true
    })
  }
  services.forEach((service: DependenciesWrapper) => {
    const serviceData = mapState.get(service.identifier)
    if (serviceData) {
      mapState.set(service.identifier, { ...serviceData, isSaved: true })
    }
  })
}

export function isExecutionWrapperConfig(node?: ExecutionWrapper): node is ExecutionWrapperConfig {
  return !!(
    (node as ExecutionWrapperConfig)?.step ||
    (node as ExecutionWrapperConfig)?.parallel ||
    (node as ExecutionWrapperConfig)?.stepGroup
  )
}

export function isExecutionElementConfig(node?: ExecutionWrapper): node is ExecutionElementConfig {
  return !!((node as ExecutionElementConfig)?.steps || (node as ExecutionElementConfig)?.rollbackSteps)
}

export const getStepsState = (node: ExecutionWrapper, mapState: StepStateMap): void => {
  if (isExecutionWrapperConfig(node) && node.step) {
    mapState.set(node.step.identifier, getDefaultStepState())
  } else if (isExecutionElementConfig(node) && node.steps) {
    node.steps.forEach(step => {
      getStepsState(step, mapState)
    })
    if (node.rollbackSteps) {
      node.rollbackSteps.forEach(step => {
        getStepsState(step, mapState)
      })
    }
  } else if (isExecutionElementConfig(node) && node.rollbackSteps) {
    node.rollbackSteps.forEach(step => {
      getStepsState(step, mapState)
    })
  } else if (isExecutionWrapperConfig(node) && node.parallel) {
    node.parallel.forEach(step => {
      getStepsState(step, mapState)
    })
  } else if (isExecutionWrapperConfig(node) && node.stepGroup) {
    node.stepGroup.steps?.forEach?.(step => {
      getStepsState(step, mapState)
    })

    mapState.set(node.stepGroup.identifier, mapState.get(node.stepGroup.identifier) || getDefaultStepGroupState())
  }
}

export const updateStepsState = (
  node: ExecutionWrapperConfig | ExecutionElementConfig,
  mapState: StepStateMap
): void => {
  if (isExecutionWrapperConfig(node) && node.step && mapState.get(node.step.identifier)) {
    const data = mapState.get(node.step.identifier)
    if (data) {
      mapState.set(node.step.identifier, { ...data, isSaved: true })
    }
  } else if (isExecutionElementConfig(node) && node.steps) {
    node.steps.forEach(step => {
      updateStepsState(step, mapState)
    })
    if (node.rollbackSteps) {
      node.rollbackSteps.forEach(step => {
        updateStepsState(step, mapState)
      })
    }
  } else if (isExecutionElementConfig(node) && node.rollbackSteps) {
    node.rollbackSteps.forEach(step => {
      updateStepsState(step, mapState)
    })
  } else if (isExecutionWrapperConfig(node) && node.parallel) {
    node.parallel.forEach(step => {
      updateStepsState(step, mapState)
    })
  } else if (isExecutionWrapperConfig(node) && node.stepGroup) {
    node.stepGroup.steps?.forEach?.(step => {
      updateStepsState(step, mapState)
    })
    const groupData = mapState.get(node.stepGroup.identifier)
    if (groupData) {
      mapState.set(node.stepGroup.identifier, { ...groupData, isSaved: true })
    }
  }
}

export function removeEntityByDotNotation(
  modifiedJSON: ExecutionWrapper,
  dotNotation: string
): { data: ExecutionWrapper; isRemoved: boolean } {
  const keys = dotNotation.split('.')
  const nodePath = keys.slice(0, -1)
  const parentNodePath = nodePath.slice(0, -1)
  const lastKey = keys[keys.length - 1]

  const currentNode = get(modifiedJSON, nodePath)
  if (!currentNode) {
    // Invalid node path, return the original JSON
    return {
      isRemoved: false,
      data: modifiedJSON
    }
  }

  if (Array.isArray(currentNode)) {
    const index = Number(lastKey) // Convert lastKey to a number
    currentNode.splice(index, 1) // Remove the specified index
    const parentNode = get(modifiedJSON, parentNodePath)
    if (currentNode.length === 1 && parentNode && parentNode.parallel && Array.isArray(parentNode.parallel)) {
      // If the parallel array contains only one element and it has a parallel property,
      // replace parallel with its contents
      const parallelContents = currentNode[0]
      set(modifiedJSON, parentNodePath, parallelContents)
    }
  } else if (typeof currentNode === 'object') {
    delete currentNode[lastKey]
  }

  return {
    isRemoved: true,
    data: modifiedJSON
  }
}

export function getClosestParentStepGroupPath(dotNotation: string): string {
  const steps = dotNotation.split('.')
  let parentPath = ''

  for (let i = 0; i < steps.length; i++) {
    if (steps[i] === NodeWrapperEntity.stepGroup) {
      parentPath = steps.slice(0, i + 1).join('.')
    }
  }

  return parentPath
}

export function getClosestParallelPath(dotNotation: string): string {
  const steps = dotNotation.split('.')
  let parentPath = ''

  for (let i = 0; i < steps.length; i++) {
    if (steps[i] === 'parallel') {
      parentPath = steps.slice(0, i + 1).join('.')
    }
  }

  return parentPath
}

export const removeStepOrGroupViaPath = ({ state, entity }: RemoveStepOrGroupProps): boolean => {
  // 1. services
  const servicesData = state.dependenciesData
  if (servicesData) {
    let idx
    servicesData.forEach((service, _idx) => {
      if (service.identifier === entity?.node?.identifier) {
        idx = _idx
      }
    })
    if (idx !== undefined) {
      servicesData.splice(idx, 1)
      return true
    }
  }

  // 2. steps
  // const isRemoved = false
  const data: ExecutionWrapper = state.stepsData
  const nodeDotNotationPath = entity?.node?.data?.nodeStateMetadata?.dotNotationPath
  const stepNodePath = getBaseDotNotationWithoutEntityIdentifier(getStepsPathWithoutStagePath(nodeDotNotationPath))
  const nodePathWithoutEntity = getBaseDotNotationWithoutEntityIdentifier(stepNodePath)
  const { isRemoved: isRemovedSuccessful } = removeEntityByDotNotation(data, nodePathWithoutEntity)

  return isRemovedSuccessful
}

export const addService = (data: DependencyElement[], service: DependencyElement): void => {
  data.push(service)
}

export const addStepOrGroup = (
  entity: any,
  data: ExecutionWrapper,
  step: ExecutionWrapperConfig,
  isParallel: boolean,
  isRollback: boolean,
  isDropped?: boolean
): void => {
  // Drop node works only for Link and CreateNew - Drop on node has inline logic
  // Drop node recalculate paths and relativePath due to json changed
  const dotNotationObjects = generateCombinedPaths(data as SampleJSON)

  if (entity?.entityType === DiagramType.Link) {
    const sourceNode = entity?.isRightAddIcon ? entity?.node : entity?.node?.prevNode
    const targetNode = entity?.isRightAddIcon ? entity?.node?.nextNode : entity?.node
    let response
    const nodeDotNotationPath1 = sourceNode?.data?.nodeStateMetadata?.dotNotationPath

    // Drop node recalculate paths and relativePath due to json changed

    const dropNodePath =
      findDotNotationByRelativePath(
        dotNotationObjects,
        getStepsPathWithoutStagePath(sourceNode?.data?.nodeStateMetadata?.relativeBasePath),
        getStepsPathWithoutStagePath(nodeDotNotationPath1)
      ) ||
      findDotNotationByRelativePath(
        dotNotationObjects,
        getStepsPathWithoutStagePath(sourceNode?.data?.nodeStateMetadata?.relativeBasePath)
      )

    const stepNodePath1 = isDropped
      ? getBaseDotNotationWithoutEntityIdentifier(dropNodePath)
      : getBaseDotNotationWithoutEntityIdentifier(getStepsPathWithoutStagePath(nodeDotNotationPath1))

    if (sourceNode?.children?.length) {
      response = getNodeAndParentForDestinationDrop(data, stepNodePath1, isRollback)
    } else {
      response = getNodeAndParent(data, getBaseDotNotationWithoutEntityIdentifier(stepNodePath1), true)
    }

    let next = 1
    if (!response.node) {
      const nodeDotNotationPath = targetNode?.data?.nodeStateMetadata?.dotNotationPath

      // Drop case
      const targetPath = findDotNotationByRelativePath(
        dotNotationObjects,
        getStepsPathWithoutStagePath(targetNode?.data?.nodeStateMetadata?.relativeBasePath),
        getStepsPathWithoutStagePath(nodeDotNotationPath)
      )

      const stepNodePath = isDropped
        ? getBaseDotNotationWithoutEntityIdentifier(targetPath)
        : getBaseDotNotationWithoutEntityIdentifier(getStepsPathWithoutStagePath(nodeDotNotationPath))

      if (targetNode?.children?.length) {
        //isFindParallelNode case
        response = getNodeAndParentForDestinationDrop(data, stepNodePath, isRollback)
      } else {
        response = getNodeAndParent(data, getBaseDotNotationWithoutEntityIdentifier(stepNodePath), true)
      }

      next = 0
    }
    if (response.node) {
      const index = response.parent.indexOf(response.node)
      if (index > -1) {
        response.parent.splice(index + next, 0, step)
      }
    }
  } else if (entity?.entityType === DiagramType.CreateNew) {
    // Steps if you are under step group
    const nodeDotNotationPath =
      entity?.data?.nodeStateMetadata?.dotNotationPath ||
      entity?.data?.destination?.baseFqn ||
      entity?.data?.node?.baseFqn || // stepGroup on extreme left case
      entity?.data?.node?.data?.nodeStateMetadata?.dotNotationPath // for stepGroup empty state

    const relativePath = entity?.data?.destination?.relativeBasePath
    const dropNodePath = findDotNotationByRelativePath(dotNotationObjects, getStepsPathWithoutStagePath(relativePath))

    const stepNodePath = isDropped ? dropNodePath : getStepsPathWithoutStagePath(nodeDotNotationPath)
    let node = getNodeAndParent(data, getBaseDotNotationWithoutEntityIdentifier(stepNodePath), false).node

    if (node?.stepGroup) {
      // dropping in empty stepGroup
      node = node.stepGroup
    }

    if (entity?.node?.parentIdentifier) {
      if (isExecutionElementConfig(node) && node?.steps) {
        node.steps.push(step)
      } else if (isExecutionElementConfig(node) && node) {
        if (isNil(node.rollbackSteps)) {
          node.rollbackSteps = []
        }
        node.rollbackSteps.push(step)
      }
    } else {
      if (isRollback) {
        if (isExecutionElementConfig(data)) {
          data.rollbackSteps?.push?.(step)
        }
      } else {
        if (isExecutionElementConfig(data)) {
          data.steps.push(step)
        }
      }
    }
  } else if (entity?.entityType === DiagramType.Default) {
    if (isParallel) {
      const nodeDotNotationPath = entity?.node?.data?.nodeStateMetadata?.dotNotationPath
      const stepNodePath = getBaseDotNotationWithoutEntityIdentifier(getStepsPathWithoutStagePath(nodeDotNotationPath))
      const response = getNodeAndParentForDestinationDrop(data, stepNodePath, isRollback)
      if (response.node) {
        if (response.node.parallel && response.node.parallel.length > 0) {
          response.node.parallel.push(step)
        } else {
          const index = response.parent.indexOf(response.node)
          if (index > -1) {
            response.parent.splice(index, 1, { parallel: [response.node, step] })
          }
        }
      }
    } else {
      if (isRollback) {
        ;(data as ExecutionElementConfig).rollbackSteps?.push?.(step)
      } else {
        ;(data as ExecutionElementConfig).steps.push(step)
      }
    }
  } else if (entity?.entityType === DiagramType.StepGroupNode) {
    if (isParallel) {
      const nodeDotNotationPath = entity?.node?.data?.nodeStateMetadata?.dotNotationPath
      const stepNodePath = getBaseDotNotationWithoutEntityIdentifier(getStepsPathWithoutStagePath(nodeDotNotationPath))
      const response = getNodeAndParentForDestinationDrop(data, stepNodePath, isRollback)

      if (response.node) {
        if (response.node.parallel && response.node.parallel.length > 0) {
          response.node.parallel.push(step)
        } else {
          const index = response.parent.indexOf(response.node)
          if (index > -1) {
            response.parent.splice(index, 1, { parallel: [response.node, step] })
          }
        }
      }
    }
  }
}

export const StepTypeToPipelineIconMap: Record<string, IconName> = {
  [PipelineStepType.SHELLSCRIPT]: 'command-shell-script',
  [PipelineStepType.K8sRollingRollback]: 'undo',
  [PipelineStepType.K8sRollingDeploy]: 'rolling',
  [PipelineStepType.JiraApproval]: 'jira-approve',
  [PipelineStepType.HarnessApproval]: 'harness-with-color',
  [PipelineStepType.JiraCreate]: 'jira-create',
  [PipelineStepType.JiraUpdate]: 'jira-update',
  [PipelineStepType.Barrier]: 'barrier-open',
  [PipelineStepType.CustomApproval]: 'custom-approval',
  [PipelineStepType.FetchInstanceScript]: 'rolling'
}

export const isServiceDependenciesSupported = (stageType: string): boolean => {
  if (stageType === StageType.BUILD || stageType === StageType.SECURITY) {
    return true
  }
  return false
}

/**
 * Get the parent path for YAML data structure based on whether it belongs to the provisioner or execution steps.
 *
 * @param {boolean} isProvisioner - A boolean flag to indicate if the path belongs to the dynamic provisioner steps.
 * @returns {string} The parent path for the specified type of steps.
 */
export const getParentPath = (isProvisioner?: boolean): string => {
  if (isProvisioner) {
    return 'stage.spec.environment.provisioner'
  }
  return 'stage.spec.execution'
}

/**
 *
 * @param {string} path - The input path to extract the node path from "steps" or "rollbackSteps".
 * @returns {string} The node path from "steps" or "rollbackSteps" under "execution" or "provisioners".
 *
 * @example
 * // Returns "steps.1.step.0.stepGroup.steps.3.steps.7.step"
 * const path = "stage.execution.steps.1.step.0.stepGroup.steps.3.steps.7.step";
 */
export const getStepsPathWithoutStagePath = (path = ''): string => {
  const isProvisioner = path?.includes('.provisioner.')

  if (isProvisioner) {
    return path.replace(/.*?(\.provisioner\.)/, '')
  } else {
    return path.replace(/.*?(\.execution\.)/, '')
  }
}

/**
 * Converts a string containing square brackets with numeric indices into dot notation.
 * @param {string} path - The input string containing square brackets with numeric indices.
 * @returns {string} The input string converted to dot notation path.
 *
 * @example
 * const path = "steps[1].step[0].stepGroup.steps[3].steps[7].step";
 * // Returns "steps.1.step.0.stepGroup.steps.3.steps.7.step"
 */
export const convertToDotNotation = (path = ''): string => {
  return path.replace(/\[(\d+)\]/g, '.$1')
}

export const isAnyNestedStepGroupContainerSG = (stepGroupSteps: ExecutionWrapperConfig[]): boolean => {
  if (!stepGroupSteps) {
    /* istanbul ignore next */ return false // No steps provided - stepGroupTemplate scenario
  }

  for (const step of stepGroupSteps) {
    if (step.stepGroup?.stepGroupInfra) {
      return true
    }
    if (step.stepGroup?.steps) {
      if (isAnyNestedStepGroupContainerSG(step.stepGroup.steps)) {
        return true
      }
    }
  }
  return false
}
