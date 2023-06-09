/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { PipelineContextInterface } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { PipelineStageConfig } from 'services/pipeline-ng'

const stagesMap = {
  Template: {
    name: 'Template',
    type: 'Template',
    icon: 'template-library',
    iconColor: 'var(--pipeline-custom-stage-color)',
    isApproval: false,
    openExecutionStrategy: false
  },
  Approval: {
    name: 'Approval',
    type: 'Approval',
    icon: 'approval-stage-icon',
    iconColor: 'var(--pipeline-approval-stage-color)',
    isApproval: true,
    openExecutionStrategy: false
  },
  Custom: {
    name: 'Custom',
    type: 'Custom',
    icon: 'custom-stage-icon',
    iconColor: 'var(--pipeline-custom-stage-color)',
    isApproval: false,
    openExecutionStrategy: false
  },
  Pipeline: {
    name: 'Pipeline',
    type: 'Pipeline',
    icon: 'chained-pipeline',
    iconColor: 'var(--pipeline-blue-color)',
    isApproval: false,
    openExecutionStrategy: false
  },
  Deployment: {
    name: 'Deploy',
    type: 'Deployment',
    icon: 'cd-main',
    iconColor: 'var(--pipeline-deploy-stage-color)',
    isApproval: false,
    openExecutionStrategy: true
  },
  CI: {
    name: 'Build',
    type: 'CI',
    icon: 'ci-main',
    iconColor: 'var(--pipeline-build-stage-color)',
    isApproval: false,
    openExecutionStrategy: false
  },
  FeatureFlag: {
    name: 'Feature Flag',
    type: 'FeatureFlag',
    icon: 'cf-main',
    iconColor: 'var(--pipeline-feature-stage-color)',
    isApproval: false,
    openExecutionStrategy: false
  },
  SecurityTests: {
    name: 'Security Tests',
    type: 'SecurityTests',
    icon: 'sto-color-filled',
    iconColor: 'var(--primary-8)',
    isApproval: false,
    openExecutionStrategy: true
  }
}

export const getModuleParams = (pipelineId?: string, module = 'cd') => ({
  orgIdentifier: 'default',
  projectIdentifier: 'Fardeen',
  ...(pipelineId && { pipelineIdentifier: pipelineId }),
  accountId: 'accountId',
  module
})

