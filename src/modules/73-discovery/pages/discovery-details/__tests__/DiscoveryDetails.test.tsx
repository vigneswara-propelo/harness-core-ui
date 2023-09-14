/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import * as servicediscovery from 'services/servicediscovery'
import { accountPathProps, discoveryPathProps, modulePathProps, projectPathProps } from '@common/utils/routeUtils'
import { DiscoveryTabs } from '@discovery/interface/discovery'
import DiscoveryDetails from '../DiscoveryDetails'

jest.useFakeTimers({ advanceTimers: true })

jest.mock('@discovery/pages/discovery-details/views/discovered-resources/DiscoveredResources', () => ({
  ...jest.requireActual('@discovery/pages/discovery-details/views/discovered-resources/DiscoveredResources'),
  __esModule: true,
  default: () => {
    return <div className={'discovered-services'}>Discovered Resources</div>
  }
}))

jest.mock('@discovery/pages/discovery-details/views/network-map/NetworkMapTable', () => ({
  ...jest.requireActual('@discovery/pages/discovery-details/views/network-map/NetworkMapTable'),
  __esModule: true,
  default: () => {
    return <div className={'network-map'}>Network Map Table</div>
  }
}))

jest.mock('@discovery/pages/discovery-details/views/discovery-history/DiscoveryHistory', () => ({
  ...jest.requireActual('@discovery/pages/discovery-details/views/discovery-history/DiscoveryHistory'),
  __esModule: true,
  default: () => {
    return <div className={'discovery-history'}>Discovery History</div>
  }
}))

const mockDiscoveryAgent: servicediscovery.ApiGetAgentResponse = {
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
    createdAt: '2023-06-21T13:17:41.491Z',
    updatedAt: '2023-06-21T13:17:41.491Z',
    createdBy: 'VgWXxi_6TdqAyplTQMg4CQ',
    updatedBy: ''
  },
  config: {
    kubernetes: {
      namespaced: false,
      namespace: 'sd1',
      serviceAccount: 'cluster-admin-1',
      imageRegistry: 'index.docker.io/shovan1995',
      imageTag: 'ci',
      imagePullPolicy: 'Always',
      resources: {}
    },
    data: {
      enableNodeAgent: false,
      enableStorageResources: false,
      enableBatchResources: false,
      retryInSecond: 100,
      retryCount: 3,
      batchSize: 100,
      collectionWindowInMin: 2
    }
  }
}

const fetchDiscoveryAgent = jest.fn(() => {
  return Object.create(mockDiscoveryAgent)
})

jest.mock('services/servicediscovery', () => ({
  useGetAgent: jest.fn().mockImplementation(() => {
    return { data: mockDiscoveryAgent, refetch: fetchDiscoveryAgent, error: null, loading: false }
  })
}))

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

describe('<DiscoveryDetails /> tests', () => {
  beforeEach(() => jest.clearAllMocks())

  test('should match snapshot', async () => {
    const { container } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <DiscoveryDetails />
      </TestWrapper>
    )
    expect(servicediscovery.useGetAgent).toBeCalled()

    expect(container).toMatchSnapshot()
  })

  test('should render loading view correctly', async () => {
    jest.spyOn(servicediscovery, 'useGetAgent').mockImplementation((): any => {
      return {
        data: undefined,
        loading: true
      }
    })

    const { container } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <DiscoveryDetails />
      </TestWrapper>
    )
    expect(servicediscovery.useGetAgent).toBeCalled()

    expect(container).toMatchSnapshot()
  })

  test('should render error view correctly', async () => {
    jest.spyOn(servicediscovery, 'useGetAgent').mockImplementation((): any => {
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
        <DiscoveryDetails />
      </TestWrapper>
    )
    expect(servicediscovery.useGetAgent).toBeCalled()

    expect(container).toMatchSnapshot()

    expect(getByText('discovery.discoveryDetails.tabTitles.history')).toBeInTheDocument()
  })

  test('changed discovered details tabs', async () => {
    const { container } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <DiscoveryDetails />
      </TestWrapper>
    )

    fireEvent.click(container.querySelector(`[data-tab-id="${DiscoveryTabs.NETWORK_MAP}"]`)!)
    expect(container).toMatchSnapshot()

    fireEvent.click(container.querySelector(`[data-tab-id="${DiscoveryTabs.DISCOVERY_HISTORY}"]`)!)
    expect(container).toMatchSnapshot()

    fireEvent.click(container.querySelector(`[data-tab-id="${DiscoveryTabs.SETTINGS}"]`)!)
    expect(container).toMatchSnapshot()

    fireEvent.click(container.querySelector(`[data-tab-id="${DiscoveryTabs.DISCOVERED_RESOURCES}"]`)!)
    expect(container).toMatchSnapshot()
  })
})
