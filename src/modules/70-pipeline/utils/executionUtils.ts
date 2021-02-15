import type { IconName } from '@wings-software/uicore'
import { isEmpty } from 'lodash-es'

import type { ExecutionStatus } from '@pipeline/utils/statusHelpers'
import { isExecutionSuccess, isExecutionCompletedWithBadState, isExecutionRunning } from '@pipeline/utils/statusHelpers'
import type { GraphLayoutNode, PipelineExecutionSummary, ExecutionGraph, ExecutionNode } from 'services/pipeline-ng'
import {
  ExecutionPipelineNode,
  ExecutionPipelineNodeType,
  ExecutionPipelineItem,
  ExecutionPipelineGroupInfo,
  ExecutionPipelineItemStatus
} from '@pipeline/components/ExecutionStageDiagram/ExecutionPipelineModel'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'

export const LITE_ENGINE_TASK = 'liteEngineTask'
export const STATIC_SERVICE_GROUP_NAME = 'static_service_group'
export const RollbackIdentifierArray = ['Rollback', 'Step_Group(Rollback)']

export const RollbackContainerCss: React.CSSProperties = {
  borderColor: 'var(--red-450)'
}

export const NonSelectableNodes: string[] = ['NG_SECTION', 'NG_FORK', 'DEPLOYMENT_STAGE_STEP']

// TODO: remove use DTO
export interface ServiceDependency {
  identifier: string
  name: string | null
  image: string
  status: string
  startTime: string
  endTime: string | null
  errorMessage: string | null
  errorReason: string | null
}

export enum StepTypes {
  SERVICE = 'SERVICE',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  GENERIC_SECTION = 'GENERIC_SECTION',
  STEP_GROUP = 'STEP_GROUP',
  NG_SECTION = 'NG_SECTION',
  K8S_ROLLING = 'K8S_ROLLING',
  FORK = 'NG_FORK',
  HTTP = 'HTTP'
}

export const StepTypeIconsMap: { [key in StepTypes]: IconName } = {
  SERVICE: 'main-services',
  GENERIC_SECTION: 'step-group',
  K8S_ROLLING: 'service-kubernetes',
  NG_SECTION: 'step-group',
  STEP_GROUP: 'step-group',
  INFRASTRUCTURE: 'search-infra-prov',
  NG_FORK: 'fork',
  HTTP: 'command-http'
}

export const ExecutionStatusIconMap: Record<ExecutionStatus, IconName> = {
  Success: 'tick-circle',
  Running: 'main-more',
  Failed: 'circle-cross',
  Expired: 'expired',
  Aborted: 'banned',
  Suspended: 'banned',
  Queued: 'queued',
  NotStarted: 'pending',
  Paused: 'pause',
  Waiting: 'waiting',
  Skipped: 'skipped'
}

/**
 * @deprecated use import { ExecutionPathProps } from '@common/interfaces/RouteInterfaces' instead
 */
export interface ExecutionPathParams {
  orgIdentifier: string
  projectIdentifier: string
  pipelineIdentifier: string
  executionIdentifier: string
  accountId: string
}

export interface ExecutionQueryParams {
  stage?: string
  step?: string
  view?: 'log' | 'graph'
}

export function getPipelineStagesMap(
  layoutNodeMap: PipelineExecutionSummary['layoutNodeMap'],
  startingNodeId?: string
): Map<string, GraphLayoutNode> {
  const map = new Map<string, GraphLayoutNode>()

  function recursiveSetInMap(node: GraphLayoutNode): void {
    if (node.nodeType === NodeTypes.Parallel) {
      node.edgeLayoutList?.currentNodeChildren?.forEach(item => {
        if (item && layoutNodeMap?.[item]) {
          map.set(layoutNodeMap[item].nodeUuid || '', layoutNodeMap[item])
          return
        }
      })
    } else {
      map.set(node.nodeUuid || '', node)
    }

    node.edgeLayoutList?.nextIds?.forEach(item => {
      if (item && layoutNodeMap?.[item]) {
        recursiveSetInMap(layoutNodeMap[item])
        return
      }
    })
  }

  if (startingNodeId && layoutNodeMap?.[startingNodeId]) {
    const node = layoutNodeMap[startingNodeId]
    recursiveSetInMap(node)
  }

  return map
}

