import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import { useDashboardsContext } from '@dashboards/pages/DashboardsContext'
import { ExplorePrompts, VisualizationPrompts } from '@dashboards/constants/AidaDashboardPrompts'
import * as sharedService from 'services/custom-dashboards'
import AidaDashboardContent from '../AidaDashboardContent'

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
  return Promise.resolve({ resource: mockDashboard })
}

const generateMockAiTileFailure = (): Promise<sharedService.GetDashboardResponse> => {
  return Promise.reject()
}

describe('AidaDashboardContent', () => {
  const useGetAiGenerateTilePromptsMock = jest.spyOn(sharedService, 'useGetAiGenerateTilePrompts')
  const useAiGenerateTileMock = jest.spyOn(sharedService, 'useAiGenerateTile')

  const useDashboardsContextMock = useDashboardsContext as jest.Mock
  const updateAiTileDetailsMock = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    useGetAiGenerateTilePromptsMock.mockReturnValue({
      data: {},
      loading: false,
      error: {
        data: {
          code: 500,
          responseMessages: '',
          error: ''
        }
      }
    } as any)

    useAiGenerateTileMock.mockReturnValue({
      mutate: generateMockAiTile,
      loading: true,
      error: null
    } as any)
    useDashboardsContextMock.mockReturnValue({ updateAiTileDetails: updateAiTileDetailsMock })
  })

  test('it should display Initializing stage as default while prompts load', () => {
    useGetAiGenerateTilePromptsMock.mockReturnValue({
      data: null,
      loading: true,
      error: null
    } as any)
    renderComponent()
    expect(screen.getByText('dashboards.aida.initializing')).toBeInTheDocument()
  })

  test('it should move through all of the stages to generation stage', async () => {
    const mockPrompts: sharedService.GenerateTilePrompt = {
      explore_prompts: ExplorePrompts,
      visualization_prompts: VisualizationPrompts
    }
    useGetAiGenerateTilePromptsMock.mockReturnValue({
      data: { resource: mockPrompts },
      loading: false,
      error: null
    } as any)

    renderComponent()

    // Explore stage
    const explorePromptButton = screen.getByTestId('prompt-option-0-0')

    await userEvent.click(explorePromptButton)

    // Visualizaton stage
    expect(screen.getByText('dashboards.aida.selectVisualisation')).toBeInTheDocument()

    const visPromptButton = screen.getByTestId('prompt-option-0-0')

    await userEvent.click(visPromptButton)

    // Chat box stage
    const input = screen.getByPlaceholderText('common.csBot.askAIDA') as HTMLInputElement
    expect(input).toBeInTheDocument()

    const mockText = 'dummy text'

    await userEvent.type(input, mockText)
    expect(input).toHaveValue(mockText)
    await userEvent.keyboard('{Enter}')

    expect(screen.getByText('dashboards.aida.generating')).toBeInTheDocument()
  })

  test('it should display AIDA trouble message if request failure occurs', async () => {
    useAiGenerateTileMock.mockReturnValue({
      mutate: generateMockAiTileFailure,
      loading: true,
      error: null
    } as any)
    useDashboardsContextMock.mockReturnValue({ updateAiTileDetails: updateAiTileDetailsMock })
    renderComponent()

    // Explore stage
    const explorePromptButton = screen.getByTestId('prompt-option-0-0')

    await userEvent.click(explorePromptButton)

    // Visualizaton stage
    expect(screen.getByText('dashboards.aida.selectVisualisation')).toBeInTheDocument()

    const visPromptButton = screen.getByTestId('prompt-option-0-0')

    await userEvent.click(visPromptButton)

    // Chat box stage
    const input = screen.getByPlaceholderText('common.csBot.askAIDA') as HTMLInputElement
    expect(input).toBeInTheDocument()

    const mockText = 'dummy text'

    await userEvent.type(input, mockText)
    expect(input).toHaveValue(mockText)
    await userEvent.keyboard('{Enter}')

    expect(screen.getByText('dashboards.aida.trouble')).toBeInTheDocument()
  })
})
