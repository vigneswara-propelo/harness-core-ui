/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, queryByText, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, modulePathProps, networkMapPathProps, projectPathProps } from '@common/utils/routeUtils'
import NetworkMapStudio from '../NetworkMapStudio'
import { mockNetworkMap } from './mockNetworkMap'

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

jest.mock('@discovery/hooks/useDiscoveryIndexedDBHook', () => ({
  useDiscoveryIndexedDBHook: jest.fn().mockReturnValue({
    isInitializingDB: false,
    dbInstance: {
      get: jest.fn(() => Promise.resolve(mockNetworkMap)),
      put: jest.fn(() => Promise.resolve()),
      delete: jest.fn(() => Promise.resolve()),
      transaction: jest.fn().mockReturnValue({
        objectStore: jest.fn().mockReturnValue({
          get: jest.fn(() => Promise.resolve(mockNetworkMap)),
          put: jest.fn(() => Promise.resolve()),
          delete: jest.fn(() => Promise.resolve())
        })
      })
    }
  }),
  DiscoveryObjectStoreNames: {}
}))

const mockCreateNetworkMap = jest.fn().mockImplementation(() => Promise.resolve())

jest.mock('services/servicediscovery', () => ({
  useCreateNetworkMap: jest.fn().mockImplementation(() => {
    return { mutate: mockCreateNetworkMap }
  })
}))

const PATH = routes.toCreateNetworkMap({
  ...accountPathProps,
  ...projectPathProps,
  ...modulePathProps,
  ...networkMapPathProps
})
const PATH_PARAMS = {
  accountId: 'accountId',
  orgIdentifier: 'default',
  projectIdentifier: 'Discovery_Test',
  module: 'chaos',
  dAgentId: 'dAgent-1',
  networkMapId: 'testnetworkmap'
}

describe('Network Map Creation', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should render the component', async () => {
    const { container } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <NetworkMapStudio />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should open name toggle on empty networkMap', async () => {
    const { getByText } = render(
      <TestWrapper path={PATH} pathParams={{ ...PATH_PARAMS, networkMapId: '-1' }}>
        <NetworkMapStudio />
      </TestWrapper>
    )

    expect(document.body.querySelector('.bp3-dialog')! as HTMLElement).not.toBeNull()

    const name = document.querySelector('input[name="name"]') as HTMLInputElement
    act(() => {
      fireEvent.change(name, { target: { value: 'testnwmap' } })
    })
    expect(name).toHaveValue('testnwmap')

    // Submit form
    act(() => {
      fireEvent.click(getByText('confirm'))
    })
  })

  test('should edit name and description', () => {
    const { container, getByTestId, getByText } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <NetworkMapStudio />
      </TestWrapper>
    )

    act(() => {
      fireEvent.click(getByTestId('edit') as HTMLElement)
    })

    const name = document.querySelector('input[name="name"]') as HTMLInputElement
    act(() => {
      fireEvent.change(name, { target: { value: 'testnwmap' } })
    })
    expect(name).toHaveValue('testnwmap')
    expect(container).toMatchSnapshot()

    // Cancel change
    act(() => {
      fireEvent.click(getByText('cancel'))
    })

    fireEvent.click(getByTestId('edit') as HTMLElement)
    act(() => {
      fireEvent.change(name, { target: { value: 'test1' } })
    })
    expect(name).toHaveValue('test1')

    // Submit form
    act(() => {
      fireEvent.click(getByText('confirm'))
    })
  })

  test('should switch tabs', async () => {
    const { container, getByText } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <NetworkMapStudio />
      </TestWrapper>
    )

    fireEvent.click(getByText('discovery.tabs.configureRelations'))
    expect(container).toMatchSnapshot()
    fireEvent.click(getByText('discovery.tabs.selectServices'))
    expect(container).toMatchSnapshot()
  })

  test('should call discard function', async () => {
    const { container, getByText } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <NetworkMapStudio />
      </TestWrapper>
    )

    act(() => {
      fireEvent.click(getByText('common.discard'))
    })
    expect(container).toMatchSnapshot()
    act(() => {
      fireEvent.click(queryByText(document.body.querySelector('.bp3-dialog')! as HTMLElement, 'cancel')!)
    })

    act(() => {
      fireEvent.click(getByText('common.discard'))
    })
    expect(container).toMatchSnapshot()
    act(() => {
      fireEvent.click(queryByText(document.body.querySelector('.bp3-dialog')! as HTMLElement, 'confirm')!)
    })
  })

  test('should change tabs', async () => {
    const { container, getByText } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <NetworkMapStudio />
      </TestWrapper>
    )

    act(() => {
      fireEvent.click(getByText('discovery.tabs.configureRelations'))
    })

    expect(container).toMatchSnapshot()
  })
})
