import React from 'react'
import { waitFor, render, RenderResult, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useDashboardsContext } from '@dashboards/pages/DashboardsContext'
import { Message, MessageRole, MessageType, VisualizationType } from '@dashboards/types/AidaTypes.types'
import * as sharedService from 'services/custom-dashboards'

import AidaGenerating from '../AidaGenerating'

const renderComponent = (messages: Message[], onError = jest.fn()): RenderResult =>
  render(
    <TestWrapper>
      <AidaGenerating messages={messages} onError={onError} />
    </TestWrapper>
  )

const generateMockAiTile = (
  mockDashboard: sharedService.DashboardModel
): Promise<sharedService.GetDashboardResponse> => {
  return Promise.resolve({ resource: mockDashboard })
}

jest.mock('@dashboards/pages/DashboardsContext', () => ({
  useDashboardsContext: jest.fn()
}))

describe('AidaGenerating', () => {
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

  test('it should display generation text', () => {
    renderComponent([])
    expect(screen.getByText('dashboards.aida.generating')).toBeInTheDocument()
  })

  test('it should attempt to perform generation from messages', async () => {
    const model = 'mockModel'
    const explore = 'mockExplore'
    const visualization_type = VisualizationType.BarChart
    const query = 'query message'

    const mockMessage1: Message = {
      id: '1',
      content: 'message1',
      type: MessageType.Prompt,
      role: MessageRole.Assistant,
      promptMapping: [
        { key: 'model', value: model },
        { key: 'explore', value: explore }
      ]
    }
    const mockMessage2: Message = {
      id: '2',
      content: 'message3',
      type: MessageType.Prompt,
      role: MessageRole.Assistant,
      promptMapping: [{ key: 'visualization', value: visualization_type }]
    }
    const mockMessage3: Message = { id: '3', content: query, type: MessageType.Text, role: MessageRole.User }

    const mockMessages: Message[] = [mockMessage1, mockMessage2, mockMessage3]
    renderComponent(mockMessages)

    await waitFor(() => expect(updateAiTileDetailsMock).toHaveBeenCalled())

    const expectedBody: sharedService.AiAddTileRequestBody = {
      model,
      explore,
      visualization_type,
      query
    }
    expect(updateAiTileDetailsMock).toHaveBeenCalledWith(expectedBody)
  })

  test('it should trigger error callback if request fails', async () => {
    const generateMockAiTileFailure = (): Promise<sharedService.GetDashboardResponse> => {
      return Promise.reject()
    }

    useAiGenerateTileMock.mockReturnValue({
      mutate: generateMockAiTileFailure,
      loading: true,
      error: null
    } as any)
    useDashboardsContextMock.mockReturnValue({ updateAiTileDetails: updateAiTileDetailsMock })

    const model = 'mockModel'
    const explore = 'mockExplore'
    const visualization_type = VisualizationType.BarChart
    const query = 'query message'

    const mockMessage1: Message = {
      id: '1',
      content: 'message1',
      type: MessageType.Prompt,
      role: MessageRole.Assistant,
      promptMapping: [
        { key: 'model', value: model },
        { key: 'explore', value: explore }
      ]
    }
    const mockMessage2: Message = {
      id: '2',
      content: 'message3',
      type: MessageType.Prompt,
      role: MessageRole.Assistant,
      promptMapping: [{ key: 'visualization', value: visualization_type }]
    }
    const mockMessage3: Message = { id: '3', content: query, type: MessageType.Text, role: MessageRole.User }

    const mockMessages: Message[] = [mockMessage1, mockMessage2, mockMessage3]

    const onMockError = jest.fn()
    renderComponent(mockMessages, onMockError)

    await waitFor(() => expect(onMockError).toHaveBeenCalled())
    expect(updateAiTileDetailsMock).not.toHaveBeenCalled()
  })
})
