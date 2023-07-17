/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { ExecutionNode } from 'services/pipeline-ng'

export const stepMock = {
  uuid: 'gscML7PsQU6Jkv4rS7xfoQ',
  setupId: 'IS-ZH0_nS7eKhZmDEYiI1Q',
  name: 'AnalyzeDeploymentImpact_1',
  identifier: 'AnalyzeDeploymentImpact_1',
  baseFqn: 'pipeline.stages.Deployment_101.spec.execution.steps.AnalyzeDeploymentImpact_1',
  outcomes: { output: { activityId: 'yRYl-h8PQeqvmLmaNUmI4g' } },
  stepParameters: {
    identifier: 'AnalyzeDeploymentImpact_1',
    name: 'AnalyzeDeploymentImpact_1',
    timeout: '15m',
    type: 'AnalyzeDeploymentImpact',
    spec: {
      serviceIdentifier: 'datadoglogs',
      envIdentifier: 'version1',
      duration: '1D',
      monitoredService: { type: 'Default', spec: {} }
    }
  },
  startTs: 1689439036152,
  endTs: 1689439036383,
  stepType: 'AnalyzeDeploymentImpact',
  status: 'Success',
  failureInfo: { message: '', failureTypeList: [], responseMessages: [] },
  skipInfo: null,
  nodeRunInfo: {
    whenCondition: '<+OnStageSuccess>',
    evaluatedCondition: true,
    expressions: [{ expression: 'OnStageSuccess', expressionValue: 'true', count: 1 }]
  },
  executableResponses: [{ sync: { logKeys: [], units: [] } }],
  unitProgresses: [],
  progressData: null,
  delegateInfoList: [],
  interruptHistories: [],
  stepDetails: null,
  strategyMetadata: null,
  executionInputConfigured: false,
  logBaseKey:
    'accountId:-k53qRQAQ1O7DBLb9ACnjQ/orgId:cvng/projectId:templatetesting2/pipelineId:Add_change_Events/runSequence:5/level0:pipeline/level1:stages/level2:Deployment_101/level3:spec/level4:execution/level5:steps/level6:AnalyzeDeploymentImpact_1'
} as unknown as ExecutionNode

export const summaryMock = {
  analysisDuration: 86400,
  analysisEndTime: 1689525436318,
  analysisStartTime: 1689439036318,
  analysisStatus: 'RUNNING',
  executionDetailIdentifier: 'X3Y16gZ-TnmwxGx_A6E-Sg',
  monitoredServiceIdentifier: 'datadoglogs_version1'
}
