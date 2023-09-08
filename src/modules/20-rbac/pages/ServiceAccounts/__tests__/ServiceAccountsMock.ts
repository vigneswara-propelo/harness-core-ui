/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ResponseBoolean, ResponsePageServiceAccountAggregateDTO } from 'services/cd-ng'
import type { ResponsePageRoleWithPrincipalCountResponse } from 'services/rbac'
import type { ResponsePageResourceGroupResponse } from 'services/resourcegroups'

export const serviceAccountsAggregate: ResponsePageServiceAccountAggregateDTO = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 6,
    pageItemCount: 6,
    pageSize: 10,
    content: [
      {
        serviceAccount: {
          identifier: 'TestToken',
          name: 'TestToken',
          email: 'TestToken@service.harness.io',
          description: '',
          tags: {},
          accountIdentifier: 'testAcc'
        },
        createdAt: 1625465792745,
        lastModifiedAt: 1625465792745,
        tokensCount: 3,
        roleAssignmentsMetadataDTO: [
          {
            identifier: 'role_assignment_a0VMVTLTyuWOjixKZdVB',
            roleIdentifier: '_feature_flag_viewer',
            roleName: 'Feature Flag View Only Role',
            resourceGroupIdentifier: '_all_account_level_resources',
            resourceGroupName: 'All Resources',
            managedRole: true,
            managedRoleAssignment: false
          }
        ]
      },
      {
        serviceAccount: {
          identifier: 'bhuvan',
          name: 'bhuvan',
          email: 'bhuvan@service.harness.io',
          description: '',
          tags: {},
          accountIdentifier: 'testAcc'
        },
        createdAt: 1625217726464,
        lastModifiedAt: 1625217726464,
        tokensCount: 1,
        roleAssignmentsMetadataDTO: [
          {
            identifier: 'role_assignment_iTQkgwI9vIbc2kKTxR7G',
            roleIdentifier: '_account_viewer',
            roleName: 'Account Viewer',
            resourceGroupIdentifier: '_all_account_level_resources',
            resourceGroupName: 'All Resources',
            managedRole: true,
            managedRoleAssignment: false
          },
          {
            identifier: 'role_assignment_qe05tHOVkBsxFRmVWvKd',
            roleIdentifier: 'create_org',
            roleName: 'create org',
            resourceGroupIdentifier: '_all_account_level_resources',
            resourceGroupName: 'All Resources',
            managedRole: false,
            managedRoleAssignment: false
          }
        ]
      },
      {
        serviceAccount: {
          identifier: 'test',
          name: 'test',
          email: 'test@service.harness.io',
          description: '',
          tags: { why: '', hello: '' },
          accountIdentifier: 'testAcc'
        },
        createdAt: 1625210104096,
        lastModifiedAt: 1625210120103,
        tokensCount: 1,
        roleAssignmentsMetadataDTO: []
      },
      {
        serviceAccount: {
          identifier: 'qesanity',
          name: 'qe-sanity',
          email: 'qesanity@service.harness.io',
          description: '',
          tags: {},
          accountIdentifier: 'testAcc'
        },
        createdAt: 1625157595760,
        lastModifiedAt: 1625203517944,
        tokensCount: 1,
        roleAssignmentsMetadataDTO: [
          {
            identifier: 'role_assignment_apJs11jQh0IJ0OumJjih',
            roleIdentifier: '_account_admin',
            roleName: 'Account Admin',
            resourceGroupIdentifier: '_all_account_level_resources',
            resourceGroupName: 'All Resources',
            managedRole: true,
            managedRoleAssignment: false
          }
        ]
      },
      {
        serviceAccount: {
          identifier: 'qa_sanity',
          name: 'qa sanity',
          email: 'qa_sanity@service.harness.io',
          description: '',
          tags: {},
          accountIdentifier: 'testAcc'
        },
        createdAt: 1625150096091,
        lastModifiedAt: 1625150096091,
        tokensCount: 1,
        roleAssignmentsMetadataDTO: [
          {
            identifier: 'role_assignment_1lBuJ2y8nu8f8mgV8fK8',
            roleIdentifier: '_account_admin',
            roleName: 'Account Admin',
            resourceGroupIdentifier: '_all_account_level_resources',
            resourceGroupName: 'All Resources',
            managedRole: true,
            managedRoleAssignment: false
          }
        ]
      },
      {
        serviceAccount: {
          identifier: 'acc1',
          name: 'acc1',
          email: 'acc1@service.harness.io',
          description: '',
          tags: {},
          accountIdentifier: 'testAcc'
        },
        createdAt: 1625145623718,
        lastModifiedAt: 1625145623718,
        tokensCount: 1,
        roleAssignmentsMetadataDTO: [
          {
            identifier: 'role_assignment_dwJ7dsZm0VqQFmx8WArJ',
            roleIdentifier: '_account_admin',
            roleName: 'Account Admin',
            resourceGroupIdentifier: '_all_account_level_resources',
            resourceGroupName: 'All Resources',
            managedRole: true,
            managedRoleAssignment: false
          }
        ]
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: {},
  correlationId: ''
}

export const mockResponse: ResponseBoolean = {
  status: 'SUCCESS',
  data: true,
  metaData: {},
  correlationId: ''
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
          identifier: '_account_viewer',
          name: 'Account Viewer',
          permissions: [
            'core_service_view',
            'core_organization_view',
            'core_environment_view',
            'core_secret_view',
            'core_connector_view'
          ],
          allowedScopeLevels: ['ACCOUNT'],
          description: 'View an account',
          tags: {}
        },
        scope: {},
        harnessManaged: true,
        createdAt: 1615054539384,
        lastModifiedAt: 1617625090481
      },
      {
        role: {
          identifier: '_account_admin',
          name: 'Account Admin',
          permissions: [
            'core_organization_create',
            'core_service_edit',
            'core_secret_delete',
            'core_organization_view',
            'core_environment_view',
            'core_service_delete',
            'core_secret_edit',
            'core_connector_create',
            'core_connector_edit',
            'core_secret_view',
            'core_secret_access',
            'core_connector_view',
            'core_connector_access',
            'core_environment_access',
            'core_service_view',
            'core_service_access',
            'core_environment_edit',
            'core_connector_delete',
            'core_environment_delete'
          ],
          allowedScopeLevels: ['ACCOUNT'],
          description: 'Administer an account',
          tags: {}
        },
        scope: {},
        harnessManaged: true,
        createdAt: 1615054539397,
        lastModifiedAt: 1617711363209
      },
      {
        role: {
          identifier: 'Custom_Role',
          name: 'Custom Role',
          permissions: [
            'core_organization_create',
            'core_secret_delete',
            'core_organization_view',
            'core_secret_edit',
            'core_secret_view'
          ],
          allowedScopeLevels: ['ACCOUNT'],
          description: '',
          tags: {}
        },
        scope: { accountIdentifier: 'testAcc' },
        harnessManaged: false,
        createdAt: 1617901019095,
        lastModifiedAt: 1617941758361
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: undefined,
  correlationId: ''
}

