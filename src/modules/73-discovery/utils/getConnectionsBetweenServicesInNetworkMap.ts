/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  ApiListDiscoveredServiceConnection,
  DatabaseConnection,
  DatabaseConnectionType,
  DatabaseNetworkMapEntity
} from 'services/servicediscovery'

export default function getConnectionsBetweenServicesInNetworkMap(
  services: DatabaseNetworkMapEntity[] | null | undefined,
  connectionList: ApiListDiscoveredServiceConnection | null
): DatabaseConnection[] | undefined {
  // Checks for new connections between the selected services
  const serviceHashMap = new Map<string, DatabaseNetworkMapEntity>(services?.map(s => [s.id ?? '', s]))

  const connectionBetweenSelectedServices: DatabaseConnection[] | undefined = connectionList?.items
    ?.filter(conn => serviceHashMap.has(conn.sourceID ?? '') && serviceHashMap.has(conn.destinationID ?? ''))
    .map(conn => ({
      from: {
        id: conn.sourceID,
        kind: serviceHashMap.get(conn.sourceID ?? '')?.kind ?? 'discoveredservice',
        name: conn.sourceName,
        kubernetes: {
          namespace: conn.sourceNamespace
        }
      },
      port: conn.destinationPort,
      to: {
        id: conn.destinationID,
        kind: serviceHashMap.get(conn.destinationID ?? '')?.kind ?? 'discoveredservice',
        name: conn.destinationName,
        kubernetes: {
          namespace: conn.destinationNamespace
        }
      },
      type: conn.type as DatabaseConnectionType,
      manual: false
    }))

  return connectionBetweenSelectedServices
}
