/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo, isEmpty } from 'lodash-es'
import { Text } from '@harness/uicore'
import {
  ExecutionPipelineGroupInfo,
  ExecutionPipelineItem,
  ExecutionPipelineNode
} from '@pipeline/components/ExecutionStageDiagram/ExecutionPipelineModel'
import { ExecutionNode, InterruptEffectDTO } from 'services/pipeline-ng'
import { KVPair } from '@modules/70-pipeline/components/PipelineDiagram/types'
import MatrixNodeNameLabelWrapper from '@modules/70-pipeline/components/PipelineDiagram/Nodes/MatrixNodeNameLabelWrapper'
import { getExecutionNodeName } from '@pipeline/utils/execUtils'
import css from '../StageSelection/StageSelection.module.scss'

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

interface NodeDisplayNameProps {
  name: string
  matrixNodeName?: string | KVPair
  isStageNode?: boolean
}

export function NodeDisplayName({ name, matrixNodeName, isStageNode }: NodeDisplayNameProps): JSX.Element {
  return (
    <Text
      lineClamp={1}
      {...(isStageNode ? { font: { weight: 'semi-bold' } } : { className: css.name })}
      tooltipProps={{ popoverClassName: matrixNodeName ? 'matrixNodeNameLabel' : '' }}
    >
      {matrixNodeName && !isEmpty(matrixNodeName) ? (
        <MatrixNodeNameLabelWrapper nodeName={name} matrixNodeName={matrixNodeName as string} />
      ) : (
        name
      )}
    </Text>
  )
}
