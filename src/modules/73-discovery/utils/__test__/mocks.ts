/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const connectionsBetweenServices = [
  {
    from: {
      id: '64920dc166c663ba792cf3b0',
      kind: 'TCP',
      name: 'access-control',
      namespace: 'chaos-1000'
    },
    port: '9090',
    to: {
      id: '64920dc166c663ba792cf3bb',
      kind: 'TCP',
      name: 'harness-manager',
      namespace: 'chaos-1000'
    },
    type: 'TCP'
  },
  {
    from: {
      id: '64920dc166c663ba792cf3bb',
      kind: 'TCP',
      name: 'access-control',
      namespace: 'chaos-1000'
    },
    port: '6379',
    to: {
      id: '64920dc166c663ba792cf3b0',
      kind: 'TCP',
      name: 'redis-sentinel-harness-announce-0',
      namespace: 'chaos-1000'
    },
    type: 'TCP'
  }
]

export const mockConnections = {
  items: [
    {
      id: '64920e3866c663ba792cf569',
      type: 'TCP',
      sourceID: '64920dc166c663ba792cf3b0',
      sourceName: 'access-control',
      sourceNamespace: 'chaos-1000',
      sourceIP: '10.100.2.2',
      destinationID: '64920dc166c663ba792cf3bb',
      destinationName: 'harness-manager',
      destinationNamespace: 'chaos-1000',
      destinationIP: '10.104.11.119',
      destinationPort: '9090'
    },
    {
      id: '64920e3866c663ba792cf56a',
      type: 'TCP',
      sourceID: '64920dc166c663ba792cf3bb',
      sourceName: 'access-control',
      sourceNamespace: 'chaos-1000',
      sourceIP: '10.100.2.2',
      destinationID: '64920dc166c663ba792cf3b0',
      destinationName: 'redis-sentinel-harness-announce-0',
      destinationNamespace: 'chaos-1000',
      destinationIP: '10.104.0.162',
      destinationPort: '6379'
    }
  ]
}

export const mockServices = {
  items: [
    {
      id: '64920dc166c663ba792cf3b0',
      agentID: '64920dbb66c663ba792cf134',
      kind: 'Service',
      name: 'access-control',
      namespace: 'chaos-1000',
      uid: '02bfaa4d-9fcd-49ed-9e1a-08a24c491c89',
      service: {
        owner: {
          kind: 'Service',
          namespace: 'chaos-1000',
          name: 'access-control',
          uid: '02bfaa4d-9fcd-49ed-9e1a-08a24c491c89',
          apiVersion: 'v1'
        },
        ports: [
          {
            name: 'http',
            protocol: 'TCP',
            port: 9006,
            targetPort: 9006
          }
        ],
        clusterIP: '10.104.11.160',
        clusterIPs: ['10.104.11.160'],
        externalIPs: undefined,
        loadBalancerIP: '',
        externalName: '',
        type: 'ClusterIP'
      },
      createdAt: '2023-06-20T20:36:17.94Z',
      updatedAt: '2023-06-20T20:36:18.357Z',
      createdBy: '',
      updatedBy: '',
      removed: false
    },
    {
      id: '64920dc166c663ba792cf3bb',
      agentID: '64920dbb66c663ba792cf134',
      kind: 'Service',
      name: 'access-control',
      namespace: 'chaos-1000',
      uid: '02bfaa4d-9fcd-49ed-9e1a-08a24c491c88',
      service: {
        owner: {
          kind: 'Service',
          namespace: 'chaos-1000',
          name: 'access-control',
          uid: '02bfaa4d-9fcd-49ed-9e1a-08a24c491c89',
          apiVersion: 'v1'
        },
        ports: [
          {
            name: 'http',
            protocol: 'TCP',
            port: 9006,
            targetPort: 9006
          }
        ],
        clusterIP: '10.104.11.160',
        clusterIPs: ['10.104.11.160'],
        externalIPs: undefined,
        loadBalancerIP: '',
        externalName: '',
        type: 'ClusterIP'
      },
      createdAt: '2023-06-20T20:36:17.94Z',
      updatedAt: '2023-06-20T20:36:18.357Z',
      createdBy: '',
      updatedBy: '',
      removed: false
    }
  ],
  page: {
    all: true,
    index: 0,
    totalItems: 1,
    totalPages: 1
  }
}
