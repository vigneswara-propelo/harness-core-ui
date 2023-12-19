/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const clusters = [
  {
    identifier: 'incluster',
    name: 'incluster',
    agentIdentifier: 'A1',
    scopeLevel: 'PROJECT'
  },
  {
    identifier: 'incluster',
    name: 'incluster',
    agentIdentifier: 'A2',
    scopeLevel: 'PROJECT'
  },
  {
    identifier: 'incluster',
    name: 'incluster',
    agentIdentifier: 'A3',
    scopeLevel: 'ACCOUNT'
  },
  {
    identifier: 'cluster12',
    name: 'Cluster 12',
    agentIdentifier: 'A1',
    scopeLevel: 'ACCOUNT'
  },
  {
    identifier: 'cluster23',
    name: 'Cluster 23',
    agentIdentifier: 'Random',
    scopeLevel: 'ORGANIZATION'
  },
  {
    identifier: 'cluster15',
    name: 'Cluster 15',
    agentIdentifier: 'A6',
    scopeLevel: 'ACCOUNT'
  },
  {
    identifier: 'cluster16',
    name: 'cluster 16',
    agentIdentifier: 'A9',
    scopeLevel: 'ACCOUNT'
  }
]

export const linkedClusters = [
  {
    clusterRef: 'account.incluster',
    agentIdentifier: 'A1',
    accountIdentifier: '1bvyLackQK-Hapk25-Ry4w',
    envRef: 'Prod',
    linkedAt: 1699304001158,
    scope: 'ACCOUNT',
    name: 'in-cluster',
    tags: {}
  }
]
