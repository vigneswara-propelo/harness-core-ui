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
import { useListK8SCustomService } from 'services/servicediscovery'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import DiscoveredServices from '../DiscoveredServices'
import { mockServices, mockConnections } from '../../mocks'

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

jest.mock('services/servicediscovery', () => ({
  useListK8SCustomService: jest.fn().mockImplementation(() => {
    return { data: mockServices, refetch: jest.fn(), error: null, loading: false }
  })
}))

describe('<DiscoveryServices /> tests', () => {
  test('should match snapshot', async () => {
    const { container } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <DiscoveredServices connectionList={mockConnections} />
      </TestWrapper>
    )
    expect(useListK8SCustomService).toBeCalled()
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
        <DiscoveredServices connectionList={mockConnections} />
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
        <DiscoveredServices connectionList={mockConnections} />
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
        <DiscoveredServices connectionList={mockConnections} />
      </TestWrapper>
    )
    expect(useListK8SCustomService).toBeCalled()

    expect(getByText('access-control')).toBeInTheDocument()
  })

  test('should navigate to create network map from three dot menu', async () => {
    const { container } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <DiscoveredServices connectionList={mockConnections} />
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
        <DiscoveredServices connectionList={mockConnections} />
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
