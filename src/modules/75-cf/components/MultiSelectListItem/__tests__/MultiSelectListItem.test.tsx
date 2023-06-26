/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import MultiSelectListItem, { MultiSelectListItemProps } from '../MultiSelectListItem'

const renderComponent = (props: Partial<MultiSelectListItemProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <MultiSelectListItem value="value" label="label" handleClick={jest.fn()} {...props} />
    </TestWrapper>
  )

describe('MultiSelectListItem', () => {
  test('it should render the label, value and checkbox', async () => {
    const label = 'TEST LABEL'
    const value = 'TEST VALUE'
    renderComponent({ label, value })

    expect(screen.getByText(label)).toBeInTheDocument()
    expect(screen.getByText(new RegExp(value))).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).toHaveAttribute('value', value)
  })

  test('it should call the handleClick function when clicked', async () => {
    const label = 'TEST LABEL'
    const handleClickMock = jest.fn()
    renderComponent({
      label,
      handleClick: handleClickMock
    })

    expect(handleClickMock).not.toHaveBeenCalled()

    await userEvent.click(screen.getByText(label))

    expect(handleClickMock).toHaveBeenCalled()
  })
})
