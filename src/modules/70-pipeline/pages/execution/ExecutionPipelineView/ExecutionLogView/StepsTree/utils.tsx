/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo } from 'lodash-es'
import {
  ExecutionPipelineGroupInfo,
  ExecutionPipelineItem,
  ExecutionPipelineNode
} from '@pipeline/components/ExecutionStageDiagram/ExecutionPipelineModel'
import { ExecutionNode, InterruptEffectDTO } from 'services/pipeline-ng'
import { getExecutionNodeName } from '@pipeline/utils/execUtils'

export function getRetryInterrupts(step: ExecutionPipelineNode<ExecutionNode>): InterruptEffectDTO[] {
  return defaultTo(step?.item?.data?.interruptHistories, defaultTo(step?.group?.data?.interruptHistories, [])).filter(
    row => row.interruptType === 'RETRY'
  )
}

export function getStepDisplayName(
  step: ExecutionPipelineItem<ExecutionNode> | ExecutionPipelineGroupInfo<ExecutionNode>
): string {
  return getExecutionNodeName(step.data) || step.name
}
