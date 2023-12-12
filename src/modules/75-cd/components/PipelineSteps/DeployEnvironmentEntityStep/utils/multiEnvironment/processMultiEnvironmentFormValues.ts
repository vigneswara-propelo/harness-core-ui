/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { defaultTo, get, isEmpty, isNil, set } from 'lodash-es'
import type { EnvironmentYamlV2, ServiceOverrideInputsYaml } from 'services/cd-ng'
import { isValueRuntimeInput } from '@common/utils/utils'
import type {
  ClusterOption,
  DeployEnvironmentEntityConfig,
  DeployEnvironmentEntityCustomStepProps,
  DeployEnvironmentEntityFormState
} from '../../types'

export function getEnvironmentsFormValuesFromFormState(
  data: DeployEnvironmentEntityFormState,
  customStepProps: DeployEnvironmentEntityCustomStepProps
): EnvironmentYamlV2[] {
  const { gitOpsEnabled, serviceIdentifiers } = customStepProps
  const isOverridesEnabled = (customStepProps as any).isOverridesEnabled

  return Array.isArray(data.environments)
    ? data.environments?.map(environment => {
        const environmentsFormState: EnvironmentYamlV2 = {
          environmentRef: environment.value as string,
          ...(data.gitMetadata?.[environment.value as string]
            ? { gitBranch: data.gitMetadata?.[environment.value as string] }
            : {})
        }

        if (data.environmentInputs?.[environment.value as string]) {
          set(environmentsFormState, 'environmentInputs', data.environmentInputs[environment.value as string])
        }
        if (
          isOverridesEnabled &&
          !isEmpty(data.serviceOverrideInputs?.[environment.value as string]) &&
          !isNil(data.serviceOverrideInputs?.[environment.value as string])
        ) {
          const serviceOverrideInputs =
            data.serviceOverrideInputs?.[environment.value as string]?.[serviceIdentifiers?.[0] as string]

          let servicesOverrides = []

          servicesOverrides =
            !get(data.serviceOverrideInputs, 'environment.expression') &&
            serviceIdentifiers &&
            serviceIdentifiers.length > 1
              ? defaultTo(serviceIdentifiers, [])
                  ?.map(serviceIdentifier => {
                    if (data.serviceOverrideInputs?.[environment.value as string]?.[serviceIdentifier]) {
                      return {
                        serviceRef: serviceIdentifier,
                        serviceOverrideInputs:
                          data.serviceOverrideInputs?.[environment.value as string]?.[serviceIdentifier]
                      } as ServiceOverrideInputsYaml
                    } else {
                      return null
                    }
                  })
                  .filter(mappedInputs => mappedInputs)
              : []

          if (!isEmpty(servicesOverrides)) {
            set(environmentsFormState, 'servicesOverrides', servicesOverrides)
          } else if (!isEmpty(serviceOverrideInputs)) {
            set(environmentsFormState, 'serviceOverrideInputs', serviceOverrideInputs)
          }
        }

        const environmentFilters = defaultTo(data?.environmentFilters?.[environment.value as string], [])
        if (environmentFilters.length) {
          set(environmentsFormState, 'filters', environmentFilters)
        } else {
          if (gitOpsEnabled) {
            const selectedClusters = data.clusters?.[environment.value as string]
            const isClusterRuntime = (selectedClusters as unknown as string) === RUNTIME_INPUT_VALUE

            const deployToAll = isClusterRuntime ? (RUNTIME_INPUT_VALUE as any) : !selectedClusters

            set(environmentsFormState, 'deployToAll', deployToAll)

            if (selectedClusters) {
              set(
                environmentsFormState,
                'gitOpsClusters',
                Array.isArray(selectedClusters as unknown as ClusterOption[])
                  ? (selectedClusters as ClusterOption[])?.map((cluster: ClusterOption) => ({
                      identifier: cluster.value as string,
                      agentIdentifier: cluster.agentIdentifier as string
                    }))
                  : selectedClusters
              )
            }
          } else {
            const selectedInfrastructures = data.infrastructures?.[environment.value as string]
            const isInfrastructureRuntime = (selectedInfrastructures as unknown as string) === RUNTIME_INPUT_VALUE

            const deployToAll = isInfrastructureRuntime ? (RUNTIME_INPUT_VALUE as any) : !selectedInfrastructures

            set(environmentsFormState, 'deployToAll', deployToAll)

            if (deployToAll === true) {
              set(environmentsFormState, 'infrastructureDefinitions', RUNTIME_INPUT_VALUE)
            }

            if (selectedInfrastructures) {
              set(
                environmentsFormState,
                'infrastructureDefinitions',
                Array.isArray(selectedInfrastructures)
                  ? selectedInfrastructures.map(infrastructure => ({
                      identifier: infrastructure.value as string,
                      inputs: data.infrastructureInputs?.[environment.value as string]?.[infrastructure.value as string]
                    }))
                  : selectedInfrastructures
              )
            }
          }
        }

        return environmentsFormState
      })
    : data.environments || []
}

export function processMultiEnvironmentFormValues(
  data: DeployEnvironmentEntityFormState,
  customStepProps: DeployEnvironmentEntityCustomStepProps
): DeployEnvironmentEntityConfig {
  const filters = defaultTo(data?.environmentFilters?.runtime, [])
  const fixedEnvfilters = defaultTo(data?.environmentFilters?.fixedScenario, [])
  const environmentValues = getEnvironmentsFormValuesFromFormState(data, customStepProps)

  if (fixedEnvfilters.length) {
    return {
      environments: {
        metadata: {
          parallel: data.parallel
        },
        filters: fixedEnvfilters
      }
    }
  }

  if (!isNil(data.environments)) {
    return {
      environments: {
        metadata: {
          parallel: data.parallel
        },
        values: environmentValues,
        ...(filters.length && isValueRuntimeInput(environmentValues as unknown as string) && { filters })
      }
    }
  }

  return {
    environments: {
      metadata: {
        parallel: data.parallel
      },
      values: []
    }
  }
}
