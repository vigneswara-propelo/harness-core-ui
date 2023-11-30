/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const pipelineExecutionSummaryMock = {
  content: [
    {
      pipelineIdentifier: 'multistagepipeline_Clone',
      orgIdentifier: 'default',
      projectIdentifier: 'CD_Dashboards',
      planExecutionId: 'ziE2uEp1TweZ4CNtff1thA',
      name: 'multistage-pipeline - Clone',
      yamlVersion: '0',
      status: 'Failed',
      tags: [],
      executionTriggerInfo: {
        triggerType: 'MANUAL',
        triggeredBy: {
          uuid: 'FCQ-FAPORre3jD4XhC3dQA',
          identifier: 'Test',
          extraInfo: {
            email: 'test@test.io'
          },
          triggerIdentifier: '',
          triggerName: ''
        },
        isRerun: false
      },
      executionErrorInfo: {
        message: 'User Initiated Failure'
      },
      layoutNodeMap: {
        'mmacNyNlS0Ci-AsYnv-6LQ': {
          nodeType: 'PipelineRollback',
          nodeGroup: 'STAGE',
          nodeIdentifier: 'prb-t-ntjP8XTVe8ccUmirEGtA',
          name: 'Pipeline Rollback',
          nodeUuid: 'mmacNyNlS0Ci-AsYnv-6LQ',
          status: 'NotStarted',
          module: 'pms',
          moduleInfo: {
            pms: {}
          },
          edgeLayoutList: {
            currentNodeChildren: [],
            nextIds: []
          },
          isRollbackStageNode: false
        },
        FnyKz5PlRsWcSMbJPid6ZQ: {
          nodeType: 'Deployment',
          nodeGroup: 'STAGE',
          nodeIdentifier: 'stg1',
          name: 'stg1',
          nodeUuid: 'FnyKz5PlRsWcSMbJPid6ZQ',
          status: 'Failed',
          module: 'cd',
          startTs: 1698909582668,
          endTs: 1698909609840,
          edgeLayoutList: {
            currentNodeChildren: [],
            nextIds: ['GnSC3p0SRVKFFkTKh88Cog']
          },
          nodeRunInfo: {
            whenCondition: '<+OnPipelineSuccess>',
            evaluatedCondition: true,
            expressions: [
              {
                expression: 'OnPipelineSuccess',
                expressionValue: 'true',
                count: 1
              }
            ]
          },
          failureInfo: {
            message: 'User Initiated Failure'
          },
          failureInfoDTO: {
            message: 'User Initiated Failure',
            failureTypeList: ['USER_MARKED_FAILURE'],
            responseMessages: [
              {
                code: 'USER_MARKED_FAILURE',
                level: 'ERROR',
                message: 'User Initiated Failure',
                exception: null,
                failureTypes: ['USER_MARKED_FAILURE']
              }
            ]
          },
          nodeExecutionId: 'PfFvzWI3T_-hgNqBRseZJw',
          executionInputConfigured: false,
          isRollbackStageNode: false
        }
      }
    }
  ],
  pageable: {
    sort: {
      empty: false,
      sorted: true,
      unsorted: false
    },
    offset: 0,
    pageSize: 100,
    pageNumber: 0,
    paged: true,
    unpaged: false
  },
  totalElements: 1,
  totalPages: 1,
  last: true,
  size: 100,
  number: 0,
  sort: {
    empty: false,
    sorted: true,
    unsorted: false
  },
  numberOfElements: 1,
  first: true,
  empty: false
}