export const resourceGroupsMockData: ResponsePageResourceGroupResponse = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 4,
    pageItemCount: 4,
    pageSize: 50,
    content: [
      {
        resourceGroup: {
          accountIdentifier: 'testAcc',
          identifier: 'My_Resources',
          name: 'My Resources',
          resourceSelectors: [],
          fullScopeSelected: false,
          tags: {},
          description: '',
          color: '#0063f7'
        },
        harnessManaged: false
      },
      {
        resourceGroup: {
          accountIdentifier: 'testAcc',
          identifier: 'Custom_RG',
          name: 'Custom RG',
          resourceSelectors: [{ type: 'DynamicResourceSelector', resourceType: 'SECRET' }],
          fullScopeSelected: false,
          tags: {},
          description: '',
          color: '#e6b800'
        },
        createdAt: 1617943146592,
        lastModifiedAt: 1617943226983,
        harnessManaged: false
      },
      {
        resourceGroup: {
          accountIdentifier: 'testAcc',
          identifier: '_all_account_level_resources',
          name: 'All Resources',
          resourceSelectors: [],
          fullScopeSelected: true,
          tags: { predefined: 'true' },
          description: 'Resource Group containing all resources',
          color: '#0061fc'
        },
        createdAt: 1617721392670,
        lastModifiedAt: 1617721392670,
        harnessManaged: false
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: undefined,
  correlationId: ''
}
