/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, modulePathProps, networkMapPathProps, projectPathProps } from '@common/utils/routeUtils'
import { NetworkGraphProps } from '@modules/73-discovery/components/NetworkGraph/NetworkGraph'
import { mockEmptyNetworkMap, mockNetworkMap } from './mocks'
import ConfigureNetworkMap from '../ConfigureNetworkMap'

let callNodeFunctions = true

jest.mock('@discovery/components/NetworkGraph/NetworkGraph', () => ({
  ...jest.requireActual('@discovery/components/NetworkGraph/NetworkGraph'),
  __esModule: true,
  default: (props: NetworkGraphProps) => {
    if (callNodeFunctions) {
      callNodeFunctions = false
      props.onNodeConnection?.('64c229096fb4bc8feefc933b', '64c229096fb4bc8feefc933d')
      props.onNodeClick?.({
        width: 90,
        height: 97,
        position: {
          x: 12,
          y: 12
        },
        type: 'networkMapHexagon',
        expandParent: true,
        id: '64c229096fb4bc8feefc933b',
        data: {
          id: '64c229096fb4bc8feefc933b',
          kind: 'discoveredservice',
          name: 'cartservice',
          kubernetes: {
            namespace: 'boutique'
          }
        },
        parentNode: 'boutique',
        targetPosition: 'top' as any,
        sourcePosition: 'bottom' as any,
        style: {},
        selected: true,
        dragging: false,
        positionAbsolute: {
          x: 62,
          y: 62
        }
      })
    }
    return <div className={'networkGraph'}>Network Graph</div>
  }
}))

jest.mock('@discovery/pages//network-map-studio/views/configure/NodeConnectionsSideBar', () => ({
  ...jest.requireActual('@discovery/pages//network-map-studio/views/configure/NodeConnectionsSideBar'),
  __esModule: true,
  default: () => {
    return <div className="nodeConnectionsSideBar">NodeConnectionsSideBar</div>
  }
}))

const PATH = routes.toCreateNetworkMap({
  ...accountPathProps,
  ...projectPathProps,
  ...modulePathProps,
  ...networkMapPathProps
})
const PATH_PARAMS = {
  accountId: 'accountId',
  orgIdentifier: 'default',
  projectIdentifier: 'Discovery_Test',
  module: 'chaos',
  dAgentId: 'dAgent-1',
  networkMapId: 'testnetworkmap'
}

const handleTabChange = jest.fn()
const setNetworkMap = jest.fn().mockImplementation(() => mockNetworkMap)

describe('<ConfigureNetworkMap /> tests with data', () => {
  beforeEach(() => jest.clearAllMocks())

  test('should render component', async () => {
    const { container } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <ConfigureNetworkMap
          networkMap={mockNetworkMap}
          updateNetworkMap={setNetworkMap}
          handleTabChange={handleTabChange}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('should press back button', async () => {
    const { container, getByText } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <ConfigureNetworkMap
          networkMap={mockEmptyNetworkMap}
          updateNetworkMap={setNetworkMap}
          handleTabChange={handleTabChange}
        />
      </TestWrapper>
    )

    fireEvent.click(getByText('back'))

    expect(container).toMatchSnapshot()
  })
})
