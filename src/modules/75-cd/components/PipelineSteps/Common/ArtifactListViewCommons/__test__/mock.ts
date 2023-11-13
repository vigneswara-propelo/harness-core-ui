/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const stageDataMock = {
  stage: {
    name: 'Stage Name',
    identifier: 'stage_id',
    spec: {
      serviceConfig: {
        serviceDefinition: {
          type: 'Kubernetes',
          spec: {
            artifacts: {
              primary: {
                sources: [
                  {
                    spec: {
                      connectorRef: 'account.harnessImage',
                      imagePath: '<+input>',
                      tag: '<+input>',
                      digest: ''
                    },
                    identifier: 'Harnessdoc',
                    type: 'DockerRegistry'
                  },
                  {
                    spec: {
                      connectorRef: 'account.harnessImage',
                      imagePath: '<+input>',
                      tag: '<+input>',
                      digest: ''
                    },
                    identifier: 'sidecartest',
                    type: 'DockerRegistry'
                  },
                  {
                    name: 'dcrTemplateartjiounoinoin',
                    identifier: 'dcrTemplateartjiounoinoin',
                    template: {
                      templateRef: 'account.gcr',
                      versionLabel: '1',
                      templateInputs: {
                        type: 'Gcr',
                        spec: {
                          imagePath: '<+input>',
                          tag: '<+input>',
                          digest: '<+input>',
                          registryHostname: '<+input>'
                        }
                      }
                    }
                  }
                ],
                primaryArtifactRef: 'Harnessdoc'
              },
              sidecars: [
                {
                  sidecar: {
                    spec: {
                      connectorRef: 'account.harnessImage',
                      imagePath: '<+input>',
                      tag: '<+input>',
                      digest: ''
                    },
                    identifier: 'sidecarartifact',
                    type: 'DockerRegistry'
                  }
                }
              ]
            }
          }
        },
        serviceRef: 'Artifacttest'
      }
    }
  }
}
