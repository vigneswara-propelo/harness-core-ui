import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { Message } from '@dashboards/types/AidaTypes.types'
import AidaChatRenderer from '../AidaChatRenderer'

const renderComponent = (messages: Message[]): RenderResult =>
  render(
    <TestWrapper>
      <AidaChatRenderer messages={messages} />
    </TestWrapper>
  )

describe('AidaChatRenderer', () => {
  test('it should display blank screen with no messages', async () => {
    renderComponent([])

    expect(screen.queryByTestId('aida-message-0')).not.toBeInTheDocument()
  })

  test('it should display message on screen', async () => {
    const testText = 'testing'
    const mockMessage: Message = { content: testText }

    renderComponent([mockMessage])

    expect(screen.getByText(testText)).toBeInTheDocument()
  })

  test('it should display multiple messages on screen', async () => {
    const testText1 = 'Here is a message'
    const testText2 = 'another one'
    const testText3 = 'and another one'
    const mockMessage1: Message = { content: testText1 }
    const mockMessage2: Message = { content: testText2 }

    const messages = [mockMessage1, mockMessage2]

    const { rerender } = renderComponent([mockMessage1, mockMessage2])

    expect(screen.getByText(testText1)).toBeInTheDocument()
    expect(screen.getByText(testText2)).toBeInTheDocument()

    const mockMessage3: Message = { content: testText3 }
    messages.push(mockMessage3)
    rerender(
      <TestWrapper>
        <AidaChatRenderer messages={messages} />
      </TestWrapper>
    )

    expect(screen.getByText(testText3)).toBeInTheDocument()
  })
})
