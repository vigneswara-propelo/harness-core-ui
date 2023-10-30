/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, queryByText, render, waitFor } from '@testing-library/react'
import routes from '@common/RouteDefinitions'
import { TestWrapper } from '@common/utils/testUtils'
import * as servicediscovery from 'services/servicediscovery'
import { useListNetworkMap } from 'services/servicediscovery'
import { accountPathProps, discoveryPathProps, modulePathProps, projectPathProps } from '@common/utils/routeUtils'
import NetworkMapTable from '../NetworkMapTable'

const agentName = 'test-agent'
const k8sConnectorID = 'k8s-connector'

const PATH = routes.toDiscoveredResource({
  ...accountPathProps,
  ...projectPathProps,
  ...modulePathProps,
  ...discoveryPathProps
})
const PATH_PARAMS = {
  accountId: 'accountId',
  orgIdentifier: 'default',
  projectIdentifier: 'Discovery_Test',
  module: 'chaos',
  dAgentId: 'dAgent-1'
}

const mockNetworkMapData = {
  page: {
    all: false,
    index: 0,
    limit: 10,
    totalPages: 1,
    totalItems: 1
  },
  items: [
    {
      id: '6492f875dc6b5f823d67c072',
      name: 'test-nw-map',
      identity: 'testnwmap',
      description: '',
      tags: null,
      agentID: '64920dbb66c663ba792cf134',
      resources: [
        {
          id: '64920dc166c663ba792cf379',
          kind: 'Service'
        },
        {
          id: '64920dc166c663ba792cf37a',
          kind: 'Service'
        },
        {
          id: '64920dc166c663ba792cf37b',
          kind: 'Service'
        }
      ],
      connections: [
        {
          to: {
            id: '64920dc166c663ba792cf37a',
            kind: 'Service'
          },
          from: {
            id: '64920dc166c663ba792cf379',
            kind: 'Service'
          },
          type: '',
          port: '80',
          params: null
        },
        {
          to: {
            id: '64920dc166c663ba792cf37b',
            kind: 'Service'
          },
          from: {
            id: '64920dc166c663ba792cf37a',
            kind: 'Service'
          },
          type: '',
          port: '9006',
          params: null
        },
        {
          to: {
            id: '64920dc166c663ba792cf37c',
            kind: 'Service'
          },
          from: {
            id: '64920dc166c663ba792cf37b',
            kind: 'Service'
          },
          type: '',
          port: '9000',
          params: null
        }
      ],
      createdAt: '2023-06-21T13:17:41.491Z',
      createdBy: 'VgWXxi_6TdqAyplTQMg4CQ',
      updatedBy: '',
      removed: false
    }
  ]
}

jest.mock('services/servicediscovery', () => ({
  useListNetworkMap: jest.fn().mockImplementation(() => {
    return { data: mockNetworkMapData, refetch: jest.fn(), error: null, loading: false }
  }),
  useDeleteNetworkMap: jest.fn().mockImplementation(() => ({
    loading: false,
    mutate: jest.fn().mockImplementation(() => {
      return Promise.resolve({
        status: 'SUCCESS',
        data: {}
      })
    }),
    refetch: jest.fn()
  }))
}))

const getEditButton = (): Element | null => document.body.querySelector('.bp3-menu span[icon="edit"]')
const getDeleteButton = (): Element | null => document.body.querySelector('.bp3-menu span[icon="trash"]')
const getMenuIcon = (row: Element): Element | null => {
  const columns = row.querySelectorAll('[role="cell"]')
  const lastColumn = columns[columns.length - 1]
  return lastColumn.querySelector('[data-icon="Options"]')
}

