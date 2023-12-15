/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { DeployEnvironmentEntityConfig, DeployEnvironmentEntityFormState } from '../../../types'
import { processSingleEnvironmentInitialValues } from '../processSingleEnvironmentInitialValues'
import { processSingleEnvironmentFormValues } from '../processSingleEnvironmentFormValues'

// eslint-disable-next-line jest/no-disabled-tests
describe('process single environment initial values', () => {
  test('env & infra fixed values with runtime inputs', () => {
    const output = processSingleEnvironmentInitialValues(
      {
        environmentRef: 'Env_1',
        environmentInputs: {
          variables: [
            {
              name: 'var1',
              type: 'String',
              value: '<+input>'
            }
          ]
        },
        infrastructureDefinitions: [
          {
            identifier: 'Infra_1',
            inputs: {
              identifier: 'Infra_1',
              type: 'Kubernetes',
              spec: {
                connectorRef: '<+input>'
              }
            }
          }
        ]
      },
      { gitOpsEnabled: false }
    )
    expect(output).toEqual({
      category: 'single',
      environment: 'Env_1',
      environmentInputs: {
        Env_1: {
          variables: [
            {
              name: 'var1',
              type: 'String',
              value: '<+input>'
            }
          ]
        }
      },
      serviceOverrideInputs: {},
      infrastructure: 'Infra_1',
      infrastructureInputs: {
        Env_1: {
          Infra_1: {
            identifier: 'Infra_1',
            type: 'Kubernetes',
            spec: {
              connectorRef: '<+input>'
            }
          }
        }
      }
    } as DeployEnvironmentEntityFormState)
  })

  test('env fixed & infra runtime', () => {
    const output = processSingleEnvironmentInitialValues(
      {
        environmentRef: 'Env_1',
        infrastructureDefinitions: '<+input>' as any
      },
      { gitOpsEnabled: false }
    )
    expect(output).toEqual({
      category: 'single',
      environment: 'Env_1',
      environmentInputs: {
        Env_1: undefined
      },
      serviceOverrideInputs: {},
      infrastructure: '<+input>',
      infrastructureInputs: {}
    } as DeployEnvironmentEntityFormState)
  })

  test('env & infra runtime', () => {
    const output = processSingleEnvironmentInitialValues(
      {
        environmentRef: '<+input>',
        infrastructureDefinitions: '<+input>' as any
      },
      { gitOpsEnabled: false }
    )
    expect(output).toEqual({
      category: 'single',
      environment: '<+input>'
    } as DeployEnvironmentEntityFormState)
  })

  test('env runtime & infra expression for custom stage', () => {
    const output = processSingleEnvironmentInitialValues(
      {
        environmentRef: '<+input>',
        infrastructureDefinitions: [
          {
            identifier: '<+expressionpart3.expressionpart4>',
            inputs: {
              identifier: '<+expressionpart3.expressionpart4>',
              spec: {
                connectorRef: '<+input>'
              },
              type: 'Kubernetes'
            }
          }
        ]
      },
      { gitOpsEnabled: false, isCustomStage: true }
    )
    expect(output).toEqual({
      category: 'single',
      environment: '<+input>',
      infrastructure: '<+expressionpart3.expressionpart4>',
      infrastructureInputs: {
        environment: {
          infrastructure: {
            expression: {
              identifier: '<+expressionpart3.expressionpart4>',
              spec: {
                connectorRef: '<+input>'
              },
              type: 'Kubernetes'
            }
          }
        }
      }
    } as DeployEnvironmentEntityFormState)
  })

  test('env & cluster fixed values', () => {
    const output = processSingleEnvironmentInitialValues(
      {
        environmentRef: 'Env_1',
        gitOpsClusters: [
          {
            identifier: 'Cluster_1'
          }
        ]
      },
      { gitOpsEnabled: true }
    )
    expect(output).toEqual({
      category: 'single',
      environment: 'Env_1',
      environmentInputs: {},
      serviceOverrideInputs: {},
      cluster: 'Cluster_1'
    } as DeployEnvironmentEntityFormState)
  })

  test('env fixed & cluster runtime', () => {
    const output = processSingleEnvironmentInitialValues(
      {
        environmentRef: 'Env_1',
        gitOpsClusters: '<+input>' as any
      },
      { gitOpsEnabled: true }
    )
    expect(output).toEqual({
      category: 'single',
      environment: 'Env_1',
      environmentInputs: {
        Env_1: undefined
      },
      serviceOverrideInputs: {},
      cluster: '<+input>'
    } as DeployEnvironmentEntityFormState)
  })

  test('env & cluster runtime', () => {
    const output = processSingleEnvironmentInitialValues(
      {
        environmentRef: '<+input>',
        gitOpsClusters: '<+input>' as any
      },
      { gitOpsEnabled: true }
    )
    expect(output).toEqual({
      category: 'single',
      environment: '<+input>'
    } as DeployEnvironmentEntityFormState)
  })

  test('no env', () => {
    const output = processSingleEnvironmentInitialValues('' as any, { gitOpsEnabled: false })
    expect(output).toEqual({
      category: 'single'
    } as DeployEnvironmentEntityFormState)
  })

  test('set environment, service overrides and infra inputs when environment is expression', () => {
    const output = processSingleEnvironmentInitialValues(
      {
        environmentRef: '<+expressionpart1.expressionpart2>',
        environmentInputs: {
          variables: [
            {
              name: 'var1',
              type: 'String',
              value: 'test1'
            }
          ]
        },
        infrastructureDefinitions: [
          {
            identifier: '<+expressionpart3.expressionpart4>',
            inputs: {
              identifier: '<+expressionpart3.expressionpart4>',
              spec: {
                connectorRef: '<+input>'
              },
              type: 'Kubernetes'
            }
          }
        ],
        serviceOverrideInputs: {
          variables: [
            {
              name: 'var1',
              type: 'String',
              value: 'test1'
            }
          ]
        },
        deployToAll: false
      },
      { gitOpsEnabled: false }
    )

    expect(output).toEqual({
      category: 'single',
      environment: '<+expressionpart1.expressionpart2>',
      // Validation when all the below remains as is, will the form get updated correctly
      environmentInputs: {
        environment: {
          expression: {
            variables: [
              {
                name: 'var1',
                type: 'String',
                value: 'test1'
              }
            ]
          }
        }
      },
      serviceOverrideInputs: {
        environment: {
          expression: {
            variables: [
              {
                name: 'var1',
                type: 'String',
                value: 'test1'
              }
            ]
          }
        }
      },
      infrastructure: '<+expressionpart3.expressionpart4>',
      infrastructureInputs: {
        environment: {
          infrastructure: {
            expression: {
              identifier: '<+expressionpart3.expressionpart4>',
              type: 'Kubernetes',
              spec: {
                connectorRef: '<+input>'
              }
            }
          }
        }
      }
    })
  })
})

