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
import DiscoveryHistory from '../DiscoveryHistory'

jest.useFakeTimers({ advanceTimers: true })

const paginationProps = {
  all: true,
  index: 0,
  totalItems: 1,
  totalPages: 1
}

const mockListInstallation: servicediscovery.DatabaseInstallationCollection = {
  agentID: '',
  createdAt: '2023-06-21T13:17:41.491Z',
  createdBy: 'VgWXxi_6TdqAyplTQMg4CQ',
  updatedAt: '2023-06-21T13:17:41.491Z',
  delegateID: '',
  updatedBy: ''
}

const mockInstallationList: servicediscovery.ApiListServiceResponse = {
  items: [mockListInstallation],
  page: paginationProps
}

const fetchListInstallation = jest.fn(() => {
  return Object.create(mockInstallationList)
})

jest.mock('services/servicediscovery', () => ({
  useListInstallation: jest.fn().mockImplementation(() => {
    return { data: mockInstallationList, refetch: fetchListInstallation, error: null, loading: false }
  })
}))

const PATH = routes.toDiscovery({ ...accountPathProps, ...projectPathProps, ...modulePathProps })
const PATH_PARAMS = {
  accountId: 'accountId',
  orgIdentifier: 'default',
  projectIdentifier: 'Discovery_Test',
  module: 'chaos'
}

describe('<DiscoveryHistory /> tests', () => {
  beforeEach(() => jest.clearAllMocks())

  test('should match snapshot', async () => {
    const { container } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <DiscoveryHistory />
      </TestWrapper>
    )
    expect(servicediscovery.useListInstallation).toBeCalled()

    expect(container).toMatchSnapshot()
  })

  test('should render loading view correctly', async () => {
    jest.spyOn(servicediscovery, 'useListInstallation').mockImplementation((): any => {
      return {
        data: undefined,
        loading: true
      }
    })

    const { container } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <DiscoveryHistory />
      </TestWrapper>
    )
    expect(servicediscovery.useListInstallation).toBeCalled()

    expect(container).toMatchSnapshot()
  })

  test('should render error view correctly', async () => {
    jest.spyOn(servicediscovery, 'useListInstallation').mockImplementation((): any => {
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
        <DiscoveryHistory />
      </TestWrapper>
    )
    expect(servicediscovery.useListInstallation).toBeCalled()

    expect(container).toMatchSnapshot()

    expect(getByText('discovery.discoveryDetails.tabTitles.history')).toBeInTheDocument()
  })
})
