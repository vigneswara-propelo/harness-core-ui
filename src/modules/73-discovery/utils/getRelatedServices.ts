/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  ApiListCustomServiceConnection,
  ApiListK8sCustomService,
  DatabaseK8SCustomServiceCollection
} from 'services/servicediscovery'

export function getRelatedServices(
  serviceID: string,
  serviceList: ApiListK8sCustomService | null,
  connectionList: ApiListCustomServiceConnection | null
): DatabaseK8SCustomServiceCollection[] | undefined {
  if (!serviceList || !connectionList) return

  const relatedServiceIds = connectionList.items?.map(conn => {
    if (serviceID === conn.sourceID) return conn.destinationID ?? ''
    /* istanbul ignore next */
    if (serviceID === conn.destinationID) return conn.sourceID ?? ''
  })

  return serviceList?.items?.filter(service => service.id === serviceID || relatedServiceIds?.includes(service.id))
}
