/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import CheckboxWithPrompt from '../CheckboxWithPrompt'

describe('CheckboxWithPrompt', () => {
  test('CheckboxWithPrompt should render checkbox with all given props correctly', () => {
    const onChange = jest.fn()
    const { container } = render(
      <TestWrapper>
        <CheckboxWithPrompt checkboxLabel="test" onChange={onChange} checked popupTitleText="Test popup title" />
      </TestWrapper>
    )

    expect(container.querySelector('input[type="checkbox"]')).toBeInTheDocument()
    expect(screen.getByText(/test/)).toBeInTheDocument()
  })

  test('CheckboxWithPrompt should show the popup on uncheck of checkbox', async () => {
    const onChange = jest.fn()
    const { container } = render(
      <TestWrapper>
        <CheckboxWithPrompt
          checkboxLabel="test"
          checkboxName="test checkbox name"
          onChange={onChange}
          checked
          showPromptOnUnCheck
          popupTitleText="Test popup title"
        />
      </TestWrapper>
    )

    expect(container.querySelector('input[type="checkbox"]')).toBeInTheDocument()

    await userEvent.click(container.querySelector('input[type="checkbox"]')!)

    expect(onChange).not.toHaveBeenCalled()

    expect(document.body.querySelector('[class*="useConfirmationDialog"]')).toBeDefined()

    const modalDeleteBtn = screen.queryAllByText('confirm')[0]
    await userEvent.click(modalDeleteBtn!)

    await waitFor(() => {
      expect(document.body.innerHTML).not.toContain('useConfirmationDialog')
    })

    expect(onChange).toHaveBeenCalledWith(false, 'test checkbox name')
  })

  test('CheckboxWithPrompt should not show the popup on uncheck of checkbox, if showPromptOnUnCheck prop is not passed', async () => {
    const onChange = jest.fn()
    const { container } = render(
      <TestWrapper>
        <CheckboxWithPrompt
          checkboxLabel="test"
          checkboxName="test checkbox name"
          onChange={onChange}
          checked
          popupTitleText="Test popup title"
        />
      </TestWrapper>
    )

    await userEvent.click(container.querySelector('input[type="checkbox"]')!)

    expect(onChange).toHaveBeenCalledWith(false, 'test checkbox name')
  })
})
