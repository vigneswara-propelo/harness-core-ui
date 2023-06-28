/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import routes from '@common/RouteDefinitions'
import { TestWrapper } from '@common/utils/testUtils'
import * as servicediscovery from 'services/servicediscovery'
import { useListK8SCustomService, useListK8sCustomServiceConnection, useListNamespace } from 'services/servicediscovery'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import DiscoveredServices from '../DiscoveredServices'

jest.mock('@discovery/components/ServiceDetails/ServiceDetails', () => ({
  ...jest.requireActual('@discovery/components/ServiceDetails/ServiceDetails'),
  __esModule: true,
  default: () => {
    return <div className={'service-details'}>Service Details</div>
  }
}))

const PATH = routes.toDiscovery({ ...accountPathProps, ...projectPathProps })
const PATH_PARAMS = {
  accountId: 'accountId',
  orgIdentifier: 'default',
  projectIdentifier: 'Discovery_Test',
  module: 'chaos'
}

const mockNamespaces = {
  items: [
    {
      name: 'bt-4079',

      spec: {
        finalizers: ['kubernetes']
      },
      status: {
        phase: 'Active'
      },
      createdAt: '2023-06-20T20:36:16.62Z',
      createdBy: '',
      updatedBy: '',
      removed: false
    }
  ]
}

const mockServices = {
  items: [
    {
      id: '64920dc166c663ba792cf3b0',
      agentID: '64920dbb66c663ba792cf134',
      kind: 'Service',
      name: 'access-control',
      namespace: 'chaos-1000',
      uid: '02bfaa4d-9fcd-49ed-9e1a-08a24c491c89',
      service: {
        owner: {
          kind: 'Service',
          namespace: 'chaos-1000',
          name: 'access-control',
          uid: '02bfaa4d-9fcd-49ed-9e1a-08a24c491c89',
          apiVersion: 'v1'
        },
        ports: [
          {
            name: 'http',
            protocol: 'TCP',
            port: 9006,
            targetPort: 9006
          }
        ],
        clusterIP: '10.104.11.160',
        clusterIPs: ['10.104.11.160'],
        externalIPs: null,
        loadBalancerIP: '',
        externalName: '',
        type: 'ClusterIP'
      },
      createdAt: '2023-06-20T20:36:17.94Z',
      updatedAt: '2023-06-20T20:36:18.357Z',
      createdBy: '',
      updatedBy: '',
      removed: false
    }
  ]
}

const mockConnections = {
  items: [
    {
      id: '64920e3866c663ba792cf569',
      type: 'TCP',
      sourceID: '64920dc166c663ba792cf3b0',
      sourceName: 'access-control',
      sourceNamespace: 'chaos-1000',
      sourceIP: '10.100.2.2',
      destinationID: '64920dc166c663ba792cf3bb',
      destinationName: 'harness-manager',
      destinationNamespace: 'chaos-1000',
      destinationIP: '10.104.11.119',
      destinationPort: '9090'
    },
    {
      id: '64920e3866c663ba792cf56a',
      type: 'TCP',
      sourceID: '64920dc166c663ba792cf3b0',
      sourceName: 'access-control',
      sourceNamespace: 'chaos-1000',
      sourceIP: '10.100.2.2',
      destinationID: '64920dc166c663ba792cf3c8',
      destinationName: 'redis-sentinel-harness-announce-0',
      destinationNamespace: 'chaos-1000',
      destinationIP: '10.104.0.162',
      destinationPort: '6379'
    }
  ]
}

jest.mock('services/servicediscovery', () => ({
  useListK8SCustomService: jest.fn().mockImplementation(() => {
    return { data: mockServices, refetch: jest.fn(), error: null, loading: false }
  }),
  useListK8sCustomServiceConnection: jest.fn().mockImplementation(() => {
    return { data: mockConnections, refetch: jest.fn(), error: null, loading: false }
  }),
  useListNamespace: jest.fn().mockImplementation(() => {
    return { data: mockNamespaces, refetch: jest.fn(), error: null, loading: false }
  })
}))

describe('<DiscoveryServices /> tests', () => {
  test('should match snapshot', async () => {
    const { container } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <DiscoveredServices />
      </TestWrapper>
    )
    expect(useListK8SCustomService).toBeCalled()
    expect(useListK8sCustomServiceConnection).toBeCalled()
    expect(useListNamespace).toBeCalled()
    expect(container).toMatchSnapshot()
  })

  test('should render loading view correctly', async () => {
    jest.spyOn(servicediscovery, 'useListK8SCustomService').mockImplementation((): any => {
      return {
        data: undefined,
        loading: true
      }
    })

    const { container } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <DiscoveredServices />
      </TestWrapper>
    )
    expect(useListK8SCustomService).toBeCalled()

    expect(container).toMatchSnapshot()
  })

  test('should render error view correctly', async () => {
    jest.spyOn(servicediscovery, 'useListK8SCustomService').mockImplementation((): any => {
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
        <DiscoveredServices />
      </TestWrapper>
    )
    expect(useListK8SCustomService).toBeCalled()

    expect(container).toMatchSnapshot()
  })

  test('should render loaded view correctly', async () => {
    jest.spyOn(servicediscovery, 'useListK8SCustomService').mockImplementation((): any => {
      return {
        data: mockServices,
        loading: false
      }
    })

    const { getByText } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <DiscoveredServices />
      </TestWrapper>
    )
    expect(useListK8SCustomService).toBeCalled()

    expect(getByText('access-control')).toBeInTheDocument()
  })

  test('subheader components should be present', async () => {
    const { container, getByTestId, getByPlaceholderText } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <DiscoveredServices />
      </TestWrapper>
    )

    const dropdown = getByTestId('namespace')
    fireEvent.click(dropdown)

    const listItem = container.getElementsByClassName('DropDown--menuItem')[0]
    fireEvent.click(listItem)

    const searchBox = getByPlaceholderText('discovery.searchService')
    expect(searchBox).not.toBe(null)
    await act(async () => {
      fireEvent.change(searchBox!, { target: { value: 'test' } })
    })

    expect(container).toBeDefined()
  })

  test('should navigate to create network map from three dot menu', async () => {
    const { container } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <DiscoveredServices />
      </TestWrapper>
    )

    const selectBtn = container.querySelector('span[icon="plus"]')
    expect(selectBtn).toBeDefined()

    if (selectBtn) {
      await act(async () => {
        fireEvent.click(selectBtn)
      })
    }
  })

  test('should open a drawer after clicking on name', async () => {
    const { getByText } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <DiscoveredServices />
      </TestWrapper>
    )

    const nameBtn = getByText('access-control')
    expect(nameBtn).toBeDefined()

    await act(async () => {
      fireEvent.click(nameBtn)
    })
    expect(getByText('Service Details')).toBeInTheDocument()
  })
})