enum NodeTypes {
  Parallel = 'parallel',
  Stage = 'stage'
}
export interface ProcessLayoutNodeMapResponse {
  stage?: GraphLayoutNode
  parallel?: GraphLayoutNode[]
}

export const processLayoutNodeMap = (executionSummary?: PipelineExecutionSummary): ProcessLayoutNodeMapResponse[] => {
  const response: ProcessLayoutNodeMapResponse[] = []
  if (!executionSummary) {
    return response
  }
  const startingNodeId = executionSummary.startingNodeId
  const layoutNodeMap = executionSummary.layoutNodeMap
  if (startingNodeId && layoutNodeMap?.[startingNodeId]) {
    let node: GraphLayoutNode | undefined = layoutNodeMap[startingNodeId]
    while (node) {
      const currentNodeChildren: string[] | undefined = node?.edgeLayoutList?.currentNodeChildren
      const nextIds: string[] | undefined = node?.edgeLayoutList?.nextIds
      if (node.nodeType === NodeTypes.Parallel && currentNodeChildren && currentNodeChildren.length > 1) {
        response.push({ parallel: currentNodeChildren.map(item => layoutNodeMap[item]) })
        node = layoutNodeMap[node.edgeLayoutList?.nextIds?.[0] || '']
      } else if (node.nodeType === NodeTypes.Parallel && currentNodeChildren && layoutNodeMap[currentNodeChildren[0]]) {
        response.push({ stage: layoutNodeMap[currentNodeChildren[0]] })
        node = layoutNodeMap[node.edgeLayoutList?.nextIds?.[0] || '']
      } else {
        response.push({ stage: node })
        if (nextIds && nextIds.length === 1) {
          node = layoutNodeMap[nextIds[0]]
        } else {
          node = undefined
        }
      }
    }
  }
  return response
}

export function getRunningStageForPipeline(
  executionSummary?: PipelineExecutionSummary,
  pipelineExecutionStatus?: ExecutionStatus
): string | null {
  if (!executionSummary) {
    return null
  }
  const stages = processLayoutNodeMap(executionSummary)
  const n = stages.length
  // for completed pipeline, select the last completed stage
  if (isExecutionSuccess(pipelineExecutionStatus)) {
    const stage = stages[stages.length - 1]

    if (stage.stage) {
      return stage.stage.nodeUuid || ''
    } else if (stage.parallel && Array.isArray(stage.parallel) && stage.parallel[0]) {
      return stage.parallel[0].nodeUuid || ''
    }
  }

  // for errored pipeline, select the errored stage
  if (isExecutionCompletedWithBadState(pipelineExecutionStatus)) {
    for (let i = stages.length - 1; i >= 0; i--) {
      const stage = stages[i]

      if (stage.stage) {
        if (isExecutionCompletedWithBadState(stage.stage.status)) {
          return stage.stage.nodeUuid || ''
        } else {
          continue
        }
      } else if (stage.parallel && Array.isArray(stage.parallel)) {
        const erorredStage = stage.parallel.filter(item => isExecutionCompletedWithBadState(item.status))[0]

        /* istanbul ignore else */
        if (erorredStage) {
          return erorredStage.nodeUuid || ''
        }
      }
    }
  }

  // find the current running stage
  for (let i = 0; i < n; i++) {
    const stage = stages[i]

    // for normal stage
    if (stage.stage) {
      if (isExecutionRunning(stage.stage.status)) {
        return stage.stage.nodeUuid || ''
      } else {
        continue
      }
      // for parallel stage
    } else if (stage.parallel && Array.isArray(stage.parallel)) {
      const activeStage = stage.parallel.filter(item => isExecutionRunning(item.status))[0]

      /* istanbul ignore else */
      if (activeStage) {
        return activeStage.nodeUuid || ''
      }
    }
  }

  return null
}

