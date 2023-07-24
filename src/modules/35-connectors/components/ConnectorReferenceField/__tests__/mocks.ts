/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ResponsePageConnectorResponse } from 'services/cd-ng'

export const awsConnectorListResponse: ResponsePageConnectorResponse = {
  data: {
    content: [
      {
        connector: {
          name: 'Aws Connector 1',
          identifier: 'Aws_Connector_1',
          description: '',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'testProject',
          tags: {},
          type: 'Aws',
          spec: {
            credential: {
              crossAccountAccess: null,
              type: 'InheritFromDelegate',
              spec: { delegateSelector: 'qwe' }
            }
          }
        },
        createdAt: 1608697269523,
        lastModifiedAt: 1608697269523,
        status: {
          status: 'SUCCESS'
        },
        harnessManaged: false
      },
      {
        connector: {
          name: 'Aws Connector 2',
          identifier: 'Aws_Connector_2',
          description: 'To connect to Git',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'testProject',
          tags: { git: '' },
          type: 'Aws',
          spec: {
            url: 'https://aws.com',
            branchName: '',
            type: 'Http',
            spec: { delegateSelector: 'qwe' }
          }
        },
        createdAt: 1608679004757,
        lastModifiedAt: 1608679004757,
        status: {
          status: 'SUCCESS'
        },
        harnessManaged: false
      }
    ]
  }
}

export const kubernetesConnectorListResponse: ResponsePageConnectorResponse = {
  data: {
    content: [
      {
        connector: {
          name: 'Kubernetes Connector 1',
          identifier: 'Kubernetes_Connector_1',
          description: '',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'testProject',
          tags: { qa: '', test: '' },
          type: 'K8sCluster',
          spec: {
            credential: {
              type: 'ManualConfig',
              spec: {
                masterUrl: 'sample.google.com',
                auth: { type: 'UsernamePassword', spec: { username: 'admin', passwordRef: 'account.kubconnpass' } }
              }
            }
          }
        },
        createdAt: 1607924578377,
        lastModifiedAt: 1608040385164,
        status: { status: 'SUCCESS', lastTestedAt: 0, lastConnectedAt: 0 },
        harnessManaged: false
      },
      {
        connector: {
          name: 'Kubernetes Connector 2',
          identifier: 'Kubernetes_Connector_2',
          description: '',
          orgIdentifier: undefined,
          projectIdentifier: undefined,
          tags: { qa: '', test: '' },
          type: 'K8sCluster',
          spec: {
            credential: {
              type: 'ManualConfig',
              spec: {
                masterUrl: 'sample.google.com',
                auth: { type: 'UsernamePassword', spec: { username: 'admin', passwordRef: 'account.kubconnpass' } }
              }
            }
          }
        },
        createdAt: 1607924578377,
        lastModifiedAt: 1608040385164,
        status: { status: 'SUCCESS', lastTestedAt: 0, lastConnectedAt: 0 },
        harnessManaged: false
      },
      {
        connector: {
          name: 'Kubernetes Connector 3',
          identifier: 'Kubernetes_Connector_3',
          description: '',
          orgIdentifier: undefined,
          projectIdentifier: undefined,
          tags: { qa: '', test: '' },
          type: 'K8sCluster',
          spec: {
            credential: {
              type: 'ManualConfig',
              spec: {
                masterUrl: 'sample.google.com',
                auth: { type: 'UsernamePassword', spec: { username: 'admin', passwordRef: 'account.kubconnpass' } }
              }
            }
          }
        },
        createdAt: 1607924578377,
        lastModifiedAt: 1608040385164,
        status: { status: 'SUCCESS', lastTestedAt: 0, lastConnectedAt: 0 },
        harnessManaged: false
      }
    ]
  }
}
