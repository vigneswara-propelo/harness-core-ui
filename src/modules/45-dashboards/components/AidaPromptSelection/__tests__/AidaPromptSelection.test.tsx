import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import { Prompt } from '@dashboards/types/AidaTypes.types'
import AidaPromptSelection, { AidaPromptSelectionProps } from '../AidaPromptSelection'

const renderComponent = (props: AidaPromptSelectionProps): RenderResult =>
  render(
    <TestWrapper>
      <AidaPromptSelection {...props} />
    </TestWrapper>
  )

describe('AidaPromptSelection', () => {
  const title = 'Test Title'

  const promptContent1 = 'Prompt 1'
  const promptContent2 = 'Prompt 2'
  const promptContent3 = 'Prompt 3'
  const promptContent4 = 'Prompt 4'

  const promptTitle1 = 'Prompt Title 1'
  const promptTitle2 = 'Prompt Title 2'

  test('it should display prompt selection title', async () => {
    renderComponent({ prompts: [], onPromptSelected: jest.fn(), title })

    expect(screen.getByText(title)).toBeInTheDocument()
  })

  test('it should display prompt without sub-title', async () => {
    const prompt: Prompt = {
      options: [{ content: promptContent1 }]
    }
    renderComponent({ prompts: [prompt], onPromptSelected: jest.fn(), title })

    expect(screen.getByText(promptContent1)).toBeInTheDocument()
    expect(screen.queryByTestId('prompt-title-0')).not.toBeInTheDocument()
  })

  test('it should display prompt with sub-title', async () => {
    const prompt: Prompt = {
      title: promptTitle1,
      options: [{ content: promptContent1 }]
    }
    renderComponent({ prompts: [prompt], onPromptSelected: jest.fn(), title })

    expect(screen.getByText(promptContent1)).toBeInTheDocument()
    expect(screen.getByTestId('prompt-title-0')).toBeInTheDocument()
    expect(screen.getByText(promptTitle1)).toBeInTheDocument()
  })

  test('it should allow prompt to be clicked', async () => {
    const prompt: Prompt = {
      title: promptTitle1,
      options: [{ content: promptContent1 }]
    }
    const mockPromptSelect = jest.fn()
    renderComponent({ prompts: [prompt], onPromptSelected: mockPromptSelect, title })

    expect(screen.getByText(promptContent1)).toBeInTheDocument()
    const promptButton = screen.getByTestId('prompt-option-0-0')

    await userEvent.click(promptButton)
    expect(mockPromptSelect).toHaveBeenCalled()
  })

  test('it should display multiple prompts with multiple options', async () => {
    const prompt1: Prompt = {
      title: promptTitle1,
      options: [{ content: promptContent1 }, { content: promptContent2 }]
    }

    const prompt2: Prompt = {
      options: [{ content: promptContent3 }]
    }
    const prompt3: Prompt = {
      title: promptTitle2,
      options: [{ content: promptContent4 }]
    }
    const mockPromptSelect = jest.fn()
    renderComponent({ prompts: [prompt1, prompt2, prompt3], onPromptSelected: mockPromptSelect, title })

    expect(screen.getByText(promptTitle1)).toBeInTheDocument()
    expect(screen.getByText(promptContent1)).toBeInTheDocument()
    expect(screen.getByText(promptContent2)).toBeInTheDocument()
    expect(screen.getByText(promptContent3)).toBeInTheDocument()
    expect(screen.getByText(promptTitle2)).toBeInTheDocument()
    expect(screen.getByText(promptContent4)).toBeInTheDocument()

    const promptButton = screen.getByTestId('prompt-option-2-0')
    expect(promptButton).toBeInTheDocument()

    await userEvent.click(promptButton)
    expect(mockPromptSelect).toHaveBeenCalledWith(prompt3.options[0])
  })
})
