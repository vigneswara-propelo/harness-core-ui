/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { IconName } from '@blueprintjs/core'
import { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { Step, StepProps } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import {
  PipelineContextType,
  PipelineContextInterface
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'

class StepFactory extends AbstractStepFactory {
  protected type = 'test-factory'
  protected stepName = 'stepOne'
  protected stepIcon: IconName = 'cross'
}

class StepOne extends Step<any> {
  protected type = StepType.CustomVariable
  protected stepName = 'stepOne'
  protected stepIcon: IconName = 'cross'
  validateInputSet(): any {
    return {}
  }
  protected defaultValues = { a: 'a' }
  renderStep(props: StepProps<any>): JSX.Element {
    return <div onClick={() => props.onUpdate?.(props.initialValues)}>{JSON.stringify(props.initialValues)}</div>
  }
}
const stepFactory = new StepFactory()
stepFactory.registerStep(new StepOne())

export const pipelineContextMock = {
  state: {
    pipeline: {
      name: 'Pipeline',
      identifier: 'Pipeline',
      description: null,
      tags: null,
      stages: [
        {
          stage: {
            name: 'BuildStage',
            identifier: 'BuildStage',
            description: '',
            type: 'CI',
            spec: {}
          }
        }
      ]
    },
    originalPipeline: {
      name: 'Pipeline',
      identifier: 'Pipeline',
      description: null,
      tags: null,
      stages: [
        {
          stage: {
            name: 'BuildStage',
            identifier: 'BuildStage',
            description: '',
            type: 'CI',
            spec: {}
          }
        }
      ]
    },
    pipelineIdentifier: 'Pipeline',
    pipelineView: {
      isSplitViewOpen: true,
      isDrawerOpened: false,
      splitViewData: { type: 'StageView' },
      drawerData: { type: 'AddCommand' }
    },
    selectionState: { selectedStageId: 'BuildStage' },
    isLoading: false,
    isBEPipelineUpdated: false,
    isDBInitialized: true,
    isUpdated: true,
    isInitialized: true,
    error: ''
  },
  contextType: PipelineContextType.Pipeline,
  stepsFactory: stepFactory
}

export const mockYamlSnippetResponse = {
  loading: false,
  error: null,
  data: {
    status: 'SUCCESS',
    content: [{ name: 'u1', uuid: 'uv1' }],
    metaData: null as unknown as undefined,
    correlationId: 'someId'
  }
}

export const getDummyPipelineContextValue = (): PipelineContextInterface => {
  return {
    ...pipelineContextMock,
    updatePipeline: jest.fn(),
    updatePipelineView: jest.fn(),
    updateStage: jest.fn(),
    getStageFromPipeline: jest.fn(() => {
      return { stage: pipelineContextMock.state.pipeline.stages[0], parent: undefined }
    })
  } as any
}

export const mockedPipelineContextValueForNonCloudInfra: PipelineContextInterface = {
  ...pipelineContextMock,
  updatePipeline: jest.fn(),
  updatePipelineView: jest.fn(),
  updateStage: jest.fn(),
  getStageFromPipeline: jest.fn(() => {
    return {
      stage: {
        stage: {
          name: 'Build Stage',
          identifier: 'BuildStage',
          type: 'CI',
          spec: {
            cloneCodebase: true,
            caching: {
              enabled: true,
              paths: ['/harness/.go', '/harness/release/linux/amd64/drone-cache'],
              key: 'mykey1'
            },
            infrastructure: {
              type: 'KubernetesDirect',
              spec: {
                connectorRef: 'tisanity2',
                namespace: 'default',
                automountServiceAccountToken: true,
                nodeSelector: {},
                os: 'Linux'
              }
            },
            execution: {
              steps: [
                {
                  step: {
                    type: 'Run',
                    name: 'Run_1',
                    identifier: 'Run_1',
                    spec: { shell: 'Sh', command: 'echo hello', envVariables: { GOPATH: '/harness/.go' } }
                  }
                }
              ]
            },
            sharedPaths: ['sample']
          }
        },
        parent: undefined
      }
    }
  })
} as any

export const mockedPipelineContextValueForCloudInfra: PipelineContextInterface = {
  ...pipelineContextMock,
  updatePipeline: jest.fn(),
  updatePipelineView: jest.fn(),
  updateStage: jest.fn(),
  getStageFromPipeline: jest.fn(() => {
    return {
      stage: {
        stage: {
          name: 'Build Stage',
          identifier: 'BuildStage',
          type: 'CI',
          spec: {
            cloneCodebase: true,
            caching: {
              enabled: false,
              paths: ['/harness/.go', '/harness/release/linux/amd64/drone-cache'],
              key: 'mykey1'
            },
            platform: { os: 'Linux', arch: 'Amd64' },
            runtime: { type: 'Cloud', spec: {} },
            execution: {
              steps: [
                {
                  step: {
                    type: 'Run',
                    name: 'Run_1',
                    identifier: 'Run_1',
                    spec: { shell: 'Sh', command: 'echo hello', envVariables: { GOPATH: '/harness/.go' } }
                  }
                }
              ]
            },
            sharedPaths: ['sample']
          }
        },
        parent: undefined
      }
    }
  })
} as any
