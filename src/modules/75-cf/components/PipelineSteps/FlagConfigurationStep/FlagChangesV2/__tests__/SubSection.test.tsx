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
import SubSection, { SubSectionProps } from '../SubSection'

const renderComponent = (props: Partial<SubSectionProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <SubSection title="TITLE" onRemove={jest.fn()} {...props} />
    </TestWrapper>
  )

describe('SubSection', () => {
  test('it should display the passed title and children', async () => {
    const title = 'TEST TITLE'
    const children = <span data-testid="test-child">Test child</span>
    renderComponent({ title, children })

    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument()
    expect(screen.getByTestId('test-child')).toBeInTheDocument()
  })

  test('it should display the remove button and call the handler when the onRemove handler is passed', async () => {
    const onRemoveMock = jest.fn()
    renderComponent({ onRemove: onRemoveMock })

    expect(onRemoveMock).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: 'cf.pipeline.flagConfiguration.removeFlagChange' }))

    expect(onRemoveMock).toHaveBeenCalled()
  })
})
