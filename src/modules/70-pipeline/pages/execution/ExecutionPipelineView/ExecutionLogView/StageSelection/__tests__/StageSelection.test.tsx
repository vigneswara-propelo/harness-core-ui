/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, getAllByText, render, waitFor, getByTestId } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { StageSelection } from '../StageSelection'
import { executionContextMock } from './mock'

jest.mock('@pipeline/context/ExecutionContext', () => ({
  useExecutionContext: () => executionContextMock
}))

const assertEntityPopover = async (container: HTMLElement, entityName: string): Promise<void> => {
  await act(async () => {
    fireEvent.mouseEnter(getAllByText(container, entityName)[0])
  })
  await waitFor(() => expect(getByTestId(document.body, 'dynamic-popover')).toBeInTheDocument())
  await act(async () => {
    fireEvent.mouseLeave(getAllByText(container, entityName)[0])
  })
}

describe('StageSelection', () => {
  test('Assert stage and step dynamic popover in console view', async () => {
    const { container } = render(
      <TestWrapper>
        <StageSelection openExecutionTimeInputsForStep={jest.fn()} />
      </TestWrapper>
    )

    await assertEntityPopover(container, 'stage_root')
    await assertEntityPopover(container, 'simpleMatrix_stable_v0')
    await assertEntityPopover(container, 'stepGroup1')
    await assertEntityPopover(container, 'stepGroup1_stable_v0')
    await assertEntityPopover(container, 'ShellScript_1_stable_v0')
    expect(container.querySelectorAll('.nameWrapper').length).toBe(4)
  })
})
