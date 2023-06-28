/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'
import { getConnectorPromise } from 'services/cd-ng'
import { TestWrapper } from '@common/utils/testUtils'
import { useGetAgent } from 'services/servicediscovery'
import Settings from '../Settings'
import { RenderConnectorStatus } from '../ConnectorStatus'

const mockDAgentData = {
  id: '648ffda242d20c0d04713e05',
  name: 'local-1',
  identity: 'local-1',
  description: '',
  tags: null,
  accountIdentifier: 'VgWXxi_6TdqAyplTQMg4CQ',
  organizationIdentifier: 'default',
  projectIdentifier: 'test',
  config: {
    kubernetes: {
      namespaced: false,
      namespace: 'sd1',
      serviceAccount: 'cluster-admin-1',
      imageRegistry: 'index.docker.io/shovan1995',
      imageTag: 'ci',
      imagePullPolicy: 'Always',
      imagePullSecrets: null,
      resources: {},
      toleration: null
    },
    data: {
      enableNodeAgent: false,
      nodeAgentSelector: '',
      blacklistedNamespaces: null,
      enableStorageResources: false,
      enableBatchResources: false,
      retryInSecond: 100,
      retryCount: 3,
      batchSize: 100,
      collectionWindowInMin: 2
    }
  },
  installationType: 'CONNECTOR',
  k8sConnectorID: 'svcdiscovery',
  createdAt: '2023-06-19T07:02:58.203Z',
  createdBy: 'VgWXxi_6TdqAyplTQMg4CQ',
  updatedBy: '',
  removed: false,
  installationDetails: {
    id: '648ffda242d20c0d04713e06',
    agentID: '648ffda242d20c0d04713e05',
    delegateTaskID: 'DFmiyJTUSF-reLnjH2q8lQ',
    delegateID: '',
    delegateTaskStatus: 'SUCCESS',
    agentDetails: {},
    createdAt: '2023-06-19T07:02:58.75Z',
    createdBy: 'VgWXxi_6TdqAyplTQMg4CQ',
    updatedBy: '',
    removed: false
  }
}

const mockConnectorData = {
  status: 'SUCCESS',
  data: {
    connector: {
      name: 'svc-discovery',
      identifier: 'svcdiscovery',
      description: '',
      orgIdentifier: 'default',
      projectIdentifier: 'test',
      tags: {},
      type: 'K8sCluster',
      spec: {
        credential: {
          type: 'InheritFromDelegate',
          spec: null
        },
        delegateSelectors: ['kubernetes-delegate']
      }
    },
    createdAt: 1685902672383,
    lastModifiedAt: 1685954799098,
    status: {
      status: 'SUCCESS',
      errorSummary: null,
      errors: null,
      testedAt: 1686810219767,
      lastTestedAt: 0,
      lastConnectedAt: 1686810219767
    },
    activityDetails: {
      lastActivityTime: 1685954799290
    },
    harnessManaged: false,
    gitDetails: {
      objectId: null,
      branch: null,
      repoIdentifier: null,
      rootFolder: null,
      filePath: null,
      repoName: null,
      commitId: null,
      fileUrl: null,
      repoUrl: null,
      parentEntityConnectorRef: null,
      parentEntityRepoName: null
    },
    entityValidityDetails: {
      valid: true,
      invalidYaml: null
    },
    governanceMetadata: null,
    isFavorite: null
  },
  metaData: null,
  correlationId: '3cad10b4-5dca-4168-ac44-d2c54014e51c'
}

jest.mock('services/servicediscovery', () => ({
  useGetAgent: jest.fn().mockImplementation(() => {
    return { data: mockDAgentData, refetch: jest.fn, error: null, loading: false }
  })
}))

jest.mock('services/cd-ng', () => ({
  getConnectorPromise: jest.fn().mockImplementation(() => {
    return { data: mockConnectorData, refetch: jest.fn, error: null, loading: false }
  })
}))

const PATH = routes.toDiscovery({ ...accountPathProps, ...projectPathProps })
const PATH_PARAMS = {
  accountId: 'accountId',
  orgIdentifier: 'default',
  projectIdentifier: 'Discovery_Test',
  module: 'chaos'
}

describe('Overview tab tests', () => {
  beforeEach(() => jest.clearAllMocks())

  test('should match snapshot', async () => {
    const { container } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <Settings />
      </TestWrapper>
    )
    expect(useGetAgent).toBeCalled()
    expect(getConnectorPromise).toBeCalled()

    expect(container).toMatchSnapshot()
  })

  test('render success status', async () => {
    const { getByText } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <RenderConnectorStatus status={'SUCCESS'} />
      </TestWrapper>
    )
    expect(getByText('success')).toBeInTheDocument()
  })

  test('render failed status', async () => {
    const { getByText } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <RenderConnectorStatus status={'FAILURE'} />
      </TestWrapper>
    )
    expect(getByText('failed')).toBeInTheDocument()
  })
})
