/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as servicediscovery from 'services/servicediscovery'
import { TestWrapper } from '@common/utils/testUtils'
import DiscoveredResources from '../DiscoveredResources'
import { mockNamespaces, mockConnections } from '../mocks'

jest.mock('services/servicediscovery', () => ({
  useListK8sCustomServiceConnection: jest.fn().mockImplementation(() => {
    return { data: mockConnections, refetch: jest.fn(), error: null, loading: false }
  }),
  useListNamespace: jest.fn().mockImplementation(() => {
    return { data: mockNamespaces, refetch: jest.fn(), error: null, loading: false }
  })
}))

jest.mock('../graphView/DiscoveredResourcesGraph', () => ({
  ...jest.requireActual('../graphView/DiscoveredResourcesGraph'),
  __esModule: true,
  default: () => {
    return <div className={'discoveredResourcesGraph'}>Discovered Resources Graph</div>
  }
}))
jest.mock('../tableView/DiscoveredServices', () => ({
  ...jest.requireActual('../tableView/DiscoveredServices'),
  __esModule: true,
  default: () => {
    return <div className={'discoveredServices'}>Discovered Services</div>
  }
}))

describe('DiscoveredResources', () => {
  test('render component', async () => {
    const { container } = render(
      <TestWrapper>
        <DiscoveredResources />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('subheader components should be present', async () => {
    const { container, getByTestId, getByPlaceholderText } = render(
      <TestWrapper>
        <DiscoveredResources />
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

    const query = 'test abc'
    const searchInput = getByPlaceholderText('discovery.searchService') as HTMLInputElement
    expect(searchInput).not.toBe(null)
    if (!searchInput) {
      throw Error('no search input')
    }
    await userEvent.type(searchInput, query)
    await waitFor(() => expect(searchInput?.value).toBe(query))

    expect(container).toMatchSnapshot()
  })

  test('Toggle between grid and list view', async () => {
    const { container } = render(
      <TestWrapper>
        <DiscoveredResources />
      </TestWrapper>
    )
    const list = container.querySelectorAll("[icon='list']")[0]
    const grid = container.querySelectorAll("[icon='grid-view']")[0]
    await act(async () => {
      fireEvent.click(list!)
      expect(container).toMatchSnapshot()
      fireEvent.click(grid!)
      expect(container).toMatchSnapshot()
    })
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
      <TestWrapper>
        <DiscoveredResources />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
