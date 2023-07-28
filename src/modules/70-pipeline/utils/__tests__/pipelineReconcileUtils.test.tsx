import { StageElementConfig } from 'services/pipeline-ng'
// stage mocks
import stagePipeline1 from './pipelineReconcileUtilsMocks/stagePipeline1.json'
import stageTemplate1 from './pipelineReconcileUtilsMocks/stageTemplate1.json'
import stageTemplate1diff from './pipelineReconcileUtilsMocks/stageTemplate1diff.json'
import stagePipeline2 from './pipelineReconcileUtilsMocks/stagePipeline2.json'
import stageTemplate2 from './pipelineReconcileUtilsMocks/stageTemplate2.json'
// pipeline mocks
import pipelinePipeline1 from './pipelineReconcileUtilsMocks/pipelinePipeline1.json'
import pipelineTemplate1 from './pipelineReconcileUtilsMocks/pipelineTemplate1.json'
import pipelinePipeline2diff from './pipelineReconcileUtilsMocks/pipelinePipeline2diff.json'
import pipelineTemplate2diff from './pipelineReconcileUtilsMocks/pipelineTemplate2diff.json'

import { compareStageTemplateAndStage, comparePipelineTemplateAndPipeline } from '../pipelineReconcileUtils'

describe('pipelineReconcileUtils', () => {
  test('compareStageTemplateAndStage - no diff', () => {
    const response = compareStageTemplateAndStage(stageTemplate1 as unknown as StageElementConfig, stagePipeline1)
    expect(response).toStrictEqual({ hasDifference: false })
  })
  test('compareStageTemplateAndStage - has diff', () => {
    const response = compareStageTemplateAndStage(stageTemplate1diff as unknown as StageElementConfig, stagePipeline1)
    expect(response).toStrictEqual({ hasDifference: true })
  })
  test('compareStageTemplateAndStage - no diff (exclude spec.environment use case)', () => {
    const response = compareStageTemplateAndStage(stageTemplate2 as unknown as StageElementConfig, stagePipeline2)
    expect(response).toStrictEqual({ hasDifference: false })
  })

  test('comparePipelineTemplateAndPipeline - no diff', () => {
    const response = comparePipelineTemplateAndPipeline(
      pipelineTemplate1 as unknown as StageElementConfig,
      pipelinePipeline1
    )
    expect(response).toStrictEqual({ hasDifference: false })
  })
  test('comparePipelineTemplateAndPipeline - has diff', () => {
    const response = comparePipelineTemplateAndPipeline(
      pipelineTemplate2diff as unknown as StageElementConfig,
      pipelinePipeline2diff
    )
    expect(response).toStrictEqual({ hasDifference: true })
  })
})