export const pipelineContextMock = {
  state: {
    pipeline: {
      name: 'chainedPipeline',
      identifier: 'chainedPipeline',
      projectIdentifier: 'Fardeen',
      orgIdentifier: 'default',
      tags: {},
      stages: [
        {
          stage: {
            name: 'parStage1',
            identifier: 'parStage1',
            description: '',
            type: 'Pipeline',
            spec: {
              org: 'default',
              pipeline: 'childPip',
              project: 'Fardeen',
              inputs: {
                identifier: 'childPip',
                stages: [
                  {
                    stage: {
                      identifier: 'childStg1',
                      type: 'Custom',
                      spec: {
                        execution: {
                          steps: [
                            {
                              step: {
                                identifier: 'HTTP',
                                type: 'Http',
                                spec: {
                                  method: '<+input>',
                                  requestBody: '<+input>'
                                }
                              }
                            },
                            {
                              stepGroup: {
                                identifier: 'childStpGrp',
                                steps: [
                                  {
                                    step: {
                                      identifier: 'ShellScript',
                                      type: 'ShellScript',
                                      spec: {
                                        source: {
                                          type: 'Inline',
                                          spec: {
                                            script: '<+input>'
                                          }
                                        }
                                      }
                                    }
                                  },
                                  {
                                    step: {
                                      identifier: 'Wait',
                                      type: 'Wait',
                                      spec: {
                                        duration: '<+input>'
                                      }
                                    }
                                  }
                                ]
                              }
                            }
                          ]
                        }
                      }
                    }
                  }
                ]
              },
              outputs: []
            },
            variables: []
          }
        },
        {
          stage: {
            name: 'parStage2',
            identifier: 'parStage2',
            description: '',
            type: 'Pipeline',
            spec: {
              org: 'default',
              pipeline: 'childParallePip',
              project: 'Fardeen',
              outputs: [
                {
                  name: 'output1',
                  value: '<+pipeline.name>'
                },
                {
                  name: 'output2',
                  value: 'default'
                },
                {
                  name: 'dummyOutput',
                  value: '<+input>'
                }
              ]
            }
          }
        },
        {
          stage: {
            name: 'parStage3',
            identifier: 'parStage3',
            description: '',
            type: 'Pipeline',
            spec: {
              org: 'default',
              pipeline: 'inputSetChildPipeline',
              project: 'Fardeen',
              inputs: {
                identifier: 'inputSetChildPipeline',
                stages: [
                  {
                    stage: {
                      identifier: 'stage1',
                      type: 'Custom',
                      spec: {
                        execution: {
                          steps: [
                            {
                              step: {
                                identifier: 'ShellScript_1',
                                type: 'ShellScript',
                                spec: {
                                  source: {
                                    type: 'Inline',
                                    spec: {
                                      script: '<+input>'
                                    }
                                  }
                                },
                                timeout: '11m'
                              }
                            },
                            {
                              step: {
                                identifier: 'HTTP_1',
                                type: 'Http',
                                spec: {
                                  method: 'GET',
                                  requestBody: 'req'
                                },
                                timeout: '12m'
                              }
                            }
                          ]
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    },
    originalPipeline: {
      name: 'chainedPipeline',
      identifier: 'chainedPipeline',
      projectIdentifier: 'Fardeen',
      orgIdentifier: 'default',
      tags: {},
      stages: [
        {
          stage: {
            name: 'parStage1',
            identifier: 'parStage1',
            description: '',
            type: 'Pipeline',
            spec: {
              org: 'default',
              pipeline: 'childPip',
              project: 'Fardeen',
              inputs: {
                identifier: 'childPip',
                stages: [
                  {
                    stage: {
                      identifier: 'childStg1',
                      type: 'Custom',
                      spec: {
                        execution: {
                          steps: [
                            {
                              step: {
                                identifier: 'HTTP',
                                type: 'Http',
                                spec: {
                                  method: '<+input>',
                                  requestBody: '<+input>'
                                }
                              }
                            },
                            {
                              stepGroup: {
                                identifier: 'childStpGrp',
                                steps: [
                                  {
                                    step: {
                                      identifier: 'ShellScript',
                                      type: 'ShellScript',
                                      spec: {
                                        source: {
                                          type: 'Inline',
                                          spec: {
                                            script: '<+input>'
                                          }
                                        }
                                      }
                                    }
                                  },
                                  {
                                    step: {
                                      identifier: 'Wait',
                                      type: 'Wait',
                                      spec: {
                                        duration: '<+input>'
                                      }
                                    }
                                  }
                                ]
                              }
                            }
                          ]
                        }
                      }
                    }
                  }
                ]
              },
              outputs: []
            },
            variables: []
          }
        },
        {
          stage: {
            name: 'parStage2',
            identifier: 'parStage2',
            description: '',
            type: 'Pipeline',
            spec: {
              org: 'default',
              pipeline: 'childParallePip',
              project: 'Fardeen',
              outputs: [
                {
                  name: 'output1',
                  value: '<+pipeline.name>'
                },
                {
                  name: 'output2',
                  value: 'default'
                },
                {
                  name: 'dummyOutput',
                  value: '<+input>'
                }
              ]
            }
          }
        },
        {
          stage: {
            name: 'parStage3',
            identifier: 'parStage3',
            description: '',
            type: 'Pipeline',
            spec: {
              org: 'default',
              pipeline: 'inputSetChildPipeline',
              project: 'Fardeen',
              inputs: {
                identifier: 'inputSetChildPipeline',
                stages: [
                  {
                    stage: {
                      identifier: 'stage1',
                      type: 'Custom',
                      spec: {
                        execution: {
                          steps: [
                            {
                              step: {
                                identifier: 'ShellScript_1',
                                type: 'ShellScript',
                                spec: {
                                  source: {
                                    type: 'Inline',
                                    spec: {
                                      script: '<+input>'
                                    }
                                  }
                                },
                                timeout: '11m'
                              }
                            },
                            {
                              step: {
                                identifier: 'HTTP_1',
                                type: 'Http',
                                spec: {
                                  method: 'GET',
                                  requestBody: 'req'
                                },
                                timeout: '12m'
                              }
                            }
                          ]
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    },
    pipelineIdentifier: 'chainedPipeline',
    pipelineView: {
      isSplitViewOpen: true,
      isDrawerOpened: false,
      splitViewData: { type: 'StageView' },
      drawerData: { type: 'AddCommand' }
    },
    selectionState: { selectedSectionId: 'INPUTS', selectedStageId: 'parStage1', selectedStepId: undefined },
    isLoading: false,
    isBEPipelineUpdated: false,
    isDBInitialized: true,
    isUpdated: true,
    isInitialized: true,
    error: '',
    templateTypes: {}
  },
  contextType: 'Pipeline',
  stagesMap
}

export const getDummyPipelineContextValue = (): PipelineContextInterface => {
  return {
    ...pipelineContextMock,
    updatePipeline: jest.fn(),
    updatePipelineView: jest.fn(),
    updateStage: jest.fn().mockResolvedValue({}),
    setSelectedSectionId: jest.fn(),
    setSelectedTabId: jest.fn(),
    getStagePathFromPipeline: jest.fn(),
    getStageFromPipeline: jest.fn(() => {
      return { stage: pipelineContextMock.state.pipeline.stages[0], parent: undefined }
    }),
    setTemplateTypes: jest.fn()
  } as any
}

export const errorContextProvider = {
  state: {} as any,
  checkErrorsForTab: jest.fn().mockResolvedValue(Promise.resolve()),
  subscribeForm: () => undefined,
  unSubscribeForm: () => undefined,
  submitFormsForTab: jest.fn()
}

export const getMockFor_useGetPipeline = (): any => ({
  refetch: jest.fn(),
  data: {
    status: 'SUCCESS',
    data: {
      yamlPipeline:
        'pipeline:\n  name: childPip\n  identifier: childPip\n  projectIdentifier: Fardeen\n  orgIdentifier: default\n  tags: {}\n  stages:\n    - stage:\n        name: childStg1\n        identifier: childStg1\n        description: ""\n        type: Custom\n        spec:\n          execution:\n            steps:\n              - step:\n                  type: Http\n                  name: HTTP\n                  identifier: HTTP\n                  spec:\n                    url: https://github.com\n                    method: <+input>\n                    headers: []\n                    outputVariables: []\n                    requestBody: <+input>\n                  timeout: 10m\n              - stepGroup:\n                  name: childStpGrp\n                  identifier: childStpGrp\n                  steps:\n                    - step:\n                        type: ShellScript\n                        name: Shell Script\n                        identifier: ShellScript\n                        spec:\n                          shell: Bash\n                          onDelegate: true\n                          source:\n                            type: Inline\n                            spec:\n                              script: <+input>\n                          environmentVariables: []\n                          outputVariables: []\n                        timeout: 10m\n                    - step:\n                        type: Wait\n                        name: Wait\n                        identifier: Wait\n                        spec:\n                          duration: <+input>\n        tags: {}\n    - stage:\n        name: childStage2\n        identifier: childStage2\n        description: ""\n        type: Approval\n        spec:\n          execution:\n            steps:\n              - step:\n                  name: approvalStep\n                  identifier: approvalStep\n                  type: HarnessApproval\n                  timeout: 1d\n                  spec:\n                    approvalMessage: |-\n                      Please review the following information\n                      and approve the pipeline progression\n                    includePipelineExecutionHistory: true\n                    approvers:\n                      minimumCount: 1\n                      disallowPipelineExecutor: false\n                      userGroups:\n                        - account._account_all_users\n                    approverInputs: []\n        tags: {}\n',
      resolvedTemplatesPipelineYaml:
        'pipeline:\n  name: childPip\n  identifier: childPip\n  projectIdentifier: Fardeen\n  orgIdentifier: default\n  tags: {}\n  stages:\n    - stage:\n        name: childStg1\n        identifier: childStg1\n        description: ""\n        type: Custom\n        spec:\n          execution:\n            steps:\n              - step:\n                  type: Http\n                  name: HTTP\n                  identifier: HTTP\n                  spec:\n                    url: https://github.com\n                    method: <+input>\n                    headers: []\n                    outputVariables: []\n                    requestBody: <+input>\n                  timeout: 10m\n              - stepGroup:\n                  name: childStpGrp\n                  identifier: childStpGrp\n                  steps:\n                    - step:\n                        type: ShellScript\n                        name: Shell Script\n                        identifier: ShellScript\n                        spec:\n                          shell: Bash\n                          onDelegate: true\n                          source:\n                            type: Inline\n                            spec:\n                              script: <+input>\n                          environmentVariables: []\n                          outputVariables: []\n                        timeout: 10m\n                    - step:\n                        type: Wait\n                        name: Wait\n                        identifier: Wait\n                        spec:\n                          duration: <+input>\n        tags: {}\n    - stage:\n        name: childStage2\n        identifier: childStage2\n        description: ""\n        type: Approval\n        spec:\n          execution:\n            steps:\n              - step:\n                  name: approvalStep\n                  identifier: approvalStep\n                  type: HarnessApproval\n                  timeout: 1d\n                  spec:\n                    approvalMessage: |-\n                      Please review the following information\n                      and approve the pipeline progression\n                    includePipelineExecutionHistory: true\n                    approvers:\n                      minimumCount: 1\n                      disallowPipelineExecutor: false\n                      userGroups:\n                        - account._account_all_users\n                    approverInputs: []\n        tags: {}\n',
      entityValidityDetails: {
        valid: true,
        invalidYaml: null
      },
      modules: ['pms']
    },
    metaData: null,
    correlationId: '1d5b2326-6c1b-42a2-8a73-498ff7d9f01a'
  }
})

export const getMockFor_useGetInputSetsListForPipeline = (): any => ({
  refetch: jest.fn(),
  data: {
    data: {
      content: [
        {
          identifier: 'overlayInp',
          name: 'overlayInp',
          pipelineIdentifier: 'inputSetChildPipeline',
          inputSetType: 'OVERLAY_INPUT_SET',
          tags: {},
          createdAt: 1672989762380,
          lastUpdatedAt: 1672989762380,
          isOutdated: false,
          entityValidityDetails: {
            valid: true,
            invalidYaml: null
          },
          storeType: 'INLINE'
        },
        {
          identifier: 'inp2',
          name: 'inp2',
          pipelineIdentifier: 'inputSetChildPipeline',
          inputSetType: 'INPUT_SET',
          tags: {},
          createdAt: 1672989744202,
          lastUpdatedAt: 1672989744202,
          isOutdated: false,
          entityValidityDetails: {
            valid: true,
            invalidYaml: null
          },
          storeType: 'INLINE'
        },
        {
          identifier: 'inp1',
          name: 'inp1',
          pipelineIdentifier: 'inputSetChildPipeline',
          inputSetType: 'INPUT_SET',
          tags: {},
          createdAt: 1672989719188,
          lastUpdatedAt: 1672989719188,
          isOutdated: false,
          entityValidityDetails: {
            valid: true,
            invalidYaml: null
          },
          storeType: 'INLINE'
        }
      ]
    }
  }
})

export const getMockFor_getsMergedTemplateInputYamlPromise = (): any => ({
  status: 'SUCCESS',
  data: {
    mergedTemplateInputs:
      'identifier: "childPip"\nstages:\n- stage:\n    identifier: "childStg1"\n    type: "Custom"\n    spec:\n      execution:\n        steps:\n        - step:\n            identifier: "HTTP"\n            type: "Http"\n            spec:\n              method: "<+input>"\n              requestBody: "<+input>"\n        - stepGroup:\n            identifier: "childStpGrp"\n            steps:\n            - step:\n                identifier: "ShellScript"\n                type: "ShellScript"\n                spec:\n                  source:\n                    type: "Inline"\n                    spec:\n                      script: "<+input>"\n            - step:\n                identifier: "Wait"\n                type: "Wait"\n                spec:\n                  duration: "<+input>"\n'
  }
})

export const getMockFor_delegateSelectors = (): any => ({
  status: 'SUCCESS',
  data: {
    metaData: {},
    resource: [
      {
        name: 'qa-stress-delegate',
        connected: true
      },
      {
        name: 'test-terraform',
        connected: true
      },
      {
        name: 'a-dec-test',
        connected: false
      },
      {
        name: 'a-test-b',
        connected: false
      },
      {
        name: 'a-testing-terraform-5jan',
        connected: false
      },
      {
        name: 'a-ubi',
        connected: false
      },
      {
        name: 'a-ubi-minimal',
        connected: false
      },
      {
        name: 'abc',
        connected: false
      }
    ]
  }
})

export const editPipelineStageProps = {
  data: {
    stage: {
      name: '',
      identifier: '',
      description: '',
      type: 'Pipeline',
      spec: {} as PipelineStageConfig
    }
  },
  orgId: 'default',
  pipelineId: 'childPip',
  projectId: 'Fardeen'
}
