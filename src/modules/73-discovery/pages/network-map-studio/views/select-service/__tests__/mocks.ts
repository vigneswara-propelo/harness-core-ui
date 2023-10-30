/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { ApiCreateNetworkMapRequest, ApiListDiscoveredService } from 'services/servicediscovery'

export const mockNamespaces = {
  items: [
    {
      name: 'boutique',

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
      sourceID: '65130e1c457bae2f07823c07',
      sourceName: 'access-control',
      sourceNamespace: 'chaos-1000',
      sourceIP: '10.100.2.2',
      destinationID: '65130e1c457bae2f07823c08',
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

export const mockServices: ApiListDiscoveredService = {
  corelationID: '699166b5-bb15-4145-8da9-6dc1edc56049',
  page: {
    all: false,
    index: 0,
    limit: 20,
    totalPages: 6,
    totalItems: 108
  },
  items: [
    {
      id: '65130e1c457bae2f07823c07',
      agentID: '65130e119d0cdfa09eaa02fc',
      type: 'Kubernetes',
      version: 'V1',
      spec: {
        kubernetes: {
          kind: 'Service',
          name: 'adservice',
          namespace: 'boutique',
          uid: '213c20e6-2a0b-4965-9cbb-3c2c2b5cd201',
          service: {
            identity: {
              kind: 'Service',
              namespace: 'boutique',
              name: 'adservice',
              uid: '213c20e6-2a0b-4965-9cbb-3c2c2b5cd201',
              apiVersion: 'v1'
            },
            annotations: {
              'cloud.google.com/neg': '{"ingress":true}'
            },
            ports: [
              {
                name: 'grpc',
                protocol: 'TCP',
                port: 9555,
                targetPort: 9555 as any
              }
            ],
            clusterIP: '10.40.4.196',
            clusterIPs: ['10.40.4.196'],
            externalIPs: undefined,
            loadBalancerIP: '',
            externalName: '',
            type: 'ClusterIP'
          },
          workloads: [
            {
              identity: {
                kind: 'Deployment',
                namespace: 'boutique',
                name: 'adservice',
                uid: 'a5cb4898-01c2-413c-8a02-9476d795b956',
                apiVersion: 'apps/v1'
              },
              labels: {
                app: 'adservice'
              },
              annotations: {
                'deployment.kubernetes.io/revision': '1'
              },
              podLabels: {
                app: 'adservice'
              },
              replicas: [
                {
                  identity: {
                    kind: 'Pod',
                    namespace: 'boutique',
                    name: 'adservice-6c6c89784d-vpnmh',
                    uid: 'c73620ef-7fb3-4768-aa2e-9f465e11ad36',
                    apiVersion: 'v1'
                  },
                  phase: 'Running'
                }
              ]
            }
          ]
        }
      },
      createdAt: '2023-09-26T17:00:12.834Z',
      updatedAt: '2023-09-27T04:00:20.667Z',
      createdBy: '',
      updatedBy: '',
      removed: false
    },
    {
      id: '65130e1c457bae2f07823c08',
      agentID: '65130e119d0cdfa09eaa02fc',
      type: 'Kubernetes',
      version: 'V1',
      spec: {
        kubernetes: {
          kind: 'Service',
          name: 'cartservice',
          namespace: 'boutique',
          uid: 'f30e3e0c-23cf-4d20-9c9a-082cd1cd1fc6',
          service: {
            identity: {
              kind: 'Service',
              namespace: 'boutique',
              name: 'cartservice',
              uid: 'f30e3e0c-23cf-4d20-9c9a-082cd1cd1fc6',
              apiVersion: 'v1'
            },
            annotations: {
              'cloud.google.com/neg': '{"ingress":true}'
            },
            ports: [
              {
                name: 'grpc',
                protocol: 'TCP',
                port: 7070,
                targetPort: 7070 as any
              }
            ],
            clusterIP: '10.40.0.63',
            clusterIPs: ['10.40.0.63'],
            externalIPs: undefined,
            loadBalancerIP: '',
            externalName: '',
            type: 'ClusterIP'
          },
          workloads: [
            {
              identity: {
                kind: 'Deployment',
                namespace: 'boutique',
                name: 'cartservice',
                uid: '69a83687-0fbb-4272-8624-afc48f02051d',
                apiVersion: 'apps/v1'
              },
              labels: {
                app: 'cartservice'
              },
              annotations: {
                'deployment.kubernetes.io/revision': '1'
              },
              podLabels: {
                app: 'cartservice'
              },
              replicas: [
                {
                  identity: {
                    kind: 'Pod',
                    namespace: 'boutique',
                    name: 'cartservice-64976b7b48-k6swg',
                    uid: '790b4497-a57c-4748-8062-05057b8e5ce7',
                    apiVersion: 'v1'
                  },
                  phase: 'Running'
                }
              ]
            }
          ]
        }
      },
      createdAt: '2023-09-26T17:00:12.834Z',
      updatedAt: '2023-09-27T04:00:20.667Z',
      createdBy: '',
      updatedBy: '',
      removed: false
    }
  ]
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
      kind: 'discoveredservice',
      name: 'cartservice',
      kubernetes: {
        namespace: 'boutique'
      }
    },
    {
      id: '64c229096fb4bc8feefc933d',
      kind: 'discoveredservice',
      name: 'checkoutservice',
      kubernetes: {
        namespace: 'boutique'
      }
    },
    {
      id: '64c229096fb4bc8feefc933e',
      kind: 'discoveredservice',
      name: 'currencyservice',
      kubernetes: {
        namespace: 'boutique'
      }
    },
    {
      id: '64c229096fb4bc8feefc933f',
      kind: 'discoveredservice',
      name: 'emailservice',
      kubernetes: {
        namespace: 'boutique'
      }
    },
    {
      id: '64c229096fb4bc8feefc9342',
      kind: 'discoveredservice',
      name: 'paymentservice',
      kubernetes: {
        namespace: 'boutique'
      }
    },
    {
      id: '64c229096fb4bc8feefc9343',
      kind: 'discoveredservice',
      name: 'productcatalogservice',
      kubernetes: {
        namespace: 'boutique'
      }
    },
    {
      id: '64c229096fb4bc8feefc9346',
      kind: 'discoveredservice',
      name: 'shippingservice',
      kubernetes: {
        namespace: 'boutique'
      }
    }
  ],
  connections: [
    {
      from: {
        id: '64c229096fb4bc8feefc933d',
        kind: 'discoveredservice',
        name: 'checkoutservice',
        kubernetes: {
          namespace: 'boutique'
        }
      },
      port: '7070',
      to: {
        id: '64c229096fb4bc8feefc933b',
        kind: 'discoveredservice',
        name: 'cartservice',
        kubernetes: {
          namespace: 'boutique'
        }
      },
      type: 'TCP'
    },
    {
      from: {
        id: '64c229096fb4bc8feefc933d',
        kind: 'discoveredservice',
        name: 'checkoutservice',
        kubernetes: {
          namespace: 'boutique'
        }
      },
      port: '50051',
      to: {
        id: '64c229096fb4bc8feefc9346',
        kind: 'discoveredservice',
        name: 'shippingservice',
        kubernetes: {
          namespace: 'boutique'
        }
      },
      type: 'TCP'
    },
    {
      from: {
        id: '64c229096fb4bc8feefc933d',
        kind: 'discoveredservice',
        name: 'checkoutservice',
        kubernetes: {
          namespace: 'boutique'
        }
      },
      port: '5000',
      to: {
        id: '64c229096fb4bc8feefc933f',
        kind: 'discoveredservice',
        name: 'emailservice',
        kubernetes: {
          namespace: 'boutique'
        }
      },
      type: 'TCP'
    },
    {
      from: {
        id: '64c229096fb4bc8feefc933d',
        kind: 'discoveredservice',
        name: 'checkoutservice',
        kubernetes: {
          namespace: 'boutique'
        }
      },
      port: '3550',
      to: {
        id: '64c229096fb4bc8feefc9343',
        kind: 'discoveredservice',
        name: 'productcatalogservice',
        kubernetes: {
          namespace: 'boutique'
        }
      },
      type: 'TCP'
    },
    {
      from: {
        id: '64c229096fb4bc8feefc933d',
        kind: 'discoveredservice',
        name: 'checkoutservice',
        kubernetes: {
          namespace: 'boutique'
        }
      },
      port: '7000',
      to: {
        id: '64c229096fb4bc8feefc933e',
        kind: 'discoveredservice',
        name: 'currencyservice',
        kubernetes: {
          namespace: 'boutique'
        }
      },
      type: 'TCP'
    },
    {
      from: {
        id: '64c229096fb4bc8feefc933d',
        kind: 'discoveredservice',
        name: 'checkoutservice',
        kubernetes: {
          namespace: 'boutique'
        }
      },
      port: '50051',
      to: {
        id: '64c229096fb4bc8feefc9342',
        kind: 'discoveredservice',
        name: 'paymentservice',
        kubernetes: {
          namespace: 'boutique'
        }
      },
      type: 'TCP'
    }
  ]
}
