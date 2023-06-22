import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useCopyToClipboard } from '../useCopyToClipboard'

function HookTestComponet(): JSX.Element {
  const { copyToClipboard } = useCopyToClipboard()
  return <button onClick={() => copyToClipboard('sample text')} />
}

beforeAll(() => {
  Object.assign(navigator, {
    clipboard: {
      writeText: () => Promise.resolve()
    }
  })
})

afterAll(() => {
  Object.assign(navigator, {})
})

describe('useCopyToClipboard tests', () => {
  test('shoud call writeText and display success toast', async () => {
    const writeTextSpy = jest.spyOn(navigator.clipboard, 'writeText')

    const { container } = render(
      <TestWrapper>
        <HookTestComponet />
      </TestWrapper>
    )

    fireEvent.click(container.getElementsByTagName('button')[0])

    expect(writeTextSpy).toBeCalledWith('sample text')
    expect(await screen.findByText('clipboardCopySuccess')).toBeDefined()
  })

  test('shoud show error toast', async () => {
    const writeTextSpy = jest.spyOn(navigator.clipboard, 'writeText')
    writeTextSpy.mockImplementation((_data: string) => Promise.reject())

    const { container } = render(
      <TestWrapper>
        <HookTestComponet />
      </TestWrapper>
    )

    fireEvent.click(container.getElementsByTagName('button')[0])

    expect(await screen.findByText('clipboardCopyFail')).toBeDefined()
  })
})
