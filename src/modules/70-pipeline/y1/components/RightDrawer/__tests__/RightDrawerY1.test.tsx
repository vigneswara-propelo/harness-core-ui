import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import { RightDrawerY1 } from '../RightDrawerY1'
import { DrawerTypesY1 } from '../../PipelineContext/PipelineActionsY1'
import { PipelineContextInterfaceY1, PipelineContextY1 } from '../../PipelineContext/PipelineContextY1'

const updatePipelineView = jest.fn()
const pipelineView = {
  isSplitViewOpen: false,
  isDrawerOpened: true,
  isYamlEditable: true,
  splitViewData: {},
  drawerData: { type: DrawerTypesY1.RuntimeInputs }
}
const pipelineContext = {
  state: {
    pipelineView
  },
  updatePipelineView
} as unknown as PipelineContextInterfaceY1

describe('RightDrawerY1', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  test('should render drawer with content', async () => {
    render(
      <TestWrapper>
        <PipelineContextY1.Provider value={pipelineContext}>
          <RightDrawerY1 />
        </PipelineContextY1.Provider>
      </TestWrapper>
    )

    expect(await screen.findByText('pipeline.runtimeInputs')).toBeInTheDocument()
    expect(await screen.findByText('applyChanges')).toBeInTheDocument()
    expect(await screen.findByText('pipeline.discard')).toBeInTheDocument()
    expect(await screen.findByText('pipeline.inputListInfo')).toBeInTheDocument()
    expect(await screen.findByText('pipeline.noRuntimeInputsCreated')).toBeInTheDocument()
    expect(await screen.findByText('pipeline.addRuntimeInput')).toBeInTheDocument()
  })

  test('should call updatePipelineView on drawer close', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <PipelineContextY1.Provider value={pipelineContext}>
          <RightDrawerY1 />
        </PipelineContextY1.Provider>
      </TestWrapper>
    )

    await user.click(screen.getByTestId('drawer-close-btn'))

    await waitFor(() => {
      expect(updatePipelineView).toBeCalledTimes(1)
      expect(updatePipelineView).toBeCalledWith({
        ...pipelineView,
        isDrawerOpened: false,
        drawerData: { type: DrawerTypesY1.AddStep }
      })
    })
  })
})
