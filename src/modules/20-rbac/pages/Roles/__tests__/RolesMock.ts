/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import type { ResponsePageRoleWithPrincipalCountResponse } from 'services/rbac'

export const rolesMockList: ResponsePageRoleWithPrincipalCountResponse = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 3,
    pageItemCount: 3,
    pageSize: 50,
    content: [
      {
        role: {
          identifier: 'role1',
          name: 'role 1',
          permissions: [],
          allowedScopeLevels: ['ACCOUNT'],
          description: '',
          tags: {}
        },
        scope: { accountIdentifier: 'testAcc' },
        harnessManaged: false,
        createdAt: 1613471787889,
        lastModifiedAt: 1613551258686
      },
      {
        role: {
          identifier: 'role2',
          name: 'role 2',
          permissions: [],
          allowedScopeLevels: ['ACCOUNT'],
          description: '',
          tags: {}
        },
        scope: { accountIdentifier: 'testAcc' },
        harnessManaged: false,
        createdAt: 1613543661350,
        lastModifiedAt: 1613543661350
      },
      {
        role: {
          identifier: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          name: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          permissions: [],
          allowedScopeLevels: ['ACCOUNT'],
          description: '',
          tags: {}
        },
        scope: { accountIdentifier: 'testAcc' },
        harnessManaged: false,
        createdAt: 1613543805827,
        lastModifiedAt: 1613543805827
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: {},
  correlationId: '25fa2bbe-a0cd-4579-bf25-ba612c2d1201'
}

export const createRoleMockData = {
  mutate: async () => {
    return {
      status: 'SUCCESS',
      data: {
        role: {
          identifier: 'role1',
          name: 'role 1',
          permissions: [],
          allowedScopeLevels: ['account'],
          description: '',
          tags: {}
        }
      },
      metaData: undefined,
      correlationId: '375d39b4-3552-42a2-a4e3-e6b9b7e51d44'
    }
  },
  loading: false
}
