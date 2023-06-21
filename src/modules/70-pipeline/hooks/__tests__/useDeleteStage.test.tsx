import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { TestWrapper, cleanupBp3Overlay } from '@common/utils/testUtils'
import type { PipelineInfoConfig } from 'services/pipeline-ng'
import { useDeleteStage, DeleteStageOptionsArg } from '../useDeleteStage'

const removeNodeFromPipelineMock = jest.fn()
const getPropagatingStagesFromStageMock = jest.fn()

jest.mock('@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil', () => ({
  getPropagatingStagesFromStage: jest.fn().mockImplementation(() => getPropagatingStagesFromStageMock()),
  removeNodeFromPipeline: jest.fn().mockImplementation(() => removeNodeFromPipelineMock())
}))

function HookTestComponent({
  options,
  hookParams
}: {
  options?: DeleteStageOptionsArg
  hookParams: Parameters<typeof useDeleteStage>
}): JSX.Element {
  const { deleteStage } = useDeleteStage(...hookParams)

  return <button onClick={() => deleteStage('stage1', options)} />
}

describe('useDeleteStage tests', () => {
  afterEach(() => {
    cleanupBp3Overlay()
    getPropagatingStagesFromStageMock.mockReset()
    removeNodeFromPipelineMock.mockReset()
  })

  test('should work properly for default flow (show delete confirmation and execute deletion on confirm)', async () => {
    getPropagatingStagesFromStageMock.mockImplementation(() => [])
    removeNodeFromPipelineMock.mockImplementation(() => true)

    const pipeline: PipelineInfoConfig = { identifier: 'pipeline1', name: 'Pipeline 1' }
    const getStageFromPipeline = jest.fn().mockImplementation(() => ({ stage: { stage: { name: 'stage1' } } }))
    const updatePipeline = jest.fn()
    render(
      <TestWrapper>
        <HookTestComponent hookParams={[pipeline, getStageFromPipeline, updatePipeline]} />
      </TestWrapper>
    )

    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('deletePipelineStage')).toBeDefined()
    expect(screen.getByText('stageConfirmationText')).toBeDefined()

    fireEvent.click(screen.getByText('delete'))
    expect(removeNodeFromPipelineMock).toBeCalledTimes(1)
    expect(updatePipeline).toBeCalledTimes(1)
  })

  test('should work properly for propagated stages flow', async () => {
    getPropagatingStagesFromStageMock.mockImplementation(() => [{ stage: {} }, { stage: {} }])
    removeNodeFromPipelineMock.mockImplementation(() => true)

    const pipeline: PipelineInfoConfig = { identifier: 'pipeline1', name: 'Pipeline 1' }
    const getStageFromPipeline = jest.fn().mockImplementation(() => ({ stage: { stage: { name: 'stage1' } } }))
    const updatePipeline = jest.fn()
    render(
      <TestWrapper>
        <HookTestComponent hookParams={[pipeline, getStageFromPipeline, updatePipeline]} />
      </TestWrapper>
    )

    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('deletePipelineStage')).toBeDefined()
    expect(screen.getByText('pipeline.parentStageDeleteWarning')).toBeDefined()

    fireEvent.click(screen.getByText('delete'))
    expect(removeNodeFromPipelineMock).toBeCalledTimes(1)
    expect(updatePipeline).toBeCalledTimes(1)
  })

  test('should not call updatePipeline if stage is not removed', async () => {
    getPropagatingStagesFromStageMock.mockImplementation(() => [])
    removeNodeFromPipelineMock.mockImplementation(() => false)

    const pipeline: PipelineInfoConfig = { identifier: 'pipeline1', name: 'Pipeline 1' }
    const getStageFromPipeline = jest.fn().mockImplementation(() => ({ stage: { stage: { name: 'stage1' } } }))
    const updatePipeline = jest.fn()
    render(
      <TestWrapper>
        <HookTestComponent hookParams={[pipeline, getStageFromPipeline, updatePipeline]} />
      </TestWrapper>
    )

    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('deletePipelineStage')).toBeDefined()
    expect(screen.getByText('stageConfirmationText')).toBeDefined()

    fireEvent.click(screen.getByText('delete'))
    expect(removeNodeFromPipelineMock).toBeCalledTimes(1)
    expect(removeNodeFromPipelineMock).toReturnWith(false)
    expect(updatePipeline).toBeCalledTimes(0)
  })

  test('should call before and after callbacks', async () => {
    getPropagatingStagesFromStageMock.mockImplementation(() => [])
    removeNodeFromPipelineMock.mockImplementation(() => true)
    const before = jest.fn()
    const after = jest.fn()

    const pipeline: PipelineInfoConfig = { identifier: 'pipeline1', name: 'Pipeline 1' }
    const getStageFromPipeline = jest.fn().mockImplementation(() => ({ stage: { stage: { name: 'stage1' } } }))
    const updatePipeline = jest.fn()
    render(
      <TestWrapper>
        <HookTestComponent options={{ before, after }} hookParams={[pipeline, getStageFromPipeline, updatePipeline]} />
      </TestWrapper>
    )

    fireEvent.click(screen.getByRole('button'))

    fireEvent.click(screen.getByText('delete'))
    expect(before).toBeCalledTimes(1)
    expect(before).toBeCalledTimes(1)
  })
})
