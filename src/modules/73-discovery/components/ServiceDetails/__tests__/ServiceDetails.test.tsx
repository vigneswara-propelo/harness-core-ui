/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import routes from '@common/RouteDefinitions'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { TestWrapper } from '@common/utils/testUtils'
import { useGetK8SCustomService, useGetServiceFromK8SCustomService } from 'services/servicediscovery'
import ServiceDetails from '../ServiceDetails'

const mockServiceDetailsProp = {
  serviceId: 'testServiceId',
  infraId: 'testInfraId',
  serviceName: 'k8s-service',
  closeModal: jest.fn()
}

const mockServiceDetails = {
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
        targetPort: 9006
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

const mockGetCustomService = {
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
  workloads: [
    {
      owner: {
        kind: 'Deployment',
        namespace: 'chaos-1000',
        name: 'access-control',
        uid: '35c27e29-134f-4834-a7fb-fe8f63b2579e',
        apiVersion: 'apps/v1'
      },
      podLabels: {
        app: 'access-control',
        'app.kubernetes.io/instance': 'smp-chaos',
        'app.kubernetes.io/name': 'access-control',
        'pod-template-hash': '8546c78fd7'
      },
      podAnnotations: {
        'cni.projectcalico.org/podIPs': '10.100.2.2/32'
      },
      replicas: [
        {
          pod: {
            kind: 'Pod',
            namespace: 'chaos-1000',
            name: 'access-control-8546c78fd7-f7nbz',
            uid: '22ac42fa-df48-458b-bc67-c1d82990fe8d',
            apiVersion: 'v1'
          },
          phase: 'Running'
        }
      ]
    }
  ],
  createdAt: '2023-06-20T20:36:17.94Z',
  updatedAt: '2023-06-20T20:36:18.357Z',
  createdBy: '',
  updatedBy: '',
  removed: false
}

const fetchServiceFromK8SCustomService = jest.fn(() => Promise.resolve(mockServiceDetails))
const fetchK8SCustomService = jest.fn(() => Promise.resolve(mockGetCustomService))

jest.mock('services/servicediscovery', () => ({
  useGetServiceFromK8SCustomService: jest.fn().mockImplementation(() => {
    return { data: mockServiceDetails, refetch: fetchServiceFromK8SCustomService, error: null, loading: false }
  }),
  useGetK8SCustomService: jest.fn().mockImplementation(() => {
    return { data: mockGetCustomService, refetch: fetchK8SCustomService, error: null, loading: false }
  })
}))

const PATH = routes.toDiscovery({ ...accountPathProps, ...projectPathProps })
const PATH_PARAMS = {
  accountId: 'accountId',
  orgIdentifier: 'default',
  projectIdentifier: 'Discovery_Test',
  module: 'chaos'
}

describe('Service Details component tests', () => {
  beforeEach(() => jest.clearAllMocks())

  test('should match snapshot', async () => {
    const { container } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <ServiceDetails {...mockServiceDetailsProp} />
      </TestWrapper>
    )
    expect(useGetServiceFromK8SCustomService).toBeCalled()
    expect(useGetK8SCustomService).toBeCalled()

    expect(container).toMatchSnapshot()
  })
})
