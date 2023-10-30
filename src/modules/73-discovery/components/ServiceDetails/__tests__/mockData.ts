/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { ApiGetDiscoveredService, ApiGetServiceResponse } from 'services/servicediscovery'

export const mockServiceDetails: ApiGetServiceResponse = {
  id: '64920dc166c663ba792cf37a',
  agentID: '64920dbb66c663ba792cf134',
  kind: 'Service',
  apiVersion: 'v1',
  name: 'access-control',
  namespace: 'chaos-1000',
  uid: '02bfaa4d-9fcd-49ed-9e1a-08a24c491c89',
  resourceVersion: '16223894',
  creationTimestamp: '2023-06-04T17:22:42Z',
  labels: {
    'app.kubernetes.io/instance': 'smp-chaos',
    'app.kubernetes.io/managed-by': 'Helm',
    'app.kubernetes.io/name': 'access-control',
    'app.kubernetes.io/version': '0.0.1',
    'helm.sh/chart': 'access-control-0.3.4'
  },
  annotations: {
    'meta.helm.sh/release-name': 'smp-chaos',
    'meta.helm.sh/release-namespace': 'chaos-1000'
  },
  spec: {
    ports: [
      {
        name: 'http',
        protocol: 'TCP',
        port: 9006,
        targetPort: 9006 as any
      }
    ],
    selector: {
      'app.kubernetes.io/instance': 'smp-chaos',
      'app.kubernetes.io/name': 'access-control'
    },
    clusterIP: '10.104.11.160',
    clusterIPs: ['10.104.11.160'],
    type: 'ClusterIP',
    sessionAffinity: 'None',
    ipFamilies: ['IPv4'],
    ipFamilyPolicy: 'SingleStack',
    internalTrafficPolicy: 'Cluster'
  },
  status: {
    loadBalancer: {}
  },
  createdAt: '2023-06-20T20:36:17.773Z',
  createdBy: '',
  updatedBy: '',
  removed: false
}

export const mockGetDiscoveredService: ApiGetDiscoveredService = {
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
}
