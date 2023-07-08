/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
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
  accountIdentifier: '',
  id: '',
  identity: '',
  k8sConnector: {
    id: ''
  },
  name: '',
  organizationIdentifier: '',
  projectIdentifier: '',
  createdAt: '2023-06-21T13:17:41.491Z',
  createdBy: 'VgWXxi_6TdqAyplTQMg4CQ',
  updatedAt: '2023-06-21T13:17:41.491Z',
  installationDetails: {
    createdAt: '2023-06-21T13:17:41.491Z',
    createdBy: 'VgWXxi_6TdqAyplTQMg4CQ',
    updatedAt: '2023-06-21T13:17:41.491Z'
  },
  updatedBy: ''
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
})