describe('process single environment form values', () => {
  test('single env only selected', () => {
    const output = processSingleEnvironmentFormValues(
      {
        category: 'single',
        environment: 'Env_1',
        environmentInputs: {
          Env_1: {
            variables: [
              {
                name: 'var1',
                type: 'String',
                value: 'test1'
              }
            ]
          }
        }
      },
      { gitOpsEnabled: false }
    )

    expect(output).toEqual({
      environment: {
        environmentRef: 'Env_1',
        environmentInputs: {
          variables: [
            {
              name: 'var1',
              type: 'String',
              value: 'test1'
            }
          ]
        },
        deployToAll: false
      }
    } as DeployEnvironmentEntityConfig)
  })

  test('single env single infra selected', () => {
    const output = processSingleEnvironmentFormValues(
      {
        category: 'single',
        environment: 'Env_1',
        environmentInputs: {
          Env_1: {
            variables: [
              {
                name: 'var1',
                type: 'String',
                value: 'test1'
              }
            ]
          }
        },
        infrastructure: 'Infra_1',
        infrastructureInputs: {
          Env_1: {
            Infra_1: {
              identifier: 'Infra_1',
              type: 'Kubernetes',
              spec: {
                connectorRef: '<+input>'
              }
            }
          }
        }
      },
      { gitOpsEnabled: false }
    )

    expect(output).toEqual({
      environment: {
        environmentRef: 'Env_1',
        environmentInputs: {
          variables: [
            {
              name: 'var1',
              type: 'String',
              value: 'test1'
            }
          ]
        },
        deployToAll: false,
        infrastructureDefinitions: [
          {
            identifier: 'Infra_1',
            inputs: {
              identifier: 'Infra_1',
              type: 'Kubernetes',
              spec: {
                connectorRef: '<+input>'
              }
            }
          }
        ]
      }
    } as DeployEnvironmentEntityConfig)
  })

  test('single env selected, infra runtime', () => {
    const output = processSingleEnvironmentFormValues(
      {
        category: 'single',
        environment: 'Env_1',
        environmentInputs: {
          Env_1: undefined
        },
        infrastructure: '<+input>',
        infrastructureInputs: {
          Env_1: {
            // Validation when it remains as is, will the form get updated correctly
            Infra_1: {
              identifier: 'Infra_1',
              type: 'Kubernetes',
              spec: {
                connectorRef: '<+input>'
              }
            }
          }
        }
      },
      { gitOpsEnabled: false }
    )

    expect(output).toEqual({
      environment: {
        environmentRef: 'Env_1',
        deployToAll: false,
        infrastructureDefinitions: '<+input>' as any
      }
    } as DeployEnvironmentEntityConfig)
  })

  test('single env single cluster selected', () => {
    const output = processSingleEnvironmentFormValues(
      {
        category: 'single',
        environment: 'Env_1',
        environmentInputs: {
          Env_1: {
            variables: [
              {
                name: 'var1',
                type: 'String',
                value: 'test1'
              }
            ]
          }
        },
        cluster: 'Cluster_1'
      },
      { gitOpsEnabled: true }
    )

    expect(output).toEqual({
      environment: {
        environmentRef: 'Env_1',
        environmentInputs: {
          variables: [
            {
              name: 'var1',
              type: 'String',
              value: 'test1'
            }
          ]
        },
        deployToAll: false,
        gitOpsClusters: [
          {
            identifier: 'Cluster_1'
          }
        ]
      }
    } as DeployEnvironmentEntityConfig)
  })

  test('single env selected, cluster runtime', () => {
    const output = processSingleEnvironmentFormValues(
      {
        category: 'single',
        environment: 'Env_1',
        environmentInputs: {
          Env_1: undefined
        },
        cluster: '<+input>'
      },
      { gitOpsEnabled: true }
    )

    expect(output).toEqual({
      environment: {
        environmentRef: 'Env_1',
        deployToAll: false,
        gitOpsClusters: '<+input>' as any
      }
    } as DeployEnvironmentEntityConfig)
  })

  test('single env runtime, GitOps disabled', () => {
    const output = processSingleEnvironmentFormValues(
      {
        category: 'single',
        environment: '<+input>',
        // Validation when all the below remains as is, will the form get updated correctly
        environmentInputs: {
          Env_1: {
            variables: [
              {
                name: 'var1',
                type: 'String',
                value: 'test1'
              }
            ]
          }
        },
        infrastructure: 'Infra_1',
        infrastructureInputs: {
          Env_1: {
            Infra_1: {
              identifier: 'Infra_1',
              type: 'Kubernetes',
              spec: {
                connectorRef: '<+input>'
              }
            }
          }
        }
      },
      { gitOpsEnabled: false }
    )

    expect(output).toEqual({
      environment: {
        environmentRef: '<+input>',
        environmentInputs: '<+input>' as any,
        serviceOverrideInputs: '<+input>' as any,
        deployToAll: false,
        infrastructureDefinitions: '<+input>' as any
      }
    } as DeployEnvironmentEntityConfig)
  })

  test('single env runtime, GitOps enabled', () => {
    const output = processSingleEnvironmentFormValues(
      {
        category: 'single',
        environment: '<+input>',
        // Validation when all the below remains as is, will the form get updated correctly
        environmentInputs: {
          Env_1: {
            variables: [
              {
                name: 'var1',
                type: 'String',
                value: 'test1'
              }
            ]
          }
        },
        cluster: 'Cluster_1'
      },
      { gitOpsEnabled: true }
    )

    expect(output).toEqual({
      environment: {
        environmentRef: '<+input>',
        environmentInputs: '<+input>' as any,
        serviceOverrideInputs: '<+input>' as any,
        deployToAll: false,
        gitOpsClusters: '<+input>' as any
      }
    } as DeployEnvironmentEntityConfig)
  })

  test('no environment in form state', () => {
    const output = processSingleEnvironmentFormValues({}, { gitOpsEnabled: false })

    expect(output).toEqual({
      environment: {
        environmentRef: ''
      }
    })
  })

  test('environment, service overrides and infra inputs when environment is expression', () => {
    const output = processSingleEnvironmentFormValues(
      {
        category: 'single',
        environment: '<+expressionpart1.expressionpart2>',
        // Validation when all the below remains as is, will the form get updated correctly
        environmentInputs: {
          environment: {
            expression: {
              variables: [
                {
                  name: 'var1',
                  type: 'String',
                  value: 'test1'
                }
              ]
            }
          }
        },
        serviceOverrideInputs: {
          environment: {
            expression: {
              variables: [
                {
                  name: 'var1',
                  type: 'String',
                  value: 'test1'
                }
              ]
            }
          }
        },
        infrastructure: '<+expressionpart3.expressionpart4>',
        infrastructureInputs: {
          environment: {
            infrastructure: {
              expression: {
                identifier: '<+expressionpart3.expressionpart4>',
                type: 'Kubernetes',
                spec: {
                  connectorRef: '<+input>'
                }
              }
            }
          }
        }
      },
      { gitOpsEnabled: false }
    )

    expect(output).toEqual({
      environment: {
        environmentRef: '<+expressionpart1.expressionpart2>',
        environmentInputs: {
          variables: [
            {
              name: 'var1',
              type: 'String',
              value: 'test1'
            }
          ]
        },
        infrastructureDefinitions: [
          {
            identifier: '<+expressionpart3.expressionpart4>',
            inputs: {
              identifier: '<+expressionpart3.expressionpart4>',
              spec: {
                connectorRef: '<+input>'
              },
              type: 'Kubernetes'
            }
          }
        ],
        serviceOverrideInputs: {
          variables: [
            {
              name: 'var1',
              type: 'String',
              value: 'test1'
            }
          ]
        },
        deployToAll: false
      }
    } as DeployEnvironmentEntityConfig)
  })

  test('environment runtime for custom stage', () => {
    const output = processSingleEnvironmentFormValues(
      {
        category: 'single',
        environment: '<+input>',
        // Validation when all the below remains as is, will the form get updated correctly
        environmentInputs: '<+input>' as any,
        infrastructure: '<+expressionpart3.expressionpart4>',
        infrastructureInputs: {
          environment: {
            infrastructure: {
              expression: {
                identifier: '<+expressionpart3.expressionpart4>',
                type: 'Kubernetes',
                spec: {
                  connectorRef: '<+input>'
                }
              }
            }
          }
        }
      },
      { gitOpsEnabled: false, isCustomStage: true }
    )

    expect(output).toEqual({
      environment: {
        environmentRef: '<+input>',
        environmentInputs: '<+input>' as any,
        infrastructureDefinitions: [
          {
            identifier: '<+expressionpart3.expressionpart4>',
            inputs: {
              identifier: '<+expressionpart3.expressionpart4>',
              spec: {
                connectorRef: '<+input>'
              },
              type: 'Kubernetes'
            }
          }
        ],
        deployToAll: false
      }
    } as DeployEnvironmentEntityConfig)
  })

  test('environment runtime and infra fixed for custom stage - infra should not be retained', () => {
    const output = processSingleEnvironmentFormValues(
      {
        category: 'single',
        environment: '<+input>',
        // Validation when all the below remains as is, will the form get updated correctly
        environmentInputs: '<+input>' as any,
        infrastructure: 'fixedInfra',
        infrastructureInputs: {
          environment: {
            infrastructure: {
              expression: {
                identifier: 'fixedInfra',
                type: 'Kubernetes',
                spec: {
                  connectorRef: '<+input>'
                }
              }
            }
          }
        }
      },
      { gitOpsEnabled: false, isCustomStage: true }
    )

    expect(output).toEqual({
      environment: {
        environmentRef: '<+input>',
        environmentInputs: '<+input>' as any,
        deployToAll: false
      }
    } as DeployEnvironmentEntityConfig)
  })
})
