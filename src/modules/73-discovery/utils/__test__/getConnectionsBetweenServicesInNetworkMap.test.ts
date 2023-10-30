/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import getConnectionsBetweenServicesInNetworkMap from '../getConnectionsBetweenServicesInNetworkMap'
import { connectionsBetweenServices, mockConnections, mockNetworkMapResources } from './mocks'

describe('getConnectionsBetweenServicesInNetworkMap', () => {
  test('test function wih mock data', async () => {
    const connections = getConnectionsBetweenServicesInNetworkMap(mockNetworkMapResources, mockConnections)
    expect(connections).toStrictEqual(connectionsBetweenServices)
  })

  test('test function wih empty data', async () => {
    const connections = getConnectionsBetweenServicesInNetworkMap(null, null)
    expect(connections).toBeUndefined()
  })
})
