/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import routes from '@common/RouteDefinitions'
import { TestWrapper } from '@common/utils/testUtils'
import * as servicediscovery from 'services/servicediscovery'
import { useListNetworkMap } from 'services/servicediscovery'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import NetworkMapTable from '../NetworkMapTable'

const PATH = routes.toDiscovery({ ...accountPathProps, ...projectPathProps })
const PATH_PARAMS = {
  accountId: 'accountId',
  orgIdentifier: 'default',
  projectIdentifier: 'Discovery_Test',
  module: 'chaos'
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

describe('<DiscoveryPage /> tests', () => {
  test('should match snapshot', async () => {
    const { container } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <NetworkMapTable />
      </TestWrapper>
    )
    expect(useListNetworkMap).toBeCalled()

    expect(container).toMatchSnapshot()
  })

  test('should render loading view correctly', async () => {
    jest.spyOn(servicediscovery, 'useListNetworkMap').mockImplementation((): any => {
      return {
        data: { items: [] },
        loading: false
      }
    })

    // eslint-disable-next-line @typescript-eslint/no-shadow
    const { container, getByText } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <NetworkMapTable />
      </TestWrapper>
    )
    expect(getByText('discovery.discoveryDetails.networkMaps.noNetworkMapHeader')).toBeVisible()

    expect(container).toMatchSnapshot()
  })
})
