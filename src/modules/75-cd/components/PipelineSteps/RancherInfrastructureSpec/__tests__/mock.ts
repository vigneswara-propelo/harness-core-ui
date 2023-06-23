/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'

export const ClusterNamesResponse = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    content: {
      clusters: ['us-west2/a1', 'us-west1-b/q1']
    }
  }
}
export const ConnectorsResponse = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      content: [
        {
          conenctor: {
            name: 'rancherconnector',
            identifier: 'rancher1',
            description: null,
            orgIdentifier: null,
            projectIdentifier: null,
            tags: {},
            type: 'Rancher',
            spec: {
              delegateSelectors: ['test-delegate'],
              credential: {
                type: 'ManualConfig',
                spec: {
                  rancherUrl: 'https://rancher.test16.sslip.io/',
                  auth: {
                    type: 'BearerToken',
                    spec: {
                      passwordRef: 'account.ranchertoken'
                    }
                  }
                }
              }
            }
          },
          createdAt: 1685977077772,
          lastModifiedAt: 1686227448090,
          status: null,
          harnessManaged: false
        }
      ]
    }
  }
}

export const ConnectorResponse = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      conenctor: {
        name: 'rancherconnector',
        identifier: 'rancher1',
        description: null,
        orgIdentifier: null,
        projectIdentifier: null,
        tags: {},
        type: 'Rancher',
        spec: {
          delegateSelectors: ['test-delegate'],
          credential: {
            type: 'ManualConfig',
            spec: {
              rancherUrl: 'https://rancher.test16.sslip.io/',
              auth: {
                type: 'BearerToken',
                spec: {
                  passwordRef: 'account.ranchertoken'
                }
              }
            }
          }
        }
      }
    }
  }
}

export const runtimeInputsValues = {
  connectorRef: RUNTIME_INPUT_VALUE,
  cluster: RUNTIME_INPUT_VALUE,
  namespace: RUNTIME_INPUT_VALUE,
  releaseName: RUNTIME_INPUT_VALUE
}

export const initialValues = {
  connectorRef: 'connectorRef',
  cluster: 'cluster',
  namespace: 'namespace',
  releaseName: 'releasename'
}

export const emptyInitialValues = {
  connectorRef: '',
  cluster: '',
  namespace: '',
  releaseName: ''
}

export const invalidYaml = `p ipe<>line:
sta ges:
   - st<>[]age:
              s pe<> c: <> sad-~`

export const yaml = `pipeline:
    stages:
        - stage:
              spec:
                  infrastructure:
                      infrastructureDefinition:
                          type: Rancher
                          spec:
                              connectorRef: account.connectorRef
                              cluster: cluster
                              namespace: namespace
                              releaseName: releaseName`

export const params = {
  accountId: 'accountId',
  module: 'cd',
  orgIdentifier: 'default',
  pipelineIdentifier: '-1',
  projectIdentifier: 'projectIdentifier'
}
