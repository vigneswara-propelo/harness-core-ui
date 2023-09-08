/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ResponsePageUserMetadataDTO, ResponsePageInvite } from 'services/cd-ng'
import type { ResponsePageRoleWithPrincipalCountResponse } from 'services/rbac'

export const orgMockData = {
  data: {
    status: 'SUCCESS',
    data: {
      pageCount: 1,
      itemCount: 3,
      pageSize: 50,
      content: [
        {
          organization: {
            accountIdentifier: 'testAcc',
            identifier: 'testOrg',
            name: 'Org Name',
            description: 'Description',
            tags: { tag1: '', tag2: 'tag3' }
          }
        },
        {
          organization: {
            accountIdentifier: 'testAcc',
            identifier: 'default',
            name: 'default',
            description: 'default',
            tags: { tag1: '', tag2: 'tag3' }
          },
          harnessManaged: true
        }
      ],
      pageIndex: 0,
      empty: false
    },
    metaData: undefined,
    correlationId: '370210dc-a345-42fa-b3cf-69bd64eb5073'
  },
  loading: false
}
export const getOrgMockData = {
  data: {
    status: 'SUCCESS',
    data: {
      organization: {
        accountIdentifier: 'testAcc',
        identifier: 'testOrg',
        name: 'Org Name',
        description: 'Description',
        tags: { tag1: '', tag2: 'tag3' }
      }
    },
    metaData: undefined,
    correlationId: '9f77f74d-c4ab-44a2-bfea-b4545c6a4a39'
  }
}

export const getOrgAggregateMockData = {
  data: {
    status: 'SUCCESS',
    data: {
      organizationResponse: {
        organization: {
          accountIdentifier: 'testAcc',
          identifier: 'testOrg',
          name: 'Org Name',
          description: 'Description',
          tags: { tag1: '', tag2: 'tag3' }
        },
        createdAt: 1607422602909,
        lastModifiedAt: 1607422602909
      },
      projects: [],
      admins: [{ name: 'Admin', email: 'admin@harness.io', uuid: 'lv0euRhKRCyiXWzS7pOg6g' }],
      collaborators: []
    },
    metaData: undefined,
    correlationId: '9f77f74d-c4ab-44a2-bfea-b4545c6a4a39'
  }
}
export const getOrganizationAggregateDTOListMockData = {
  data: {
    status: 'SUCCESS',
    data: {
      totalPages: 1,
      totalItems: 3,
      pageItemCount: 3,
      pageSize: 50,
      content: [
        {
          organizationResponse: {
            organization: {
              accountIdentifier: 'dummy2',
              identifier: 'bfvbfkbvf',
              name: 'bfvbfkbvf',
              description: '',
              tags: {}
            },
            createdAt: 1607450298192,
            lastModifiedAt: 1607450298192
          },
          projectsCount: 0,
          admins: [{ name: 'Admin', email: 'admin@harness.io', uuid: 'lv0euRhKRCyiXWzS7pOg6g' }],
          collaborators: [{ name: 'Admin2', email: 'admin2@harness.io', uuid: 'lv0efduRhKRCyiXWzS7pOg6g' }]
        },
        {
          organizationResponse: {
            organization: {
              accountIdentifier: 'dummy2',
              identifier: 'Harness',
              name: 'Harness',
              description: 'Harness',
              tags: { ce: 'module', prod: '', cv: 'module', ci: 'module', strin: '' }
            },
            createdAt: null,
            lastModifiedAt: 1607448526662
          },
          projectsCount: 5,
          admins: [{ name: 'Admin', email: 'admin@harness.io', uuid: 'lv0euRhKRCyiXWzS7pOg6g' }],
          collaborators: []
        },
        {
          organizationResponse: {
            organization: {
              accountIdentifier: 'dummy2',
              identifier: 'default',
              name: 'Default',
              description: 'Default Organization',
              tags: {}
            },
            createdAt: 1607447807131,
            lastModifiedAt: 1607447807131
          },
          projectsCount: 7,
          admins: [],
          collaborators: []
        }
      ],
      pageIndex: 0,
      empty: false
    },
    metaData: null,
    correlationId: '5f150ca8-8502-4c81-afc4-960f2d23f2bb'
  }
}
export const createOrgMockData = {
  mutate: async () => {
    return {
      status: 'SUCCESS',
      data: {
        accountIdentifier: 'testAcc',
        identifier: 'testOrg',
        name: 'Org Name',
        color: '#004fc4',
        description: 'Description',
        tags: { tag1: '', tag2: 'tag3' }
      },
      metaData: undefined,
      correlationId: '375d39b4-3552-42a2-a4e3-e6b9b7e51d44'
    }
  },
  loading: false
}

export const response = {
  status: 'SUCCESS',
  data: true,
  metaData: {},
  correlationId: ''
}

export const userMockData: ResponsePageUserMetadataDTO = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 6,
    pageItemCount: 6,
    pageSize: 50,
    content: [
      { name: 'example1', email: 'example1@email.com', uuid: '19bYA-ooQZOTZQxf2N-VPA' },
      { name: 'example2', email: 'example2@email.com', uuid: 'BnTbQTIJS4SkadzYv0BcbA' },
      { name: 'example3', email: 'example3@email.com', uuid: 'nhLgdGgxS_iqa0KP5edC-w' },
      { name: 'example4', email: 'example4@email.com', uuid: 'ZqXNvYmURnO46PX7HwgEtQ' },
      { name: 'example5', email: 'example5@email.com', uuid: '0osgWsTZRsSZ8RWfjLRkEg' },
      { name: 'example6', email: 'example6@email.com', uuid: 'lv0euRhKRCyiXWzS7pOg6g' }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: undefined,
  correlationId: '5c453afd-179b-44f6-8fc7-6f30a5698453'
}

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
        accountIdentifier: 'testAcc',
        email: 'example4@email.com',
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
        accountIdentifier: 'testAcc',
        email: 'example3@email.com',
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
        accountIdentifier: 'testAcc',
        email: 'example2@email.com',
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
