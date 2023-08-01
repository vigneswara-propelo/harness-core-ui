/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const artifacts = {
  sidecars: [
    {
      sidecar: {
        identifier: 'Sidecar',
        type: 'Nexus2Registry',
        spec: {
          connectorRef: '<+input>',
          repository: '<+input>',
          tag: '<+input>',
          spec: {
            artifactPath: '<+input>',
            groupId: '<+input>',
            artifactId: '<+input>',
            extension: '<+input>',
            classifier: '<+input>',
            packageName: '<+input>'
          }
        }
      }
    }
  ],
  primary: {
    spec: {
      connectorRef: '<+input>',
      repository: '<+input>',
      tag: '<+input>',
      spec: {
        artifactPath: '<+input>',
        groupId: '<+input>',
        artifactId: '<+input>',
        extension: '<+input>',
        classifier: '<+input>',
        packageName: '<+input>'
      }
    },
    type: 'Nexus2Registry'
  }
}

export const template = {
  artifacts: {
    sidecars: [
      {
        sidecar: {
          identifier: 'Sidecar',
          type: 'Nexus2Registry',
          spec: {
            connectorRef: '<+input>',
            repository: '<+input>',
            tagRegex: '<+input>',
            spec: {
              artifactPath: '<+input>',
              groupId: '<+input>',
              artifactId: '<+input>',
              extension: '<+input>',
              classifier: '<+input>',
              packageName: '<+input>'
            }
          }
        }
      }
    ],
    primary: {
      spec: {
        connectorRef: '<+input>',
        repository: '<+input>',
        tag: '<+input>',
        spec: {
          artifactPath: '<+input>',
          groupId: '<+input>',
          artifactId: '<+input>',
          extension: '<+input>',
          classifier: '<+input>',
          packageName: '<+input>'
        }
      },
      type: 'Nexus2Registry'
    }
  }
}
