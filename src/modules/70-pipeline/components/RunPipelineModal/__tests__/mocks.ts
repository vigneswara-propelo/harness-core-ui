/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { UseGetMockDataWithMutateAndRefetch } from '@common/utils/testUtils'
import { ResponsePlanExecutionResponseDto, ResponseRetryInfo } from 'services/pipeline-ng'
import { ResponseValidateTemplateInputsResponseDto } from 'services/pipeline-rq'

export const getMockFor_useGetPipeline = (): any => ({
  data: {
    data: {
      resolvedTemplatesPipelineYaml: `pipeline:
  name: TestPipeline
  identifier: First
  tags: {}
  stages:
    - stage:
      name: Stage1
      identifier: Stage1
      description: ""
      type: Approval
      spec:
        execution:
          steps:
            - step:
                name: Approval
                identifier: approval
                type: HarnessApproval
                timeout: 1d
                spec:
                  includePipelineExecutionHistory: true
                  approvers:
                    disallowPipelineExecutor: false
                    minimumCount: 2
                    userGroups:
                      - Chirag
                  approverInputs: []
                  approvalMessage: ABC
      tags: {}
      variables: []
  projectIdentifier: Chirag
  orgIdentifier: harness
  variables:
    - name: checkVariable1
      type: String
      value: <+input>
      required: true
    - name: checkVariable2
      type: String
      value: <+input>
      required: false`,
      yamlPipeline: `pipeline:
  name: TestPipeline
  identifier: First
  tags: {}
  stages:
    - stage:
        name: Stage1
        identifier: Stage1
        description: ""
        type: Approval
        spec:
          execution:
            steps:
              - step:
                  name: Approval
                  identifier: approval
                  type: HarnessApproval
                  timeout: 1d
                  spec:
                    includePipelineExecutionHistory: true
                    approvers:
                      disallowPipelineExecutor: false
                      minimumCount: 2
                      userGroups:
                        - Chirag
                    approverInputs: []
                    approvalMessage: ABC
        tags: {}
        variables: []
  projectIdentifier: Chirag
  orgIdentifier: harness
  variables:
    - name: checkVariable1
      type: String
      value: <+input>
      required: true
    - name: checkVariable2
      type: String
      value: <+input>
      required: false`
    }
  }
})

export const getMockFor_useGetInputSetsListForPipeline = (): any => ({
  refetch: jest.fn(),
  data: {
    data: {
      content: [
        {
          identifier: 'inputset1',
          inputSetType: 'INPUT_SET',
          name: 'is1',
          pipelineIdentifier: 'PipelineId',
          inputSetErrorDetails: {
            uuidToErrorResponseMap: {
              a: {
                errors: [{ fieldName: 'a', message: 'a field invalid' }]
              }
            }
          }
        },
        {
          identifier: 'inputset2',
          inputSetType: 'INPUT_SET',
          name: 'is2',
          pipelineIdentifier: 'PipelineId'
        },
        {
          identifier: 'inputset3',
          inputSetType: 'INPUT_SET',
          name: 'is3',
          pipelineIdentifier: 'PipelineId'
        },
        {
          identifier: 'overlay1',
          inputSetType: 'OVERLAY_INPUT_SET',
          name: 'ov1',
          pipelineIdentifier: 'PipelineId',
          overlaySetErrorDetails: {
            b: 'overlay field invalid'
          }
        }
      ]
    }
  }
})

export const getMockFor_Generic_useMutate = (mutateMock?: jest.Mock): any => ({
  loading: false,
  refetch: jest.fn(),
  mutate:
    mutateMock ||
    jest.fn().mockResolvedValue({
      data: {
        correlationId: '',
        status: 'SUCCESS',
        metaData: null,
        data: {}
      }
    })
})

export const getMockFor_useGetTemplateFromPipeline = (): any => ({
  mutate: jest.fn().mockResolvedValue({
    data: {
      hasInputSets: true,
      inputSetTemplateYaml: `pipeline:
  identifier: "First"
  variables:
    - name: "checkVariable1"
      type: "String"
      value: "<+input>"
    - name: "checkVariable2"
      type: "String"
      value: "<+input>"`
    }
  })
})

export const getMockFor_useGetMergeInputSetFromPipelineTemplateWithListInput = (): any => ({
  mutate: jest.fn().mockResolvedValue({
    data: {
      pipelineYaml:
        'pipeline:\n  identifier: "First"\n  variables:\n  - name: "checkVariable1"\n    type: "String"\n    value: "valuefrominputsetsmerge"\n  - name: "checkVariable2"\n    type: "String"\n    value: "value2frominputsetsmerge"\n'
    }
  })
})

