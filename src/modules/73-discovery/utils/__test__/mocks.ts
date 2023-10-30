/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { DatabaseNetworkMapEntity } from 'services/servicediscovery'

export const connectionsBetweenServices = [
  {
    from: {
      id: '64920dc166c663ba792cf3b0',
      kind: 'discoveredservice',
      name: 'access-control',
      kubernetes: { namespace: 'chaos-1000' }
    },
    port: '9090',
    to: {
      id: '64920dc166c663ba792cf3bb',
      kind: 'discoveredservice',
      name: 'harness-manager',

      kubernetes: { namespace: 'chaos-1000' }
    },
    type: 'TCP',
    manual: false
  },
  {
    from: {
      id: '64920dc166c663ba792cf3bb',
      kind: 'discoveredservice',
      name: 'access-control',

      kubernetes: { namespace: 'chaos-1000' }
    },
    port: '6379',
    to: {
      id: '64920dc166c663ba792cf3b0',
      kind: 'discoveredservice',
      name: 'redis-sentinel-harness-announce-0',

      kubernetes: { namespace: 'chaos-1000' }
    },
    type: 'TCP',
    manual: false
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
      name: 'chaos-exporter',
      namespace: 'chaos-1000',
      uid: '02bfaa4d-9fcd-49ed-9e1a-08a24c491c88',
      service: {
        owner: {
          kind: 'Service',
          namespace: 'chaos-1000',
          name: 'chaos-exporter',
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

export const mockNetworkMapResources: DatabaseNetworkMapEntity[] = [
  {
    id: '64920dc166c663ba792cf3b0',
    kind: 'discoveredservice',
    name: 'access-control',
    kubernetes: {
      namespace: 'chaos-1000'
    }
  },
  {
    id: '64920dc166c663ba792cf3bb',
    kind: 'discoveredservice',
    name: 'chaos-exporter',
    kubernetes: {
      namespace: 'chaos-1000'
    }
  }
]

export const mockLogData = `{"level":"","pos":1,"out":"{file:entry.go:41,func:github.com/wings-software/service-discovery/collector.Start,level:info,msg:go version go1.20.8,time:2023-10-04T04:30:15.872344691Z}","time":"2023-10-04T04:30:20.480817808Z","args":{"PodName":"sd-cluster-9ts9x","PodNamespace":"hce"}}
{"level":"","pos":2,"out":"{file:entry.go:42,func:github.com/wings-software/service-discovery/collector.Start,level:info,msg:go os linux,time:2023-10-04T04:30:15.872758918Z}","time":"2023-10-04T04:30:20.843837081Z","args":{"PodName":"sd-cluster-9ts9x","PodNamespace":"hce"}}
{"level":"","pos":2,"out":"{file:entry.go:42,func:github.com/wings-software/service-discovery/collector.Start,level:info,msg:go os linux,time:2023-10-04T04:30:15.872758918Z}","time":"2023-10-04T04:30:20.843837081Z","args":{"PodName":"sd-node-2gc9l","PodNamespace":"hce"}}`

export const mockLogDataResponse = [
  {
    text: {
      level: '',
      out: '{file:entry.go:41,func:github.com/wings-software/service-discovery/collector.Start,level:info,msg:go version go1.20.8,time:2023-10-04T04:30:15.872344691Z}',
      args: {
        PodName: 'sd-cluster-9ts9x',
        PodNamespace: 'hce'
      }
    }
  },
  {
    text: {
      level: '',
      out: '{file:entry.go:42,func:github.com/wings-software/service-discovery/collector.Start,level:info,msg:go os linux,time:2023-10-04T04:30:15.872758918Z}',
      args: {
        PodName: 'sd-cluster-9ts9x',
        PodNamespace: 'hce'
      }
    }
  },
  {
    text: {
      args: {
        PodName: 'sd-node-2gc9l',
        PodNamespace: 'hce'
      },
      level: '',
      out: '{file:entry.go:42,func:github.com/wings-software/service-discovery/collector.Start,level:info,msg:go os linux,time:2023-10-04T04:30:15.872758918Z}'
    }
  }
]

export const installations = {
  id: '651cea4d2dc5d1dc8a74530b',
  agentID: '65126c42183f27a2381f9384',
  delegateTaskID: '2c4sK0KkRsivFp6gb4kDRA-DEL',
  delegateID: '',
  delegateTaskStatus: 'SUCCESS',
  agentDetails: {
    cluster: {
      name: 'sd-cluster-9ts9x',
      namespace: 'hce',
      uid: 'c63fbf54-0f32-4f3a-ad54-078cf8bddf41',
      status: 'Succeeded'
    },
    node: [
      {
        name: 'sd-node-2gc9l',
        namespace: 'hce',
        uid: '234d86b8-454d-434f-87ff-5493e0f0f1ea',
        status: 'Succeeded'
      }
    ],
    status: 'SUCCESS'
  },
  isCronTriggered: true,
  logStreamID: 'c70fbd79-4f7d-45e7-b65c-df4b6237336f',
  logStreamCreatedAt: '2023-10-04T04:30:05.339Z',
  isLogStreamOpen: false,
  createdAt: '2023-10-04T04:30:05.339Z',
  updatedAt: '2023-10-04T04:45:15.299Z',
  createdBy: '',
  updatedBy: '',
  removed: false
}
