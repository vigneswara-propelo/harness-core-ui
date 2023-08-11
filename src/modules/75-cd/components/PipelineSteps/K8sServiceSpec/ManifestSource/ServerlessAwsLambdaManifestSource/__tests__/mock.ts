/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { PrimaryArtifact } from 'services/cd-ng'

export const template: DeploymentStageElementConfig = {
  identifier: 'Stage_1',
  name: 'Stage 1',
  spec: {
    serviceConfig: {
      serviceDefinition: {
        type: 'ServerlessAwsLambda',
        spec: {
          manifests: [
            {
              manifest: {
                identifier: 'test_manifest',
                type: 'ServerlessAwsLambda',
                spec: {
                  store: {
                    type: 'Github',
                    spec: {
                      connectorRef: '<+input>',
                      paths: '<+input>',
                      repoName: '<+input>',
                      branch: '<+input>'
                    }
                  },
                  configOverridePath: '<+input>'
                }
              }
            }
          ],
          artifacts: {
            primary: {
              type: 'ArtifactoryRegistry' as PrimaryArtifact['type'],
              spec: {
                connectorRef: '<+input>',
                artifactDirectory: '<+input>',
                artifactPath: '<+input>',
                repository: '<+input>'
              }
            }
          }
        }
      }
    },
    execution: {
      steps: [
        {
          step: {
            identifier: 'Step_1',
            name: 'Step 1',
            type: StepType.ServerlessAwsLambdaDeployV2
          }
        }
      ]
    }
  }
}

export const manifests = [
  {
    manifest: {
      identifier: 'test_manifest',
      type: 'ServerlessAwsLambda',
      spec: {
        store: {
          type: 'Github',
          spec: {
            connectorRef: '<+input>',
            gitFetchType: 'Branch',
            paths: '<+input>',
            repoName: '<+input>',
            branch: '<+input>'
          }
        },
        configOverridePath: '<+input>'
      }
    }
  }
]

export const initialValues: DeploymentStageElementConfig = {
  identifier: 'Stage_1',
  name: 'Stage 1',
  spec: {
    serviceConfig: {
      serviceDefinition: {
        type: 'ServerlessAwsLambda',
        spec: {
          manifests: [
            {
              manifest: {
                identifier: 'test_manifest',
                type: 'ServerlessAwsLambda',
                spec: {
                  store: {
                    type: 'Github',
                    spec: {
                      connectorRef: '',
                      paths: '',
                      repoName: '',
                      branch: ''
                    }
                  },
                  configOverridePath: ''
                }
              }
            }
          ],
          artifacts: {
            primary: {
              type: 'ArtifactoryRegistry' as PrimaryArtifact['type'],
              spec: {
                connectorRef: '<+input>',
                artifactDirectory: '<+input>',
                artifactPath: '<+input>',
                repository: '<+input>'
              }
            }
          }
        }
      }
    },
    execution: {
      steps: [
        {
          step: {
            identifier: 'Step_1',
            name: 'Step 1',
            type: StepType.ServerlessAwsLambdaDeployV2
          }
        }
      ]
    }
  }
}

export const manifest = {
  identifier: 'test_manifest',
  type: 'ServerlessAwsLambda',
  spec: {
    store: {
      type: 'Github',
      spec: {
        connectorRef: '<+input>',
        gitFetchType: 'Branch',
        paths: '<+input>',
        repoName: '<+input>',
        branch: '<+input>'
      }
    },
    configOverridePath: '<+input>'
  }
}
