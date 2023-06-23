/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, fireEvent, act } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import ChangeSourceTable from '../ChangeSourceTable'
import { ChangeSourceOptions } from './ChangeSourceTable.mock'

const onEdit = jest.fn()
const onSuccess = jest.fn()
jest.mock('@cv/components/ContextMenuActions/ContextMenuActions', () => (props: any) => {
  return (
    <>
      <div className="context-menu-mock-edit" onClick={props?.onEdit} />
      <div className="context-menu-mock-delete" onClick={props?.onSuccess} />
    </>
  )
})

describe('Test Change Source Table', () => {
  test('ChangeSource table renders empty with no data card', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <ChangeSourceTable value={[]} onEdit={onEdit} onSuccess={onSuccess} />
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('cv.changeSource.noChangeSource')).toBeTruthy())
    expect(container).toMatchSnapshot()
  })

  test('Verify changeSource renders and validate value in row', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <ChangeSourceTable value={ChangeSourceOptions} onEdit={onEdit} onSuccess={onSuccess} />
      </TestWrapper>
    )
    // verify single row renders
    await waitFor(() => expect(container.querySelectorAll('.TableV2--body  [role="row"]').length).toEqual(1))
    // verify changesource name
    await waitFor(() => expect(getByText('Harness CD')).toBeTruthy())
    // verify changesource type
    await waitFor(() => expect(getByText('deploymentText')).toBeTruthy())
    // verify onEdit isClickable
    await act(() => {
      fireEvent.click(container.querySelector('.context-menu-mock-edit')!)
    })
    await waitFor(() => expect(onEdit).toHaveBeenCalled())
  })
})
