/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { ChartVersionInstanceDetail } from 'services/cd-ng'

export const selectedChartVersionPreProd: ChartVersionInstanceDetail = {
  environmentGroupInstanceDetails: {
    environmentGroupInstanceDetails: [
      {
        id: 'prod_envs',
        name: '',
        environmentTypes: ['PreProduction'],
        count: 2,
        isDrift: false,
        isEnvGroup: false,
        isRevert: false,
        isRollback: true,
        artifactDeploymentDetails: [
          {
            artifact: '/test-artifact',
            lastDeployedAt: 1666785805123,
            envId: 'env1',
            envName: 'Env 1',
            lastPipelineExecutionId: 'exec1',
            pipelineId: 'Pipeline_1'
          }
        ]
      }
    ]
  }
}

export const selectedChartVersionProd: ChartVersionInstanceDetail = {
  environmentGroupInstanceDetails: {
    environmentGroupInstanceDetails: [
      {
        id: 'prod_envs',
        name: 'Prod Envs',
        environmentTypes: ['Production'],
        count: 2,
        isDrift: false,
        isEnvGroup: true,
        isRevert: false,
        isRollback: true,
        artifactDeploymentDetails: [
          {
            artifact: '/test-artifact',
            lastDeployedAt: 1666785805123,
            envId: 'env1',
            envName: 'Env 1',
            lastPipelineExecutionId: 'exec1',
            pipelineId: 'Pipeline_1'
          }
        ]
      }
    ]
  }
}
