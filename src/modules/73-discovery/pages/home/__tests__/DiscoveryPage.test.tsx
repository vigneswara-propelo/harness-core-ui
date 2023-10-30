/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import * as servicediscovery from 'services/servicediscovery'
import { accountPathProps, modulePathProps, projectPathProps } from '@common/utils/routeUtils'
import { ApiGetAgentResponse, useListAgent } from 'services/servicediscovery'
import type { DrawerProps } from '../views/create-discovery-agent/CreateDAgent'
import DiscoveryPage from '../DiscoveryPage'

jest.mock('@discovery/pages/home/views/create-discovery-agent/CreateDAgent', () => ({
  ...jest.requireActual('@discovery/pages/home/views/create-discovery-agent/CreateDAgent'),
  __esModule: true,
  default: () => {
    return <div className={'create-d-agent'}>CreateDAgent</div>
  }
}))

jest.mock('@discovery/pages/home/views/empty-state/EmptyStateDiscoveryAgent', () => ({
  ...jest.requireActual('@discovery/pages/home/views/empty-state/EmptyStateDiscoveryAgent'),
  __esModule: true,
  default: (props: DrawerProps) => {
    return (
      <div className={'discovery-view-mock'}>
        <h1>Empty State Discovery Table</h1>
        <button onClick={() => props.setDrawerOpen(prev => !prev)}>Open Discovery Drawer</button>
      </div>
    )
  }
}))

jest.mock('@discovery/components/DiscoveryAgentTable/DiscoveryAgentTable', () => ({
  ...jest.requireActual('@discovery/components/DiscoveryAgentTable/DiscoveryAgentTable'),
  __esModule: true,
  default: () => {
    return <div className={'discovery-agent-table'}>Discovery Agent Table</div>
  }
}))

const paginationProps = {
  all: true,
  index: 0,
  totalItems: 1,
  totalPages: 1
}

const mockDiscoveryAgent: ApiGetAgentResponse = {
  id: '648ffda242d20c0d04713e05',
  name: 'local-1',
  identity: 'local-1',
  description: '',
  accountIdentifier: 'VgWXxi_6TdqAyplTQMg4CQ',
  organizationIdentifier: 'default',
  projectIdentifier: 'test',
  createdAt: '2023-06-21T13:17:41.491Z',
  updatedAt: '2023-06-21T13:17:41.491Z',
  createdBy: 'VgWXxi_6TdqAyplTQMg4CQ',
  updatedBy: '',
  installationDetails: {
    id: '648ffda242d20c0d04713e06',
    agentID: '648ffda242d20c0d04713e05',
    delegateTaskID: 'DFmiyJTUSF-reLnjH2q8lQ',
    delegateID: '',
    delegateTaskStatus: 'SUCCESS',
    agentDetails: {},
    createdAt: '2023-06-19T07:02:58.75Z',
    createdBy: 'VgWXxi_6TdqAyplTQMg4CQ',
    updatedBy: '',
    removed: false
  },
  config: {
    kubernetes: {
      namespaced: false,
      namespace: 'sd1',
      serviceAccount: 'cluster-admin-1',
      imageRegistry: 'index.docker.io/shovan1995',
      imageTag: 'ci',
      imagePullPolicy: 'Always'
    },
    data: {
      enableNodeAgent: false,
      enableBatchResources: false,
      collectionWindowInMin: 2
    }
  }
}

const mockDiscoveryList = {
  items: [mockDiscoveryAgent],
  page: paginationProps
}

const fetchDiscoveryAgents = jest.fn(() => {
  return Object.create(mockDiscoveryList)
})

jest.mock('services/servicediscovery', () => ({
  useListAgent: jest.fn().mockImplementation(() => {
    return { data: mockDiscoveryList, refetch: fetchDiscoveryAgents, error: null, loading: false }
  })
}))

const PATH = routes.toDiscovery({ ...accountPathProps, ...projectPathProps, ...modulePathProps })
const PATH_PARAMS = {
  accountId: 'accountId',
  orgIdentifier: 'default',
  projectIdentifier: 'Discovery_Test',
  module: 'chaos'
}

describe('<DiscoveryPage /> tests', () => {
  beforeEach(() => jest.clearAllMocks())
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2023-06-28'))
  })

  test('should match snapshot', async () => {
    const { container } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <DiscoveryPage />
      </TestWrapper>
    )
    expect(useListAgent).toBeCalled()

    expect(container).toMatchSnapshot()
  })

  test('should render loading view correctly', async () => {
    jest.spyOn(servicediscovery, 'useListAgent').mockImplementation((): any => {
      return {
        data: undefined,
        loading: true
      }
    })

    const { container } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <DiscoveryPage />
      </TestWrapper>
    )
    expect(useListAgent).toBeCalled()

    expect(container).toMatchSnapshot()
  })

  test('should render error view correctly', async () => {
    jest.spyOn(servicediscovery, 'useListAgent').mockImplementation((): any => {
      return {
        data: undefined,
        loading: false,
        error: {
          message: 'some error'
        }
      }
    })

    const { container, getByText } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <DiscoveryPage />
      </TestWrapper>
    )
    expect(useListAgent).toBeCalled()

    expect(container).toMatchSnapshot()

    expect(getByText('Open Discovery Drawer')).toBeInTheDocument()
  })

  test('should render loaded view correctly', async () => {
    jest.spyOn(servicediscovery, 'useListAgent').mockImplementation((): any => {
      return {
        data: mockDiscoveryList,
        loading: false
      }
    })

    const { getByText } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <DiscoveryPage />
      </TestWrapper>
    )
    expect(useListAgent).toBeCalled()

    expect(getByText('Discovery Agent Table')).toBeInTheDocument()
  })

  test('should render empty loaded view correctly', async () => {
    jest.spyOn(servicediscovery, 'useListAgent').mockImplementation((): any => {
      return {
        data: {
          items: [],
          page: paginationProps
        },
        loading: false
      }
    })

    const { getByText } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <DiscoveryPage />
      </TestWrapper>
    )
    expect(useListAgent).toBeCalled()

    expect(getByText('Empty State Discovery Table')).toBeInTheDocument()
  })

  test('should render empty loaded view correctly', async () => {
    jest.spyOn(servicediscovery, 'useListAgent').mockImplementation((): any => {
      return {
        data: mockDiscoveryList,
        loading: false
      }
    })
    const { container, getByText } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <DiscoveryPage />
      </TestWrapper>
    )
    expect(useListAgent).toBeCalled()

    const newDiscoveryBtn = getByText('discovery.homepage.newDiscoveryAgentBtn')
    expect(newDiscoveryBtn).not.toBeNull()
    await act(async () => {
      fireEvent.click(newDiscoveryBtn)
      expect(container).toMatchSnapshot()
    })
    const closeBtn = document.querySelectorAll('[icon="cross"]')[0]
    await act(async () => {
      fireEvent.click(closeBtn)
      expect(container).toMatchSnapshot()
    })
  })

  test('test search functionality', async () => {
    const { container, getByPlaceholderText } = render(
      <TestWrapper>
        <DiscoveryPage />
      </TestWrapper>
    )

    const query = 'test abc'
    const searchInput = getByPlaceholderText('discovery.homepage.searchDiscoveryAgent') as HTMLInputElement
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
