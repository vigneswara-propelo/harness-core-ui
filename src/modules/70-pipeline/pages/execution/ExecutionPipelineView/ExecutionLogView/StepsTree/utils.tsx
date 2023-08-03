import { defaultTo } from 'lodash-es'
import { ExecutionPipelineNode } from '@pipeline/components/ExecutionStageDiagram/ExecutionPipelineModel'
import { ExecutionNode, InterruptEffectDTO } from 'services/pipeline-ng'

export function getRetryInterrupts(step: ExecutionPipelineNode<ExecutionNode>): InterruptEffectDTO[] {
  return defaultTo(step?.item?.data?.interruptHistories, defaultTo(step?.group?.data?.interruptHistories, [])).filter(
    row => row.interruptType === 'RETRY'
  )
}
