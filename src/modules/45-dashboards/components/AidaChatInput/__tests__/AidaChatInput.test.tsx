import React from 'react'
import { act, fireEvent, render, RenderResult, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import AidaChatInput from '../AidaChatInput'

const renderComponent = (onEnter: (value: string) => void = jest.fn()): RenderResult =>
  render(
    <TestWrapper>
      <AidaChatInput onEnter={onEnter} />
    </TestWrapper>
  )

describe('AidaChatInput', () => {
  test('it should display placeholder text in input', async () => {
    const { container } = renderComponent()
    expect(screen.getByPlaceholderText('common.csBot.askAIDA')).toBeInTheDocument()
    expect(container.querySelector('svg')).toHaveAttribute('data-icon', 'arrow-right')
  })

  test('it should allow text entry within input', async () => {
    renderComponent()

    const input = screen.getByPlaceholderText('common.csBot.askAIDA') as HTMLInputElement

    const mockText = 'dummy text'
    await act(async () => {
      fireEvent.change(input, {
        target: { value: mockText }
      })
    })

    expect(input).toHaveValue(mockText)
  })

  test('it should trigger onEnter callback when enter pressed with text in input', async () => {
    const onEnterMock = jest.fn()

    renderComponent(onEnterMock)

    const input = screen.getByPlaceholderText('common.csBot.askAIDA') as HTMLInputElement
    const mockText = 'dummy text'

    await userEvent.click(input)
    await userEvent.keyboard('{Enter}')

    expect(onEnterMock).not.toHaveBeenCalled()

    await userEvent.type(input, mockText)
    expect(input).toHaveValue(mockText)

    await userEvent.keyboard('{Enter}')
    expect(onEnterMock).toHaveBeenCalledTimes(1)
  })
})