export const mockRetryStages: UseGetMockDataWithMutateAndRefetch<ResponseRetryInfo> = {
  loading: false,
  refetch: jest.fn(),
  mutate: jest.fn(),
  data: {
    status: 'SUCCESS',
    data: {
      errorMessage: null as unknown as undefined,
      groups: [
        {
          info: [
            {
              name: 'stage1',
              identifier: 'stage1',
              status: 'Success',
              createdAt: 1637196823530,
              parentId: '_erjqIYeSdyI32-Q3og1Vw',
              nextId: 'FkJ2JI9ySIaz4dMiOWiHTA'
            }
          ]
        },
        {
          info: [
            {
              name: 'stage2',
              identifier: 'stage2',
              status: 'Success',
              createdAt: 1637196843381,
              parentId: '_erjqIYeSdyI32-Q3og1Vw',
              nextId: 'MR-2RZXuTiKQniQcka-aAQ'
            }
          ]
        },
        {
          info: [
            {
              name: 'stage3',
              identifier: 'stage3',
              status: 'Failed',
              createdAt: 1637196850227,
              parentId: 'MR-2RZXuTiKQniQcka-aAQ',
              nextId: null as unknown as undefined
            },
            {
              name: 'stage4',
              identifier: 'stage4',
              status: 'Success',
              createdAt: 1637196850248,
              parentId: 'MR-2RZXuTiKQniQcka-aAQ',
              nextId: null as unknown as undefined
            }
          ]
        }
      ],
      resumable: true
    },
    metaData: null as unknown as undefined,
    correlationId: '04b10adc-2516-4185-bc53-67c35d12ab01'
  }
}

export const mockRetryStages_Serial: UseGetMockDataWithMutateAndRefetch<ResponseRetryInfo> = {
  loading: false,
  refetch: jest.fn(),
  mutate: jest.fn(),
  data: {
    data: {
      errorMessage: null as unknown as undefined,
      groups: [
        {
          info: [
            {
              name: 'stage1',
              identifier: 'stage1',
              status: 'Success',
              createdAt: 1637196823530,
              parentId: '_erjqIYeSdyI32-Q3og1Vw',
              nextId: 'FkJ2JI9ySIaz4dMiOWiHTA'
            }
          ]
        }
      ]
    }
  }
}

export const mockPostRetryPipeline: UseGetMockDataWithMutateAndRefetch<ResponsePlanExecutionResponseDto> = {
  loading: false,
  refetch: jest.fn(),
  mutate: jest.fn(),
  data: {
    status: 'SUCCESS',
    data: {
      planExecution: {
        uuid: 'puqa4ivwRzGDUrYJdrcPbg',
        createdAt: 1642671599437,
        planId: 'Jxslh-ffQEGkvqB_lrrjhQ',
        setupAbstractions: {
          accountId: 'px7xd_BFRCi-pfWPYXVjvw',
          orgIdentifier: 'default',
          projectIdentifier: 'Bhavya'
        },
        validUntil: 1658309999431 as unknown as undefined,
        status: 'RUNNING',
        startTs: 1642671599431,
        endTs: null as unknown as undefined,
        metadata: {
          runSequence: 3,
          triggerInfo: {
            triggerType: 'MANUAL',
            triggeredBy: {
              uuid: 'KrWK5MceTGyjLqLVRh3FCw',
              identifier: 'bhavya.sinha@harness.io',
              extraInfo: {
                email: 'bhavya.sinha@harness.io'
              }
            },
            isRerun: false
          },
          pipelineIdentifier: 'pipeline2',
          executionUuid: 'puqa4ivwRzGDUrYJdrcPbg',
          moduleType: 'cd',
          retryInfo: {
            isRetry: true,
            rootExecutionId: '5E3H4VokRkWXLnpYV2_u2A',
            parentRetryId: '5E3H4VokRkWXLnpYV2_u2A'
          }
        },
        lastUpdatedAt: 1642671599437,
        version: 0,

        nodeType: 'PLAN'
      }
    },
    metaData: null as unknown as undefined,
    correlationId: '915c7b2f-8a53-483f-878d-3741408fe03e'
  }
}

export const inputSetYAML = `pipeline:
  identifier: "First"
  variables:
    - name: "checkVariable1"
      type: "String"
      value: "<+input>"
    - name: "checkVariable2"
      type: "String"
      value: "<+input>"`

export const getUseRetryPipelineRequest = ({ isAllowAll }: { isAllowAll: boolean }) => ({
  identifier: 'pid',
  queryParamStringifyOptions: {
    arrayFormat: 'repeat'
  },
  queryParams: {
    accountIdentifier: 'acid',
    moduleType: 'ci',
    orgIdentifier: 'orgId',
    planExecutionId: '',
    projectIdentifier: 'prjid',
    retryStages: ['stage3', 'stage4'],
    runAllStages: isAllowAll
  },
  requestOptions: {
    headers: {
      'content-type': 'application/yaml'
    }
  }
})

export const mockValidateTemplateInputsOutOfSync: UseGetMockDataWithMutateAndRefetch<ResponseValidateTemplateInputsResponseDto> =
  {
    loading: false,
    refetch: jest.fn(),
    mutate: jest.fn(),
    data: {
      status: 'SUCCESS',
      data: {
        type: 'TemplateInputsErrorMetadataV2',
        validYaml: false,
        errorNodeSummary: {
          nodeInfo: {
            identifier: 'stagetplpipeline1',
            name: 'stage-tpl-pipeline-1'
          },
          childrenErrorNodes: []
        }
      },
      correlationId: '61812385-d410-47a0-8857-f1bafcb06b22'
    }
  }

export const mockValidateTemplateInputsInSync: UseGetMockDataWithMutateAndRefetch<ResponseValidateTemplateInputsResponseDto> =
  {
    loading: false,
    refetch: jest.fn(),
    mutate: jest.fn(),
    data: {
      status: 'SUCCESS',
      data: {
        type: 'TemplateInputsErrorMetadataV2',
        validYaml: true,
        errorNodeSummary: {}
      },
      correlationId: '61812385-d410-47a0-8857-f1bafcb06b22'
    }
  }
