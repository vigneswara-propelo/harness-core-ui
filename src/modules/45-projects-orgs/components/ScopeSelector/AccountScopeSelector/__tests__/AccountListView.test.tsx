/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { defaultTo } from 'lodash-es'
import { TestWrapper, findDialogContainer } from '@common/utils/testUtils'
import { AccountListView } from '../AccountListView'
import mocks from './mocks.json'

const setDefaultAccountMock = jest.fn(() => mocks.switchAccount)
const switchAccountMock = jest.fn(() => mocks.switchAccount)

jest.mock('services/portal', () => ({
  ...(jest.requireActual('services/portal') as any),
  useGetUserAccounts: () => {
    return {
      data: mocks,
      refetch: jest.fn()
    }
  },
  useSetDefaultAccountForCurrentUser: () => {
    return {
      mutate: setDefaultAccountMock
    }
  },
  useRestrictedSwitchAccount: () => {
    return {
      mutate: switchAccountMock
    }
  }
}))

jest.mock('services/cd-ng', () => ({
  ...(jest.requireActual('services/cd-ng') as any),
  useGetCurrentUserInfo: () => {
    return {
      refetch: jest.fn()
    }
  }
}))

function WrapperComponent(): JSX.Element {
  return (
    <TestWrapper>
      <AccountListView accounts={defaultTo(mocks?.resource?.content, []) as any} />
    </TestWrapper>
  )
}

describe('Account List View', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('accounts are rendered', async () => {
    const { getAllByRole } = render(<WrapperComponent />)
    const rows = getAllByRole('row')
    expect(rows).toHaveLength(3)
  })
  test('switch account', async () => {
    render(<WrapperComponent />)
    const account = await screen.findByText('Id: kmpySmUISimoRrJL6NL73w')
    fireEvent.click(account)
    const dialog = findDialogContainer()
    expect(dialog).toBeDefined()
    expect(dialog).toHaveTextContent('common.switchAccount')
    const switchAccountBtn = await screen.findByText('common.switch')
    act(() => {
      fireEvent.click(switchAccountBtn)
    })
    expect(switchAccountMock).toHaveBeenCalledWith({ accountId: 'kmpySmUISimoRrJL6NL73w' })
  })
  test('Set as default', async () => {
    const { container, findByText } = render(<WrapperComponent />)
    const setDefaultButton = container.querySelector('span[icon="tick-circle"]') as HTMLElement
    fireEvent.click(setDefaultButton)
    const dialog = findDialogContainer() as HTMLElement
    expect(dialog).toBeDefined()
    const continueButton = await findByText('continue')
    act(() => {
      fireEvent.click(continueButton)
    })
    expect(setDefaultAccountMock).toHaveBeenCalledWith(undefined, {
      pathParams: { accountId: 'kmpySmUISimoRrJL6NL73w' }
    })
  })
})
