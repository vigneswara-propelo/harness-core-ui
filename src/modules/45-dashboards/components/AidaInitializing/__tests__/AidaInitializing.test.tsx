import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as sharedService from 'services/custom-dashboards'

import AidaInitializing from '../AidaInitializing'

const renderComponent = (onInitialized = jest.fn(), onError = jest.fn()): RenderResult =>
  render(
    <TestWrapper>
      <AidaInitializing onInitialized={onInitialized} onError={onError} />
    </TestWrapper>
  )

jest.mock('@dashboards/pages/DashboardsContext', () => ({
  useDashboardsContext: jest.fn()
}))

describe('AidaGenerating', () => {
  const useGetAiGenerateTilePromptsMock = jest.spyOn(sharedService, 'useGetAiGenerateTilePrompts')

  beforeEach(() => {
    jest.clearAllMocks()
    useGetAiGenerateTilePromptsMock.mockReturnValue({
      data: {},
      loading: true,
      error: null
    } as any)
  })

  test('it should display initialization text', () => {
    renderComponent()
    expect(screen.getByText('dashboards.aida.initializing')).toBeInTheDocument()
  })

  test('it should trigger initialization callback upon request success', () => {
    const mockPrompts: sharedService.GenerateTilePrompt = {
      explore_prompts: []
    }
    useGetAiGenerateTilePromptsMock.mockReturnValue({
      data: { resource: mockPrompts },
      loading: false,
      error: null
    } as any)
    const mockFunc = jest.fn()
    renderComponent(mockFunc)
    expect(mockFunc).toHaveBeenCalledWith(mockPrompts)
  })

  test('it should trigger error callback upon request error', () => {
    const mockError: sharedService.ErrorResponse = {
      code: 500,
      responseMessages: '',
      error: ''
    }
    useGetAiGenerateTilePromptsMock.mockReturnValue({
      data: {},
      loading: false,
      error: { data: mockError }
    } as any)
    const mockFunc = jest.fn()
    renderComponent(jest.fn(), mockFunc)
    expect(mockFunc).toHaveBeenCalled()
  })
})
