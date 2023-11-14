/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const mockPipelineData = {
  name: 'test infra propagation',
  identifier: 'test_infra_propagation',
  projectIdentifier: 'kanikaTest',
  orgIdentifier: 'default',
  tags: {},
  stages: [
    {
      stage: {
        name: 's1',
        identifier: 's1',
        description: '',
        type: 'Deployment',
        spec: {
          deploymentType: 'Kubernetes',
          service: {
            serviceRef: '<+input>',
            serviceInputs: '<+input>'
          },
          environment: {
            environmentRef: 'DEV',
            deployToAll: false,
            infrastructureDefinitions: [
              {
                identifier: 'simple_infra',
                inputs: {
                  identifier: 'simple_infra',
                  type: 'KubernetesDirect',
                  spec: {
                    connectorRef: '<+input>',
                    namespace: '<+input>'
                  }
                }
              }
            ]
          },
          execution: {
            steps: [
              {
                step: {
                  name: 'Rollout Deployment',
                  identifier: 'rolloutDeployment',
                  type: 'K8sRollingDeploy',
                  timeout: '10m',
                  spec: {
                    skipDryRun: false,
                    pruningEnabled: false
                  }
                }
              }
            ],
            rollbackSteps: [
              {
                step: {
                  name: 'Rollback Rollout Deployment',
                  identifier: 'rollbackRolloutDeployment',
                  type: 'K8sRollingRollback',
                  timeout: '10m',
                  spec: {
                    pruningEnabled: false
                  }
                }
              }
            ]
          }
        },
        tags: {},
        failureStrategies: [
          {
            onFailure: {
              errors: ['AllErrors'],
              action: {
                type: 'StageRollback'
              }
            }
          }
        ]
      }
    },
    {
      stage: {
        name: 's2',
        identifier: 's2',
        description: '',
        type: 'Deployment',
        spec: {
          deploymentType: 'Kubernetes',
          service: {
            serviceRef: '<+input>',
            serviceInputs: '<+input>'
          },
          environment: {
            environmentRef: '<+input>',
            deployToAll: false,
            environmentInputs: '<+input>',
            serviceOverrideInputs: '<+input>',
            infrastructureDefinitions: '<+input>'
          },
          execution: {
            steps: [
              {
                step: {
                  name: 'Rollout Deployment',
                  identifier: 'rolloutDeployment',
                  type: 'K8sRollingDeploy',
                  timeout: '10m',
                  spec: {
                    skipDryRun: false,
                    pruningEnabled: false
                  }
                }
              }
            ],
            rollbackSteps: [
              {
                step: {
                  name: 'Rollback Rollout Deployment',
                  identifier: 'rollbackRolloutDeployment',
                  type: 'K8sRollingRollback',
                  timeout: '10m',
                  spec: {
                    pruningEnabled: false
                  }
                }
              }
            ]
          }
        },
        tags: {},
        failureStrategies: [
          {
            onFailure: {
              errors: ['AllErrors'],
              action: {
                type: 'StageRollback'
              }
            }
          }
        ]
      }
    }
  ]
}
