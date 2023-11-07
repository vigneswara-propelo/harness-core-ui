/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { PipelineStagesProps } from '@pipeline/components/PipelineStages/PipelineStages'
import { PipelineContextInterface } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { IDPStageMinimalModeProps } from '../types'

export const getPropsForMinimalStage = (): PipelineStagesProps<IDPStageMinimalModeProps> => ({
  minimal: true,
  gitDetails: {},
  storeMetadata: {},
  stageProps: {
    data: {
      stage: {
        identifier: '',
        name: ''
      }
    },
    onSubmit: jest.fn(),
    onChange: jest.fn()
  },
  children: [
    {
      props: {
        name: '',
        type: 'IDP',
        icon: 'idp',
        isApproval: false,
        isDisabled: false,
        title: 'IDP Stage',
        description: ''
      },
      type: '',
      key: 'idp'
    }
  ]
})

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
            name: 'IDP Stage',
            identifier: 'IDPStage',
            description: '',
            type: 'IDP',
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
            name: 'IDP Stage',
            identifier: 'IDPStage',
            description: '',
            type: 'Custom',
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
    isLoading: false,
    isBEPipelineUpdated: false,
    isDBInitialized: true,
    isUpdated: true,
    isInitialized: true,
    error: '',
    templateTypes: {}
  },
  contextType: 'IDP'
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
  } as unknown as PipelineContextInterface
}
