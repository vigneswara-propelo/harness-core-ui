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
import DeleteWithPrompt from '../DeleteWithPrompt'

describe('DeleteWithPrompt', () => {
  test('DeleteWithPrompt should render delete icon with given props correctly', async () => {
    const onClick = jest.fn()
    const { container } = render(
      <TestWrapper>
        <DeleteWithPrompt index={0} onClick={onClick} itemName="testItem" showPromptOnDelete />
      </TestWrapper>
    )

    expect(container.querySelector('span[data-icon="main-delete"]')).toBeInTheDocument()

    await userEvent.click(container.querySelector('span[data-icon="main-delete"]')!)

    expect(onClick).not.toHaveBeenCalled()

    expect(document.body.querySelector('[class*="useConfirmationDialog"]')).toBeDefined()

    const modalDeleteBtn = screen.queryAllByText('confirm')[0]
    await userEvent.click(modalDeleteBtn!)

    await waitFor(() => {
      expect(document.body.innerHTML).not.toContain('useConfirmationDialog')
    })

    expect(onClick).toHaveBeenCalledWith('testItem', 0)
  })

  test('DeleteWithPrompt should not show popup, if showPromptOnDelete prop is not given', async () => {
    const onClick = jest.fn()
    const { container } = render(
      <TestWrapper>
        <DeleteWithPrompt index={0} onClick={onClick} itemName="testItem" />
      </TestWrapper>
    )

    expect(container.querySelector('span[data-icon="main-delete"]')).toBeInTheDocument()

    await userEvent.click(container.querySelector('span[data-icon="main-delete"]')!)

    expect(onClick).toHaveBeenCalledWith('testItem', 0)
  })
})
