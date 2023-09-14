/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const mockNetworkMap = {
  identity: 'testnetworkmap',
  name: 'testnetworkmap',
  description: 'Network map for testing',
  tags: {
    test: '',
    nwMap: ''
  },
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