export function getRunningStep(graph: ExecutionGraph, nodeId?: string): string | null {
  const { rootNodeId, nodeMap, nodeAdjacencyListMap } = graph

  if (!nodeMap || !nodeAdjacencyListMap) {
    return null
  }

  const currentNodeId = nodeId || rootNodeId

  if (!currentNodeId) return null

  const node = nodeMap[currentNodeId]
  const nodeAdjacencyList = nodeAdjacencyListMap[currentNodeId]

  if (!node || !nodeAdjacencyList) {
    return null
  }

  if (Array.isArray(nodeAdjacencyList.children) && nodeAdjacencyList.children.length > 0) {
    const n = nodeAdjacencyList.children.length

    for (let i = 0; i < n; i++) {
      const childNodeId = nodeAdjacencyList.children[i]
      const step = getRunningStep(graph, childNodeId)

      if (typeof step === 'string') return step
    }
  }

  if (nodeAdjacencyList.nextIds && nodeAdjacencyList.nextIds[0]) {
    const step = getRunningStep(graph, nodeAdjacencyList.nextIds[0])

    if (typeof step === 'string') return step
  }

  if (isExecutionRunning(node.status) && !NonSelectableNodes.includes(node.stepType || '')) {
    return currentNodeId
  }

  return null
}

export function getIconFromStageModule(stageModule: 'cd' | 'ci' | string | undefined): IconName {
  switch (stageModule) {
    case 'cd':
      return 'pipeline-deploy'
    case 'ci':
      return 'pipeline-build'
    default:
      return 'pipeline-deploy'
  }
}

const addDependencyToArray = (service: ServiceDependency, arr: ExecutionPipelineNode<ExecutionNode>[]): void => {
  const stepItem: ExecutionPipelineItem<ExecutionNode> = {
    identifier: service.identifier as string,
    name: service.name as string,
    type: ExecutionPipelineNodeType.NORMAL,
    status: service.status as ExecutionPipelineItemStatus,
    icon: 'dependency-step',
    data: service as ExecutionNode,
    itemType: 'service-dependency'
  }

  // add step node
  const stepNode: ExecutionPipelineNode<ExecutionNode> = { item: stepItem }
  arr.push(stepNode)
}

const addDependencies = (
  dependencies: ServiceDependency[],
  stepsPipelineNodes: ExecutionPipelineNode<ExecutionNode>[]
): void => {
  if (dependencies && dependencies.length > 0) {
    const items: ExecutionPipelineNode<ExecutionNode>[] = []

    dependencies.forEach(_service => addDependencyToArray(_service, items))

    const dependenciesGroup: ExecutionPipelineGroupInfo<ExecutionNode> = {
      identifier: STATIC_SERVICE_GROUP_NAME,
      name: 'Dependencies', // TODO: use getString('execution.dependencyGroupName'),
      status: dependencies[0].status as ExecutionPipelineItemStatus, // use status of first service
      data: {},
      icon: 'step-group',
      verticalStepGroup: true,
      isOpen: true,
      items: [{ parallel: items }]
    }

    // dependency goes at the begining
    stepsPipelineNodes.unshift({ group: dependenciesGroup })
  }
}

const processLiteEngineTask = (
  nodeData: ExecutionNode | undefined,
  rootNodes: ExecutionPipelineNode<ExecutionNode>[]
): void => {
  // NOTE: liteEngineTask contains information about dependencies
  const serviceDependencyList: ServiceDependency[] = (nodeData?.outcomes as any)?.find(
    (_item: any) => !!_item.serviceDependencyList
  )?.serviceDependencyList

  // 1. Add dependency services
  addDependencies(serviceDependencyList, rootNodes)

  // 2. Add Initialize step ( at the first place in array )
  const stepItem: ExecutionPipelineItem<ExecutionNode> = {
    identifier: nodeData?.uuid as string,
    name: 'Initialize',
    type: ExecutionPipelineNodeType.NORMAL,
    status: nodeData?.status as ExecutionPipelineItemStatus,
    icon: 'initialize-step',
    data: nodeData as ExecutionNode,
    itemType: 'service-dependency'
  }
  const stepNode: ExecutionPipelineNode<ExecutionNode> = { item: stepItem }
  rootNodes.unshift(stepNode)
}

