/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const provisionersMock = [
  {
    parallel: [
      {
        step: {
          type: 'TerraformPlan',
          name: 'name1',
          identifier: 'name1',
          timeout: '10m',
          spec: {
            provisionerIdentifier: 'asd',
            configuration: {
              command: 'Apply',
              configFiles: {
                store: {
                  spec: {
                    connectorRef: '<+input>',
                    artifactPaths: ['asd'],
                    repositoryName: 'asd'
                  },
                  type: 'Artifactory'
                }
              },
              secretManagerRef: 'harnessSecretManager'
            }
          }
        }
      },
      {
        step: {
          type: 'TerraformApply',
          name: 'TerraformApply_2',
          identifier: 'TerraformApply_2',
          spec: {
            provisionerIdentifier: 'a1',
            configuration: {
              type: 'Inline',
              spec: {
                configFiles: {
                  store: {
                    spec: {
                      connectorRef: '<+input>',
                      artifactPaths: ['<+input>'],
                      repositoryName: '<+input>'
                    },
                    type: 'Artifactory'
                  }
                }
              }
            }
          },
          timeout: '10m'
        }
      }
    ]
  },
  {
    step: {
      type: 'HarnessApproval',
      name: 'asdas',
      identifier: 'asdas',
      timeout: '1d',
      spec: {
        approvalMessage: 'asda',
        includePipelineExecutionHistory: true,
        approvers: {
          userGroups: '<+input>',
          minimumCount: 1,
          disallowPipelineExecutor: true
        },
        approverInputs: []
      }
    }
  },
  {
    step: {
      type: 'TerraformApply',
      name: 'dasda',
      identifier: 'dasda',
      timeout: '10m',
      spec: {
        provisionerIdentifier: 'asdas',
        configuration: {
          type: 'InheritFromPlan'
        }
      }
    }
  },
  {
    stepGroup: {
      name: 'st1',
      identifier: 'st1',
      steps: [
        {
          step: {
            type: 'TerraformPlan',
            name: 'TerraformPlan_2',
            identifier: 'TerraformPlan_2',
            spec: {
              provisionerIdentifier: '<+input>',
              configuration: {
                command: 'Apply',
                configFiles: {
                  store: {
                    spec: {
                      connectorRef: '<+input>',
                      artifactPaths: ['<+input>'],
                      repositoryName: '<+input>'
                    },
                    type: 'Artifactory'
                  }
                },
                secretManagerRef: '<+input>'
              }
            },
            timeout: '10m'
          }
        }
      ]
    }
  }
]

export const stepGroupTemplateProvisioner = {
  stepGroup: {
    name: 'StepGroupTest',
    identifier: 'StepGroupTest',
    template: {
      templateRef: 'testRef',
      versionLabel: 'v1',
      templateInputs: {
        steps: [
          {
            step: {
              identifier: 'ShellScriptProvision_4',
              type: 'ShellScriptProvision',
              spec: {
                source: {
                  type: 'Inline',
                  spec: {
                    script: '<+input>'
                  }
                }
              }
            }
          },
          {
            parallel: [
              {
                step: {
                  identifier: 'shellHarnessEcsInfrastructureParameters',
                  type: 'ShellScriptProvision',
                  timeout: '<+input>'
                }
              },
              {
                step: {
                  identifier: 'ShellScriptProvision_2',
                  type: 'ShellScriptProvision',
                  spec: {
                    source: {
                      type: 'Inline',
                      spec: {
                        script: '<+input>'
                      }
                    }
                  }
                }
              }
            ]
          }
        ]
      }
    }
  }
}
