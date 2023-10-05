/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  ApiListCustomServiceConnection,
  DatabaseConnection,
  DatabaseConnectionType,
  DatabaseNetworkMapEntity
} from 'services/servicediscovery'

export default function getConnectionsBetweenServicesInNetworkMap(
  services: DatabaseNetworkMapEntity[] | null | undefined,
  connectionList: ApiListCustomServiceConnection | null
): DatabaseConnection[] | undefined {
  // Checks for new connections between the selected services
  const serviceHashMap = new Map<string, string>(services?.map((s): [string, string] => [s.id ?? '', s.id ?? '']))
  const connectionBetweenSelectedServices: DatabaseConnection[] | undefined = connectionList?.items
    ?.filter(conn => serviceHashMap.has(conn.sourceID ?? '') && serviceHashMap.has(conn.destinationID ?? ''))
    .map(conn => ({
      from: {
        id: conn.sourceID,
        kind: conn.type,
        name: conn.sourceName,
        namespace: conn.sourceNamespace
      },
      port: conn.destinationPort,
      to: {
        id: conn.destinationID,
        kind: conn.type,
        name: conn.destinationName,
        namespace: conn.destinationNamespace
      },
      type: conn.type as DatabaseConnectionType
    }))

  return connectionBetweenSelectedServices
}
