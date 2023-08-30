/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const artifacts = {
  sidecars: [
    {
      sidecar: {
        spec: {
          feed: 'feedtest',
          connectorRef: '<+input>',
          package: 'testpackage',
          project: 'project',
          version: '<+input>'
        },
        identifier: 'Sidecar test',
        type: 'AzureArtifacts'
      }
    },
    {
      sidecar: {
        spec: {
          feed: 'feedtest',
          package: 'testpackage',
          project: 'project',
          connectorRef: '<+input>',
          version: '<+input>'
        },
        identifier: 'Azure sidecar',
        type: 'AzureArtifacts'
      }
    }
  ],
  primary: {
    type: 'AzureArtifacts',
    spec: {
      feed: 'feedtest',
      package: 'testpackage',
      project: 'project',
      version: '<+input>',
      connectorRef: '<+input>'
    }
  }
}

export const template = {
  artifacts: {
    sidecars: [
      {
        sidecar: {
          identifier: 'sidecar2',
          type: 'AzureArtifacts',
          spec: {
            connectorRef: '<+input>',
            feed: '<+input>',
            package: '<+input>',
            project: '<+input>',
            version: '<+input>'
          }
        }
      },
      {
        sidecar: {
          identifier: 'Sidecar test',
          type: 'AzureArtifacts',
          spec: {
            version: '<+input>'
          }
        }
      }
    ],
    primary: {
      type: 'AzureArtifacts',
      spec: {
        feed: '<+input>',
        package: '<+input>',
        project: '<+input>',
        version: '<+input>',
        connectorRef: '<+input>'
      }
    }
  }
}

export const projectsMockResponse = {
  status: 'SUCCESS',
  data: [
    {
      id: 'd2b33e45-ec08-4eb7-a351-a61d989ad61d',
      name: 'sample-k8s-manifests'
    },
    {
      id: '483263b0-ac55-4835-9af2-8e49a1ae843a',
      name: 'PipelinesNgAutomation'
    },
    {
      id: 'e3bbfdf8-b1df-4ff0-9755-c67b163328b3',
      name: 'automation-cdc'
    },
    {
      id: '2b36d02e-066b-4611-b7a8-28b00c9c8971',
      name: 'harness-azure'
    },
    {
      id: '8919b0cd-88f9-4fd7-a8a3-e838ad9cd273',
      name: 'IDP'
    }
  ],
  metaData: null,
  correlationId: '1e6e3abb-7b41-4748-aab3-220adef5d1d7'
}

export const feedsMockResponse = {
  status: 'SUCCESS',
  data: [
    {
      id: '6434318d-7904-4b76-a503-332951acb8a2',
      name: 'feedproject',
      fullyQualifiedName: 'feedproject',
      project: {
        id: 'e3bbfdf8-b1df-4ff0-9755-c67b163328b3',
        name: 'automation-cdc'
      }
    },
    {
      id: '886ea751-cb1e-4044-a7a2-452280ce061e',
      name: 'NewUniversalPkg',
      fullyQualifiedName: 'NewUniversalPkg',
      project: {
        id: 'e3bbfdf8-b1df-4ff0-9755-c67b163328b3',
        name: 'automation-cdc'
      }
    },
    {
      id: 'c293854b-49ce-4fb9-b10c-cbecfbe04f7d',
      name: 'Nuget-cdc',
      fullyQualifiedName: 'Nuget-cdc',
      project: {
        id: 'e3bbfdf8-b1df-4ff0-9755-c67b163328b3',
        name: 'automation-cdc'
      }
    },
    {
      id: 'fc576801-6a3d-4c25-8106-53242380c741',
      name: 'univ1',
      fullyQualifiedName: 'univ1',
      project: {
        id: 'e3bbfdf8-b1df-4ff0-9755-c67b163328b3',
        name: 'automation-cdc'
      }
    }
  ],
  metaData: null,
  correlationId: '77f3de07-3d2a-4171-bef1-03227e1d3835'
}

export const packagesMockResponse = {
  status: 'SUCCESS',
  data: [
    {
      id: 'c7b1275a-af13-4ebe-82e3-669c5922689f',
      name: 'my-first-package',
      protocolType: 'UPack'
    }
  ],
  metaData: null,
  correlationId: '26f31bd6-9e45-4d3a-aeea-f6eba499abe9'
}
