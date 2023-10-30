import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import { RightBarY1 } from '../RightBarY1'
import { DrawerTypesY1 } from '../../PipelineContext/PipelineActionsY1'
import { PipelineContextInterfaceY1, PipelineContextY1 } from '../../PipelineContext/PipelineContextY1'

const updatePipelineView = jest.fn()
const pipelineView = {
  isSplitViewOpen: false,
  isDrawerOpened: false,
  isYamlEditable: true,
  splitViewData: {},
  drawerData: {
    type: DrawerTypesY1.AddStep
  }
}
const pipelineContext = {
  state: {
    pipelineView
  },
  updatePipelineView
} as unknown as PipelineContextInterfaceY1

describe('RightBarY1', () => {
  beforeAll(() => {
    jest.resetAllMocks()
  })

  test('should render runtime inputs button', async () => {
    render(
      <TestWrapper>
        <PipelineContextY1.Provider value={pipelineContext}>
          <RightBarY1 />
        </PipelineContextY1.Provider>
      </TestWrapper>
    )

    expect(screen.getByTestId('runtime-inputs-nav-tile')).toBeInTheDocument()
  })

  test('should call updatePipelineView on runtime inputs button click', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <PipelineContextY1.Provider value={pipelineContext}>
          <RightBarY1 />
        </PipelineContextY1.Provider>
      </TestWrapper>
    )

    await user.click(screen.getByTestId('runtime-inputs-nav-tile'))

    await waitFor(() => {
      expect(updatePipelineView).toBeCalledTimes(1)
      expect(updatePipelineView).toBeCalledWith({
        ...pipelineView,
        isDrawerOpened: true,
        drawerData: { type: DrawerTypesY1.RuntimeInputs },
        isSplitViewOpen: false,
        splitViewData: {}
      })
    })
  })
})
