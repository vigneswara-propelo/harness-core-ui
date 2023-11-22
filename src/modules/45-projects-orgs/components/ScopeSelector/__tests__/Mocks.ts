/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const projectMockDataWithModules = {
  status: 'SUCCESS',
  data: {
    totalPages: 13,
    totalItems: 608,
    pageItemCount: 50,
    pageSize: 50,
    content: [
      {
        projectResponse: {
          project: {
            orgIdentifier: 'AAAsunnyGitExp',
            identifier: 'gitX_CDC',
            name: 'gitX CDC',
            color: '#0063f7',
            modules: [
              'CD',
              'CI',
              'CV',
              'CF',
              'CE',
              'STO',
              'CHAOS',
              'SRM',
              'IACM',
              'CET',
              'CODE',
              'CORE',
              'PMS',
              'TEMPLATESERVICE',
              'SSCA'
            ],
            description: '',
            tags: {}
          },
          createdAt: 1698045034539,
          lastModifiedAt: 1698045034539,
          isFavorite: false
        },
        organization: {
          identifier: 'AAAsunnyGitExp',
          name: 'AAAsunnyGitExp',
          description: '',
          tags: {}
        },
        harnessManagedOrg: false,
        admins: [
          {
            name: 'dummy',
            email: 'dummy',
            uuid: 'dummy',
            locked: false,
            disabled: false,
            externallyManaged: false,
            twoFactorAuthenticationEnabled: false
          }
        ],
        collaborators: []
      }
    ]
  }
}

export const organizations = {
  status: 'SUCCESS',
  data: {
    totalPages: 2,
    totalItems: 82,
    pageItemCount: 50,
    pageSize: 50,
    content: [
      {
        organizationResponse: {
          organization: { identifier: 'aaaaaaaaaaaaaaaaDeepakOrg', name: 'a DeepakOrg', description: '', tags: {} },
          createdAt: null,
          lastModifiedAt: 1629882239962,
          harnessManaged: false
        },
        projectsCount: 0,
        connectorsCount: 0,
        secretsCount: 0,
        delegatesCount: 0,
        templatesCount: 0,
        admins: null,
        collaborators: null
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: 'dummy'
}
