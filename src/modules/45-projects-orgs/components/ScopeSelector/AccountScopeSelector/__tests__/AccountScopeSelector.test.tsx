/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import { Scope } from 'framework/types/types'
import * as portalServices from 'services/portal'
import { useGetUserAccounts } from 'services/portal'
import { AccountScopeSelector } from '../AccountScopeSelector'
import mocks from './mocks.json'

const handleScopeChange = jest.fn()

function WrapperComponent(): JSX.Element {
  return (
    <TestWrapper>
      <AccountScopeSelector
        clickOnLoggedInAccount={() => {
          handleScopeChange(Scope.ACCOUNT)
        }}
      />
    </TestWrapper>
  )
}

describe('Account Scope Selector', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('accounts are rendered', async () => {
    render(<WrapperComponent />)
    const row = await screen.findAllByRole('row')
    await waitFor(() => {
      expect(row).toHaveLength(3)
    })
  })

  test('test search functionality', async () => {
    jest
      .spyOn(portalServices, 'useGetUserAccounts')
      .mockImplementation(() => ({ data: mocks, refetch: jest.fn() } as any))
    render(<WrapperComponent />)
    const searchInput = screen.getByPlaceholderText('common.switchAccountSearch') as HTMLInputElement

    expect(searchInput).toBeVisible()
    expect(searchInput?.value).toBe('')

    const query = 'abcd'

    userEvent.type(searchInput, query)
    await waitFor(() => expect(searchInput?.value).toBe(query))
    await waitFor(() => expect(useGetUserAccounts).toBeCalledTimes(3))
  })

  test('test pagination functionality', async () => {
    render(<WrapperComponent />)
    const nextButton = screen.getByRole('button', { name: 'Next' })
    const previousButton = screen.getByRole('button', { name: 'Prev' })

    expect(nextButton).toBeVisible()
    expect(previousButton).toBeVisible()

    userEvent.click(nextButton)
    await waitFor(() => expect(useGetUserAccounts).toBeCalledTimes(1))

    userEvent.click(previousButton)
    await waitFor(() => expect(useGetUserAccounts).toBeCalledTimes(1))
  })
})
