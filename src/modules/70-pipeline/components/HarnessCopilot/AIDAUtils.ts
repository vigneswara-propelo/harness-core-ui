/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo, get } from 'lodash-es'
import { ResponseMessage } from 'services/pipeline-ng'
import { getNodeId, getStageErrorMessage, resolveCurrentStep } from '@pipeline/utils/executionUtils'
import { ExecutionContextParams } from '@pipeline/context/ExecutionContext'

export enum ErrorScope {
  Stage = 'STAGE',
  Step = 'STEP'
}

export const getErrorMessage = ({
  erropScope,
  selectedStageExecutionId,
  selectedStageId,
  pipelineStagesMap,
  pipelineExecutionDetail,
  selectedStepId,
  allNodeMap,
  queryParams
}: {
  erropScope: ErrorScope
  selectedStageExecutionId: string
  selectedStageId: string
  pipelineStagesMap: ExecutionContextParams['pipelineStagesMap']
  pipelineExecutionDetail: ExecutionContextParams['pipelineExecutionDetail']
  selectedStepId: ExecutionContextParams['selectedStepId']
  allNodeMap: ExecutionContextParams['allNodeMap']
  queryParams: ExecutionContextParams['queryParams']
}): string => {
  const nodeId = getNodeId(selectedStageExecutionId, selectedStageId)
  const stage = pipelineStagesMap.get(nodeId)
  const responseMessages = defaultTo(
    pipelineExecutionDetail?.pipelineExecutionSummary?.failureInfo?.responseMessages,
    []
  )
  const currentStepId = resolveCurrentStep(selectedStepId, queryParams)
  const selectedStep = allNodeMap[currentStepId]
  switch (erropScope) {
    case ErrorScope.Step:
      return (
        get(selectedStep, 'failureInfo.message', '') ||
        get(selectedStep, 'failureInfo.responseMessages', [])
          ?.filter((respMssg: ResponseMessage) => !!respMssg?.message)
          ?.map((respMssg: ResponseMessage) => respMssg.message)
          ?.join(',')
      )
    case ErrorScope.Stage:
      return getStageErrorMessage(responseMessages, stage)
    default:
      return ''
  }
}
