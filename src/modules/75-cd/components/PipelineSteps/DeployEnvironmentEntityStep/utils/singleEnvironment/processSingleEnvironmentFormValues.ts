/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getMultiTypeFromValue, MultiTypeInputType, RUNTIME_INPUT_VALUE, SelectOption } from '@harness/uicore'
import { defaultTo, get, isEmpty, isNil } from 'lodash-es'

import { getScopeAppendedToIdentifier } from '@modules/10-common/utils/StringUtils'
import type { EnvironmentYamlV2, ServiceOverrideInputsYaml } from 'services/cd-ng'
import type {
  ClusterOption,
  DeployEnvironmentEntityConfig,
  DeployEnvironmentEntityCustomStepProps,
  DeployEnvironmentEntityFormState
} from '../../types'

export function processSingleEnvironmentFormValues(
  data: DeployEnvironmentEntityFormState,
  customStepProps: DeployEnvironmentEntityCustomStepProps
): DeployEnvironmentEntityConfig {
  const { gitOpsEnabled, serviceIdentifiers } = customStepProps
  const isOverridesEnabled = (customStepProps as any).isOverridesEnabled
  if (!isNil(data.propagateFrom)) {
    return {
      environment: {
        useFromStage: {
          stage: defaultTo(data.propagateFrom.value as string, '')
        }
      }
    }
  }

  if (!isNil(data.environment)) {
    // ! Do not merge this with the other returns even if they look similar. It makes it confusing to read
    if (getMultiTypeFromValue(data.environment) === MultiTypeInputType.RUNTIME) {
      return {
        environment: {
          environmentRef: RUNTIME_INPUT_VALUE,
          deployToAll: false,
          ...(!isEmpty(data.provisioner) && { provisioner: data.provisioner }),
          environmentInputs: RUNTIME_INPUT_VALUE as any,
          serviceOverrideInputs: RUNTIME_INPUT_VALUE as any,
          ...(gitOpsEnabled
            ? { gitOpsClusters: RUNTIME_INPUT_VALUE as any }
            : { infrastructureDefinitions: RUNTIME_INPUT_VALUE as any })
        }
      }
    } else {
      const serviceOverrideInputs = get(data.serviceOverrideInputs, 'environment.expression')
        ? get(data.serviceOverrideInputs, 'environment.expression')
        : data.serviceOverrideInputs?.[data.environment]?.[serviceIdentifiers?.[0] as string]
        ? data.serviceOverrideInputs?.[data.environment]?.[serviceIdentifiers?.[0] as string]
        : {}

      let servicesOverrides: ServiceOverrideInputsYaml[] = []

      if (isOverridesEnabled) {
        servicesOverrides =
          !get(data.serviceOverrideInputs, 'environment.expression') &&
          serviceIdentifiers &&
          serviceIdentifiers?.length > 1
            ? serviceIdentifiers
                ?.map(serviceIdentifier => {
                  if (data.serviceOverrideInputs?.[data.environment as string]?.[serviceIdentifier]) {
                    return {
                      serviceRef: serviceIdentifier,
                      serviceOverrideInputs:
                        data.serviceOverrideInputs?.[data.environment as string]?.[serviceIdentifier]
                    } as ServiceOverrideInputsYaml
                  } else {
                    return {} as ServiceOverrideInputsYaml
                  }
                })
                .filter(mappedInputs => !isEmpty(mappedInputs))
            : []
      }

      return {
        environment: {
          environmentRef: data.environment,
          ...(data.gitMetadata?.[data.environment] ? { gitBranch: data.gitMetadata?.[data.environment] } : {}),
          ...(get(data.environmentInputs, 'environment.expression')
            ? { environmentInputs: get(data.environmentInputs, 'environment.expression') }
            : !!data.environmentInputs?.[data.environment] && {
                environmentInputs: data.environmentInputs[data.environment]
              }),
          ...(!isEmpty(servicesOverrides)
            ? { servicesOverrides }
            : !isEmpty(serviceOverrideInputs)
            ? { serviceOverrideInputs }
            : {}),
          deployToAll: false,
          ...(!isEmpty(data.provisioner) && { provisioner: data.provisioner }),
          ...(data.environment &&
            !!data.infrastructure && {
              infrastructureDefinitions:
                getMultiTypeFromValue(data.infrastructure) === MultiTypeInputType.RUNTIME
                  ? (data.infrastructure as any)
                  : [
                      {
                        identifier: data.infrastructure,
                        inputs: get(
                          data,
                          `infrastructureInputs.environment.infrastructure.expression`,
                          get(data, `infrastructureInputs.['${data.environment}'].${data.infrastructure}`)
                        )
                      }
                    ]
            }),
          ...(data.environment &&
            !!data.cluster && {
              gitOpsClusters:
                getMultiTypeFromValue(data.cluster) === MultiTypeInputType.RUNTIME
                  ? (data.cluster as any)
                  : [
                      {
                        identifier: data.cluster
                      }
                    ]
            })
        }
      }
    }
  }

  return {
    environment: {
      environmentRef: ''
    }
  }
}

export function processSingleEnvironmentGitOpsFormValues(
  data: DeployEnvironmentEntityFormState
): DeployEnvironmentEntityConfig {
  if (!isNil(data.environment)) {
    // ! Do not merge this with the other returns even if they look similar. It makes it confusing to read
    if (getMultiTypeFromValue(data.environment) === MultiTypeInputType.RUNTIME) {
      const filters = defaultTo(data.environmentFilters?.runtime, [])
      return {
        environment: {
          environmentRef: RUNTIME_INPUT_VALUE,
          ...(filters.length
            ? { filters }
            : {
                deployToAll: RUNTIME_INPUT_VALUE as any,
                environmentInputs: RUNTIME_INPUT_VALUE as any,
                gitOpsClusters: RUNTIME_INPUT_VALUE as any
              })
        }
      }
    } else {
      const selectedClusters = data.clusters?.[data.environment as string]
      const deployToAll =
        getMultiTypeFromValue(selectedClusters as SelectOption[] | string) === MultiTypeInputType.RUNTIME
          ? (RUNTIME_INPUT_VALUE as any)
          : isEmpty(selectedClusters)

      const gitOpsClusters = Array.isArray(selectedClusters as ClusterOption[])
        ? ((selectedClusters || []) as ClusterOption[])?.map((cluster: ClusterOption) => ({
            identifier: cluster.scope
              ? getScopeAppendedToIdentifier(cluster.identifier as string, cluster.scope as string)
              : cluster.identifier || cluster.value,
            agentIdentifier: cluster.agentIdentifier as string
          }))
        : selectedClusters

      const dataObj: DeployEnvironmentEntityConfig = {
        environment: {
          environmentRef: data.environment,
          ...(!!data.environmentInputs?.[data.environment] && {
            environmentInputs: data.environmentInputs[data.environment]
          }),
          ...(!isEmpty(data.provisioner) && { provisioner: data.provisioner }),
          deployToAll,
          ...(!isEmpty(data.clusters) && {
            gitOpsClusters
          })
        } as EnvironmentYamlV2
      }
      if (!selectedClusters?.length) {
        delete dataObj.environment?.gitOpsClusters
      }

      return dataObj
    }
  }

  return {}
}
