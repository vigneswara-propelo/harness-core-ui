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
import SelectService from '../SelectService'

jest.useFakeTimers({ advanceTimers: true })

const createNetworkMapMutate = jest.fn()

const paginationProps = {
  all: true,
  index: 0,
  totalItems: 1,
  totalPages: 1
}

const mockDiscoveryService: servicediscovery.DatabaseServiceCollection = {
  agentID: '',
  apiVersion: 'v1',
  createdAt: '2023-06-21T13:17:41.491Z',
  createdBy: 'VgWXxi_6TdqAyplTQMg4CQ',
  updatedAt: '2023-06-21T13:17:41.491Z',
  id: '',
  kind: 'ClusterService',
  name: 'Test Service',
  namespace: 'sd1',
  removed: false,
  updatedBy: ''
}

const mockServiceList: servicediscovery.ApiListServiceResponse = {
  items: [mockDiscoveryService],
  page: paginationProps
}

const fetchDiscoveryServices = jest.fn(() => {
  return Object.create(mockServiceList)
})

jest.mock('services/servicediscovery', () => ({
  useListService: jest.fn().mockImplementation(() => {
    return { data: mockServiceList, refetch: fetchDiscoveryServices, error: null, loading: false }
  }),
  useCreateNetworkMap: jest
    .fn()
    .mockImplementation(() => ({ mutate: createNetworkMapMutate as servicediscovery.ApiGetNetworkMapResponse }))
}))

const PATH = routes.toDiscovery({ ...accountPathProps, ...projectPathProps, ...modulePathProps })
const PATH_PARAMS = {
  accountId: 'accountId',
  orgIdentifier: 'default',
  projectIdentifier: 'Discovery_Test',
  module: 'chaos'
}

describe('<SelectService /> tests', () => {
  beforeEach(() => jest.clearAllMocks())

  test('should match snapshot', async () => {
    const { container } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <SelectService name="test-service" networkMapRef={undefined} />
      </TestWrapper>
    )
    expect(servicediscovery.useListService).toBeCalled()

    expect(container).toMatchSnapshot()
  })

  test('should render loading view correctly', async () => {
    jest.spyOn(servicediscovery, 'useListService').mockImplementation((): any => {
      return {
        data: undefined,
        loading: true
      }
    })

    const { container } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <SelectService name="test-service" networkMapRef={undefined} />
      </TestWrapper>
    )
    expect(servicediscovery.useListService).toBeCalled()

    expect(container).toMatchSnapshot()
  })

  test('should render error view correctly', async () => {
    jest.spyOn(servicediscovery, 'useListService').mockImplementation((): any => {
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
        <SelectService name="test-service" networkMapRef={undefined} />
      </TestWrapper>
    )
    expect(servicediscovery.useListService).toBeCalled()

    expect(container).toMatchSnapshot()

    expect(getByText('Create Network Map')).toBeInTheDocument()
  })
})
