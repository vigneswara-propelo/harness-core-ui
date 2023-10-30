/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, queryByText, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, modulePathProps, networkMapPathProps, projectPathProps } from '@common/utils/routeUtils'
import mockImport from 'framework/utils/mockImport'
import { StudioTabs } from '@modules/73-discovery/interface/networkMapStudio'
import NetworkMapStudio from '../NetworkMapStudio'
import { mockNetworkMap } from './mockNetworkMap'

jest.useFakeTimers({ advanceTimers: true })

jest.mock('@discovery/pages/network-map-studio/views/select-service/SelectService', () => ({
  ...jest.requireActual('@discovery/pages/network-map-studio/views/select-service/SelectService'),
  __esModule: true,
  default: () => {
    return <div>Select Service</div>
  }
}))

jest.mock('@discovery/pages/network-map-studio/views/configure/ConfigureNetworkMap', () => ({
  ...jest.requireActual('@discovery/pages/network-map-studio/views/configure/ConfigureNetworkMap'),
  __esModule: true,
  default: () => {
    return <div>Configure Network Map</div>
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
const mockRefetch = jest.fn().mockImplementation(() => Promise.resolve())

jest.mock('services/servicediscovery', () => ({
  useCreateNetworkMap: jest.fn().mockImplementation(() => {
    return { mutate: mockCreateNetworkMap }
  }),
  useGetNetworkMap: jest.fn().mockImplementation(() => {
    return { data: mockNetworkMap, refetch: mockRefetch }
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

  test('should render the configure tab', async () => {
    const { container } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS} queryParams={{ tab: StudioTabs.CONFIGURE_RELATIONS }}>
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
    expect(getByText('testnwmap')).toBeInTheDocument()
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
    expect(getByText('test1')).toBeInTheDocument()
  })

  test('should call save function', async () => {
    const { getByText } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <NetworkMapStudio />
      </TestWrapper>
    )

    act(() => {
      waitFor(() => fireEvent.click(getByText('save')))
    })
    waitFor(() => expect(mockCreateNetworkMap).toHaveBeenCalledTimes(1))
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
    waitFor(() => expect(container).toMatchSnapshot())

    act(() => {
      fireEvent.click(getByText('discovery.tabs.selectServices'))
    })
    waitFor(() => expect(container).toMatchSnapshot())
  })

  test('test edit networkmap case', async () => {
    // getting empty data from idb
    const mockGet = jest.fn().mockImplementation(() => Promise.resolve(undefined))
    const mockPut = jest.fn().mockImplementation(() => Promise.resolve())
    mockImport('@discovery/hooks/useDiscoveryIndexedDBHook', () => ({
      useDiscoveryIndexedDBHook: jest.fn().mockReturnValue({
        isInitializingDB: false,
        dbInstance: {
          get: mockGet,
          put: mockPut,
          delete: jest.fn(() => Promise.resolve()),
          transaction: jest.fn().mockReturnValue({
            objectStore: jest.fn().mockReturnValue({
              get: mockGet,
              put: jest.fn(() => Promise.resolve()),
              delete: jest.fn(() => Promise.resolve())
            })
          })
        }
      }),
      DiscoveryObjectStoreNames: {}
    }))

    const { container, getByText } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <NetworkMapStudio />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()

    waitFor(() => expect(mockGet).toHaveBeenCalledTimes(1))
    waitFor(() => expect(mockRefetch).toHaveBeenCalledTimes(1))
    waitFor(() => expect(mockPut).toHaveBeenCalledTimes(1))
    waitFor(() => expect(getByText('testnetworkmap')).toBeInTheDocument())
  })

  test('test save with empty data', async () => {
    // getting empty data from idb
    const mockGet = jest.fn().mockImplementation(() => Promise.resolve(undefined))
    const mockPut = jest.fn().mockImplementation(() => Promise.resolve())
    mockImport('@discovery/hooks/useDiscoveryIndexedDBHook', () => ({
      useDiscoveryIndexedDBHook: jest.fn().mockReturnValue({
        isInitializingDB: false,
        dbInstance: {
          get: mockGet,
          put: mockPut,
          delete: jest.fn(() => Promise.resolve()),
          transaction: jest.fn().mockReturnValue({
            objectStore: jest.fn().mockReturnValue({
              get: mockGet,
              put: jest.fn(() => Promise.resolve()),
              delete: jest.fn(() => Promise.resolve())
            })
          })
        }
      }),
      DiscoveryObjectStoreNames: {}
    }))

    const { container, getByText } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <NetworkMapStudio />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    act(() => {
      waitFor(() => fireEvent.click(getByText('save')))
    })
    waitFor(() => expect(mockCreateNetworkMap).not.toHaveBeenCalled())
  })
})
