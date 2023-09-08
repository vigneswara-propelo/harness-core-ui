/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import type { ResponseRoleResponse, ResponseSetString } from 'services/rbac'

export const resourceTypesMockData: ResponseSetString = {
  status: 'SUCCESS',
  data: ['ACCOUNT', 'ORGANIZATION', 'PROJECT', 'SECRET'],
  metaData: {},
  correlationId: '97683e83-6a8a-4e9f-9607-534cc499016f'
}

export const roleMockData: ResponseRoleResponse = {
  status: 'SUCCESS',
  data: {
    role: {
      identifier: 'identifier',
      name: 'name',
      permissions: ['core_project_delete', 'core_organization_create', 'core_project_create'],
      allowedScopeLevels: ['ACCOUNT'],
      description: 'description',
      tags: { ui: '', dev: '' }
    },
    scope: { accountIdentifier: 'testAcc' },
    harnessManaged: false,
    createdAt: 1614260652905,
    lastModifiedAt: 1614669872800
  },
  metaData: {},
  correlationId: '3b452fb0-aa4b-4f31-979a-f0b3fd61772d'
}

export const permissionListMockData = {
  status: 'SUCCESS',
  data: [
    {
      permission: {
        identifier: 'core_secret_access',
        name: 'Runtime Access on a secret',
        status: 'ACTIVE',
        allowedScopeLevels: ['organization', 'project', 'account'],
        resourceType: 'SECRET',
        action: 'access'
      }
    },
    {
      permission: {
        identifier: 'core_organization_create',
        name: 'Create an Organization',
        status: 'ACTIVE',
        allowedScopeLevels: ['account'],
        resourceType: 'ORGANIZATION',
        action: 'create'
      }
    },
    {
      permission: {
        identifier: 'core_organization_create',
        name: 'Create an Organization',
        status: 'ACTIVE',
        allowedScopeLevels: ['account'],
        resourceType: 'ORGANIZATION',
        action: 'create'
      }
    },
    {
      permission: {
        identifier: 'core_project_create',
        name: 'Create a Project',
        status: 'ACTIVE',
        allowedScopeLevels: ['account', 'organization'],
        resourceType: 'PROJECT',
        action: 'create'
      }
    },
    {
      permission: {
        identifier: 'core_secret_view',
        name: 'View Secret',
        status: 'ACTIVE',
        allowedScopeLevels: ['organization', 'project', 'account'],
        resourceType: 'SECRET',
        action: 'view'
      }
    },
    {
      permission: {
        identifier: 'core_organization_view',
        name: 'View Organization',
        status: 'ACTIVE',
        allowedScopeLevels: ['organization', 'account'],
        resourceType: 'ORGANIZATION',
        action: 'view'
      }
    },
    {
      permission: {
        identifier: 'core_secret_edit',
        name: 'Create or Edit a Secret',
        status: 'ACTIVE',
        allowedScopeLevels: ['organization', 'project', 'account'],
        resourceType: 'SECRET',
        action: 'edit'
      }
    },
    {
      permission: {
        identifier: 'core_secret_delete',
        name: 'Delete Secret',
        status: 'ACTIVE',
        allowedScopeLevels: ['organization', 'project', 'account'],
        resourceType: 'SECRET',
        action: 'delete'
      }
    }
  ],
  metaData: '',
  correlationId: ''
}
