/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as servicediscovery from 'services/servicediscovery'
import { NetworkGraphProps } from '@discovery/components/NetworkGraph/NetworkGraph'
import DiscoveredResourcesGraph from '../DiscoveredResourcesGraph'
import { mockConnections, mockServices } from '../../mocks'

jest.mock('services/servicediscovery', () => ({
  useListK8SCustomService: jest.fn().mockImplementation(() => {
    return { data: mockServices, refetch: jest.fn(), error: null, loading: false }
  })
}))

jest.mock('@discovery/components/NetworkGraph/NetworkGraph', () => ({
  ...jest.requireActual('@discovery/components/NetworkGraph/NetworkGraph'),
  __esModule: true,
  default: (props: NetworkGraphProps) => {
    props.onNodeClick({
      id: 'a1',
      data: { name: 'a1' },
      position: { x: 0, y: 0 }
    })

    return <div className={'networkGraph'}>Network Graph</div>
  }
}))

describe('DiscoveredResourcesGraph', () => {
  test('render component with mock data', async () => {
    const { container } = render(
      <TestWrapper>
        <DiscoveredResourcesGraph connectionList={mockConnections} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('render component with empty data', async () => {
    jest.spyOn(servicediscovery, 'useListK8SCustomService').mockImplementation((): any => {
      return {
        data: null,
        loading: false,
        refetch: jest.fn(),
        error: {
          message: 'some error'
        }
      }
    })

    const { container } = render(
      <TestWrapper>
        <DiscoveredResourcesGraph connectionList={null} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