const processNodeData = (
  children: string[],
  nodeMap: ExecutionGraph['nodeMap'],
  nodeAdjacencyListMap: ExecutionGraph['nodeAdjacencyListMap'],
  rootNodes: Array<ExecutionPipelineNode<ExecutionNode>>
): Array<ExecutionPipelineNode<ExecutionNode>> => {
  const items: Array<ExecutionPipelineNode<ExecutionNode>> = []
  children?.forEach(item => {
    const nodeData = nodeMap?.[item]
    if (nodeData?.stepType === StepTypes.FORK) {
      items.push({
        parallel: processNodeData(
          nodeAdjacencyListMap?.[item].children || /* istanbul ignore next */ [],
          nodeMap,
          nodeAdjacencyListMap,
          rootNodes
        )
      })
    } else if (nodeData?.stepType === StepTypes.STEP_GROUP || nodeData?.stepType === StepTypes.NG_SECTION) {
      const icon = factory.getStepIcon(nodeData?.stepType)
      items.push({
        group: {
          name: nodeData.name || /* istanbul ignore next */ '',
          identifier: item,
          data: nodeData,
          containerCss: {
            ...(RollbackIdentifierArray.indexOf(nodeData.identifier || '') > -1 ? RollbackContainerCss : {})
          },
          showInLabel: false,
          status: nodeData.status as ExecutionPipelineItemStatus,
          isOpen: true,
          icon: icon !== 'disable' ? icon : StepTypeIconsMap[nodeData?.stepType as StepTypes] || 'cross',
          items: processNodeData(
            nodeAdjacencyListMap?.[item].children || /* istanbul ignore next */ [],
            nodeMap,
            nodeAdjacencyListMap,
            rootNodes
          )
        }
      })
    } else {
      if (nodeData?.stepType === LITE_ENGINE_TASK) {
        processLiteEngineTask(nodeData, rootNodes)
      } else {
        const icon = factory.getStepIcon(nodeData?.stepType || '')
        items.push({
          item: {
            name: nodeData?.name || /* istanbul ignore next */ '',
            icon: icon !== 'disable' ? icon : StepTypeIconsMap[nodeData?.stepType as StepTypes] || 'cross',
            identifier: item,
            status: nodeData?.status as ExecutionPipelineItemStatus,
            type: ExecutionPipelineNodeType.NORMAL,
            data: nodeData
          }
        })
      }
    }
    const nextIds = nodeAdjacencyListMap?.[item].nextIds || /* istanbul ignore next */ []
    nextIds.forEach(id => {
      const nodeDataNext = nodeMap?.[id]
      if (nodeDataNext?.stepType === StepTypes.FORK) {
        items.push({
          parallel: processNodeData(
            nodeAdjacencyListMap?.[id].children || /* istanbul ignore next */ [],
            nodeMap,
            nodeAdjacencyListMap,
            rootNodes
          )
        })
      } else if (nodeDataNext?.stepType === StepTypes.STEP_GROUP) {
        const icon = factory.getStepIcon(nodeDataNext?.stepType)
        items.push({
          group: {
            name: nodeDataNext.name || /* istanbul ignore next */ '',
            identifier: id,
            data: nodeDataNext,
            showInLabel: false,
            status: nodeDataNext.status as ExecutionPipelineItemStatus,
            isOpen: true,
            icon: icon !== 'disable' ? icon : StepTypeIconsMap[nodeDataNext?.stepType as StepTypes] || 'cross',
            items: processNodeData(
              nodeAdjacencyListMap?.[id].children || /* istanbul ignore next */ [],
              nodeMap,
              nodeAdjacencyListMap,
              rootNodes
            )
          }
        })
      } else {
        const icon = factory.getStepIcon(nodeDataNext?.stepType || '')
        items.push({
          item: {
            name: nodeDataNext?.name || /* istanbul ignore next */ '',
            icon: icon !== 'disable' ? icon : StepTypeIconsMap[nodeData?.stepType as StepTypes] || 'cross',
            identifier: id,
            status: nodeDataNext?.status as ExecutionPipelineItemStatus,
            type: ExecutionPipelineNodeType.NORMAL,
            data: nodeDataNext
          }
        })
      }
      const nextLevels = nodeAdjacencyListMap?.[id].nextIds
      if (nextLevels) {
        items.push(...processNodeData(nextLevels, nodeMap, nodeAdjacencyListMap, rootNodes))
      }
    })
  })
  return items
}

