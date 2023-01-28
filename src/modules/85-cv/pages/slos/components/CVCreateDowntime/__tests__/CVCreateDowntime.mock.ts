/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const emptyDowntimeResponse = {
  metaData: {},
  resource: {
    downtime: {},
    createdAt: 1666181322626,
    lastModifiedAt: 1666181322626
  },
  responseMessages: []
}

export const downtimeResponse = {
  metaData: {},
  resource: {
    downtime: {
      name: 'SLO Downtime',
      identifier: 'SLO_Downtime',
      description: 'Weekly downtime',
      category: 'Deployment'
    },
    createdAt: 1666181322626,
    lastModifiedAt: 1666181322626
  },
  responseMessages: []
}
