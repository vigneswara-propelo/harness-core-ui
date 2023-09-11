import React from 'react'
import { act, fireEvent, render, RenderResult, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useDashboardsContext } from '@dashboards/pages/DashboardsContext'
import * as sharedService from 'services/custom-dashboards'
import AidaDashboardContent from '..'

const renderComponent = (): RenderResult =>
  render(
    <TestWrapper>
      <AidaDashboardContent />
    </TestWrapper>
  )

jest.mock('@dashboards/pages/DashboardsContext', () => ({
  useDashboardsContext: jest.fn()
}))

const generateMockAiTile = (
  mockDashboard: sharedService.DashboardModel
): Promise<sharedService.GetDashboardResponse> => {
  return new Promise(resolve => {
    resolve({ resource: mockDashboard })
  })
}

describe('AidaDashboardContent', () => {
  const useAiGenerateTileMock = jest.spyOn(sharedService, 'useAiGenerateTile')

  const useDashboardsContextMock = useDashboardsContext as jest.Mock
  const updateAiTileDetailsMock = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    useAiGenerateTileMock.mockReturnValue({
      mutate: generateMockAiTile,
      loading: true,
      error: null
    } as any)
    useDashboardsContextMock.mockReturnValue({ updateAiTileDetails: updateAiTileDetailsMock })
  })

  test('it should display Explore stage as default', () => {
    renderComponent()
    expect(screen.getByText('dashboards.aida.selectExplore')).toBeInTheDocument()
  })

  test('it should move through all of the stages to generation stage', async () => {
    renderComponent()

    // Explore stage
    const explorePromptButton = screen.getByTestId('prompt-option-0-0')

    act(() => {
      fireEvent.click(explorePromptButton)
    })

    // Visualizaton stage
    expect(screen.getByText('dashboards.aida.selectVisualisation')).toBeInTheDocument()

    const visPromptButton = screen.getByTestId('prompt-option-0-0')

    act(() => {
      fireEvent.click(visPromptButton)
    })

    // Chat box stage
    const input = screen.getByPlaceholderText('common.csBot.askAIDA') as HTMLInputElement
    expect(input).toBeInTheDocument()

    const mockText = 'dummy text'
    await act(async () => {
      fireEvent.change(input, {
        target: { value: mockText }
      })
    })
    fireEvent.keyPress(input, { key: 'Enter', charCode: 13 })

    expect(screen.getByText('dashboards.aida.generating')).toBeInTheDocument()
  })
})