const hasOnlyLiteEngineTask = (children?: string[], graph?: ExecutionGraph): boolean => {
  return (
    !!children &&
    children.length === 1 &&
    graph?.nodeMap?.[children[0]]?.stepType === LITE_ENGINE_TASK &&
    graph?.nodeAdjacencyListMap?.[children[0]]?.nextIds?.length === 0
  )
}

export const processExecutionData = (graph?: ExecutionGraph): Array<ExecutionPipelineNode<ExecutionNode>> => {
  const items: Array<ExecutionPipelineNode<ExecutionNode>> = []

  /* istanbul ignore else */
  if (graph?.nodeAdjacencyListMap && graph?.rootNodeId) {
    const nodeAdjacencyListMap = graph.nodeAdjacencyListMap
    const rootNode = graph.rootNodeId
    let nodeId = nodeAdjacencyListMap[rootNode].children?.[0]
    while (nodeId && nodeAdjacencyListMap[nodeId]) {
      const nodeData = graph?.nodeMap?.[nodeId]
      /* istanbul ignore else */
      if (nodeData) {
        if (nodeData.stepType === StepTypes.NG_SECTION) {
          // NOTE: exception if we have only lite task engine in Execution group
          if (hasOnlyLiteEngineTask(nodeAdjacencyListMap[nodeId].children, graph)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const liteTaskEngineId = nodeAdjacencyListMap[nodeId]?.children?.[0]!
            processLiteEngineTask(graph?.nodeMap?.[liteTaskEngineId], items)
          } else if (!isEmpty(nodeAdjacencyListMap[nodeId].children)) {
            const icon = factory.getStepIcon(nodeData?.stepType || '')
            items.push({
              group: {
                name: nodeData.name || /* istanbul ignore next */ '',
                identifier: nodeId,
                data: nodeData,
                containerCss: {
                  ...(RollbackIdentifierArray.indexOf(nodeData.identifier || '') > -1 ? RollbackContainerCss : {})
                },
                status: nodeData.status as ExecutionPipelineItemStatus,
                isOpen: true,
                icon: icon !== 'disable' ? icon : StepTypeIconsMap[nodeData?.stepType as StepTypes] || 'cross',
                items: processNodeData(
                  nodeAdjacencyListMap[nodeId].children || /* istanbul ignore next */ [],
                  graph?.nodeMap,
                  graph?.nodeAdjacencyListMap,
                  items
                )
              }
            })
          }
        } else if (nodeData.stepType === StepTypes.FORK) {
          items.push({
            parallel: processNodeData(
              nodeAdjacencyListMap[nodeId].children || /* istanbul ignore next */ [],
              graph?.nodeMap,
              graph?.nodeAdjacencyListMap,
              items
            )
          })
        } else {
          const icon = factory.getStepIcon(nodeData?.stepType || '')
          items.push({
            item: {
              name: nodeData.name || /* istanbul ignore next */ '',
              icon: icon !== 'disable' ? icon : StepTypeIconsMap[nodeData?.stepType as StepTypes] || 'cross',
              showInLabel: nodeData.stepType === StepTypes.SERVICE || nodeData.stepType === StepTypes.INFRASTRUCTURE,
              identifier: nodeId,
              status: nodeData.status as ExecutionPipelineItemStatus,
              type: ExecutionPipelineNodeType.NORMAL,
              data: nodeData
            }
          })
        }
      }
      nodeId = nodeAdjacencyListMap[nodeId].nextIds?.[0]
    }
  }
  return items
}

export function getStageType(node?: GraphLayoutNode): 'ci' | 'cd' | 'unknown' {
  if (node?.module?.toLowerCase?.() === 'ci' || !isEmpty(node?.moduleInfo?.ci)) {
    return 'ci'
  } else if (node?.module?.toLowerCase?.() === 'cd' || !isEmpty(node?.moduleInfo?.cd)) {
    return 'cd'
  }
  return 'unknown'
}
