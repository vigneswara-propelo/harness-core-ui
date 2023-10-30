/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { ApiCreateNetworkMapRequest, DatabaseNetworkMapEntity } from 'services/servicediscovery'

export const mockNetworkMap: ApiCreateNetworkMapRequest = {
  identity: 'testnetworkmap',
  name: 'testnetworkmap',
  description: 'Network map for testing',
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
        id: '64c229096fb4bc8feefc933b',
        kind: 'discoveredservice',
        name: 'cartservice',
        kubernetes: {
          namespace: 'boutique'
        }
      },
      port: '7070',
      to: {
        id: '64c229096fb4bc8feefc933d',
        kind: 'discoveredservice',
        name: 'dummyService',
        kubernetes: {
          namespace: 'boutique'
        }
      },
      type: 'TCP',
      manual: true
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
      type: 'TCP',
      manual: true
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

export const mockEmptyNetworkMap: ApiCreateNetworkMapRequest = {
  identity: 'testnetworkmap',
  name: 'testnetworkmap',
  description: 'Network map for testing',
  resources: [],
  connections: []
}

export const mockSourceService: DatabaseNetworkMapEntity = {
  id: '64c229096fb4bc8feefc933b',
  kind: 'discoveredservice',
  name: 'cartservice',
  kubernetes: {
    namespace: 'boutique'
  }
}

export const mockRelation = {
  source: '64c229096fb4bc8feefc933b',
  target: '64c229096fb4bc8feefc933d',
  properties: { type: 'TCP', port: '' }
}