describe('<NetworkMapTable /> tests with data', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2023-06-28'))
  })
  test('should match snapshot', async () => {
    const { container } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <NetworkMapTable agentName={agentName} connectorID={k8sConnectorID} />
      </TestWrapper>
    )
    expect(useListNetworkMap).toBeCalled()
    expect(container).toMatchSnapshot()
  })

  test('open menu and check the options', async () => {
    const { container } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <NetworkMapTable agentName={agentName} connectorID={k8sConnectorID} />
      </TestWrapper>
    )

    const tableRows = Array.from(container.querySelectorAll('div[role="row"]'))
    tableRows.shift() // remove header row

    const testRow = async (row: Element): Promise<void> => {
      const menuIcon = getMenuIcon(row)
      // assert that menu icon exists in the last column
      expect(menuIcon).toBeTruthy()
      const checkForMenuState = async (shouldExist = false): Promise<void> => {
        if (shouldExist) {
          await waitFor(() => expect(getEditButton()).toBeTruthy())
          await waitFor(() => expect(getDeleteButton()).toBeTruthy())
        } else {
          await waitFor(() => expect(getEditButton()).not.toBeTruthy())
          await waitFor(() => expect(getDeleteButton()).not.toBeTruthy())
        }
      }
      // menu should not be open by default
      await checkForMenuState()
      act(() => {
        fireEvent.click(menuIcon!)
      })
      // menu should open on clicking the options icon
      await checkForMenuState(true)

      act(() => {
        fireEvent.mouseDown(document)
      })
    }
    await testRow(tableRows[0])
  })

  test('Edit and delete methods should be called with correct data', async () => {
    const { container, getByTestId } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <NetworkMapTable agentName={agentName} connectorID={k8sConnectorID} />
      </TestWrapper>
    )
    const menuIcon = getMenuIcon(container.querySelectorAll('div[role="row"]')[1])
    act(() => {
      fireEvent.click(menuIcon!)
    })

    // Click delete and cancel
    act(() => {
      fireEvent.click(getDeleteButton()!)
    })
    await waitFor(() =>
      expect(queryByText(document.body, 'discovery.permissions.confirmDeleteTitleNetworkMap')).toBeTruthy()
    )
    act(() => {
      fireEvent.click(queryByText(document.body.querySelector('.bp3-dialog')! as HTMLElement, 'cancel')!)
    })

    // Click delete and then confirm
    act(() => {
      fireEvent.click(getDeleteButton()!)
    })
    act(() => {
      fireEvent.click(queryByText(document.body.querySelector('.bp3-dialog')! as HTMLElement, 'delete')!)
    })

    // Click edit
    act(() => {
      fireEvent.click(getEditButton()!)
    })
    expect(getByTestId('location').innerHTML).toEqual(
      routes.toCreateNetworkMap({
        accountId: 'accountId',
        orgIdentifier: 'default',
        projectIdentifier: 'Discovery_Test',
        module: 'chaos',
        dAgentId: 'dAgent-1',
        networkMapId: 'testnwmap'
      })
    )
  })

  test('click on new NetworkMap button', async () => {
    const { getByText, getByTestId } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <NetworkMapTable agentName={agentName} connectorID={k8sConnectorID} />
      </TestWrapper>
    )

    expect(useListNetworkMap).toBeCalled()
    fireEvent.click(getByText('discovery.newNetworkMap'))

    expect(getByTestId('location').innerHTML).toEqual(
      routes.toCreateNetworkMap({
        accountId: 'accountId',
        orgIdentifier: 'default',
        projectIdentifier: 'Discovery_Test',
        module: 'chaos',
        dAgentId: 'dAgent-1',
        networkMapId: '-1'
      })
    )
  })

  test('test search functionality', async () => {
    const { container, getByPlaceholderText } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <NetworkMapTable agentName={agentName} connectorID={k8sConnectorID} />
      </TestWrapper>
    )

    const query = 'test-nw-map'
    const searchInput = getByPlaceholderText('discovery.searchNetworkMap') as HTMLInputElement
    expect(searchInput).not.toBe(null)
    if (!searchInput) {
      throw Error('no search input')
    }
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: query } })
    })
    await waitFor(() => expect(searchInput?.value).toBe(query))

    expect(container).toMatchSnapshot()
  })
})

describe('<NetworkMapTable /> tests without data', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2023-06-28'))
    jest.clearAllMocks()
  })

  test('should render loading view correctly', async () => {
    jest.spyOn(servicediscovery, 'useListNetworkMap').mockImplementation((): any => {
      return {
        data: { items: [] },
        loading: false
      }
    })

    const { container, getByText } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <NetworkMapTable agentName={agentName} connectorID={k8sConnectorID} />
      </TestWrapper>
    )
    expect(getByText('discovery.discoveryDetails.networkMaps.noNetworkMapHeader')).toBeVisible()

    expect(container).toMatchSnapshot()
  })
})
