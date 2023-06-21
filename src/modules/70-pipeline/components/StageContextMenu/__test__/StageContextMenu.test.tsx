import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import {
  PipelineContext,
  PipelineContextInterface
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import StageContextMenu from '../StageContextMenu'
import DeleteStageMenuItem from '../DeleteStageMenuItem'
import EditStageMenuItem from '../EditStageMenuItem'

describe('StageContextMenu tests', () => {
  test('should open menu with EditStageMenuItem and DeleteStageMenuItem items', () => {
    const mockContext: Partial<PipelineContextInterface> = { deleteStage: jest.fn(), setSelection: jest.fn() }
    const { getByText, getAllByText, getByRole } = render(
      <TestWrapper>
        <PipelineContext.Provider value={mockContext as PipelineContextInterface}>
          <StageContextMenu>
            <EditStageMenuItem stageId="stage1" />
            <DeleteStageMenuItem stageId="stage1" />
          </StageContextMenu>
        </PipelineContext.Provider>
      </TestWrapper>
    )

    const btn = getByRole('button')
    expect(btn).toBeDefined()
    fireEvent.click(btn)

    // note: icon decs and text has the same text 'edit'
    expect(getAllByText('edit').length).toBe(2)
    expect(getByText('delete')).toBeDefined()
  })
})

describe('EditStageMenuItem tests', () => {
  test('should call setSelection on click', () => {
    const setSelection = jest.fn()
    const mockContext: Partial<PipelineContextInterface> = { setSelection }
    const { getByRole } = render(
      <TestWrapper>
        <PipelineContext.Provider value={mockContext as PipelineContextInterface}>
          <StageContextMenu>
            <EditStageMenuItem stageId="stage1" />
          </StageContextMenu>
        </PipelineContext.Provider>
      </TestWrapper>
    )

    const btn = getByRole('button')
    expect(btn).toBeDefined()
    fireEvent.click(btn)

    const btnEditMenuItem = getByRole('listitem')
    fireEvent.click(btnEditMenuItem.childNodes[0])

    expect(setSelection).toBeCalledWith({
      sectionId: 'OVERVIEW',
      stageId: 'stage1'
    })
  })
})

describe('DeleteStageMenuItem tests', () => {
  test('should call deleteStage on click', () => {
    const deleteStage = jest.fn()
    const mockContext: Partial<PipelineContextInterface> = { deleteStage }
    const { getByRole } = render(
      <TestWrapper>
        <PipelineContext.Provider value={mockContext as PipelineContextInterface}>
          <StageContextMenu>
            <DeleteStageMenuItem stageId="stage1" />
          </StageContextMenu>
        </PipelineContext.Provider>
      </TestWrapper>
    )

    const btn = getByRole('button')
    expect(btn).toBeDefined()
    fireEvent.click(btn)

    const btnEditMenuItem = getByRole('listitem')
    fireEvent.click(btnEditMenuItem.childNodes[0])

    expect(deleteStage).toBeCalledWith('stage1')
  })
})
