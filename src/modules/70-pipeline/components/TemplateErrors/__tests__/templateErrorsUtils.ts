export const PIPELINE_TEMPLATE_ERROR_1 = {
  message: 'Pipeline Template Error 1',
  fqn: '$.template.allowStageExecutions'
}

export const STAGE_1_INFO = {
  identifier: 'stage1Name',
  type: 'Approval',
  name: 'stage1Name',
  fqn: '$.template.spec.spec.stages[0].stage'
}

export const STAGE_2_INFO = {
  identifier: '1a',
  type: 'Deployment',
  name: 'stage2Name',
  fqn: '$.template.spec.spec.stages[1].stage'
}

export const STAGE_1_ERROR_1 = {
  message: 'Stage 1 Error 1',
  stageInfo: STAGE_1_INFO,
  fqn: '$.template.spec.spec.stages[1].stage.type'
}

export const STAGE_1_ERROR_2 = {
  message: 'Stage 1 Error 2',
  stageInfo: STAGE_1_INFO,
  fqn: '$.template.spec.spec.stages[1].stage.identifier'
}

export const STEP_1_INFO = {
  identifier: 'step1Name',
  type: 'ShellScript',
  name: 'step1Name',
  fqn: '$.template.spec.spec.execution.steps[0].step.spec.shell'
}

export const STEP_ERROR_1 = {
  message: 'Step Error 1',
  stageInfo: undefined,
  stepInfo: STEP_1_INFO,
  fqn: '$.template.spec.spec.execution.steps[0].step.spec.shell'
}

export const STEP_ERROR_2 = {
  message: 'Step Error 2',
  stageInfo: undefined,
  stepInfo: {
    identifier: 'step2Name',
    type: 'ShellScript',
    name: 'step2Name',
    fqn: '$.template.spec.spec.execution.steps[1].step.spec'
  },
  fqn: '$.template.spec.spec.execution.steps[1].step.spec'
}
