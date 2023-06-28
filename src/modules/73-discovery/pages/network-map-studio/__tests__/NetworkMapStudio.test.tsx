/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, modulePathProps, projectPathProps } from '@common/utils/routeUtils'
import NetworkMapStudio from '../NetworkMapStudio'

jest.useFakeTimers({ advanceTimers: true })

jest.mock('@discovery/pages/network-map-studio/views/select-service/SelectService', () => ({
  ...jest.requireActual('@discovery/pages/network-map-studio/views/select-service/SelectService'),
  __esModule: true,
  default: () => {
    return (
      <div className={'discovery-view-mock'}>
        <p>Select Service</p>
      </div>
    )
  }
}))

const PATH = routes.toCreateNetworkMap({ ...accountPathProps, ...projectPathProps, ...modulePathProps })
const PATH_PARAMS = {
  accountId: 'accountId',
  orgIdentifier: 'default',
  projectIdentifier: 'Discovery_Test',
  module: 'chaos'
}

describe('Network Map Creation', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should render header and tabs', async () => {
    const { container, getByTestId } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <NetworkMapStudio />
      </TestWrapper>
    )

    await userEvent.click(getByTestId('edit') as HTMLElement)

    const name = document.querySelector('input[name="name"]') as HTMLInputElement
    act(() => {
      fireEvent.change(name, { target: { value: 'testNetworkMap' } })
    })
    expect(name).toHaveValue('testNetworkMap')

    act(() => {
      fireEvent.change(name, { target: { value: 'test1' } })
    })
    expect(name).toHaveValue('test1')

    expect(container).toBeDefined()
  })

  test('should submit form data', async () => {
    const { findByText, getByTestId } = render(
      <TestWrapper>
        <NetworkMapStudio />
      </TestWrapper>
    )

    await userEvent.click(getByTestId('edit') as HTMLElement)
    const name = document.querySelector('input[name="name"]') as HTMLInputElement
    act(() => {
      fireEvent.change(name, { target: { value: 'testNetworkMap' } })
    })
    expect(name).toHaveValue('testNetworkMap')

    const submitBtn = await findByText('confirm')
    act(() => {
      fireEvent.click(submitBtn)
    })
  })

  test('should close the modal', async () => {
    const { findByText, getByTestId } = render(
      <TestWrapper>
        <NetworkMapStudio />
      </TestWrapper>
    )

    await userEvent.click(getByTestId('edit') as HTMLElement)
    const name = document.querySelector('input[name="name"]') as HTMLInputElement
    act(() => {
      fireEvent.change(name, { target: { value: 'testNetworkMap' } })
    })
    expect(name).toHaveValue('testNetworkMap')

    const cancelBtn = await findByText('cancel')
    act(() => {
      fireEvent.click(cancelBtn)
    })
  })

  test('should switch tabs', async () => {
    const { getByText } = render(
      <TestWrapper>
        <NetworkMapStudio />
      </TestWrapper>
    )

    const tabs = document.querySelector('input[name="networkMapTabs"]') as HTMLInputElement
    await userEvent.click(getByText('discovery.tabs.configureRelations'))

    expect(tabs).toBeDefined()
  })
})
