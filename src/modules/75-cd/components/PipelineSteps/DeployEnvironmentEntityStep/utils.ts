/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getMultiTypeFromValue, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { defaultTo, get, isEmpty, isNil, set } from 'lodash-es'
import type { EnvironmentYamlV2 } from 'services/cd-ng'
import type { DeployEnvironmentEntityConfig, DeployEnvironmentEntityFormState } from './types'

export function processInitialValues(initialValues: DeployEnvironmentEntityConfig): DeployEnvironmentEntityFormState {
  const formState = {}

  if (initialValues.environment && initialValues.environment.environmentRef) {
    if (getMultiTypeFromValue(initialValues.environment.environmentRef) === MultiTypeInputType.RUNTIME) {
      return {
        environment: RUNTIME_INPUT_VALUE
      }
    }

    const infrastructureDefinition = initialValues.environment.infrastructureDefinitions?.[0]
    const isInfrastructureRuntime =
      (initialValues.environment.infrastructureDefinitions as unknown as string) === RUNTIME_INPUT_VALUE

    return {
      environment: initialValues.environment.environmentRef,
      environmentInputs:
        getMultiTypeFromValue(initialValues.environment.environmentRef) === MultiTypeInputType.FIXED
          ? { [initialValues.environment.environmentRef]: initialValues.environment?.environmentInputs }
          : {},
      infrastructure: isInfrastructureRuntime ? RUNTIME_INPUT_VALUE : infrastructureDefinition?.identifier,
      // ? Can there be a better condition to identify?
      ...(!!infrastructureDefinition?.identifier && {
        infrastructureInputs: !isEmpty(infrastructureDefinition?.identifier)
          ? {
              [initialValues.environment.environmentRef]: {
                [infrastructureDefinition.identifier]: infrastructureDefinition?.inputs
              }
            }
          : {}
      })
    }
  } else if (initialValues.environments) {
    if (getMultiTypeFromValue(initialValues.environments?.values as unknown as string) !== MultiTypeInputType.FIXED) {
      set(formState, 'environments', initialValues.environments?.values)
      set(formState, 'environmentInputs', {})
      set(formState, 'infrastructures', [])
      set(formState, 'infrastructureInputs', {})
    } else {
      defaultTo(initialValues.environments?.values, []).map((environment: EnvironmentYamlV2, index: number) => {
        set(formState, `environments.${index}`, {
          label: environment.environmentRef,
          value: environment.environmentRef
        })
        set(formState, `environmentInputs.${environment.environmentRef}`, environment.environmentInputs)
        set(formState, `serviceOverrideInputs.${environment.environmentRef}`, environment.serviceOverrideInputs)
        if (Array.isArray(environment.infrastructureDefinitions)) {
          environment.infrastructureDefinitions.map((infrastructure, infrastructureIndex) => {
            set(formState, `infrastructures.${environment.environmentRef}.${infrastructureIndex}`, {
              label: infrastructure.identifier,
              value: infrastructure.identifier
            })
            set(
              formState,
              `infrastructureInputs.${environment.environmentRef}.${infrastructure.identifier}`,
              infrastructure.inputs
            )
          })
        } else {
          set(formState, `infrastructures.${environment.environmentRef}`, environment.infrastructureDefinitions)
        }
      })
    }
    set(formState, `parallel`, defaultTo(initialValues.environments?.metadata?.parallel, true))
  } else if (initialValues.environmentGroup && initialValues.environmentGroup.envGroupRef) {
    set(formState, `environmentGroup`, initialValues.environmentGroup.envGroupRef)

    if (
      getMultiTypeFromValue(initialValues.environmentGroup?.envGroupRef as unknown as string) ===
      MultiTypeInputType.FIXED
    ) {
      if (
        getMultiTypeFromValue(initialValues.environmentGroup?.environments as unknown as string) !==
        MultiTypeInputType.FIXED
      ) {
        set(formState, 'environments', initialValues.environmentGroup.environments)
        set(formState, 'environmentInputs', {})
        set(formState, 'infrastructures', [])
        set(formState, 'infrastructureInputs', {})
      } else {
        // This section is same as multi env. Move to function
        defaultTo(initialValues.environmentGroup.environments, []).map(
          (environment: EnvironmentYamlV2, index: number) => {
            set(formState, `environments.${index}`, {
              label: environment.environmentRef,
              value: environment.environmentRef
            })
            set(formState, `environmentInputs.${environment.environmentRef}`, environment.environmentInputs)
            set(formState, `serviceOverrideInputs.${environment.environmentRef}`, environment.serviceOverrideInputs)
            if (Array.isArray(environment.infrastructureDefinitions)) {
              environment.infrastructureDefinitions.map((infrastructure, infrastructureIndex) => {
                set(formState, `infrastructures.${environment.environmentRef}.${infrastructureIndex}`, {
                  label: infrastructure.identifier,
                  value: infrastructure.identifier
                })
                set(
                  formState,
                  `infrastructureInputs.${environment.environmentRef}.${infrastructure.identifier}`,
                  infrastructure.inputs
                )
              })
            } else {
              set(formState, `infrastructures.${environment.environmentRef}`, environment.infrastructureDefinitions)
            }
          }
        )
      }
    }
  }

  return formState
}

