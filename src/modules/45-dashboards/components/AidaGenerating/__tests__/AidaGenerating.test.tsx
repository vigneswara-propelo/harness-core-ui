import React from 'react'
import { waitFor, render, RenderResult, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useDashboardsContext } from '@dashboards/pages/DashboardsContext'
import { Message, MessageType, VisualizationType } from '@dashboards/types/AidaTypes.types'
import * as sharedService from 'services/custom-dashboards'

import AidaGenerating from '..'

const renderComponent = (messages: Message[]): RenderResult =>
  render(
    <TestWrapper>
      <AidaGenerating messages={messages} />
    </TestWrapper>
  )

const generateMockAiTile = (
  mockDashboard: sharedService.DashboardModel
): Promise<sharedService.GetDashboardResponse> => {
  return new Promise(resolve => {
    resolve({ resource: mockDashboard })
  })
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
      content: 'message1',
      type: MessageType.Prompt,
      promptMapping: [
        { key: 'model', value: model },
        { key: 'explore', value: explore }
      ]
    }
    const mockMessage2: Message = {
      content: 'message3',
      type: MessageType.Prompt,
      promptMapping: [{ key: 'visualization', value: visualization_type }]
    }
    const mockMessage3: Message = { content: query, type: MessageType.Text }

    const mockMessages: Message[] = [mockMessage1, mockMessage2, mockMessage3]
    renderComponent(mockMessages)

    await waitFor(() => expect(updateAiTileDetailsMock).toHaveBeenCalled())

    const expectedBody: sharedService.AiAddTileRequestBody = {
      model,
      explore,
      visualization_type,
      query
    }
    expect(updateAiTileDetailsMock.mock.calls[0][0]).toStrictEqual(expectedBody)
  })
})
