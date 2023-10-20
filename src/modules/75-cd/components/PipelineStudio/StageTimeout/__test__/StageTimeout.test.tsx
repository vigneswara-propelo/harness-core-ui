import { render, fireEvent } from '@testing-library/react'
import React from 'react'
import { TestWrapper } from '@modules/10-common/utils/testUtils'
import { PipelineContext } from '@modules/70-pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import {
  getDummyPipelineContextValue,
  pipelineContextMock
} from '@modules/75-ci/components/PipelineStudio/BuildStageSpecifications/__test__/BuildStageSpecificationsTestHelpers'
import { StageElementConfig } from 'services/pipeline-ng'
import { StageTimeout } from '../StageTimeout'

const onChangeMocked = jest.fn()

describe('StageTimeout test', () => {
  test('Test StageTimeout', () => {
    const timeout = '20m'
    const pipelineContextMockValue = getDummyPipelineContextValue()
    const data = pipelineContextMock.state.pipeline.stages[0]
    const { stage } = data
    const { getByText, getByPlaceholderText } = render(
      <TestWrapper>
        <PipelineContext.Provider value={pipelineContextMockValue}>
          <StageTimeout<StageElementConfig> isReadonly={false} onChange={onChangeMocked} data={data} />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    expect(getByText('pipelineSteps.timeoutLabel')).toBeInTheDocument()

    const timeoutInput = getByPlaceholderText('Enter w/d/h/m/s/ms')

    fireEvent.change(timeoutInput, { target: { value: timeout } })
    expect(onChangeMocked).toHaveBeenCalledWith({ ...stage, timeout })
  })
})
