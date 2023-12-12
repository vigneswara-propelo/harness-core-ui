/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import type { DeployEnvironmentEntityConfig, DeployEnvironmentEntityFormState } from '../../types'
import { processInitialValues, processFormValues } from '../utils'

describe('process initial values', () => {
  test('clean slate', () => {
    const output = processInitialValues({}, { gitOpsEnabled: false })

    expect(output).toEqual({
      category: 'single'
    })
  })

  test('environment ref selected', () => {
    const output = processInitialValues(
      {
        environment: {
          environmentRef: 'Env_1',
          deployToAll: false,
          infrastructureDefinitions: [
            {
              identifier: 'Infra_1'
            }
          ]
        }
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
      infrastructure: 'Infra_1',
      infrastructureInputs: {
        Env_1: {
          Infra_1: undefined
        }
      }
    } as DeployEnvironmentEntityFormState)
  })

  test('environments selected', () => {
    const output = processInitialValues(
      {
        environments: {
          metadata: {
            parallel: false
          },
          values: [
            {
              environmentRef: 'Env_1',
              deployToAll: true,
              infrastructureDefinitions: RUNTIME_INPUT_VALUE as any
            }
          ]
        }
      },
      { gitOpsEnabled: false }
    )

    expect(output).toEqual({
      category: 'multi',
      environments: [{ label: 'Env_1', value: 'Env_1' }],
      environmentInputs: {
        Env_1: undefined
      },
      parallel: false
    } as DeployEnvironmentEntityFormState)
  })

  test('environment group selected ', () => {
    const output = processInitialValues(
      {
        environmentGroup: {
          envGroupRef: 'Env_Group_1',
          deployToAll: true,
          environments: RUNTIME_INPUT_VALUE as any,
          metadata: {
            parallel: false
          }
        }
      },
      { gitOpsEnabled: false }
    )

    expect(output).toEqual({
      category: 'group',
      environmentGroup: 'Env_Group_1',
      environmentInputs: {},
      infrastructures: {},
      parallel: false,
      infrastructureInputs: {}
    } as DeployEnvironmentEntityFormState)
  })

  test('environment ref selected with clusters', () => {
    const output = processInitialValues(
      {
        environment: {
          environmentRef: 'Env_1',
          deployToAll: false,
          gitOpsClusters: [
            {
              identifier: 'meena',
              agentIdentifier: 'meena'
            },
            {
              identifier: 'lucas',
              agentIdentifier: 'lucas'
            }
          ]
        }
      },
      { gitOpsEnabled: true }
    )

    expect(output).toEqual({
      category: 'single',
      environment: 'Env_1',
      environmentInputs: {
        Env_1: undefined
      },
      provisioner: undefined,
      gitMetadata: {
        Env_1: undefined
      },
      clusters: {
        Env_1: [
          {
            label: 'meena',
            value: 'meena',
            agentIdentifier: 'meena'
          },
          {
            label: 'lucas',
            value: 'lucas',
            agentIdentifier: 'lucas'
          }
        ]
      }
    } as DeployEnvironmentEntityFormState)
  })

  test('when environmentRef is runtime', () => {
    const output = processInitialValues(
      {
        environment: {
          environmentRef: '<+input>'
        }
      },
      { gitOpsEnabled: true }
    )

    expect(output).toEqual({
      category: 'single',
      environment: '<+input>',
      gitOpsClusters: '<+input>'
    } as DeployEnvironmentEntityFormState)
  })

  test('when stage value is mentioned', () => {
    const output = processInitialValues(
      {
        environment: {
          environmentRef: 'prod',
          useFromStage: {
            stage: 'stage1'
          },
          infrastructureDefinitions: [
            {
              identifier: 'Infra_1'
            }
          ]
        }
      },
      { gitOpsEnabled: true }
    )

    expect(output).toEqual({
      category: 'single',
      clusters: {
        prod: undefined
      },
      environment: 'prod',
      environmentInputs: {
        prod: undefined
      },
      gitMetadata: {
        prod: undefined
      },
      provisioner: undefined
    })
  })

  test('when useFromStage is given and gitOpsEnabled is false', () => {
    const output = processInitialValues(
      {
        environment: {
          environmentRef: 'prod',
          useFromStage: {
            stage: 'stage1'
          },
          infrastructureDefinitions: [
            {
              identifier: 'Infra_1'
            }
          ]
        }
      },
      { gitOpsEnabled: false }
    )
    expect(output).toEqual({
      category: 'single',
      propagateFrom: {
        label: 'stage1',
        value: 'stage1'
      }
    })
  })
})

