/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, getByRole as getByRoleFromRTL } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { setPublicAccessPromise } from 'services/cd-ng'
import { TestWrapper, findDialogContainer } from '@common/utils/testUtils'
import EnablePublicAccess from '../EnablePublicAccess'

jest.mock('services/cd-ng')
const setUpdating = jest.fn()

describe('EnablePublicAccess', () => {
  test('that setPublicAccess operation was successful', async () => {
    const refetchAuthSettings = jest.fn()
    const mockSetPublicAccessPromise = jest.fn(() => {
      return Promise.resolve({
        metaData: {},
        resource: true,
        responseMessages: []
      })
    })
    ;(setPublicAccessPromise as jest.Mock).mockImplementationOnce(mockSetPublicAccessPromise)

    const { getByTestId } = render(
      <TestWrapper>
        <EnablePublicAccess
          enabled={false}
          refetchAuthSettings={refetchAuthSettings}
          canEdit={true}
          setUpdating={setUpdating}
        />
      </TestWrapper>
    )

    const switchBtn = getByTestId('toggle-enable-public-access')
    await userEvent.click(switchBtn!)

    const dialogContainer = findDialogContainer()
    expect(dialogContainer).toBeInTheDocument()
    const enableButton = getByRoleFromRTL(dialogContainer as HTMLElement, 'button', { name: 'enable' })
    await userEvent.click(enableButton)

    await waitFor(() => expect(setPublicAccessPromise).toBeCalled())

    // after switch click, since mock 'setPublicAccessPromise' returns true, refetchAuthSettings should be called
    expect(refetchAuthSettings).toHaveBeenCalled()
  })

  test('that setPublicAccess operation failed', async () => {
    const refetchAuthSettings = jest.fn()
    const mockSetPublicAccessPromiseFalsyValue = jest.fn(() => {
      return Promise.resolve({
        metaData: {},
        resource: false,
        responseMessages: []
      })
    })
    ;(setPublicAccessPromise as jest.Mock).mockImplementationOnce(mockSetPublicAccessPromiseFalsyValue)

    const { getByTestId, queryByText } = render(
      <TestWrapper>
        <EnablePublicAccess
          enabled={false}
          refetchAuthSettings={refetchAuthSettings}
          canEdit={true}
          setUpdating={setUpdating}
        />
      </TestWrapper>
    )

    const switchBtn = getByTestId('toggle-enable-public-access')
    await userEvent.click(switchBtn!)

    const dialogContainer = findDialogContainer()
    expect(dialogContainer).toBeInTheDocument()
    const enableButton = getByRoleFromRTL(dialogContainer as HTMLElement, 'button', { name: 'enable' })
    await userEvent.click(enableButton)

    await waitFor(() => expect(setPublicAccessPromise).toBeCalled())

    await waitFor(() => expect(queryByText('somethingWentWrong')).toBeTruthy())
    expect(refetchAuthSettings).not.toHaveBeenCalled()
  })

  test('that while trying to setPublicAccess, a run-time error is appropriately handled', async () => {
    const refetchAuthSettings = jest.fn()

    const mockSetPublicAccessPromiseFail = jest.fn(() => {
      throw new Error('Simulated run-time error occurred')
    })
    ;(setPublicAccessPromise as jest.Mock).mockImplementationOnce(mockSetPublicAccessPromiseFail)

    const { getByTestId } = render(
      <TestWrapper>
        <EnablePublicAccess
          enabled={false}
          refetchAuthSettings={refetchAuthSettings}
          canEdit={true}
          setUpdating={setUpdating}
        />
      </TestWrapper>
    )

    const switchBtn = getByTestId('toggle-enable-public-access')
    await userEvent.click(switchBtn!)

    const dialogContainer = findDialogContainer()
    expect(dialogContainer).toBeInTheDocument()
    const enableButton = getByRoleFromRTL(dialogContainer as HTMLElement, 'button', { name: 'enable' })
    await userEvent.click(enableButton)

    await waitFor(() => expect(setPublicAccessPromise).toBeCalled())

    expect(refetchAuthSettings).not.toHaveBeenCalled()
  })
})
