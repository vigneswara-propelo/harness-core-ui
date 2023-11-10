/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const getInfraListAPIResponseMock = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 5,
    pageItemCount: 5,
    pageSize: 100,
    content: [
      {
        infrastructure: {
          accountId: 'dummy',
          identifier: 'Infra_5',
          orgIdentifier: 'dummy',
          projectIdentifier: 'dummy',
          environmentRef: 'Env_1',
          name: 'Infra 5',
          description: 'Some desc',
          tags: { 'tag 1': '' },
          deploymentType: 'Kubernetes',
          type: 'KubernetesDirect',
          storeType: 'INLINE',
          yaml: 'infrastructureDefinition:\n  name: "Infra 5"\n  identifier: "Infra_5"\n  orgIdentifier: "dummy"\n  projectIdentifier: "dummy"\n  environmentRef: "Env_1"\n  description: "Some desc"\n  tags:\n    tag 1: ""\n  allowSimultaneousDeployments: true\n  deploymentType: "Kubernetes"\n  type: "KubernetesDirect"\n  spec:\n    connectorRef: "Test"\n    namespace: "testasdsaa"\n    releaseName: "release-<+INFRA_KEY>"\n'
        },
        createdAt: 1655450453892,
        lastModifiedAt: 1655690308350
      },
      {
        infrastructure: {
          accountId: 'dummy',
          identifier: 'Infra_4',
          orgIdentifier: 'dummy',
          projectIdentifier: 'dummy',
          environmentRef: 'Env_1',
          name: 'Infra 4',
          description: '',
          tags: {},
          deploymentType: 'Kubernetes',
          type: 'KubernetesDirect',
          yaml: 'infrastructureDefinition:\n  name: "Infra 4"\n  identifier: "Infra_4"\n  orgIdentifier: "dummy"\n  projectIdentifier: "dummy"\n  environmentRef: "Env_1"\n  description: ""\n  tags: {}\n  allowSimultaneousDeployments: false\n  deploymentType: "Kubernetes"\n  type: "KubernetesDirect"\n  spec:\n    connectorRef: "Test"\n    namespace: "test"\n    releaseName: "release-<+INFRA_KEY>"\n'
        },
        createdAt: 1655445452968,
        lastModifiedAt: 1655445452968
      },
      {
        infrastructure: {
          accountId: 'dummy',
          identifier: 'Infra_3',
          orgIdentifier: 'dummy',
          projectIdentifier: 'dummy',
          environmentRef: 'Env_1',
          name: 'Infra 3',
          description: '',
          tags: {},
          deploymentType: 'Kubernetes',
          type: 'KubernetesDirect',
          yaml: 'infrastructureDefinition:\n  name: "Infra 3"\n  identifier: "Infra_3"\n  orgIdentifier: "dummy"\n  projectIdentifier: "dummy"\n  environmentRef: "Env_1"\n  description: ""\n  tags: {}\n  allowSimultaneousDeployments: true\n  deploymentType: "Kubernetes"\n  type: "KubernetesDirect"\n  spec:\n    connectorRef: "Test"\n    namespace: "test"\n    releaseName: "release-<+INFRA_KEY>"\n'
        },
        createdAt: 1655445340885,
        lastModifiedAt: 1655445340885
      },
      {
        infrastructure: {
          accountId: 'dummy',
          identifier: 'Infra_2',
          orgIdentifier: 'dummy',
          projectIdentifier: 'dummy',
          environmentRef: 'Env_1',
          name: 'Infra 2',
          description: '',
          tags: {},
          deploymentType: 'Kubernetes',
          type: 'KubernetesDirect',
          yaml: 'infrastructureDefinition:\n  name: "Infra 2"\n  identifier: "Infra_2"\n  orgIdentifier: "dummy"\n  projectIdentifier: "dummy"\n  environmentRef: "Env_1"\n  description: ""\n  tags: {}\n  allowSimultaneousDeployments: true\n  deploymentType: "Kubernetes"\n  type: "KubernetesDirect"\n  spec:\n    connectorRef: "Test"\n    namespace: "test"\n    releaseName: "release-<+INFRA_KEY>"\n'
        },
        createdAt: 1655445243429,
        lastModifiedAt: 1655648248775
      },
      {
        infrastructure: {
          accountId: 'dummy',
          identifier: 'Infra_1',
          orgIdentifier: 'dummy',
          projectIdentifier: 'dummy',
          environmentRef: 'Env_1',
          name: 'Infra 1',
          description: '',
          tags: {},
          deploymentType: 'Kubernetes',
          type: 'KubernetesDirect',
          storeType: 'REMOTE',

          entityGitDetails: {
            repoName: 'testRepo',
            filePath: '.harness/infra6.yaml'
          },
          connectorRef: 'c1',
          yaml: 'infrastructureDefinition:\n  name: "Infra 1"\n  identifier: "Infra_1"\n  orgIdentifier: "dummy"\n  projectIdentifier: "dummy"\n  environmentRef: "Env_1"\n  description: ""\n  tags: {}\n  allowSimultaneousDeployments: true\n  deploymentType: "Kubernetes"\n  type: "KubernetesDirect"\n  spec:\n    connectorRef: "Test"\n    namespace: "test"\n    releaseName: "release-<+INFRA_KEY>"\n'
        },
        createdAt: 1655281836514,
        lastModifiedAt: 1655295908746
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: '46fe5e7d-9a0f-4f43-99f6-1a72219ad333'
}