describe('process form values', () => {
  test('clean slate', () => {
    const output = processInitialValues({}, { gitOpsEnabled: false })

    expect(output).toEqual({
      category: 'single'
    })
  })

  test('clean slate for formValues', () => {
    const output = processFormValues({}, { gitOpsEnabled: false })

    expect(output).toEqual({})
  })

  test('when environment is runtime value', () => {
    const output = processFormValues(
      {
        category: 'single',
        environment: '<+input>'
      },
      { gitOpsEnabled: true }
    )
    expect(output).toEqual({
      environment: {
        deployToAll: '<+input>',
        environmentInputs: '<+input>',
        environmentRef: '<+input>',
        gitOpsClusters: '<+input>'
      }
    })
  })

  test('environment selected with gitops enabled and no clusters', () => {
    const output = processFormValues(
      {
        category: 'single',
        environment: 'Env_1',
        environmentInputs: {
          Env_1: undefined
        },
        infrastructure: 'Infra_1',

        infrastructureInputs: {
          Env_1: {
            Infra_1: undefined
          }
        },
        clusters: {
          Env_1: []
        }
      },
      { gitOpsEnabled: true }
    )

    expect(output).toEqual({
      environment: {
        environmentRef: 'Env_1',
        deployToAll: true
      }
    } as DeployEnvironmentEntityConfig)
  })

  test('with propogateFrom information', () => {
    const output = processFormValues(
      {
        category: 'single',
        environment: 'Env_1',
        propagateFrom: {
          label: 'test',
          value: 'test'
        }
      },
      { gitOpsEnabled: false }
    )

    expect(output).toEqual({
      environment: {
        useFromStage: {
          stage: 'test'
        }
      }
    })
  })

  test('environment ref selected', () => {
    const output = processFormValues(
      {
        category: 'single',
        environment: 'Env_1',
        environmentInputs: {
          Env_1: undefined
        },
        infrastructure: 'Infra_1',
        infrastructureInputs: {
          Env_1: {
            Infra_1: undefined
          }
        }
      },
      { gitOpsEnabled: false }
    )

    expect(output).toEqual({
      environment: {
        environmentRef: 'Env_1',
        deployToAll: false,
        infrastructureDefinitions: [
          {
            identifier: 'Infra_1'
          }
        ]
      }
    } as DeployEnvironmentEntityConfig)
  })

  test('environments selected', () => {
    const output = processFormValues(
      {
        category: 'multi',
        environments: [{ label: 'Env_1', value: 'Env_1' }],
        environmentInputs: {
          Env_1: undefined
        },
        infrastructures: { Env_1: undefined as any },
        parallel: false
      },
      { gitOpsEnabled: false }
    )

    expect(output).toEqual({
      environments: {
        metadata: {
          parallel: false
        },
        values: [
          {
            environmentRef: 'Env_1',
            deployToAll: true,
            infrastructureDefinitions: RUNTIME_INPUT_VALUE as any
          }
        ]
      }
    } as DeployEnvironmentEntityConfig)
  })

  test('environment group selected ', () => {
    const output = processFormValues(
      {
        category: 'group',
        environmentGroup: 'Env_Group_1',
        environmentInputs: {},
        infrastructures: {},
        infrastructureInputs: {},
        parallel: true
      },
      { gitOpsEnabled: false }
    )

    expect(output).toEqual({
      environmentGroup: {
        envGroupRef: 'Env_Group_1',
        deployToAll: true,
        environments: RUNTIME_INPUT_VALUE as any,
        metadata: {
          parallel: true
        }
      }
    } as DeployEnvironmentEntityConfig)
  })

  test('environment selected with clusters', () => {
    const output = processFormValues(
      {
        category: 'single',
        environment: 'Env_1',
        environmentInputs: {
          Env_1: undefined
        },
        infrastructure: 'Infra_1',

        infrastructureInputs: {
          Env_1: {
            Infra_1: undefined
          }
        },
        clusters: {
          Env_1: [
            {
              label: 'meena',
              value: 'meena',
              agentIdentifier: 'meena'
            },
            {
              label: 'lucas',
              value: 'lucas',
              agentIdentifier: 'lucas'
            }
          ]
        }
      },
      { gitOpsEnabled: true }
    )

    expect(output).toEqual({
      environment: {
        environmentRef: 'Env_1',
        deployToAll: false,
        gitOpsClusters: [
          {
            agentIdentifier: 'meena',
            identifier: 'meena'
          },
          {
            agentIdentifier: 'lucas',
            identifier: 'lucas'
          }
        ]
      }
    } as DeployEnvironmentEntityConfig)
  })

  test('multi environments selected', () => {
    const output = processFormValues(
      {
        category: 'multi',
        environments: [{ label: 'prod', value: 'prod' }],
        environmentInputs: {
          prod: undefined
        },
        parallel: true,

        clusters: {
          prod: [
            {
              label: 'meena',
              value: 'meena',
              agentIdentifier: 'meena'
            },
            {
              label: 'lucas',
              value: 'lucas',
              agentIdentifier: 'lucas'
            }
          ]
        }
      },
      { gitOpsEnabled: true }
    )

    expect(output).toEqual({
      environments: {
        metadata: {
          parallel: true
        },
        values: [
          {
            deployToAll: false,
            environmentRef: 'prod',
            gitOpsClusters: [
              {
                agentIdentifier: 'meena',
                identifier: 'meena'
              },
              {
                agentIdentifier: 'lucas',
                identifier: 'lucas'
              }
            ]
          }
        ]
      }
    } as unknown as DeployEnvironmentEntityFormState)
  })

  test('when environment is empty  and gitOps is Enabled', () => {
    const output = processFormValues(
      {
        category: 'single',

        environmentInputs: {
          Env_1: undefined
        },
        infrastructure: 'Infra_1',

        infrastructureInputs: {
          Env_1: {
            Infra_1: undefined
          }
        },
        clusters: {
          Env_1: []
        }
      },
      { gitOpsEnabled: true }
    )

    expect(output).toEqual({} as DeployEnvironmentEntityConfig)
  })
})
