/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import * as servicediscovery from 'services/servicediscovery'
import { accountPathProps, modulePathProps, networkMapPathProps, projectPathProps } from '@common/utils/routeUtils'
import SelectService from '../SelectService'
import { mockConnections, mockNamespaces, mockNetworkMap, mockServices } from './mocks'

jest.useFakeTimers({ advanceTimers: true })

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

jest.mock('@discovery/components/NetworkGraph/NetworkGraph', () => ({
  ...jest.requireActual('@discovery/components/NetworkGraph/NetworkGraph'),
  __esModule: true,
  default: () => {
    return <div className={'networkGraph'}>Network Graph</div>
  }
}))

jest.mock('services/servicediscovery', () => ({
  useListDiscoveredService: jest.fn().mockImplementation(() => {
    return { data: mockServices, refetch: jest.fn(), error: null, loading: false }
  }),
  useListDiscoveredServiceConnection: jest.fn().mockImplementation(() => {
    return { data: mockConnections, refetch: jest.fn(), error: null, loading: false }
  }),
  useListNamespace: jest.fn().mockImplementation(() => {
    return { data: mockNamespaces, refetch: jest.fn(), error: null, loading: false }
  })
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

const handleTabChange = jest.fn()
const setNetworkMap = jest.fn().mockImplementation(() => mockNetworkMap)

const getRowCheckBox = (row: Element): HTMLInputElement => row.querySelector('input[type="checkbox"]')!
const getSelectRelatedServicesButton = (): Element => document.body.querySelector('.bp3-portal span[data-icon="Edit"]')!
const getMenuIcon = (row: Element): Element | null => {
  const columns = row.querySelectorAll('[role="cell"]')
  const lastColumn = columns[columns.length - 1]
  return lastColumn.querySelector('[data-icon="Options"]')
}

describe('<SelectService /> tests with data', () => {
  beforeEach(() => jest.clearAllMocks())

  test('should render component and call required APIs', async () => {
    const { container, getAllByRole } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <SelectService networkMap={mockNetworkMap} updateNetworkMap={setNetworkMap} handleTabChange={handleTabChange} />
      </TestWrapper>
    )
    expect(servicediscovery.useListDiscoveredService).toBeCalled()
    expect(servicediscovery.useListDiscoveredServiceConnection).toBeCalled()
    expect(servicediscovery.useListNamespace).toBeCalled()

    expect(container).toMatchSnapshot()

    const allRows = getAllByRole('row')
    const firstRow = allRows[0]
    expect(within(firstRow).getByText('adservice')).toBeInTheDocument()
    expect(within(firstRow).getByText('discovery.discoveryDetails.id: 65130e1c457bae2f07823c07')).toBeInTheDocument()
    expect(within(firstRow).getByText('common.namespace')).toBeInTheDocument()
    expect(within(firstRow).getByText('boutique')).toBeInTheDocument()
    expect(within(firstRow).getByText('common.ipAddress')).toBeInTheDocument()
    expect(within(firstRow).getByText('10.40.4.196')).toBeInTheDocument()
    expect(within(firstRow).getByText('common.smtp.port')).toBeInTheDocument()
    expect(within(firstRow).getByText('9555')).toBeInTheDocument()
  })

  test('should check service on clicking checkbox', async () => {
    const { container } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <SelectService networkMap={mockNetworkMap} updateNetworkMap={setNetworkMap} handleTabChange={handleTabChange} />
      </TestWrapper>
    )

    const tableRows = Array.from(container.querySelectorAll('div[role="row"]'))

    const testRowCheckboxClick = async (row: Element): Promise<void> => {
      const checkbox = getRowCheckBox(row)

      expect(checkbox).toBeInTheDocument()
      expect(checkbox).not.toBeChecked()
      // select
      fireEvent.click(checkbox)
      expect(container).toMatchSnapshot()
    }
    await testRowCheckboxClick(tableRows[0])
  })

  test('should check related services and menu should open and close', async () => {
    const { container } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <SelectService networkMap={mockNetworkMap} updateNetworkMap={setNetworkMap} handleTabChange={handleTabChange} />
      </TestWrapper>
    )

    const tableRows = Array.from(container.querySelectorAll('div[role="row"]'))

    const testRowMenu = async (row: Element): Promise<void> => {
      const menuIcon = getMenuIcon(row)

      // assert that menu icon exists in the last column
      expect(menuIcon).toBeTruthy()

      const checkForMenuState = async (shouldExist = false): Promise<void> => {
        const selectRelatedServices = getSelectRelatedServicesButton()
        if (shouldExist) {
          if (selectRelatedServices)
            act(() => {
              fireEvent.click(selectRelatedServices)
            })

          expect(container).toMatchSnapshot()
        } else {
          expect(selectRelatedServices).not.toBeTruthy()
        }
      }
      // menu should not be open by default
      await checkForMenuState()
      await userEvent.click(menuIcon!)

      // menu should open on clicking the options icon
      await checkForMenuState(true)

      act(() => {
        fireEvent.mouseDown(document)
      })
    }
    await testRowMenu(tableRows[0])
  })

  test('should select all service on clicking select all', async () => {
    const { container, getByText } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <SelectService networkMap={mockNetworkMap} updateNetworkMap={setNetworkMap} handleTabChange={handleTabChange} />
      </TestWrapper>
    )

    act(() => {
      fireEvent.click(getByText('common.selectAll'))
    })
    expect(container).toMatchSnapshot()
  })

  test('should select a namespace and search', async () => {
    const { container, getByTestId, getByPlaceholderText } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <SelectService networkMap={mockNetworkMap} updateNetworkMap={setNetworkMap} handleTabChange={handleTabChange} />
      </TestWrapper>
    )

    const dropdown = getByTestId('namespace')
    act(() => {
      fireEvent.click(dropdown)
    })

    const listItem = container.getElementsByClassName('DropDown--menuItem')[0]
    act(() => {
      fireEvent.click(listItem)
    })
    expect(container).toMatchSnapshot()

    const query = 'test'
    const searchInput = getByPlaceholderText('discovery.searchService') as HTMLInputElement
    expect(searchInput).not.toBe(null)
    if (!searchInput) {
      throw Error('no search input')
    }

    await userEvent.type(searchInput, query)
    await waitFor(() => expect(searchInput?.value).toBe(query))
  })

  test('should change tab on Next button', async () => {
    const { container, getByText } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <SelectService networkMap={mockNetworkMap} updateNetworkMap={setNetworkMap} handleTabChange={handleTabChange} />
      </TestWrapper>
    )

    const nextButton = getByText('next')
    act(() => {
      fireEvent.click(nextButton)
    })
    expect(container).toMatchSnapshot()
  })
})

describe('<SelectService /> tests without data', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should render loading view correctly', async () => {
    jest.spyOn(servicediscovery, 'useListDiscoveredService').mockImplementation((): any => {
      return {
        data: undefined,
        loading: true
      }
    })

    const { container } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <SelectService networkMap={mockNetworkMap} updateNetworkMap={setNetworkMap} handleTabChange={handleTabChange} />
      </TestWrapper>
    )
    expect(servicediscovery.useListDiscoveredService).toBeCalled()

    expect(container).toMatchSnapshot()
  })

  test('when namespace data is undefined', async () => {
    jest.spyOn(servicediscovery, 'useListNamespace').mockImplementation((): any => {
      return {
        data: undefined,
        loading: false,
        error: {
          message: 'some error'
        }
      }
    })
    const { container } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <SelectService networkMap={mockNetworkMap} updateNetworkMap={setNetworkMap} handleTabChange={handleTabChange} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
