/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import type { ResponsePageInvite } from 'services/cd-ng'
import type { ResponsePageRoleWithPrincipalCountResponse } from 'services/rbac'

export const invitesMockData: ResponsePageInvite = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 4,
    pageItemCount: 4,
    pageSize: 50,
    content: [
      {
        id: '5f773f61cc54a42436326268',
        name: 'example4',
        email: 'example4@email.com',
        accountIdentifier: 'testAcc',
        roleBindings: [
          {
            roleIdentifier: 'role1',
            roleName: 'role 1',
            resourceGroupIdentifier: 'rg1',
            resourceGroupName: 'rg 1',
            managedRole: true
          }
        ],
        inviteType: 'ADMIN_INITIATED_INVITE',
        approved: false
      },
      {
        id: '5f773f61cc54a42436326267',
        name: 'example3',
        email: 'example3@email.com',
        accountIdentifier: 'testAcc',
        roleBindings: [
          {
            roleIdentifier: 'role1',
            roleName: 'role 1',
            resourceGroupIdentifier: 'rg1',
            resourceGroupName: 'rg 1',
            managedRole: true
          }
        ],
        inviteType: 'ADMIN_INITIATED_INVITE',
        approved: false
      },
      {
        id: '5f773f61cc54a42436326266',
        name: 'example2',
        email: 'example2@email.com',
        accountIdentifier: 'testAcc',
        roleBindings: [
          {
            roleIdentifier: 'role1',
            roleName: 'role 1',
            resourceGroupIdentifier: 'rg1',
            resourceGroupName: 'rg 1',
            managedRole: true
          }
        ],
        inviteType: 'ADMIN_INITIATED_INVITE',
        approved: false
      }
    ],
    pageIndex: 0,
    empty: false
  }
}

export const roleMockData: ResponsePageRoleWithPrincipalCountResponse = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 3,
    pageItemCount: 3,
    pageSize: 50,
    content: [
      {
        role: {
          identifier: '_project_admin',
          name: 'Project Admin',
          permissions: [
            'core_secret_delete',
            'core_pipeline_delete',
            'core_secret_edit',
            'core_connector_create',
            'core_project_view',
            'core_connector_edit',
            'core_secret_view',
            'core_pipeline_view',
            'core_project_edit',
            'core_connector_view',
            'core_pipeline_edit',
            'core_secret_create',
            'core_pipeline_execute',
            'core_project_delete',
            'core_connector_delete'
          ],
          allowedScopeLevels: ['PROJECT'],
          description: 'Administrate an existing project.',
          tags: {}
        },
        scope: { accountIdentifier: 'testAcc' },
        harnessManaged: true,
        createdAt: 1615180329305,
        lastModifiedAt: 1616929638331
      },
      {
        role: {
          identifier: '_project_viewer',
          name: 'Project Viewer',
          permissions: ['core_project_view', 'core_secret_view', 'core_pipeline_view', 'core_connector_view'],
          allowedScopeLevels: ['PROJECT'],
          description: 'View a project',
          tags: {}
        },
        scope: { accountIdentifier: 'testAcc' },
        harnessManaged: true,
        createdAt: 1615180329319,
        lastModifiedAt: 1616929638230
      },
      {
        role: {
          identifier: '_pipeline_executor',
          name: 'Pipeline Executor',
          permissions: ['core_pipeline_execute', 'core_secret_view', 'core_pipeline_view', 'core_connector_view'],
          allowedScopeLevels: ['PROJECT'],
          description: 'Execute a pipeline',
          tags: {}
        },
        scope: { accountIdentifier: 'testAcc' },
        harnessManaged: true,
        createdAt: 1616668636360,
        lastModifiedAt: 1616929638320
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: undefined,
  correlationId: 'f78f3b2d-b4f0-483e-a064-2aca8984ec9f'
}
