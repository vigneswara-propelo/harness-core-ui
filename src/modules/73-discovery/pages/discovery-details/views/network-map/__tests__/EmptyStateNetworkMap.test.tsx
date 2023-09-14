/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, discoveryPathProps, modulePathProps, projectPathProps } from '@common/utils/routeUtils'
import EmptyStateNetworkMap from '../EmptyStateNetworkMap'

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
  dAgentId: 'dAgentId-1'
}

describe('<DiscoveryHistory /> tests', () => {
  test('should match snapshot', async () => {
    const { container } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <EmptyStateNetworkMap />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('click on create new network map', async () => {
    const { container, getByText, getByTestId } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <EmptyStateNetworkMap />
      </TestWrapper>
    )

    const newNetworkMapBtn = getByText('discovery.createNewNetworkMap')
    act(() => {
      fireEvent.click(newNetworkMapBtn)
    })

    expect(getByTestId('location')).toMatchInlineSnapshot(`
      <div
        data-testid="location"
      >
        /account/accountId/chaos/orgs/default/projects/Discovery_Test/setup/resources/discovery/dAgentId-1/network-map-studio/-1
      </div>
    `)

    expect(container).toMatchSnapshot()
  })
})
