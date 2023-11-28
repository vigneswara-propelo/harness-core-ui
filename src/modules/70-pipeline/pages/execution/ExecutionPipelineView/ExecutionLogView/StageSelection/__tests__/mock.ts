/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const executionContextMock = {
  childPipelineStagesMap: new Map([
    [
      '9WiPTVuaQUSqRC3HpC648w',
      {
        nodeType: 'Custom',
        nodeGroup: 'STAGE',
        nodeIdentifier: 'simpleMatrix_stable_v0',
        name: 'simpleMatrix_stable_v0',
        nodeUuid: 'WvjiiS6bTiWpU7-ZnTvPMw',
        status: 'Success',
        startTs: 1700773023401,
        endTs: 1700773075694,
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
        failureInfo: {
          message: ''
        },
        failureInfoDTO: {
          message: '',
          failureTypeList: [],
          responseMessages: []
        },
        nodeExecutionId: '9WiPTVuaQUSqRC3HpC648w',
        strategyMetadata: {
          currentiteration: 0,
          totaliterations: 1,
          matrixmetadata: {
            matrixvalues: {
              version: 'v0',
              tag: 'stable'
            },
            matrixcombination: [0, 0],
            subtype: '',
            matrixkeystoskipinname: [],
            nodename: ''
          },
          identifierpostfix: '_stable_v0'
        },
        isRollbackStageNode: false
      }
    ]
  ]),
  rollbackPipelineStagesMap: new Map([]),
  allStagesMap: new Map([
    [
      'FtGZN4Y6Q-eN_ZaUyijodQ',
      {
        nodeType: 'Pipeline',
        nodeGroup: 'STAGE',
        nodeIdentifier: 'stage_root',
        name: 'stage_root',
        nodeUuid: 'FtGZN4Y6Q-eN_ZaUyijodQ',
        status: 'Success',
        module: 'pms',
        moduleInfo: {
          pms: {}
        },
        startTs: 1700773019489,
        endTs: 1700773077318,
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
        failureInfo: {
          message: ''
        },
        failureInfoDTO: {
          message: '',
          failureTypeList: [],
          responseMessages: []
        },
        nodeExecutionId: 'biFkLOD0TgGW8wB8bxhVPg',
        executionInputConfigured: false,
        isRollbackStageNode: false
      }
    ]
  ]),
  allNodeMap: {
    '9WiPTVuaQUSqRC3HpC648w': {
      uuid: '9WiPTVuaQUSqRC3HpC648w',
      setupId: 'WvjiiS6bTiWpU7-ZnTvPMw',
      name: 'simpleMatrix_stable_v0',
      identifier: 'simpleMatrix_stable_v0',
      baseFqn: 'pipeline.stages.simpleMatrix_stable_v0',
      outcomes: {},
      stepParameters: {
        identifier: 'simpleMatrix_stable_v0',
        name: 'simpleMatrix_stable_v0',
        description: '',
        variables: {},
        tags: {},
        type: 'Custom',
        specConfig: { childNodeID: '3JmU8K69QmuA9vffwf_Xig' },
        timeout: '35d'
      },
      startTs: 1700773023401,
      endTs: 1700773075694,
      stepType: 'CUSTOM_STAGE',
      status: 'Success',
      failureInfo: { message: '', failureTypeList: [], responseMessages: [] },
      skipInfo: null,
      nodeRunInfo: {
        whenCondition: '<+OnPipelineSuccess>',
        evaluatedCondition: true,
        expressions: [{ expression: 'OnPipelineSuccess', expressionValue: 'true', count: 1 }]
      },
      executableResponses: [{ child: { childNodeId: '3JmU8K69QmuA9vffwf_Xig', logKeys: [], units: [] } }],
      unitProgresses: [],
      progressData: { unitProgresses: [] },
      delegateInfoList: [],
      interruptHistories: [],
      stepDetails: null,
      strategyMetadata: {
        currentiteration: 0,
        totaliterations: 1,
        matrixmetadata: {
          matrixvalues: { version: 'v0', tag: 'stable' },
          matrixcombination: [0, 0],
          subtype: '',
          matrixkeystoskipinname: [],
          nodename: ''
        },
        identifierpostfix: '_stable_v0'
      },
      executionInputConfigured: false,
      logBaseKey:
        'px7xd_BFRCi-pfWPYXVjvw/pipeline/normalMatrixSGStep/1/-nXZv8WhfTp6lbVXNKZV-LQ/simpleMatrix/simpleMatrix_stable_v0'
    },
    _pSlx30hQbWuhzTrjMBy2Q: {
      uuid: '_pSlx30hQbWuhzTrjMBy2Q',
      setupId: 'zdR9qb4ZS1aiEPfrWX2TBA',
      name: 'stepGroup1_stable_v0',
      identifier: 'stepGroup1_stable_v0',
      baseFqn: 'pipeline.stages.simpleMatrix_stable_v0.spec.execution.steps.stepGroup1_stable_v0',
      outcomes: {},
      stepParameters: {
        identifier: 'stepGroup1_stable_v0',
        name: 'stepGroup1_stable_v0',
        childNodeID: 'B0r54_BaRyiHi8zsFAFS_Qsteps',
        variables: {}
      },
      startTs: 1700773046552,
      endTs: 1700773062720,
      stepType: 'STEP_GROUP',
      status: 'Success',
      failureInfo: { message: '', failureTypeList: [], responseMessages: [] },
      skipInfo: null,
      nodeRunInfo: {
        whenCondition: '<+OnStageSuccess>',
        evaluatedCondition: true,
        expressions: [{ expression: 'OnStageSuccess', expressionValue: 'true', count: 1 }]
      },
      executableResponses: [{ child: { childNodeId: 'B0r54_BaRyiHi8zsFAFS_Qsteps', logKeys: [], units: [] } }],
      unitProgresses: [],
      progressData: { unitProgresses: [] },
      delegateInfoList: [],
      interruptHistories: [],
      stepDetails: null,
      strategyMetadata: {
        currentiteration: 0,
        totaliterations: 1,
        matrixmetadata: {
          matrixvalues: { version: 'v0', tag: 'stable' },
          matrixcombination: [0, 0],
          subtype: '',
          matrixkeystoskipinname: [],
          nodename: ''
        },
        identifierpostfix: '_stable_v0'
      },
      executionInputConfigured: false,
      logBaseKey:
        'px7xd_BFRCi-pfWPYXVjvw/pipeline/normalMatrixSGStep/1/-nXZv8WhfTp6lbVXNKZV-LQ/simpleMatrix/simpleMatrix_stable_v0/stepGroup1/stepGroup1_stable_v0'
    },
    zSle8k4_Qq2CpTAj2yT4uw: {
      uuid: 'zSle8k4_Qq2CpTAj2yT4uw',
      setupId: '7A1tDTKWR2C0L9th6XeZ3g',
      name: 'ShellScript_1_stable_v0',
      identifier: 'ShellScript_1_stable_v0',
      baseFqn: 'pipeline.stages.simpleMatrix_stable_v0.spec.execution.steps.ShellScript_1_stable_v0',
      outcomes: { output: { outputVariables: {} } },
      stepParameters: {
        identifier: 'ShellScript_1_stable_v0',
        name: 'ShellScript_1_stable_v0',
        timeout: '10m',
        type: 'ShellScript',
        spec: {
          outputVariables: {},
          environmentVariables: {},
          shell: 'Bash',
          source: { type: 'Inline', spec: { script: 'echo 1' } },
          onDelegate: true
        }
      },
      startTs: 1700773064427,
      endTs: 1700773067709,
      stepType: 'ShellScript',
      status: 'Success',
      failureInfo: { message: '', failureTypeList: [], responseMessages: [] },
      skipInfo: null,
      nodeRunInfo: {
        whenCondition: '<+OnStageSuccess>',
        evaluatedCondition: true,
        expressions: [{ expression: 'OnStageSuccess', expressionValue: 'true', count: 1 }]
      },
      executableResponses: [
        {
          task: {
            taskId: '4NJD9li0QBG7piut32Ac5w-DEL',
            taskCategory: 'DELEGATE_TASK_V2',
            logKeys: [
              'px7xd_BFRCi-pfWPYXVjvw/pipeline/normalMatrixSGStep/1/-nXZv8WhfTp6lbVXNKZV-LQ/simpleMatrix/simpleMatrix_stable_v0/ShellScript_1/ShellScript_1_stable_v0-commandUnit:Execute'
            ],
            units: [],
            taskName: 'SHELL_SCRIPT_TASK_NG'
          }
        }
      ],
      unitProgresses: [
        { unitName: 'Execute', status: 'SUCCESS', startTime: '1700773065014', endTime: '1700773065021' }
      ],
      progressData: {
        unitProgresses: [
          { unitName: 'Execute', status: 'SUCCESS', startTime: '1700773065014', endTime: '1700773065021' }
        ]
      },
      delegateInfoList: [
        {
          id: 'lZg8_f2NQpOQQd-KC8Wrog',
          name: 'kubernetes-delegate-idp',
          taskId: '4NJD9li0QBG7piut32Ac5w-DEL',
          taskName: 'SHELL_SCRIPT_TASK_NG'
        }
      ],
      interruptHistories: [],
      stepDetails: null,
      strategyMetadata: {
        currentiteration: 0,
        totaliterations: 1,
        matrixmetadata: {
          matrixvalues: { version: 'v0', tag: 'stable' },
          matrixcombination: [0, 0],
          subtype: '',
          matrixkeystoskipinname: [],
          nodename: ''
        },
        identifierpostfix: '_stable_v0'
      },
      executionInputConfigured: false,
      logBaseKey:
        'px7xd_BFRCi-pfWPYXVjvw/pipeline/normalMatrixSGStep/1/-nXZv8WhfTp6lbVXNKZV-LQ/simpleMatrix/simpleMatrix_stable_v0/ShellScript_1/ShellScript_1_stable_v0'
    },
    '7R_7tQ3ZQnWhLuzSAhH_pQ': {
      uuid: '7R_7tQ3ZQnWhLuzSAhH_pQ',
      setupId: 'tOhrt9nOQGC-5-FbXJCreQ',
      name: 'Execution',
      identifier: 'execution',
      baseFqn: 'pipeline.stages.simpleMatrix_stable_v0.spec.execution',
      outcomes: {},
      stepParameters: { childNodeId: 'tOhrt9nOQGC-5-FbXJCreQsteps', logMessage: 'Execution Element' },
      startTs: 1700773034760,
      endTs: 1700773069450,
      stepType: 'NG_SECTION_WITH_ROLLBACK_INFO',
      status: 'Success',
      failureInfo: { message: '', failureTypeList: [], responseMessages: [] },
      skipInfo: null,
      nodeRunInfo: null,
      executableResponses: [{ child: { childNodeId: 'tOhrt9nOQGC-5-FbXJCreQsteps', logKeys: [], units: [] } }],
      unitProgresses: [],
      progressData: { unitProgresses: [] },
      delegateInfoList: [],
      interruptHistories: [],
      stepDetails: null,
      strategyMetadata: null,
      executionInputConfigured: false,
      logBaseKey:
        'px7xd_BFRCi-pfWPYXVjvw/pipeline/normalMatrixSGStep/1/-nXZv8WhfTp6lbVXNKZV-LQ/simpleMatrix/simpleMatrix_stable_v0'
    },
    sVDYWQMiTSqKRSfNVz40tg: {
      uuid: 'sVDYWQMiTSqKRSfNVz40tg',
      setupId: 'Zx7iNO3PTHmAEsnFBa9Hqg',
      name: 'ShellScript_1_stable_v0',
      identifier: 'ShellScript_1_stable_v0',
      baseFqn:
        'pipeline.stages.simpleMatrix_stable_v0.spec.execution.steps.stepGroup1_stable_v0.steps.ShellScript_1_stable_v0',
      outcomes: { output: { outputVariables: {} } },
      stepParameters: {
        identifier: 'ShellScript_1_stable_v0',
        name: 'ShellScript_1_stable_v0',
        timeout: '10m',
        type: 'ShellScript',
        spec: {
          outputVariables: {},
          environmentVariables: {},
          shell: 'Bash',
          source: { type: 'Inline', spec: { script: 'echo 1' } },
          onDelegate: true
        }
      },
      startTs: 1700773048318,
      endTs: 1700773061934,
      stepType: 'ShellScript',
      status: 'Success',
      failureInfo: { message: '', failureTypeList: [], responseMessages: [] },
      skipInfo: null,
      nodeRunInfo: {
        whenCondition: '<+OnStageSuccess>',
        evaluatedCondition: true,
        expressions: [{ expression: 'OnStageSuccess', expressionValue: 'true', count: 1 }]
      },
      executableResponses: [
        {
          task: {
            taskId: '73nFabkQQFuEYJWy1zJVeA-DEL',
            taskCategory: 'DELEGATE_TASK_V2',
            logKeys: [
              'px7xd_BFRCi-pfWPYXVjvw/pipeline/normalMatrixSGStep/1/-nXZv8WhfTp6lbVXNKZV-LQ/simpleMatrix/simpleMatrix_stable_v0/stepGroup1/stepGroup1_stable_v0/ShellScript_1/ShellScript_1_stable_v0-commandUnit:Execute'
            ],
            units: [],
            taskName: 'SHELL_SCRIPT_TASK_NG'
          }
        }
      ],
      unitProgresses: [
        { unitName: 'Execute', status: 'SUCCESS', startTime: '1700773059202', endTime: '1700773059401' }
      ],
      progressData: {
        unitProgresses: [
          { unitName: 'Execute', status: 'SUCCESS', startTime: '1700773059202', endTime: '1700773059401' }
        ]
      },
      delegateInfoList: [
        {
          id: 'Ul1wDI2QT4eyUZwTXKtrXg',
          name: 'kubernetes-delegate',
          taskId: '73nFabkQQFuEYJWy1zJVeA-DEL',
          taskName: 'SHELL_SCRIPT_TASK_NG'
        }
      ],
      interruptHistories: [],
      stepDetails: null,
      strategyMetadata: {
        currentiteration: 0,
        totaliterations: 1,
        matrixmetadata: {
          matrixvalues: { version: 'v0', tag: 'stable' },
          matrixcombination: [0, 0],
          subtype: '',
          matrixkeystoskipinname: [],
          nodename: ''
        },
        identifierpostfix: '_stable_v0'
      },
      executionInputConfigured: false,
      logBaseKey:
        'px7xd_BFRCi-pfWPYXVjvw/pipeline/normalMatrixSGStep/1/-nXZv8WhfTp6lbVXNKZV-LQ/simpleMatrix/simpleMatrix_stable_v0/stepGroup1/stepGroup1_stable_v0/ShellScript_1/ShellScript_1_stable_v0'
    },
    C2jE_zTxQKiTrlj22UrfkQ: {
      uuid: 'C2jE_zTxQKiTrlj22UrfkQ',
      setupId: 'U_JLlZc0TUyvY18UrtaEEw',
      name: 'ShellScript_1',
      identifier: 'ShellScript_1',
      baseFqn: 'pipeline.stages.simpleMatrix_stable_v0.spec.execution.steps.stepGroup1_stable_v0.steps',
      outcomes: {},
      stepParameters: {
        strategyConfig: {
          matrixConfig: {
            uuid: 'etWpYK7FTqKnxT17I4Xfnw',
            axes: { tag: { axisValue: ['stable'] }, version: { axisValue: ['v0'] } },
            expressionAxes: {}
          }
        },
        childNodeId: 'Zx7iNO3PTHmAEsnFBa9Hqg',
        strategyType: 'MATRIX',
        shouldProceedIfFailed: true
      },
      startTs: 1700773047535,
      endTs: 1700773062197,
      stepType: 'STRATEGY',
      status: 'Success',
      failureInfo: { message: '', failureTypeList: [], responseMessages: [] },
      skipInfo: null,
      nodeRunInfo: null,
      executableResponses: [
        {
          children: {
            children: [
              {
                childNodeId: 'Zx7iNO3PTHmAEsnFBa9Hqg',
                strategyMetadata: {
                  currentIteration: 0,
                  totalIterations: 1,
                  matrixMetadata: {
                    matrixValues: { version: 'v0', tag: 'stable' },
                    matrixCombination: [0, 0],
                    subType: '',
                    matrixKeysToSkipInName: [],
                    nodeName: ''
                  },
                  identifierPostFix: '_stable_v0'
                }
              }
            ],
            maxConcurrency: '1',
            logKeys: [],
            shouldProceedIfFailed: true,
            units: []
          }
        }
      ],
      unitProgresses: [],
      progressData: { unitProgresses: [] },
      delegateInfoList: [],
      interruptHistories: [],
      stepDetails: null,
      strategyMetadata: null,
      executionInputConfigured: false,
      logBaseKey:
        'px7xd_BFRCi-pfWPYXVjvw/pipeline/normalMatrixSGStep/1/-nXZv8WhfTp6lbVXNKZV-LQ/simpleMatrix/simpleMatrix_stable_v0/stepGroup1/stepGroup1_stable_v0/ShellScript_1'
    },
    bkVPnit7Qai2sf9Lhm04EQ: {
      uuid: 'bkVPnit7Qai2sf9Lhm04EQ',
      setupId: 'B0r54_BaRyiHi8zsFAFS_Q',
      name: 'stepGroup1',
      identifier: 'stepGroup1',
      baseFqn: 'pipeline.stages.simpleMatrix_stable_v0.spec.execution.steps',
      outcomes: {},
      stepParameters: {
        strategyConfig: {
          matrixConfig: {
            uuid: 'wcCKxMudQvqihl1qYTpgew',
            axes: { tag: { axisValue: ['stable'] }, version: { axisValue: ['v0'] } },
            expressionAxes: {}
          }
        },
        childNodeId: 'zdR9qb4ZS1aiEPfrWX2TBA',
        strategyType: 'MATRIX',
        shouldProceedIfFailed: true
      },
      startTs: 1700773045810,
      endTs: 1700773063142,
      stepType: 'STRATEGY',
      status: 'Success',
      failureInfo: { message: '', failureTypeList: [], responseMessages: [] },
      skipInfo: null,
      nodeRunInfo: null,
      executableResponses: [
        {
          children: {
            children: [
              {
                childNodeId: 'zdR9qb4ZS1aiEPfrWX2TBA',
                strategyMetadata: {
                  currentIteration: 0,
                  totalIterations: 1,
                  matrixMetadata: {
                    matrixValues: { version: 'v0', tag: 'stable' },
                    matrixCombination: [0, 0],
                    subType: '',
                    matrixKeysToSkipInName: [],
                    nodeName: ''
                  },
                  identifierPostFix: '_stable_v0'
                }
              }
            ],
            maxConcurrency: '1',
            logKeys: [],
            shouldProceedIfFailed: true,
            units: []
          }
        }
      ],
      unitProgresses: [],
      progressData: { unitProgresses: [] },
      delegateInfoList: [],
      interruptHistories: [],
      stepDetails: null,
      strategyMetadata: null,
      executionInputConfigured: false,
      logBaseKey:
        'px7xd_BFRCi-pfWPYXVjvw/pipeline/normalMatrixSGStep/1/-nXZv8WhfTp6lbVXNKZV-LQ/simpleMatrix/simpleMatrix_stable_v0/stepGroup1'
    },
    'Dtg-e4WIS3iOQ7jkTlmjpw': {
      uuid: 'Dtg-e4WIS3iOQ7jkTlmjpw',
      setupId: 'uZyZU3ecRLaoiBjUCliajg',
      name: 'ShellScript_1',
      identifier: 'ShellScript_1',
      baseFqn: 'pipeline.stages.simpleMatrix_stable_v0.spec.execution.steps',
      outcomes: {},
      stepParameters: {
        strategyConfig: {
          matrixConfig: {
            uuid: 'fajC0-MAQdmgtlEMpjLfoA',
            axes: { tag: { axisValue: ['stable'] }, version: { axisValue: ['v0'] } },
            expressionAxes: {}
          }
        },
        childNodeId: '7A1tDTKWR2C0L9th6XeZ3g',
        strategyType: 'MATRIX',
        shouldProceedIfFailed: true
      },
      startTs: 1700773063636,
      endTs: 1700773067970,
      stepType: 'STRATEGY',
      status: 'Success',
      failureInfo: { message: '', failureTypeList: [], responseMessages: [] },
      skipInfo: null,
      nodeRunInfo: null,
      executableResponses: [
        {
          children: {
            children: [
              {
                childNodeId: '7A1tDTKWR2C0L9th6XeZ3g',
                strategyMetadata: {
                  currentIteration: 0,
                  totalIterations: 1,
                  matrixMetadata: {
                    matrixValues: { version: 'v0', tag: 'stable' },
                    matrixCombination: [0, 0],
                    subType: '',
                    matrixKeysToSkipInName: [],
                    nodeName: ''
                  },
                  identifierPostFix: '_stable_v0'
                }
              }
            ],
            maxConcurrency: '1',
            logKeys: [],
            shouldProceedIfFailed: true,
            units: []
          }
        }
      ],
      unitProgresses: [],
      progressData: { unitProgresses: [] },
      delegateInfoList: [],
      interruptHistories: [],
      stepDetails: null,
      strategyMetadata: null,
      executionInputConfigured: false,
      logBaseKey:
        'px7xd_BFRCi-pfWPYXVjvw/pipeline/normalMatrixSGStep/1/-nXZv8WhfTp6lbVXNKZV-LQ/simpleMatrix/simpleMatrix_stable_v0/ShellScript_1'
    }
  },

  pipelineExecutionDetail: {
    pipelineExecutionSummary: {
      pipelineIdentifier: 'childPipelineWithMatrixScenarioStage',
      orgIdentifier: 'default',
      projectIdentifier: 'Pratyush_TestZone',
      planExecutionId: 'o5Uh21MURyukP5P18wu9JQ',
      name: 'childPipelineWithMatrixScenarioStage',
      yamlVersion: '0',
      status: 'Success',
      tags: [],
      executionTriggerInfo: {
        triggerType: 'MANUAL',
        triggeredBy: {
          uuid: 'qUaLKpHcTOS3ThJVG2bwIw',
          identifier: 'Pratyush Garg',
          extraInfo: { email: 'pratyush.garg@harness.io' },
          triggerIdentifier: '',
          triggerName: ''
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
      moduleInfo: {},
      layoutNodeMap: {
        IbMr6zcrSXyC3ax_XsADdQ: {
          nodeType: 'PipelineRollback',
          nodeGroup: 'STAGE',
          nodeIdentifier: 'prb-thdc5oNtQLOGZ2ThjPIhrA',
          name: 'Pipeline Rollback',
          nodeUuid: 'IbMr6zcrSXyC3ax_XsADdQ',
          status: 'NotStarted',
          module: 'pms',
          moduleInfo: { pms: {} },
          edgeLayoutList: { currentNodeChildren: [], nextIds: [] },
          isRollbackStageNode: false
        },
        'FtGZN4Y6Q-eN_ZaUyijodQ': {
          nodeType: 'Pipeline',
          nodeGroup: 'STAGE',
          nodeIdentifier: 'stage_root',
          name: 'stage_root',
          nodeUuid: 'FtGZN4Y6Q-eN_ZaUyijodQ',
          status: 'Success',
          module: 'pms',
          moduleInfo: { pms: {} },
          startTs: 1700773019489,
          endTs: 1700773077318,
          edgeLayoutList: { currentNodeChildren: [], nextIds: [] },
          nodeRunInfo: {
            whenCondition: '<+OnPipelineSuccess>',
            evaluatedCondition: true,
            expressions: [{ expression: 'OnPipelineSuccess', expressionValue: 'true', count: 1 }]
          },
          failureInfo: { message: '' },
          failureInfoDTO: { message: '', failureTypeList: [], responseMessages: [] },
          nodeExecutionId: 'biFkLOD0TgGW8wB8bxhVPg',
          executionInputConfigured: false,
          isRollbackStageNode: false
        }
      },
      modules: ['pms'],
      startingNodeId: 'FtGZN4Y6Q-eN_ZaUyijodQ',
      startTs: 1700773017475,
      endTs: 1700773078058,
      createdAt: 1700773017798,
      canRetry: true,
      showRetryHistory: false,
      runSequence: 1,
      successfulStagesCount: 1,
      runningStagesCount: 0,
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
      notesExistForPlanExecutionId: false,
      shouldUseSimplifiedKey: true,
      stagesExecution: false
    },
    childGraph: {
      pipelineExecutionSummary: {
        pipelineIdentifier: 'normalMatrixSGStep',
        orgIdentifier: 'default',
        projectIdentifier: 'Pratyush_TestZone',
        planExecutionId: 'nXZv8WhfTp6lbVXNKZV-LQ',
        name: 'normalMatrixSGStep',
        yamlVersion: '0',
        status: 'Success',
        tags: [],
        executionTriggerInfo: {
          triggerType: 'MANUAL',
          triggeredBy: {
            uuid: 'qUaLKpHcTOS3ThJVG2bwIw',
            identifier: 'Pratyush Garg',
            extraInfo: { email: 'pratyush.garg@harness.io' },
            triggerIdentifier: '',
            triggerName: ''
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
        moduleInfo: {},
        layoutNodeMap: {
          'OarHr79fSFWQvJz-810NZA': {
            nodeType: 'MATRIX',
            nodeGroup: 'STRATEGY',
            nodeIdentifier: 'simpleMatrix',
            name: 'simpleMatrix',
            nodeUuid: 'OarHr79fSFWQvJz-810NZA',
            status: 'Success',
            moduleInfo: {
              maxConcurrency: { value: 1 },
              stepParameters: {
                __recast: 'io.harness.steps.matrix.StrategyStepParameters',
                strategyConfig: {
                  __recast: 'io.harness.plancreator.strategy.StrategyConfig',
                  uuid: 'WvjiiS6bTiWpU7-ZnTvPMw',
                  matrixConfig: {
                    __recast: 'parameterField',
                    __encodedValue: {
                      __recast: 'io.harness.pms.yaml.ParameterDocumentField',
                      expressionValue: null,
                      expression: false,
                      valueDoc: {
                        __recast: 'io.harness.pms.yaml.ParameterFieldValueWrapper',
                        value: {
                          __recast: 'io.harness.plancreator.strategy.MatrixConfig',
                          uuid: '8mxMy7lLSqOpdJXb5DEUaQ',
                          axes: {
                            tag: {
                              __recast: 'io.harness.plancreator.strategy.AxisConfig',
                              axisValue: {
                                __recast: 'parameterField',
                                __encodedValue: {
                                  __recast: 'io.harness.pms.yaml.ParameterDocumentField',
                                  expressionValue: null,
                                  expression: false,
                                  valueDoc: {
                                    __recast: 'io.harness.pms.yaml.ParameterFieldValueWrapper',
                                    value: ['stable']
                                  },
                                  valueClass: 'java.util.List',
                                  typeString: false,
                                  skipAutoEvaluation: false,
                                  jsonResponseField: false,
                                  responseField: null
                                }
                              }
                            },
                            version: {
                              __recast: 'io.harness.plancreator.strategy.AxisConfig',
                              axisValue: {
                                __recast: 'parameterField',
                                __encodedValue: {
                                  __recast: 'io.harness.pms.yaml.ParameterDocumentField',
                                  expressionValue: null,
                                  expression: false,
                                  valueDoc: {
                                    __recast: 'io.harness.pms.yaml.ParameterFieldValueWrapper',
                                    value: ['v0']
                                  },
                                  valueClass: 'java.util.List',
                                  typeString: false,
                                  skipAutoEvaluation: false,
                                  jsonResponseField: false,
                                  responseField: null
                                }
                              }
                            }
                          },
                          expressionAxes: {},
                          exclude: {
                            __recast: 'parameterField',
                            __encodedValue: {
                              __recast: 'io.harness.pms.yaml.ParameterDocumentField',
                              expressionValue: null,
                              expression: false,
                              valueDoc: { __recast: 'io.harness.pms.yaml.ParameterFieldValueWrapper' },
                              valueClass: 'java.util.List',
                              typeString: false,
                              skipAutoEvaluation: false,
                              jsonResponseField: false,
                              responseField: null
                            }
                          },
                          maxConcurrency: {
                            __recast: 'parameterField',
                            __encodedValue: {
                              __recast: 'io.harness.pms.yaml.ParameterDocumentField',
                              expressionValue: null,
                              expression: false,
                              valueDoc: { __recast: 'io.harness.pms.yaml.ParameterFieldValueWrapper' },
                              valueClass: 'java.lang.Integer',
                              typeString: false,
                              skipAutoEvaluation: false,
                              jsonResponseField: false,
                              responseField: null
                            }
                          },
                          nodeName: {
                            __recast: 'parameterField',
                            __encodedValue: {
                              __recast: 'io.harness.pms.yaml.ParameterDocumentField',
                              expressionValue: null,
                              expression: false,
                              valueDoc: { __recast: 'io.harness.pms.yaml.ParameterFieldValueWrapper' },
                              valueClass: 'java.lang.String',
                              typeString: false,
                              skipAutoEvaluation: true,
                              jsonResponseField: false,
                              responseField: null
                            }
                          }
                        }
                      },
                      valueClass: 'io.harness.plancreator.strategy.MatrixConfigInterface',
                      typeString: false,
                      skipAutoEvaluation: false,
                      jsonResponseField: false,
                      responseField: null
                    }
                  },
                  parallelism: {
                    __recast: 'parameterField',
                    __encodedValue: {
                      __recast: 'io.harness.pms.yaml.ParameterDocumentField',
                      expressionValue: null,
                      expression: false,
                      valueDoc: { __recast: 'io.harness.pms.yaml.ParameterFieldValueWrapper' },
                      valueClass: 'java.lang.Integer',
                      typeString: false,
                      skipAutoEvaluation: false,
                      jsonResponseField: false,
                      responseField: null
                    }
                  }
                },
                childNodeId: 'WvjiiS6bTiWpU7-ZnTvPMw',
                maxConcurrency: {
                  __recast: 'parameterField',
                  __encodedValue: {
                    __recast: 'io.harness.pms.yaml.ParameterDocumentField',
                    expressionValue: null,
                    expression: false,
                    valueDoc: { __recast: 'io.harness.pms.yaml.ParameterFieldValueWrapper' },
                    valueClass: 'java.lang.Integer',
                    typeString: false,
                    skipAutoEvaluation: false,
                    jsonResponseField: false,
                    responseField: null
                  }
                },
                strategyType: 'MATRIX',
                shouldProceedIfFailed: true
              }
            },
            startTs: 1700773022669,
            endTs: 1700773075993,
            edgeLayoutList: { currentNodeChildren: ['9WiPTVuaQUSqRC3HpC648w'], nextIds: [] },
            failureInfo: { message: '' },
            isRollbackStageNode: false
          },
          'WvjiiS6bTiWpU7-ZnTvPMw': {
            nodeType: 'Custom',
            nodeGroup: 'STAGE',
            nodeIdentifier: 'simpleMatrix',
            name: 'simpleMatrix',
            nodeUuid: 'WvjiiS6bTiWpU7-ZnTvPMw',
            status: 'NotStarted',
            module: 'pms',
            moduleInfo: { pms: {} },
            edgeLayoutList: { currentNodeChildren: [], nextIds: [] },
            isRollbackStageNode: false
          },
          K8thhP4uT7meZ5cbYaP8ZQ: {
            nodeType: 'PipelineRollback',
            nodeGroup: 'STAGE',
            nodeIdentifier: 'prb-XcbFDUTsQ2GxyvUjzm_qpA',
            name: 'Pipeline Rollback',
            nodeUuid: 'K8thhP4uT7meZ5cbYaP8ZQ',
            status: 'NotStarted',
            module: 'pms',
            moduleInfo: { pms: {} },
            edgeLayoutList: { currentNodeChildren: [], nextIds: [] },
            isRollbackStageNode: false
          },
          '9WiPTVuaQUSqRC3HpC648w': {
            nodeType: 'Custom',
            nodeGroup: 'STAGE',
            nodeIdentifier: 'simpleMatrix_stable_v0',
            name: 'simpleMatrix_stable_v0',
            nodeUuid: 'WvjiiS6bTiWpU7-ZnTvPMw',
            status: 'Success',
            startTs: 1700773023401,
            endTs: 1700773075694,
            edgeLayoutList: { currentNodeChildren: [], nextIds: [] },
            nodeRunInfo: {
              whenCondition: '<+OnPipelineSuccess>',
              evaluatedCondition: true,
              expressions: [{ expression: 'OnPipelineSuccess', expressionValue: 'true', count: 1 }]
            },
            failureInfo: { message: '' },
            failureInfoDTO: { message: '', failureTypeList: [], responseMessages: [] },
            nodeExecutionId: '9WiPTVuaQUSqRC3HpC648w',
            strategyMetadata: {
              currentiteration: 0,
              totaliterations: 1,
              matrixmetadata: {
                matrixvalues: { version: 'v0', tag: 'stable' },
                matrixcombination: [0, 0],
                subtype: '',
                matrixkeystoskipinname: [],
                nodename: ''
              },
              // Not idealistic, but for jest added in the same object
              formetadata: {
                value: 'brave',
                partition: []
              },
              identifierpostfix: '_stable_v0'
            },
            isRollbackStageNode: false
          }
        },
        modules: ['pms'],
        startingNodeId: 'OarHr79fSFWQvJz-810NZA',
        startTs: 1700773020773,
        endTs: 1700773076699,
        createdAt: 1700773021087,
        canRetry: true,
        showRetryHistory: false,
        runSequence: 1,
        successfulStagesCount: 1,
        runningStagesCount: 0,
        failedStagesCount: 0,
        totalStagesCount: 1,
        storeType: 'INLINE',
        executionInputConfigured: false,
        parentStageInfo: {
          hasparentpipeline: true,
          stagenodeid: 'FtGZN4Y6Q-eN_ZaUyijodQ',
          executionid: 'o5Uh21MURyukP5P18wu9JQ',
          identifier: 'childPipelineWithMatrixScenarioStage',
          projectid: 'Pratyush_TestZone',
          orgid: 'default',
          runsequence: 1
        },
        allowStageExecutions: true,
        executionMode: 'NORMAL',
        notesExistForPlanExecutionId: false,
        shouldUseSimplifiedKey: true,
        stagesExecution: false
      },
      executionGraph: {
        rootNodeId: '9WiPTVuaQUSqRC3HpC648w',
        nodeMap: {
          '9WiPTVuaQUSqRC3HpC648w': {
            uuid: '9WiPTVuaQUSqRC3HpC648w',
            setupId: 'WvjiiS6bTiWpU7-ZnTvPMw',
            name: 'simpleMatrix_stable_v0',
            identifier: 'simpleMatrix_stable_v0',
            baseFqn: 'pipeline.stages.simpleMatrix_stable_v0',
            outcomes: {},
            stepParameters: {
              identifier: 'simpleMatrix_stable_v0',
              name: 'simpleMatrix_stable_v0',
              description: '',
              variables: {},
              tags: {},
              type: 'Custom',
              specConfig: { childNodeID: '3JmU8K69QmuA9vffwf_Xig' },
              timeout: '35d'
            },
            startTs: 1700773023401,
            endTs: 1700773075694,
            stepType: 'CUSTOM_STAGE',
            status: 'Success',
            failureInfo: { message: '', failureTypeList: [], responseMessages: [] },
            skipInfo: null,
            nodeRunInfo: {
              whenCondition: '<+OnPipelineSuccess>',
              evaluatedCondition: true,
              expressions: [{ expression: 'OnPipelineSuccess', expressionValue: 'true', count: 1 }]
            },
            executableResponses: [{ child: { childNodeId: '3JmU8K69QmuA9vffwf_Xig', logKeys: [], units: [] } }],
            unitProgresses: [],
            progressData: { unitProgresses: [] },
            delegateInfoList: [],
            interruptHistories: [],
            stepDetails: null,
            strategyMetadata: {
              currentiteration: 0,
              totaliterations: 1,
              matrixmetadata: {
                matrixvalues: { version: 'v0', tag: 'stable' },
                matrixcombination: [0, 0],
                subtype: '',
                matrixkeystoskipinname: [],
                nodename: ''
              },
              identifierpostfix: '_stable_v0'
            },
            executionInputConfigured: false,
            logBaseKey:
              'px7xd_BFRCi-pfWPYXVjvw/pipeline/normalMatrixSGStep/1/-nXZv8WhfTp6lbVXNKZV-LQ/simpleMatrix/simpleMatrix_stable_v0'
          },
          _pSlx30hQbWuhzTrjMBy2Q: {
            uuid: '_pSlx30hQbWuhzTrjMBy2Q',
            setupId: 'zdR9qb4ZS1aiEPfrWX2TBA',
            name: 'stepGroup1_stable_v0',
            identifier: 'stepGroup1_stable_v0',
            baseFqn: 'pipeline.stages.simpleMatrix_stable_v0.spec.execution.steps.stepGroup1_stable_v0',
            outcomes: {},
            stepParameters: {
              identifier: 'stepGroup1_stable_v0',
              name: 'stepGroup1_stable_v0',
              childNodeID: 'B0r54_BaRyiHi8zsFAFS_Qsteps',
              variables: {}
            },
            startTs: 1700773046552,
            endTs: 1700773062720,
            stepType: 'STEP_GROUP',
            status: 'Success',
            failureInfo: { message: '', failureTypeList: [], responseMessages: [] },
            skipInfo: null,
            nodeRunInfo: {
              whenCondition: '<+OnStageSuccess>',
              evaluatedCondition: true,
              expressions: [{ expression: 'OnStageSuccess', expressionValue: 'true', count: 1 }]
            },
            executableResponses: [{ child: { childNodeId: 'B0r54_BaRyiHi8zsFAFS_Qsteps', logKeys: [], units: [] } }],
            unitProgresses: [],
            progressData: { unitProgresses: [] },
            delegateInfoList: [],
            interruptHistories: [],
            stepDetails: null,
            strategyMetadata: {
              currentiteration: 0,
              totaliterations: 1,
              matrixmetadata: {
                matrixvalues: { version: 'v0', tag: 'stable' },
                matrixcombination: [0, 0],
                subtype: '',
                matrixkeystoskipinname: [],
                nodename: ''
              },
              identifierpostfix: '_stable_v0'
            },
            executionInputConfigured: false,
            logBaseKey:
              'px7xd_BFRCi-pfWPYXVjvw/pipeline/normalMatrixSGStep/1/-nXZv8WhfTp6lbVXNKZV-LQ/simpleMatrix/simpleMatrix_stable_v0/stepGroup1/stepGroup1_stable_v0'
          },
          zSle8k4_Qq2CpTAj2yT4uw: {
            uuid: 'zSle8k4_Qq2CpTAj2yT4uw',
            setupId: '7A1tDTKWR2C0L9th6XeZ3g',
            name: 'ShellScript_1_stable_v0',
            identifier: 'ShellScript_1_stable_v0',
            baseFqn: 'pipeline.stages.simpleMatrix_stable_v0.spec.execution.steps.ShellScript_1_stable_v0',
            outcomes: { output: { outputVariables: {} } },
            stepParameters: {
              identifier: 'ShellScript_1_stable_v0',
              name: 'ShellScript_1_stable_v0',
              timeout: '10m',
              type: 'ShellScript',
              spec: {
                outputVariables: {},
                environmentVariables: {},
                shell: 'Bash',
                source: { type: 'Inline', spec: { script: 'echo 1' } },
                onDelegate: true
              }
            },
            startTs: 1700773064427,
            endTs: 1700773067709,
            stepType: 'ShellScript',
            status: 'Success',
            failureInfo: { message: '', failureTypeList: [], responseMessages: [] },
            skipInfo: null,
            nodeRunInfo: {
              whenCondition: '<+OnStageSuccess>',
              evaluatedCondition: true,
              expressions: [{ expression: 'OnStageSuccess', expressionValue: 'true', count: 1 }]
            },
            executableResponses: [
              {
                task: {
                  taskId: '4NJD9li0QBG7piut32Ac5w-DEL',
                  taskCategory: 'DELEGATE_TASK_V2',
                  logKeys: [
                    'px7xd_BFRCi-pfWPYXVjvw/pipeline/normalMatrixSGStep/1/-nXZv8WhfTp6lbVXNKZV-LQ/simpleMatrix/simpleMatrix_stable_v0/ShellScript_1/ShellScript_1_stable_v0-commandUnit:Execute'
                  ],
                  units: [],
                  taskName: 'SHELL_SCRIPT_TASK_NG'
                }
              }
            ],
            unitProgresses: [
              { unitName: 'Execute', status: 'SUCCESS', startTime: '1700773065014', endTime: '1700773065021' }
            ],
            progressData: {
              unitProgresses: [
                { unitName: 'Execute', status: 'SUCCESS', startTime: '1700773065014', endTime: '1700773065021' }
              ]
            },
            delegateInfoList: [
              {
                id: 'lZg8_f2NQpOQQd-KC8Wrog',
                name: 'kubernetes-delegate-idp',
                taskId: '4NJD9li0QBG7piut32Ac5w-DEL',
                taskName: 'SHELL_SCRIPT_TASK_NG'
              }
            ],
            interruptHistories: [],
            stepDetails: null,
            strategyMetadata: {
              currentiteration: 0,
              totaliterations: 1,
              matrixmetadata: {
                matrixvalues: { version: 'v0', tag: 'stable' },
                matrixcombination: [0, 0],
                subtype: '',
                matrixkeystoskipinname: [],
                nodename: ''
              },
              identifierpostfix: '_stable_v0'
            },
            executionInputConfigured: false,
            logBaseKey:
              'px7xd_BFRCi-pfWPYXVjvw/pipeline/normalMatrixSGStep/1/-nXZv8WhfTp6lbVXNKZV-LQ/simpleMatrix/simpleMatrix_stable_v0/ShellScript_1/ShellScript_1_stable_v0'
          },
          '7R_7tQ3ZQnWhLuzSAhH_pQ': {
            uuid: '7R_7tQ3ZQnWhLuzSAhH_pQ',
            setupId: 'tOhrt9nOQGC-5-FbXJCreQ',
            name: 'Execution',
            identifier: 'execution',
            baseFqn: 'pipeline.stages.simpleMatrix_stable_v0.spec.execution',
            outcomes: {},
            stepParameters: { childNodeId: 'tOhrt9nOQGC-5-FbXJCreQsteps', logMessage: 'Execution Element' },
            startTs: 1700773034760,
            endTs: 1700773069450,
            stepType: 'NG_SECTION_WITH_ROLLBACK_INFO',
            status: 'Success',
            failureInfo: { message: '', failureTypeList: [], responseMessages: [] },
            skipInfo: null,
            nodeRunInfo: null,
            executableResponses: [{ child: { childNodeId: 'tOhrt9nOQGC-5-FbXJCreQsteps', logKeys: [], units: [] } }],
            unitProgresses: [],
            progressData: { unitProgresses: [] },
            delegateInfoList: [],
            interruptHistories: [],
            stepDetails: null,
            strategyMetadata: null,
            executionInputConfigured: false,
            logBaseKey:
              'px7xd_BFRCi-pfWPYXVjvw/pipeline/normalMatrixSGStep/1/-nXZv8WhfTp6lbVXNKZV-LQ/simpleMatrix/simpleMatrix_stable_v0'
          },
          sVDYWQMiTSqKRSfNVz40tg: {
            uuid: 'sVDYWQMiTSqKRSfNVz40tg',
            setupId: 'Zx7iNO3PTHmAEsnFBa9Hqg',
            name: 'ShellScript_1_stable_v0',
            identifier: 'ShellScript_1_stable_v0',
            baseFqn:
              'pipeline.stages.simpleMatrix_stable_v0.spec.execution.steps.stepGroup1_stable_v0.steps.ShellScript_1_stable_v0',
            outcomes: { output: { outputVariables: {} } },
            stepParameters: {
              identifier: 'ShellScript_1_stable_v0',
              name: 'ShellScript_1_stable_v0',
              timeout: '10m',
              type: 'ShellScript',
              spec: {
                outputVariables: {},
                environmentVariables: {},
                shell: 'Bash',
                source: { type: 'Inline', spec: { script: 'echo 1' } },
                onDelegate: true
              }
            },
            startTs: 1700773048318,
            endTs: 1700773061934,
            stepType: 'ShellScript',
            status: 'Success',
            failureInfo: { message: '', failureTypeList: [], responseMessages: [] },
            skipInfo: null,
            nodeRunInfo: {
              whenCondition: '<+OnStageSuccess>',
              evaluatedCondition: true,
              expressions: [{ expression: 'OnStageSuccess', expressionValue: 'true', count: 1 }]
            },
            executableResponses: [
              {
                task: {
                  taskId: '73nFabkQQFuEYJWy1zJVeA-DEL',
                  taskCategory: 'DELEGATE_TASK_V2',
                  logKeys: [
                    'px7xd_BFRCi-pfWPYXVjvw/pipeline/normalMatrixSGStep/1/-nXZv8WhfTp6lbVXNKZV-LQ/simpleMatrix/simpleMatrix_stable_v0/stepGroup1/stepGroup1_stable_v0/ShellScript_1/ShellScript_1_stable_v0-commandUnit:Execute'
                  ],
                  units: [],
                  taskName: 'SHELL_SCRIPT_TASK_NG'
                }
              }
            ],
            unitProgresses: [
              { unitName: 'Execute', status: 'SUCCESS', startTime: '1700773059202', endTime: '1700773059401' }
            ],
            progressData: {
              unitProgresses: [
                { unitName: 'Execute', status: 'SUCCESS', startTime: '1700773059202', endTime: '1700773059401' }
              ]
            },
            delegateInfoList: [
              {
                id: 'Ul1wDI2QT4eyUZwTXKtrXg',
                name: 'kubernetes-delegate',
                taskId: '73nFabkQQFuEYJWy1zJVeA-DEL',
                taskName: 'SHELL_SCRIPT_TASK_NG'
              }
            ],
            interruptHistories: [],
            stepDetails: null,
            strategyMetadata: {
              currentiteration: 0,
              totaliterations: 1,
              matrixmetadata: {
                matrixvalues: { version: 'v0', tag: 'stable' },
                matrixcombination: [0, 0],
                subtype: '',
                matrixkeystoskipinname: [],
                nodename: ''
              },
              identifierpostfix: '_stable_v0'
            },
            executionInputConfigured: false,
            logBaseKey:
              'px7xd_BFRCi-pfWPYXVjvw/pipeline/normalMatrixSGStep/1/-nXZv8WhfTp6lbVXNKZV-LQ/simpleMatrix/simpleMatrix_stable_v0/stepGroup1/stepGroup1_stable_v0/ShellScript_1/ShellScript_1_stable_v0'
          },
          C2jE_zTxQKiTrlj22UrfkQ: {
            uuid: 'C2jE_zTxQKiTrlj22UrfkQ',
            setupId: 'U_JLlZc0TUyvY18UrtaEEw',
            name: 'ShellScript_1',
            identifier: 'ShellScript_1',
            baseFqn: 'pipeline.stages.simpleMatrix_stable_v0.spec.execution.steps.stepGroup1_stable_v0.steps',
            outcomes: {},
            stepParameters: {
              strategyConfig: {
                matrixConfig: {
                  uuid: 'etWpYK7FTqKnxT17I4Xfnw',
                  axes: { tag: { axisValue: ['stable'] }, version: { axisValue: ['v0'] } },
                  expressionAxes: {}
                }
              },
              childNodeId: 'Zx7iNO3PTHmAEsnFBa9Hqg',
              strategyType: 'MATRIX',
              shouldProceedIfFailed: true
            },
            startTs: 1700773047535,
            endTs: 1700773062197,
            stepType: 'STRATEGY',
            status: 'Success',
            failureInfo: { message: '', failureTypeList: [], responseMessages: [] },
            skipInfo: null,
            nodeRunInfo: null,
            executableResponses: [
              {
                children: {
                  children: [
                    {
                      childNodeId: 'Zx7iNO3PTHmAEsnFBa9Hqg',
                      strategyMetadata: {
                        currentIteration: 0,
                        totalIterations: 1,
                        matrixMetadata: {
                          matrixValues: { version: 'v0', tag: 'stable' },
                          matrixCombination: [0, 0],
                          subType: '',
                          matrixKeysToSkipInName: [],
                          nodeName: ''
                        },
                        identifierPostFix: '_stable_v0'
                      }
                    }
                  ],
                  maxConcurrency: '1',
                  logKeys: [],
                  shouldProceedIfFailed: true,
                  units: []
                }
              }
            ],
            unitProgresses: [],
            progressData: { unitProgresses: [] },
            delegateInfoList: [],
            interruptHistories: [],
            stepDetails: null,
            strategyMetadata: null,
            executionInputConfigured: false,
            logBaseKey:
              'px7xd_BFRCi-pfWPYXVjvw/pipeline/normalMatrixSGStep/1/-nXZv8WhfTp6lbVXNKZV-LQ/simpleMatrix/simpleMatrix_stable_v0/stepGroup1/stepGroup1_stable_v0/ShellScript_1'
          },
          bkVPnit7Qai2sf9Lhm04EQ: {
            uuid: 'bkVPnit7Qai2sf9Lhm04EQ',
            setupId: 'B0r54_BaRyiHi8zsFAFS_Q',
            name: 'stepGroup1',
            identifier: 'stepGroup1',
            baseFqn: 'pipeline.stages.simpleMatrix_stable_v0.spec.execution.steps',
            outcomes: {},
            stepParameters: {
              strategyConfig: {
                matrixConfig: {
                  uuid: 'wcCKxMudQvqihl1qYTpgew',
                  axes: { tag: { axisValue: ['stable'] }, version: { axisValue: ['v0'] } },
                  expressionAxes: {}
                }
              },
              childNodeId: 'zdR9qb4ZS1aiEPfrWX2TBA',
              strategyType: 'MATRIX',
              shouldProceedIfFailed: true
            },
            startTs: 1700773045810,
            endTs: 1700773063142,
            stepType: 'STRATEGY',
            status: 'Success',
            failureInfo: { message: '', failureTypeList: [], responseMessages: [] },
            skipInfo: null,
            nodeRunInfo: null,
            executableResponses: [
              {
                children: {
                  children: [
                    {
                      childNodeId: 'zdR9qb4ZS1aiEPfrWX2TBA',
                      strategyMetadata: {
                        currentIteration: 0,
                        totalIterations: 1,
                        matrixMetadata: {
                          matrixValues: { version: 'v0', tag: 'stable' },
                          matrixCombination: [0, 0],
                          subType: '',
                          matrixKeysToSkipInName: [],
                          nodeName: ''
                        },
                        identifierPostFix: '_stable_v0'
                      }
                    }
                  ],
                  maxConcurrency: '1',
                  logKeys: [],
                  shouldProceedIfFailed: true,
                  units: []
                }
              }
            ],
            unitProgresses: [],
            progressData: { unitProgresses: [] },
            delegateInfoList: [],
            interruptHistories: [],
            stepDetails: null,
            strategyMetadata: null,
            executionInputConfigured: false,
            logBaseKey:
              'px7xd_BFRCi-pfWPYXVjvw/pipeline/normalMatrixSGStep/1/-nXZv8WhfTp6lbVXNKZV-LQ/simpleMatrix/simpleMatrix_stable_v0/stepGroup1'
          },
          'Dtg-e4WIS3iOQ7jkTlmjpw': {
            uuid: 'Dtg-e4WIS3iOQ7jkTlmjpw',
            setupId: 'uZyZU3ecRLaoiBjUCliajg',
            name: 'ShellScript_1',
            identifier: 'ShellScript_1',
            baseFqn: 'pipeline.stages.simpleMatrix_stable_v0.spec.execution.steps',
            outcomes: {},
            stepParameters: {
              strategyConfig: {
                matrixConfig: {
                  uuid: 'fajC0-MAQdmgtlEMpjLfoA',
                  axes: { tag: { axisValue: ['stable'] }, version: { axisValue: ['v0'] } },
                  expressionAxes: {}
                }
              },
              childNodeId: '7A1tDTKWR2C0L9th6XeZ3g',
              strategyType: 'MATRIX',
              shouldProceedIfFailed: true
            },
            startTs: 1700773063636,
            endTs: 1700773067970,
            stepType: 'STRATEGY',
            status: 'Success',
            failureInfo: { message: '', failureTypeList: [], responseMessages: [] },
            skipInfo: null,
            nodeRunInfo: null,
            executableResponses: [
              {
                children: {
                  children: [
                    {
                      childNodeId: '7A1tDTKWR2C0L9th6XeZ3g',
                      strategyMetadata: {
                        currentIteration: 0,
                        totalIterations: 1,
                        matrixMetadata: {
                          matrixValues: { version: 'v0', tag: 'stable' },
                          matrixCombination: [0, 0],
                          subType: '',
                          matrixKeysToSkipInName: [],
                          nodeName: ''
                        },
                        identifierPostFix: '_stable_v0'
                      }
                    }
                  ],
                  maxConcurrency: '1',
                  logKeys: [],
                  shouldProceedIfFailed: true,
                  units: []
                }
              }
            ],
            unitProgresses: [],
            progressData: { unitProgresses: [] },
            delegateInfoList: [],
            interruptHistories: [],
            stepDetails: null,
            strategyMetadata: null,
            executionInputConfigured: false,
            logBaseKey:
              'px7xd_BFRCi-pfWPYXVjvw/pipeline/normalMatrixSGStep/1/-nXZv8WhfTp6lbVXNKZV-LQ/simpleMatrix/simpleMatrix_stable_v0/ShellScript_1'
          }
        },
        nodeAdjacencyListMap: {
          '9WiPTVuaQUSqRC3HpC648w': { children: ['7R_7tQ3ZQnWhLuzSAhH_pQ'], nextIds: [] },
          _pSlx30hQbWuhzTrjMBy2Q: { children: ['C2jE_zTxQKiTrlj22UrfkQ'], nextIds: [] },
          zSle8k4_Qq2CpTAj2yT4uw: { children: [], nextIds: [] },
          '7R_7tQ3ZQnWhLuzSAhH_pQ': { children: ['bkVPnit7Qai2sf9Lhm04EQ'], nextIds: [] },
          sVDYWQMiTSqKRSfNVz40tg: { children: [], nextIds: [] },
          C2jE_zTxQKiTrlj22UrfkQ: { children: ['sVDYWQMiTSqKRSfNVz40tg'], nextIds: [] },
          bkVPnit7Qai2sf9Lhm04EQ: { children: ['_pSlx30hQbWuhzTrjMBy2Q'], nextIds: ['Dtg-e4WIS3iOQ7jkTlmjpw'] },
          'Dtg-e4WIS3iOQ7jkTlmjpw': { children: ['zSle8k4_Qq2CpTAj2yT4uw'], nextIds: [] }
        },
        executionMetadata: {
          accountId: 'px7xd_BFRCi-pfWPYXVjvw',
          pipelineIdentifier: 'normalMatrixSGStep',
          orgIdentifier: 'default',
          projectIdentifier: 'Pratyush_TestZone',
          planExecutionId: 'nXZv8WhfTp6lbVXNKZV-LQ'
        },
        representationStrategy: 'camelCase'
      }
    }
  },
  selectedStageId: 'FtGZN4Y6Q-eN_ZaUyijodQ',
  selectedChildStageId: 'WvjiiS6bTiWpU7-ZnTvPMw',
  selectedStepId: 'zSle8k4_Qq2CpTAj2yT4uw',
  selectedStageExecutionId: '9WiPTVuaQUSqRC3HpC648w',
  isDataLoadedForSelectedStage: true,
  queryParams: {},
  loading: false
}
