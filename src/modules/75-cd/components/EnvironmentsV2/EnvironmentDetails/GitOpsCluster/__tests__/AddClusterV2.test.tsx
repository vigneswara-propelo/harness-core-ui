/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'

import AddCluster from '../AddClusterV2'

const clusters = [
  {
    identifier: 'incluster',
    name: 'incluster',
    agentIdentifier: 'A1',
    scopeLevel: 'PROJECT'
  },
  {
    identifier: 'incluster',
    name: 'incluster',
    agentIdentifier: 'A2',
    scopeLevel: 'PROJECT'
  },
  {
    identifier: 'incluster',
    name: 'incluster',
    agentIdentifier: 'A3',
    scopeLevel: 'ACCOUNT'
  },
  {
    identifier: 'cluster12',
    name: 'Cluster 12',
    agentIdentifier: 'A1',
    scopeLevel: 'ACCOUNT'
  },
  {
    identifier: 'cluster15',
    name: 'Cluster 15',
    agentIdentifier: 'A6',
    scopeLevel: 'ACCOUNT'
  },
  {
    identifier: 'cluster16',
    name: 'cluster 16',
    agentIdentifier: 'A9',
    scopeLevel: 'ACCOUNT'
  }
]
const addApi = jest.fn().mockImplementation(() => Promise.resolve())
jest.mock('services/cd-ng', () => ({
  getClusterListFromSourcePromise: jest.fn().mockImplementation(() => Promise.resolve({ data: { content: clusters } })),
  useLinkClusters: jest.fn().mockImplementation(() => {
    return { mutate: addApi }
  })
}))
describe('Add Cluster V2 tests', () => {
  test('when no clusters', () => {
    jest.mock('services/cd-ng', () => ({
      getClusterListFromSourcePromise: jest.fn().mockImplementation(() => Promise.resolve([])),
      useLinkClusters: jest.fn().mockImplementation(() => {
        return { mutate: addApi }
      })
    }))
    render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/environments/:envId/details"
        pathParams={{ accountId: 'acc_Id', projectIdentifier: 'projId', orgIdentifier: 'Org_Id', envId: 'DUMMY_ENV_1' }}
      >
        <AddCluster onHide={jest.fn()} refetch={jest.fn()} envRef={'DUMMY_ENV_1'} linkedClusterResponse={null} />
      </TestWrapper>
    )
    const form = findDialogContainer()!
    const content = form.getElementsByClassName('bp3-tab')!
    expect(content.length).toBe(3)
  })
  test('with clusters', async () => {
    render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/environments/:envId/details"
        pathParams={{ accountId: 'acc_Id', projectIdentifier: 'projId', orgIdentifier: 'Org_Id', envId: 'DUMMY_ENV_1' }}
      >
        <AddCluster onHide={jest.fn()} refetch={jest.fn()} envRef={'DUMMY_ENV_1'} linkedClusterResponse={null} />
      </TestWrapper>
    )
    const form = findDialogContainer()!
    await waitFor(() => {
      expect(screen.queryByText('Cluster 12')).toBeInTheDocument()
    })
    const content = form.getElementsByClassName('collapeHeaderContent')!
    expect(content.length).toBe(6)
    expect(screen.queryByText('Cluster 12')).toBeInTheDocument()
  })
})
