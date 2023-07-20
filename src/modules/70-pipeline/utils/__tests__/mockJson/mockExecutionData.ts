/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { ResponsePipelineExecutionDetail } from 'services/pipeline-ng'

export const nodeDataBackgroundStep: ResponsePipelineExecutionDetail = {
  status: 'SUCCESS',
  data: {
    pipelineExecutionSummary: {
      pipelineIdentifier: 'BG_step',
      orgIdentifier: 'default',
      projectIdentifier: 'shauryaTest',
      planExecutionId: '8_ZYlKbDRRyNy1788ietCQ',
      name: 'BG step',
      status: 'Running',
      tags: [],
      executionTriggerInfo: {
        triggerType: 'MANUAL',
        triggeredBy: {
          uuid: 'tejPuoMCR12JyD1EZvak3w',
          identifier: 'Shaurya Kalia',
          extraInfo: {
            email: 'shaurya.kalia@harness.io'
          },
          triggerIdentifier: ''
        },
        isRerun: false
      },
      governanceMetadata: {
        id: '',
        deny: false,
        details: [],
        message: '',
        timestamp: '0',
        status: '',
        accountId: '',
        orgId: '',
        projectId: '',
        entity: '',
        type: '',
        action: '',
        created: '0'
      },
      moduleInfo: {
        ci: {
          ciPipelineStageModuleInfo: {
            stageExecutionId: 'pKhWPoVAQiyC35wgnQ86ww',
            stageId: 'build',
            stageName: 'build',
            cpuTime: 0,
            stageBuildTime: 0,
            infraType: 'HostedVm',
            osType: 'Linux',
            osArch: 'Arm64',
            startTs: 1689529261570,
            buildMultiplier: 1
          },
          imageDetailsList: [
            {
              imageName: 'redis',
              imageTag: ''
            }
          ],
          infraDetailsList: [
            {
              infraType: 'HostedVm',
              infraOSType: 'Linux',
              infraHostType: 'Harness Hosted',
              infraArchType: 'Arm64'
            }
          ],
          scmDetailsList: [],
          tiBuildDetailsList: []
        }
      },
      layoutNodeMap: {
        Q8PtFQynSqq2ObslgExe2A: {
          nodeType: 'PipelineRollback',
          nodeGroup: 'STAGE',
          nodeIdentifier: 'prb-xyiS6PNOQUaH0dwnETyJTg',
          name: 'Pipeline Rollback',
          nodeUuid: 'Q8PtFQynSqq2ObslgExe2A',
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
        'Rbllz9oaTW6ekT-EX7yAZA': {
          nodeType: 'CI',
          nodeGroup: 'STAGE',
          nodeIdentifier: 'build',
          name: 'build',
          nodeUuid: 'Rbllz9oaTW6ekT-EX7yAZA',
          status: 'Running',
          module: 'ci',
          moduleInfo: {
            ci: {}
          },
          startTs: 1689529261570,
          edgeLayoutList: {
            currentNodeChildren: [],
            nextIds: []
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
          nodeExecutionId: 'pKhWPoVAQiyC35wgnQ86ww',
          executionInputConfigured: false,
          isRollbackStageNode: false
        }
      },
      modules: ['pms', 'ci'],
      startingNodeId: 'Rbllz9oaTW6ekT-EX7yAZA',
      startTs: 1689529261042,
      createdAt: 1689529261081,
      canRetry: true,
      showRetryHistory: false,
      runSequence: 90,
      successfulStagesCount: 0,
      runningStagesCount: 1,
      failedStagesCount: 0,
      totalStagesCount: 1,
      storeType: 'INLINE',
      executionInputConfigured: false,
      parentStageInfo: {
        hasparentpipeline: false,
        stagenodeid: '',
        executionid: '',
        identifier: '',
        projectid: '',
        orgid: '',
        runsequence: 0
      },
      allowStageExecutions: false,
      executionMode: 'NORMAL',
      stagesExecution: false
    },
    executionGraph: {
      rootNodeId: 'pKhWPoVAQiyC35wgnQ86ww',
      nodeMap: {
        UlsrXckcQ6C_Mw5hiXHxSw: {
          uuid: 'UlsrXckcQ6C_Mw5hiXHxSw',
          setupId: 'Oorq9utZRt-4Oul80YAwwQ',
          name: 'Execution',
          identifier: 'execution',
          baseFqn: 'pipeline.stages.build.spec.execution',
          outcomes: {},
          stepParameters: undefined,
          startTs: 0,
          endTs: undefined,
          stepType: 'NG_EXECUTION',
          status: 'Running',
          failureInfo: undefined,
          skipInfo: undefined,
          nodeRunInfo: undefined,
          executableResponses: [
            {
              child: {
                childNodeId: 'Oorq9utZRt-4Oul80YAwwQsteps',
                logKeys: [],
                units: []
              }
            }
          ],
          unitProgresses: [],
          progressData: undefined,
          delegateInfoList: [],
          interruptHistories: [],
          stepDetails: undefined,
          strategyMetadata: undefined,
          executionInputConfigured: false,
          logBaseKey:
            'accountId:h61p38AZSV6MzEkpWWBtew/orgId:default/projectId:shauryaTest/pipelineId:BG_step/runSequence:90/level0:pipeline/level1:stages/level2:build/level3:spec/level4:execution'
        },
        y0yLJ2_7TRygLNaVMlWCJQ: {
          uuid: 'y0yLJ2_7TRygLNaVMlWCJQ',
          setupId: 'GlOUl_6BTqGzBGPvEQOGgQ',
          name: 'Run_2',
          identifier: 'Run_2',
          baseFqn: 'pipeline.stages.build.spec.execution.steps.Run_2',
          outcomes: {},
          stepParameters: {
            spec: {
              retry: 1,
              command: 'sleep 50\nredis-cli ping',
              image: 'redis',
              connectorRef: 'account.CItestDockerConnectoru65B3QlQdk',
              shell: 'SH'
            }
          },
          startTs: 1689529415737,
          endTs: undefined,
          stepType: 'Run',
          status: 'AsyncWaiting',
          failureInfo: undefined,
          skipInfo: undefined,
          nodeRunInfo: {
            whenCondition: '<+OnStageSuccess>',
            evaluatedCondition: true,
            expressions: [
              {
                expression: 'OnStageSuccess',
                expressionValue: 'true',
                count: 1
              }
            ]
          },
          executableResponses: [
            {
              async: {
                callbackIds: ['PSIXEw4NT7CIcsmvKbncbg-DEL'],
                logKeys: [
                  'accountId:h61p38AZSV6MzEkpWWBtew/orgId:default/projectId:shauryaTest/pipelineId:BG_step/runSequence:90/level0:pipeline/level1:stages/level2:build/level3:spec/level4:execution/level5:steps/level6:Run_2'
                ],
                units: [],
                timeout: 0,
                status: 'NO_OP'
              }
            }
          ],
          unitProgresses: [],
          progressData: undefined,
          delegateInfoList: [],
          interruptHistories: [],
          stepDetails: undefined,
          strategyMetadata: undefined,
          executionInputConfigured: false,
          logBaseKey:
            'accountId:h61p38AZSV6MzEkpWWBtew/orgId:default/projectId:shauryaTest/pipelineId:BG_step/runSequence:90/level0:pipeline/level1:stages/level2:build/level3:spec/level4:execution/level5:steps/level6:Run_2'
        },
        lYz9fURmRCenQXzLZBCZDQ: {
          uuid: 'lYz9fURmRCenQXzLZBCZDQ',
          setupId: 'bCviJq0BRaW1PpKQw3zo4w',
          name: 'Background_1',
          identifier: 'Background_1',
          baseFqn: 'pipeline.stages.build.spec.execution.steps.Background_1',
          outcomes: {},
          stepParameters: {
            spec: {
              retry: 1,
              image: 'redis',
              connectorRef: 'account.CItestDockerConnectoru65B3QlQdk',
              shell: 'SH',
              entrypoint: ['docker-entrypoint.sh', 'redis-server', '--loglevel debug']
            }
          },
          startTs: 1689529411117,
          endTs: 1689529415676,
          stepType: 'Background',
          status: 'Success',
          failureInfo: {
            message: '',
            failureTypeList: [],
            responseMessages: []
          },
          skipInfo: undefined,
          nodeRunInfo: {
            whenCondition: '<+OnStageSuccess>',
            evaluatedCondition: true,
            expressions: [
              {
                expression: 'OnStageSuccess',
                expressionValue: 'true',
                count: 1
              }
            ]
          },
          executableResponses: [
            {
              async: {
                callbackIds: ['OFBorq0WQvOGTyO6eVyn5g-DEL'],
                logKeys: [
                  'accountId:h61p38AZSV6MzEkpWWBtew/orgId:default/projectId:shauryaTest/pipelineId:BG_step/runSequence:90/level0:pipeline/level1:stages/level2:build/level3:spec/level4:execution/level5:steps/level6:Background_1'
                ],
                units: [],
                timeout: 0,
                status: 'NO_OP'
              }
            }
          ],
          unitProgresses: [],
          progressData: undefined,
          delegateInfoList: [],
          interruptHistories: [],
          stepDetails: undefined,
          strategyMetadata: undefined,
          executionInputConfigured: false,
          logBaseKey:
            'accountId:h61p38AZSV6MzEkpWWBtew/orgId:default/projectId:shauryaTest/pipelineId:BG_step/runSequence:90/level0:pipeline/level1:stages/level2:build/level3:spec/level4:execution/level5:steps/level6:Background_1'
        },
        pKhWPoVAQiyC35wgnQ86ww: {
          uuid: 'pKhWPoVAQiyC35wgnQ86ww',
          setupId: 'Rbllz9oaTW6ekT-EX7yAZA',
          name: 'build',
          identifier: 'build',
          baseFqn: 'pipeline.stages.build',
          outcomes: {},
          stepParameters: {
            variables: {},
            tags: {},
            specConfig: {
              infrastructure: {
                type: 'HOSTED_VM',
                spec: {
                  platform: {
                    os: 'Linux',
                    arch: 'Arm64'
                  }
                }
              },
              enableCloneRepo: false,
              stepIdentifiers: ['Background_1', 'Run_2'],
              childNodeID: 'Cz3D71D9RO2UqjgHYKwsNA',
              triggerPayload: {},
              cloneManually: false
            }
          },
          startTs: 1689529261570,
          endTs: undefined,
          stepType: 'IntegrationStageStepPMS',
          status: 'Running',
          failureInfo: undefined,
          skipInfo: undefined,
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
          executableResponses: [
            {
              child: {
                childNodeId: 'Cz3D71D9RO2UqjgHYKwsNA',
                logKeys: [],
                units: []
              }
            }
          ],
          unitProgresses: [],
          progressData: undefined,
          delegateInfoList: [],
          interruptHistories: [],
          stepDetails: undefined,
          strategyMetadata: undefined,
          executionInputConfigured: false,
          logBaseKey:
            'accountId:h61p38AZSV6MzEkpWWBtew/orgId:default/projectId:shauryaTest/pipelineId:BG_step/runSequence:90/level0:pipeline/level1:stages/level2:build'
        },
        'zFrRYBPwTU-0bp_eEABpgg': {
          uuid: 'zFrRYBPwTU-0bp_eEABpgg',
          setupId: 'yaVpqcETSeCdYEsywCsy1A',
          name: 'liteEngineTask',
          identifier: 'liteEngineTask',
          baseFqn: 'pipeline.stages.build.spec.execution.steps.liteEngineTask',
          outcomes: {
            vmDetailsOutcome: {},
            dependencies: {
              serviceDependencyList: []
            }
          },
          stepParameters: {
            spec: {
              timeout: 0,
              retry: 0,
              executionElementConfig: {
                steps: [
                  {
                    uuid: '3wwLgoQQT2qbNz0gvGiXqw',
                    step: {
                      identifier: 'Background_1',
                      type: 'Background',
                      name: 'Background_1',
                      spec: {
                        connectorRef: 'account.CItestDockerConnectoru65B3QlQdk',
                        image: 'redis',
                        shell: 'Sh',
                        entrypoint: ['docker-entrypoint.sh', 'redis-server', '--loglevel debug'],
                        __uuid: 'lsdUQOpHTV2dn8wUwbQYgQ'
                      },
                      description: 'background step',
                      __uuid: 'bCviJq0BRaW1PpKQw3zo4w'
                    },
                    parallel: {},
                    stepGroup: {}
                  },
                  {
                    uuid: 'ZeM2FS4_RvKxn6E56LU5Vg',
                    step: {
                      identifier: 'Run_2',
                      type: 'Run',
                      name: 'Run_2',
                      spec: {
                        connectorRef: 'account.CItestDockerConnectoru65B3QlQdk',
                        image: 'redis',
                        shell: 'Sh',
                        command: 'sleep 50\nredis-cli ping',
                        __uuid: 'HwRYtIypRpmqI1jJy2n5Nw'
                      },
                      description: 'echo',
                      __uuid: 'GlOUl_6BTqGzBGPvEQOGgQ'
                    },
                    parallel: {},
                    stepGroup: {}
                  }
                ]
              },
              stageIdentifier: 'build',
              stageElementConfig: {
                execution: {
                  steps: [
                    {
                      uuid: '3wwLgoQQT2qbNz0gvGiXqw',
                      step: {
                        identifier: 'Background_1',
                        type: 'Background',
                        name: 'Background_1',
                        spec: {
                          connectorRef: 'account.CItestDockerConnectoru65B3QlQdk',
                          image: 'redis',
                          shell: 'Sh',
                          entrypoint: ['docker-entrypoint.sh', 'redis-server', '--loglevel debug'],
                          __uuid: 'lsdUQOpHTV2dn8wUwbQYgQ'
                        },
                        description: 'background step',
                        __uuid: 'bCviJq0BRaW1PpKQw3zo4w'
                      },
                      parallel: {},
                      stepGroup: {}
                    },
                    {
                      uuid: 'ZeM2FS4_RvKxn6E56LU5Vg',
                      step: {
                        identifier: 'Run_2',
                        type: 'Run',
                        name: 'Run_2',
                        spec: {
                          connectorRef: 'account.CItestDockerConnectoru65B3QlQdk',
                          image: 'redis',
                          shell: 'Sh',
                          command: 'sleep 50\nredis-cli ping',
                          __uuid: 'HwRYtIypRpmqI1jJy2n5Nw'
                        },
                        description: 'echo',
                        __uuid: 'GlOUl_6BTqGzBGPvEQOGgQ'
                      },
                      parallel: {},
                      stepGroup: {}
                    }
                  ]
                },
                runtime: {
                  type: 'CLOUD',
                  spec: {}
                },
                platform: {
                  os: 'Linux',
                  arch: 'Arm64'
                },
                cloneCodebase: false
              },
              skipGitClone: true,
              infrastructure: {
                type: 'HOSTED_VM',
                spec: {
                  platform: {
                    os: 'Linux',
                    arch: 'Arm64'
                  }
                }
              }
            }
          },
          startTs: 1689529262212,
          endTs: 1689529411054,
          stepType: 'liteEngineTask',
          status: 'Success',
          failureInfo: {
            message: '',
            failureTypeList: [],
            responseMessages: []
          },
          skipInfo: undefined,
          nodeRunInfo: {
            whenCondition: '<+OnStageSuccess>',
            evaluatedCondition: true,
            expressions: [
              {
                expression: 'OnStageSuccess',
                expressionValue: 'true',
                count: 1
              }
            ]
          },
          executableResponses: [
            {
              async: {
                callbackIds: ['UMs_XvyHSrCwptAopm9gNQ-DEL'],
                logKeys: [
                  'accountId:h61p38AZSV6MzEkpWWBtew/orgId:default/projectId:shauryaTest/pipelineId:BG_step/runSequence:90/level0:pipeline/level1:stages/level2:build/level3:spec/level4:execution/level5:steps/level6:liteEngineTask'
                ],
                units: [],
                timeout: 0,
                status: 'NO_OP'
              }
            }
          ],
          unitProgresses: [],
          progressData: undefined,
          delegateInfoList: [],
          interruptHistories: [],
          stepDetails: {
            initStepV2DelegateTaskInfo: {}
          },
          strategyMetadata: undefined,
          executionInputConfigured: false,
          logBaseKey:
            'accountId:h61p38AZSV6MzEkpWWBtew/orgId:default/projectId:shauryaTest/pipelineId:BG_step/runSequence:90/level0:pipeline/level1:stages/level2:build/level3:spec/level4:execution/level5:steps/level6:liteEngineTask'
        }
      },
      nodeAdjacencyListMap: {
        UlsrXckcQ6C_Mw5hiXHxSw: {
          children: ['zFrRYBPwTU-0bp_eEABpgg'],
          nextIds: []
        },
        y0yLJ2_7TRygLNaVMlWCJQ: {
          children: [],
          nextIds: []
        },
        lYz9fURmRCenQXzLZBCZDQ: {
          children: [],
          nextIds: ['y0yLJ2_7TRygLNaVMlWCJQ']
        },
        pKhWPoVAQiyC35wgnQ86ww: {
          children: ['UlsrXckcQ6C_Mw5hiXHxSw'],
          nextIds: []
        },
        'zFrRYBPwTU-0bp_eEABpgg': {
          children: [],
          nextIds: ['lYz9fURmRCenQXzLZBCZDQ']
        }
      },
      executionMetadata: {
        accountId: 'h61p38AZSV6MzEkpWWBtew',
        pipelineIdentifier: 'BG_step',
        orgIdentifier: 'default',
        projectIdentifier: 'shauryaTest',
        planExecutionId: '8_ZYlKbDRRyNy1788ietCQ'
      },
      representationStrategy: 'camelCase'
    }
  },
  metaData: {},
  correlationId: '0edc385c-96ab-4b4a-ba29-7ebbcfd5735d'
}

export const backgroundStepId = 'lYz9fURmRCenQXzLZBCZDQ'
