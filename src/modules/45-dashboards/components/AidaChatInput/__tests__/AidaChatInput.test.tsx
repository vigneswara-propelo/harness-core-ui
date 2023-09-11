import React from 'react'
import { act, fireEvent, render, RenderResult, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import AidaChatInput from '..'

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
    expect(container.querySelector('svg')?.getAttribute('data-icon')).toEqual('arrow-right')
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

    expect(input.value).toBe(mockText)
  })

  test('it should trigger onEnter callback when enter pressed with text in input', async () => {
    const onEnterMock = jest.fn()

    renderComponent(onEnterMock)

    const input = screen.getByPlaceholderText('common.csBot.askAIDA') as HTMLInputElement
    const mockText = 'dummy text'

    fireEvent.keyPress(input, { key: 'Enter', charCode: 13 })
    expect(onEnterMock).toHaveBeenCalledTimes(0)

    await act(async () => {
      fireEvent.change(input, {
        target: { value: mockText }
      })
    })
    fireEvent.keyPress(input, { key: 'Enter', charCode: 13 })
    expect(onEnterMock).toHaveBeenCalledTimes(1)
  })
})
