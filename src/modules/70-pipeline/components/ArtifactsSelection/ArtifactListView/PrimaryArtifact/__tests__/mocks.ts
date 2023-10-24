/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const mockConnectorResponse = {
  totalPages: 1,
  totalItems: 1,
  pageItemCount: 1,
  pageSize: 10,
  content: [
    {
      connector: {
        name: 'harnessqa',
        identifier: 'harnessqa',
        description: '',
        accountIdentifier: 'px7xd_BFRCi-pfWPYXVjvw',
        orgIdentifier: 'default',
        projectIdentifier: 'KanikaTest',
        tags: {},
        type: 'DockerRegistry',
        spec: {
          dockerRegistryUrl: 'https://index.docker.io/v2/',
          providerType: 'DockerHub',
          auth: {
            type: 'UsernamePassword',
            spec: {
              username: 'harnessqa',
              usernameRef: null,
              passwordRef: 'docker_harnessqa'
            }
          },
          delegateSelectors: [],
          executeOnDelegate: true
        }
      },
      createdAt: 1676915953722,
      lastModifiedAt: 1679984754296,
      status: {
        status: 'SUCCESS',
        errorSummary: null,
        errors: null,
        testedAt: 1698042939286,
        lastTestedAt: 0,
        lastConnectedAt: 1698042939286
      },
      activityDetails: {
        lastActivityTime: 1679984754312
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
      isFavorite: false
    }
  ],
  pageIndex: 0,
  empty: false,
  pageToken: null
}

export const mockPrimaryArtifact = {
  name: 'someartifacttemplate',
  identifier: 'someartifacttemplate',
  template: {
    templateRef: 'artifact_template_stale',
    versionLabel: '12',
    templateInputs: {
      type: 'ArtifactoryRegistry',
      spec: {
        tag: '<+input>'
      }
    }
  }
}

export const artifactTemplateMockResponse = {
  status: 'SUCCESS',
  data: {
    accountId: 'px7xd_BFRCi-pfWPYXVjvw',
    orgIdentifier: 'default',
    projectIdentifier: 'KanikaTest',
    identifier: 'artifact_template_stale',
    name: 'artifact template stale',
    description: '',
    tags: {},
    yaml: 'template:\n  name: artifact template stale\n  identifier: artifact_template_stale\n  versionLabel: "12"\n  type: ArtifactSource\n  projectIdentifier: KanikaTest\n  orgIdentifier: default\n  tags: {}\n  spec:\n    type: ArtifactoryRegistry\n    spec:\n      artifactPath: server/best/nginx\n      tag: <+input>\n      repository: harness-automation-anonymous\n      repositoryFormat: docker\n      connectorRef: Ajfrog\n',
    versionLabel: '12',
    templateEntityType: 'ArtifactSource',
    childType: 'ArtifactoryRegistry',
    templateScope: 'project',
    version: 2,
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
    lastUpdatedAt: 1694502182814,
    storeType: 'INLINE',
    stableTemplate: true
  },
  metaData: null,
  correlationId: 'f7d60a9c-cbda-40e5-b678-146af861b5c0'
}
