/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import routes from '@common/RouteDefinitions'
import { accountPathProps, pipelineModuleParams, pipelinePathProps } from '@common/utils/routeUtils'
import { State } from '@pipeline/components/LogsContent/LogsState/types'

export const logBaseKey =
  'accountId:accountId/orgId:default/projectId:testci/pipelineId:deploy_k8s_todolist/runSequence:3/level0:pipeline/level1:stages/level2:deploy/level3:spec/level4:execution/level5:steps/level6:rolloutDeployment'

export const stepId = '2Sjau1QkSqS_fEfFqhY7nQ'

export const singleLogState = {
  units: ['Fetch Files'],
  logKeys: [
    'accountId:accountId/orgId:default/projectId:PREQA_NG_Pipelines/pipelineId:PR_Harness_Env/runSequence:17310/level0:pipeline/level1:stages/level2:parallel6lAzRN9QR-KDFWIiG_bavgparallel/level3:ngUI/level4:spec/level5:execution/level6:steps/level7:rolloutDeployment-commandUnit:Fetch Files'
  ],
  dataMap: {
    'accountId:accountId/orgId:default/projectId:PREQA_NG_Pipelines/pipelineId:PR_Harness_Env/runSequence:17310/level0:pipeline/level1:stages/level2:parallel6lAzRN9QR-KDFWIiG_bavgparallel/level3:ngUI/level4:spec/level5:execution/level6:steps/level7:rolloutDeployment-commandUnit:Fetch Files':
      {
        title: 'Fetch Files',
        data: [
          {
            text: {
              level: 'INFO'
            }
          }
        ],
        isOpen: true,
        manuallyToggled: false,
        status: 'SUCCESS',
        unitStatus: 'SUCCESS',
        startTime: 1689088635579,
        endTime: 1689088638958,
        dataSource: 'blob'
      }
  },
  selectedStep: '2Sjau1QkSqS_fEfFqhY7nQ',
  selectedStage: 'gegjPInZSh6lVgbDPC0ymw',
  searchData: {
    text: '',
    currentIndex: 0,
    linesWithResults: []
  }
} as State

export const multiLogState = {
  ...singleLogState,
  units: ['Fetch Files', 'Initialize'],
  logKeys: [
    'accountId:accountId/orgId:default/projectId:PREQA_NG_Pipelines/pipelineId:PR_Harness_Env/runSequence:17310/level0:pipeline/level1:stages/level2:parallel6lAzRN9QR-KDFWIiG_bavgparallel/level3:ngUI/level4:spec/level5:execution/level6:steps/level7:rolloutDeployment-commandUnit:Fetch Files',
    'accountId:accountId/orgId:default/projectId:PREQA_NG_Pipelines/pipelineId:PR_Harness_Env/runSequence:17310/level0:pipeline/level1:stages/level2:parallel6lAzRN9QR-KDFWIiG_bavgparallel/level3:ngUI/level4:spec/level5:execution/level6:steps/level7:rolloutDeployment-commandUnit:Initialize'
  ],
  dataMap: {
    'accountId:accountId/orgId:default/projectId:PREQA_NG_Pipelines/pipelineId:PR_Harness_Env/runSequence:17310/level0:pipeline/level1:stages/level2:parallel6lAzRN9QR-KDFWIiG_bavgparallel/level3:ngUI/level4:spec/level5:execution/level6:steps/level7:rolloutDeployment-commandUnit:Initialize':
      {
        title: 'Initialize',
        data: [
          {
            text: {
              level: 'INFO'
            }
          }
        ],
        isOpen: true,
        manuallyToggled: false,
        status: 'SUCCESS',
        unitStatus: 'SUCCESS',
        startTime: 1689088635579,
        endTime: 1689088638958,
        dataSource: 'blob'
      }
  }
} as State

export const moduleParams = {
  accountId: 'accountId',
  orgIdentifier: 'orgIdentifier',
  projectIdentifier: 'projectIdentifier',
  module: 'cd'
}

export const TEST_PATH = routes.toDeployments({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })

export const successResponse = {
  link: 'https://storage.download',
  status: 'success',
  expires: '2023-07-11T18:37:08.468034207Z'
}

export const failedResponse = {
  error_msg: 'cannot list files for prefix'
}

export const pipelinErrorResponse = {
  link: 'https://storage.download',
  status: 'error',
  expires: '2023-07-11T18:37:08.468034207Z',
  message: 'pipeline log zipping failed'
}
