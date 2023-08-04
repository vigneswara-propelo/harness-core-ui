/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo, isEmpty } from 'lodash-es'
import { useLocalStorage, useUpdateQueryParams } from '@common/hooks'
import {
  ExecutionNode,
  ResponseNodeExecutionDetails,
  useGetExecutionSubGraphForNodeExecution
} from 'services/pipeline-ng'
import { ExecutionPageQueryParams } from '@pipeline/utils/types'
import { ExecutionPathProps } from '@common/interfaces/RouteInterfaces'
import {
  ExecutionPipelineGroupInfo,
  ExecutionPipelineNode
} from '@pipeline/components/ExecutionStageDiagram/ExecutionPipelineModel'
import { processNodeData } from '@pipeline/utils/executionUtils'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'

interface RetryStepGroupProps {
  currentStepGroupRetryId: string
}

interface RetryStepGroupReturnInterface {
  retryStepGroupParams: { [key: string]: string }
  retryStepGroupStepsData: ExecutionPipelineNode<ExecutionNode>[]
  goToRetryStepExecution: (id: string, stepGroupData: ExecutionPipelineGroupInfo<ExecutionNode> | undefined) => void
  goToCurrentExecution: (stepGroupData: ExecutionPipelineGroupInfo<ExecutionNode> | undefined) => void
  executionNode: ResponseNodeExecutionDetails | null
  loading: boolean
}

export const useGetRetryStepGroupData = (props: RetryStepGroupProps): RetryStepGroupReturnInterface => {
  const { currentStepGroupRetryId } = props
  const { accountId, projectIdentifier, orgIdentifier, executionIdentifier } = useParams<ExecutionPathProps>()
  const [retryStepGroupParams, setRetryStepGroupParams] = useLocalStorage<{ [key: string]: string }>(
    'retryStepGroup',
    {}
  )
  const { updateQueryParams } = useUpdateQueryParams<ExecutionPageQueryParams>()
  const [retryStepGroupStepsData, setRetryStepGroupStepsData] = React.useState<ExecutionPipelineNode<ExecutionNode>[]>(
    []
  )
  const { addNewNodeToMap, pipelineExecutionDetail } = useExecutionContext()

  const planExecutionId = defaultTo(
    pipelineExecutionDetail?.childGraph?.executionGraph?.executionMetadata?.planExecutionId,
    executionIdentifier
  )

  const organisationIdentifier = defaultTo(
    pipelineExecutionDetail?.childGraph?.executionGraph?.executionMetadata?.orgIdentifier,
    orgIdentifier
  )

  const prjctIdentifier = defaultTo(
    pipelineExecutionDetail?.childGraph?.executionGraph?.executionMetadata?.projectIdentifier,
    projectIdentifier
  )

  const { data: executionNode, loading } = useGetExecutionSubGraphForNodeExecution({
    planExecutionId: planExecutionId,
    nodeExecutionId: currentStepGroupRetryId,
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier: prjctIdentifier,
      orgIdentifier: organisationIdentifier
    },
    pathParams: {
      planExecutionId: planExecutionId,
      nodeExecutionId: currentStepGroupRetryId
    },
    lazy: isEmpty(currentStepGroupRetryId)
  })

  React.useEffect(() => {
    if (executionNode?.data?.executionGraph) {
      const items: Array<ExecutionPipelineNode<ExecutionNode>> = []
      const rootNodeId = executionNode.data.executionGraph.rootNodeId as string
      const nodeAdjacencyListMap = executionNode?.data?.executionGraph.nodeAdjacencyListMap
      items.push(
        ...processNodeData(
          nodeAdjacencyListMap?.[rootNodeId].children || [],
          executionNode.data.executionGraph?.nodeMap,
          executionNode.data.executionGraph?.nodeAdjacencyListMap,
          items
        )
      )
      setRetryStepGroupStepsData(items)
      const newNodeMap = executionNode?.data?.executionGraph?.nodeMap
      for (const nodeid in newNodeMap) {
        Object.assign(newNodeMap[nodeid], { __isInterruptNode: true })
        addNewNodeToMap(nodeid, newNodeMap[nodeid])
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [executionNode?.data])

  function goToRetryStepExecution(id: string, stepGroupData: any): void {
    setRetryStepGroupParams(prevState => {
      const newRetryParams = { ...prevState, [defaultTo(stepGroupData?.data?.baseFqn, stepGroupData?.baseFqn)]: id }
      return newRetryParams
    })
  }

  function goToCurrentExecution(stepGroupData: any): void {
    setRetryStepGroupParams(prevState => {
      const newRetryParams = { ...prevState, [defaultTo(stepGroupData?.data?.baseFqn, stepGroupData?.baseFqn)]: '' }
      return newRetryParams
    })
    updateQueryParams({ step: [] as unknown as string /* this removes the param fro query */ })
  }
  return {
    retryStepGroupParams,
    retryStepGroupStepsData,
    goToRetryStepExecution,
    goToCurrentExecution,
    executionNode,
    loading
  }
}
