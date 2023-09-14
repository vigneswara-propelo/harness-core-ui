/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { ApiCreateNetworkMapRequest } from 'services/servicediscovery'

export const mockNamespaces = {
  items: [
    {
      name: 'bt-4079',

      spec: {
        finalizers: ['kubernetes']
      },
      status: {
        phase: 'Active'
      },
      createdAt: '2023-06-20T20:36:16.62Z',
      createdBy: '',
      updatedBy: '',
      removed: false
    }
  ]
}

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
      sourceID: '64920dc166c663ba792cf3b0',
      sourceName: 'access-control',
      sourceNamespace: 'chaos-1000',
      sourceIP: '10.100.2.2',
      destinationID: '64920dc166c663ba792cf3c8',
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
        externalIPs: null,
        loadBalancerIP: '',
        externalName: '',
        type: 'ClusterIP'
      },
      spec: {
        clusterIP: '10.104.11.160',
        ports: [
          {
            name: 'http',
            protocol: 'TCP',
            port: 9006,
            targetPort: 9006
          }
        ]
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

export const mockNetworkMap: ApiCreateNetworkMapRequest = {
  identity: 'testnetworkmap',
  name: 'testnetworkmap',
  description: 'Network map for testing',
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  tags: { test: '', nwMap: '' },
  resources: [
    {
      id: '64c229096fb4bc8feefc933b',
      kind: 'Service',
      name: 'cartservice',
      namespace: 'boutique'
    },
    {
      id: '64c229096fb4bc8feefc933d',
      kind: 'Service',
      name: 'checkoutservice',
      namespace: 'boutique'
    },
    {
      id: '64c229096fb4bc8feefc933e',
      kind: 'Service',
      name: 'currencyservice',
      namespace: 'boutique'
    },
    {
      id: '64c229096fb4bc8feefc933f',
      kind: 'Service',
      name: 'emailservice',
      namespace: 'boutique'
    },
    {
      id: '64c229096fb4bc8feefc9342',
      kind: 'Service',
      name: 'paymentservice',
      namespace: 'boutique'
    },
    {
      id: '64c229096fb4bc8feefc9343',
      kind: 'Service',
      name: 'productcatalogservice',
      namespace: 'boutique'
    },
    {
      id: '64c229096fb4bc8feefc9346',
      kind: 'Service',
      name: 'shippingservice',
      namespace: 'boutique'
    }
  ],
  connections: [
    {
      from: {
        id: '64c229096fb4bc8feefc933d',
        kind: 'TCP',
        name: 'checkoutservice',
        namespace: 'boutique'
      },
      port: '7070',
      to: {
        id: '64c229096fb4bc8feefc933b',
        kind: 'TCP',
        name: 'cartservice',
        namespace: 'boutique'
      },
      type: 'TCP'
    },
    {
      from: {
        id: '64c229096fb4bc8feefc933d',
        kind: 'TCP',
        name: 'checkoutservice',
        namespace: 'boutique'
      },
      port: '50051',
      to: {
        id: '64c229096fb4bc8feefc9346',
        kind: 'TCP',
        name: 'shippingservice',
        namespace: 'boutique'
      },
      type: 'TCP'
    },
    {
      from: {
        id: '64c229096fb4bc8feefc933d',
        kind: 'TCP',
        name: 'checkoutservice',
        namespace: 'boutique'
      },
      port: '5000',
      to: {
        id: '64c229096fb4bc8feefc933f',
        kind: 'TCP',
        name: 'emailservice',
        namespace: 'boutique'
      },
      type: 'TCP'
    },
    {
      from: {
        id: '64c229096fb4bc8feefc933d',
        kind: 'TCP',
        name: 'checkoutservice',
        namespace: 'boutique'
      },
      port: '3550',
      to: {
        id: '64c229096fb4bc8feefc9343',
        kind: 'TCP',
        name: 'productcatalogservice',
        namespace: 'boutique'
      },
      type: 'TCP'
    },
    {
      from: {
        id: '64c229096fb4bc8feefc933d',
        kind: 'TCP',
        name: 'checkoutservice',
        namespace: 'boutique'
      },
      port: '7000',
      to: {
        id: '64c229096fb4bc8feefc933e',
        kind: 'TCP',
        name: 'currencyservice',
        namespace: 'boutique'
      },
      type: 'TCP'
    },
    {
      from: {
        id: '64c229096fb4bc8feefc933d',
        kind: 'TCP',
        name: 'checkoutservice',
        namespace: 'boutique'
      },
      port: '50051',
      to: {
        id: '64c229096fb4bc8feefc9342',
        kind: 'TCP',
        name: 'paymentservice',
        namespace: 'boutique'
      },
      type: 'TCP'
    }
  ]
}
