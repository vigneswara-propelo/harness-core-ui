/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getMultiTypeFromValue, MultiTypeInputType, SelectOption } from '@harness/uicore'
import { defaultTo, get, isEmpty, isNil, set } from 'lodash-es'
import type { EnvironmentYamlV2 } from 'services/cd-ng'
import type { DeployEnvironmentEntityConfig, DeployEnvironmentEntityFormState } from './types'

export function processInitialValues(initialValues: DeployEnvironmentEntityConfig): DeployEnvironmentEntityFormState {
  const formState = {}

  if (initialValues.environment && initialValues.environment.environmentRef) {
    const infrastructureDefinition = initialValues.environment.infrastructureDefinitions?.[0]
    return {
      environment: initialValues.environment.environmentRef,
      environmentInputs:
        getMultiTypeFromValue(initialValues.environment.environmentRef) === MultiTypeInputType.FIXED
          ? { [initialValues.environment.environmentRef]: initialValues.environment?.environmentInputs }
          : {},
      infrastructure: infrastructureDefinition?.identifier,
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
      }
    })
  } else if (initialValues.environmentGroup && initialValues.environmentGroup.envGroupRef) {
    set(formState, `environmentGroup`, initialValues.environmentGroup.envGroupRef)

    // This section is same as multi env. Move to function
    defaultTo(initialValues.environmentGroup.environments, []).map((environment: EnvironmentYamlV2, index: number) => {
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
      }
    })
  }

  set(formState, `parallel`, defaultTo(initialValues.environments?.metadata?.parallel, true))

  return formState
}

export function processFormValues(data: DeployEnvironmentEntityFormState): DeployEnvironmentEntityConfig {
  if (!isNil(data.environment)) {
    return {
      environment: {
        environmentRef: data.environment,
        ...(!!data.environmentInputs?.[data.environment] && {
          environmentInputs: data.environmentInputs[data.environment]
        }),
        deployToAll: false,
        ...(!!data.infrastructure && {
          infrastructureDefinitions: [
            {
              identifier: data.infrastructure,
              inputs: get(data, `infrastructureInputs.${data.environment}.${data.infrastructure}`)
            }
          ]
        })
      }
    }
  } else if (!isNil(data.environmentGroup)) {
    return {
      environmentGroup: {
        envGroupRef: data.environmentGroup,
        deployToAll: isEmpty(data.environments),
        environments: (data.environments as unknown as SelectOption[])?.map(environment => ({
          environmentRef: environment.value as string,
          ...(!!data.environmentInputs?.[environment.value as string] && {
            environmentInputs: data.environmentInputs[environment.value as string]
          }),
          deployToAll: !data.infrastructures?.[environment.value as string],
          ...(!!data.infrastructures?.[environment.value as string] && {
            infrastructureDefinitions: data.infrastructures[environment.value as string].map(infrastructure => ({
              identifier: infrastructure.value as string,
              inputs: data.infrastructureInputs?.[environment.value as string][infrastructure.value as string]
            }))
          })
        }))
      }
    }
  } else if (!isNil(data.environments)) {
    return {
      environments: {
        values: data.environments?.map(environment => ({
          environmentRef: environment.value as string,
          ...(!!data.environmentInputs?.[environment.value as string] && {
            environmentInputs: data.environmentInputs[environment.value as string]
          }),
          deployToAll: !data.infrastructures?.[environment.value as string],
          ...(!!data.infrastructures?.[environment.value as string] && {
            infrastructureDefinitions: data.infrastructures[environment.value as string].map(infrastructure => ({
              identifier: infrastructure.value as string,
              inputs: data.infrastructureInputs?.[environment.value as string][infrastructure.value as string]
            }))
          })
        }))
      }
    }
  }
  return {}
}
