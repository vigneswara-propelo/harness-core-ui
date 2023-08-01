/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const mockRepos = {
  status: 'SUCCESS',
  data: [{ name: 'repo1' }, { name: 'repo2' }, { name: 'repo3' }, { name: 'repotest1' }, { name: 'repotest2' }],
  metaData: null,
  correlationId: 'correlationId'
}

export const mockBranches = {
  status: 'SUCCESS',
  data: {
    branches: [{ name: 'main' }, { name: 'main-demo' }, { name: 'main-patch' }, { name: 'dev' }],
    defaultBranch: { name: 'main' }
  },
  metaData: null,
  correlationId: 'correlationId'
}

export const gitConnectorMock = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 2,
    pageItemCount: 2,
    pageSize: 100,
    content: [
      {
        connector: {
          name: 'ValidGitAccount',
          identifier: 'ValidGitRepo',
          description: '',
          orgIdentifier: 'default',
          projectIdentifier: 'DevX',
          tags: {},
          type: 'Github',
          spec: {
            url: 'https://github.com/wings-software',
            authentication: {
              type: 'Http',
              spec: {
                type: 'UsernamePassword',
                spec: { username: 'harnessDev', usernameRef: null, passwordRef: 'githubToken' }
              }
            },
            apiAccess: { type: 'Token', spec: { tokenRef: 'githubToken' } },
            delegateSelectors: [],
            type: 'Account'
          }
        },
        createdAt: 1618848332466,
        lastModifiedAt: 1618848363159,
        status: {
          status: 'FAILURE',
          errorSummary: 'Error Encountered (Invalid git repo https://github.com/wings-software)',
          errors: [
            { reason: 'Unexpected Error', message: 'Invalid git repo https://github.com/wings-software', code: 450 }
          ],
          testedAt: 1619685989716,
          lastTestedAt: 0,
          lastConnectedAt: 1619626567468
        },
        activityDetails: { lastActivityTime: 1618848363165 },
        harnessManaged: false,
        gitDetails: { objectId: null, branch: null, repoIdentifier: null }
      },
      {
        connector: {
          name: 'ValidGithubRepo',
          identifier: 'ValidGithubRepo',
          description: 'Used in gitSync',
          orgIdentifier: 'default',
          projectIdentifier: 'DevX',
          tags: {},
          type: 'Github',
          spec: {
            url: 'https://github.com/wings-software/sunnykesh-gitSync',
            authentication: {
              type: 'Http',
              spec: {
                type: 'UsernamePassword',
                spec: { username: 'harnessDev', usernameRef: null, passwordRef: 'githubToken' }
              }
            },
            apiAccess: { type: 'Token', spec: { tokenRef: 'githubToken' } },
            delegateSelectors: [],
            type: 'Repo'
          }
        },
        createdAt: 1618848214482,
        lastModifiedAt: 1618848214472,
        status: {
          status: 'SUCCESS',
          errorSummary: null,
          errors: null,
          testedAt: 1619685421630,
          lastTestedAt: 0,
          lastConnectedAt: 1619685421630
        },
        activityDetails: { lastActivityTime: 1618848214504 },
        harnessManaged: false,
        gitDetails: { objectId: null, branch: null, repoIdentifier: null }
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: 'b966360a-06b4-4c7a-8509-7d5d6d848548'
}

export const fetchSupportedConnectorsListPayload = {
  body: {
    category: undefined,
    filterType: 'Connector',
    orgIdentifier: ['default'],
    projectIdentifier: ['DevX'],
    types: ['Github', 'Bitbucket', 'AzureRepo', 'Gitlab']
  },
  queryParams: {
    accountIdentifier: 'dummy',
    includeAllConnectorsAvailableAtScope: false,
    orgIdentifier: 'default',
    pageIndex: 0,
    pageSize: 10,
    projectIdentifier: 'DevX',
    searchTerm: '',
    sortOrders: 'createdAt,DESC'
  }
}

export const gitXSettingMock = {
  status: 'SUCCESS',
  data: [
    {
      setting: {
        identifier: 'default_store_type_for_entities',
        name: 'Default Store Type For Entities- Pipelines/InputSets/Templates',
        orgIdentifier: 'default',
        projectIdentifier: 'sunnyQA_test',
        category: 'GIT_EXPERIENCE',
        groupIdentifier: null,
        valueType: 'String',
        allowedValues: ['INLINE', 'REMOTE'],
        allowOverrides: true,
        value: 'REMOTE',
        defaultValue: 'INLINE',
        settingSource: 'PROJECT',
        isSettingEditable: true,
        allowedScopes: ['ACCOUNT', 'ORGANIZATION', 'PROJECT']
      },
      lastModifiedAt: 1689737175125
    },
    {
      setting: {
        identifier: 'enforce_git_experience',
        name: 'Enforce Git Experience For Entities- Pipelines/InputSets/Templates',
        orgIdentifier: 'default',
        projectIdentifier: 'sunnyQA_test',
        category: 'GIT_EXPERIENCE',
        groupIdentifier: null,
        valueType: 'Boolean',
        allowedValues: null,
        allowOverrides: true,
        value: 'false',
        defaultValue: 'false',
        settingSource: 'PROJECT',
        isSettingEditable: true,
        allowedScopes: ['ACCOUNT', 'ORGANIZATION', 'PROJECT']
      },
      lastModifiedAt: 1690793003784
    },
    {
      setting: {
        identifier: 'git_experience_repo_allowlist',
        name: 'Git Experience Repo Allowlist',
        orgIdentifier: null,
        projectIdentifier: null,
        category: 'GIT_EXPERIENCE',
        groupIdentifier: null,
        valueType: 'String',
        allowedValues: null,
        allowOverrides: true,
        value: null,
        defaultValue: null,
        settingSource: 'DEFAULT',
        isSettingEditable: true,
        allowedScopes: ['ACCOUNT', 'ORGANIZATION', 'PROJECT']
      },
      lastModifiedAt: null
    },
    {
      setting: {
        identifier: 'default_connector_for_git_experience',
        name: 'Default Connector For Git Experience with Entities- Pipelines/InputSets/Templates',
        orgIdentifier: 'default',
        projectIdentifier: 'DevX',
        category: 'GIT_EXPERIENCE',
        groupIdentifier: null,
        valueType: 'String',
        allowedValues: null,
        allowOverrides: true,
        value: 'ValidGithubRepo',
        defaultValue: null,
        settingSource: 'PROJECT',
        isSettingEditable: true,
        allowedScopes: ['ACCOUNT', 'ORGANIZATION', 'PROJECT']
      },
      lastModifiedAt: 1690793003847
    },
    {
      setting: {
        identifier: 'default_repo_for_git_experience',
        name: 'Default Repo For Git Experience with Entities- Pipelines/InputSets/Templates',
        orgIdentifier: null,
        projectIdentifier: null,
        category: 'GIT_EXPERIENCE',
        groupIdentifier: null,
        valueType: 'String',
        allowedValues: null,
        allowOverrides: true,
        value: 'gitX2',
        defaultValue: 'gitX2',
        settingSource: 'ACCOUNT',
        isSettingEditable: true,
        allowedScopes: ['ACCOUNT', 'ORGANIZATION', 'PROJECT']
      },
      lastModifiedAt: 1690462502543
    }
  ],
  metaData: null,
  correlationId: '76c48d8b-d5f4-48d0-aad3-1fbfd4c5b0db'
}
