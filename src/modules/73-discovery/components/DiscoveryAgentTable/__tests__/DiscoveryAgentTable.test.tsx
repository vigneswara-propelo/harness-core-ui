/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { PopoverPosition } from '@blueprintjs/core'
import { render } from '@testing-library/react'
import type { ApiGetAgentResponse } from 'services/servicediscovery'
import routes from '@common/RouteDefinitions'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { TestWrapper } from '@common/utils/testUtils'
import DiscoveryAgentTable from '../DiscoveryAgentTable'

const mockDiscoveryAgent: ApiGetAgentResponse[] = [
  {
    id: '648ffda242d20c0d04713e05',
    name: 'local-1',
    identity: 'local-1',
    description: 'some description',
    accountIdentifier: 'VgWXxi_6TdqAyplTQMg4CQ',
    organizationIdentifier: 'default',
    projectIdentifier: 'test',
    createdAt: '2023-06-21T13:17:41.491Z',
    updatedAt: '2023-06-21T13:17:41.491Z',
    createdBy: 'VgWXxi_6TdqAyplTQMg4CQ',
    updatedBy: 'Sahil',
    installationDetails: {
      createdAt: '2023-06-21T13:17:41.491Z',
      updatedAt: '2023-06-21T13:17:41.491Z',
      createdBy: 'VgWXxi_6TdqAyplTQMg4CQ',
      updatedBy: 'Sahil'
    },
    config: {
      kubernetes: {
        namespaced: false,
        namespace: 'sd1',
        serviceAccount: 'cluster-admin-1',
        imageRegistry: 'index.docker.io/shovan1995',
        imageTag: 'ci',
        imagePullPolicy: 'Always',
        resources: {}
      },
      data: {
        enableNodeAgent: false,
        enableStorageResources: false,
        enableBatchResources: false,
        retryInSecond: 100,
        retryCount: 3,
        batchSize: 100,
        collectionWindowInMin: 2
      }
    }
  }
]

const mockPagination = {
  itemCount: 1,
  pageSize: 1,
  pageCount: 1,
  pageIndex: 0,
  gotoPage: jest.fn,
  onPageSizeChange: jest.fn,
  showPagination: true,
  pageSizeDropdownProps: {
    usePortal: true,
    popoverProps: {
      position: PopoverPosition.TOP
    }
  },
  pageSizeOptions: [10, 20, 50, 100]
}

const PATH = routes.toDiscovery({ ...accountPathProps, ...projectPathProps })
const PATH_PARAMS = {
  accountId: 'accountId',
  orgIdentifier: 'default',
  projectIdentifier: 'Discovery_Test',
  module: 'chaos'
}

describe('Discovery Agent Status ', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2023-06-28'))
  })
  test('render', async () => {
    const props = {
      listData: mockDiscoveryAgent,
      pagination: mockPagination
    }
    const { container } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <DiscoveryAgentTable {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
