/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import {
  PipelineContext,
  PipelineContextInterface
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { stageDataMock } from './mock'
import { ArtifactListViewHeader } from '../ArtifactListViewHeader'

const getContextValue = (): PipelineContextInterface => {
  return {
    state: {
      selectionState: { selectedStageId: 'stage_id' }
    },
    updateStage: jest.fn(),
    getStageFromPipeline: jest.fn(() => {
      return {
        stage: stageDataMock
      }
    })
  } as any
}

describe('ArtifactListViewHeader - ', () => {
  test('should render dropdown with existing primary artifact ref', () => {
    const { getByDisplayValue, getByText } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getContextValue()}>
          <ArtifactListViewHeader isPrimaryArtifactSources={true} selectedDeploymentType={'Asg'} />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    expect(getByText('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.artifacts')).toBeInTheDocument()
    expect(getByDisplayValue('Harnessdoc')).toBeInTheDocument()
  })
})
