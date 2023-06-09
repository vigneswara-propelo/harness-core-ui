/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react'
import type { StringKeys } from 'framework/strings'
import { TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import routes from '@common/RouteDefinitions'
import { accountPathProps, pipelineModuleParams, pipelinePathProps } from '@common/utils/routeUtils'
import { stagesCollection } from '@pipeline/components/PipelineStudio/Stages/StagesCollection'
import { StageType } from '@pipeline/utils/stageHelpers'
import { getPipelineStages as GetCDPipelineStages } from '@pipeline/components/PipelineStudio/PipelineStagesUtils'
import { getStageAttributes, getStageEditorImplementation } from '../index'
import { getModuleParams } from './PipelineStageHelper'

const TEST_PATH = routes.toPipelineStudio({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })
const argsMock = {
  showSelectMenu: true,
  contextType: 'Pipeline',
  gitDetails: {},
  storeMetadata: {},
  getNewStageFromType: jest.fn()
}

const argsMockWithOnSelectStage = {
  showSelectMenu: true,
  contextType: 'Pipeline',
  gitDetails: {},
  storeMetadata: {},
  onSelectStage: jest.fn()
}

function getString(key: StringKeys): StringKeys {
  return key
}

describe('Testing Empty pipeline stages', () => {
  beforeAll(() => {
    stagesCollection.registerStageFactory(StageType.PIPELINE, getStageAttributes, getStageEditorImplementation)
  })
  test('should render empty stage view on right section when no stagetype is rendered', async () => {
    render(
      <TestWrapper
        path={TEST_PATH}
        pathParams={getModuleParams('chainedPipeline')}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <GetCDPipelineStages module="cd" getString={jest.fn()} args={argsMock} />
      </TestWrapper>
    )
    const addStage = await screen.findByText('pipeline.addStage.description')
    expect(addStage).toBeTruthy()
    expect(stagesCollection.getStageAttributes(StageType.PIPELINE, getString)).toEqual({
      icon: 'chained-pipeline',
      iconColor: 'var(--pipeline-blue-color)',
      isApproval: false,
      name: 'Pipeline',
      openExecutionStrategy: false,
      type: 'Pipeline'
    })
  })

  test('should call getNewStageFromType when onSelectStage is not passed and Pipeline Stage is selected', async () => {
    render(
      <TestWrapper
        path={TEST_PATH}
        pathParams={getModuleParams('chainedPipeline')}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <GetCDPipelineStages module="cd" getString={getString} args={argsMock} isPipelineChainingEnabled={true} />
      </TestWrapper>
    )

    const pipelineStageLabel = await screen.findByText('common.pipeline')
    expect(pipelineStageLabel).toBeTruthy()
    const pipelineStageCard = screen.getByTestId('stage-Pipeline')
    fireEvent.click(pipelineStageCard)
    expect(argsMock.getNewStageFromType).toBeCalledWith(StageType.PIPELINE, true)
  })

  test('should call onSelectStage when onSelectStage is passed and Pipeline Stage is selected', async () => {
    render(
      <TestWrapper
        path={TEST_PATH}
        pathParams={getModuleParams('chainedPipeline')}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <GetCDPipelineStages
          module="cd"
          getString={getString}
          args={argsMockWithOnSelectStage}
          isPipelineChainingEnabled={true}
        />
      </TestWrapper>
    )

    const pipelineStageLabel = await screen.findByText('common.pipeline')
    expect(pipelineStageLabel).toBeTruthy()
    const pipelineStageCard = screen.getByTestId('stage-Pipeline')
    fireEvent.click(pipelineStageCard)
    expect(argsMock.getNewStageFromType).toHaveBeenCalledWith(StageType.PIPELINE, true)
  })
})