// TODO: Add type check to optionally extends keys
export type ChangeTypeOfKeys<T, N, K extends keyof T> = Pick<T, K> &
  {
    [key in keyof T]: T[key] | N
  }

export function processFormValues(data: DeployEnvironmentEntityFormState): DeployEnvironmentEntityConfig {
  if (!isNil(data.environment)) {
    // ! Do not merge this with the other returns even if they look similar. It makes it confusing to read
    if (getMultiTypeFromValue(data.environment) === MultiTypeInputType.RUNTIME) {
      return {
        environment: {
          environmentRef: RUNTIME_INPUT_VALUE,
          deployToAll: false,
          environmentInputs: RUNTIME_INPUT_VALUE as any,
          serviceOverrideInputs: RUNTIME_INPUT_VALUE as any,
          infrastructureDefinitions: RUNTIME_INPUT_VALUE as any
        }
      }
    }

    return {
      environment: {
        environmentRef: data.environment,
        ...(!!data.environmentInputs?.[data.environment] && {
          environmentInputs: data.environmentInputs[data.environment]
        }),
        deployToAll: false,
        ...(data.environment &&
          !!data.infrastructure && {
            infrastructureDefinitions:
              getMultiTypeFromValue(data.infrastructure) === MultiTypeInputType.RUNTIME
                ? (data.infrastructure as any)
                : [
                    {
                      identifier: data.infrastructure,
                      inputs: get(data, `infrastructureInputs.${data.environment}.${data.infrastructure}`)
                    }
                  ]
          })
      }
    }
  } else if (!isNil(data.environmentGroup)) {
    if (getMultiTypeFromValue(data.environmentGroup) === MultiTypeInputType.RUNTIME) {
      return {
        environmentGroup: {
          envGroupRef: RUNTIME_INPUT_VALUE,
          deployToAll: RUNTIME_INPUT_VALUE as any,
          environments: RUNTIME_INPUT_VALUE as any
        }
      }
    }

    return {
      environmentGroup: {
        envGroupRef: data.environmentGroup,
        deployToAll:
          getMultiTypeFromValue(data.environments) === MultiTypeInputType.RUNTIME
            ? (RUNTIME_INPUT_VALUE as any)
            : isEmpty(data.environments),
        environments: Array.isArray(data.environments)
          ? data.environments?.map(environment => {
              const selectedInfrastructures = data.infrastructures?.[environment.value as string]
              const isInfrastructureRuntime = (selectedInfrastructures as unknown as string) === RUNTIME_INPUT_VALUE

              return {
                environmentRef: environment.value as string,
                ...(!!data.environmentInputs?.[environment.value as string] && {
                  environmentInputs: data.environmentInputs[environment.value as string]
                }),
                deployToAll: isInfrastructureRuntime ? (RUNTIME_INPUT_VALUE as any) : !selectedInfrastructures,
                ...(!!selectedInfrastructures && {
                  infrastructureDefinitions: Array.isArray(selectedInfrastructures)
                    ? selectedInfrastructures.map(infrastructure => ({
                        identifier: infrastructure.value as string,
                        inputs: data.infrastructureInputs?.[environment.value as string][infrastructure.value as string]
                      }))
                    : selectedInfrastructures
                })
              }
            })
          : data.environments
      }
    }
  } else if (!isNil(data.environments)) {
    return {
      environments: {
        metadata: {
          parallel: data.parallel
        },
        values: Array.isArray(data.environments)
          ? data.environments?.map(environment => {
              const selectedInfrastructures = data.infrastructures?.[environment.value as string]
              const isInfrastructureRuntime = (selectedInfrastructures as unknown as string) === RUNTIME_INPUT_VALUE

              return {
                environmentRef: environment.value as string,
                ...(!!data.environmentInputs?.[environment.value as string] && {
                  environmentInputs: data.environmentInputs[environment.value as string]
                }),
                deployToAll: isInfrastructureRuntime ? (RUNTIME_INPUT_VALUE as any) : !selectedInfrastructures,
                ...(!!selectedInfrastructures && {
                  infrastructureDefinitions: Array.isArray(selectedInfrastructures)
                    ? selectedInfrastructures.map(infrastructure => ({
                        identifier: infrastructure.value as string,
                        inputs: data.infrastructureInputs?.[environment.value as string][infrastructure.value as string]
                      }))
                    : selectedInfrastructures
                })
              }
            })
          : data.environments
      }
    }
  }
  return {}
}
