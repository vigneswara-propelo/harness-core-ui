/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import { defaultTo, get, isEmpty, isNil, set, unset } from 'lodash-es'
import type { EnvironmentYamlV2 } from 'services/cd-ng'
import { getIdentifierFromScopedRef, isValueExpression, isValueRuntimeInput } from '@common/utils/utils'
import type {
  DeployEnvironmentEntityConfig,
  DeployEnvironmentEntityCustomStepProps,
  DeployEnvironmentEntityFormState
} from '../../types'

export function getEnvironmentsFormStateFromInitialValues(
  environments?: EnvironmentYamlV2[],
  deployToAll?: boolean,
  customStepProps: DeployEnvironmentEntityCustomStepProps = {}
): DeployEnvironmentEntityFormState {
  const formState = {
    gitMetadata: {}
  }
  const { gitOpsEnabled, serviceIdentifiers } = customStepProps
  const isOverridesEnabled = (customStepProps as any).isOverridesEnabled

  if (getMultiTypeFromValue(environments as unknown as string) !== MultiTypeInputType.FIXED) {
    if (deployToAll !== true) {
      set(formState, 'environments', environments)
    }
    set(formState, 'environmentInputs', {})
    if (gitOpsEnabled) {
      set(formState, 'clusters', {})
    } else {
      set(formState, 'infrastructures', {})
      set(formState, 'infrastructureInputs', {})
    }
  } else {
    defaultTo(environments, []).map((environment: EnvironmentYamlV2, index: number) => {
      set(formState, `environments.${index}`, {
        label: getIdentifierFromScopedRef(environment.environmentRef as string),
        value: environment.environmentRef
      })

      set(formState, `environmentInputs.['${environment.environmentRef}']`, environment.environmentInputs)
      environment.gitBranch &&
        set(formState, 'gitMetadata', {
          ...formState.gitMetadata,
          [environment.environmentRef as string]: environment.gitBranch
        })
      if (isOverridesEnabled) {
        if (!isNil(environment.servicesOverrides) && !isEmpty(environment.servicesOverrides)) {
          environment.servicesOverrides.forEach(serviceOverride => {
            set(
              formState,
              'serviceOverrideInputs',
              getMultiTypeFromValue(environment.environmentRef) === MultiTypeInputType.FIXED
                ? {
                    [environment.environmentRef as string]: {
                      [serviceOverride.serviceRef]: serviceOverride.serviceOverrideInputs
                    }
                  }
                : isValueExpression(environment.environmentRef)
                ? { environment: { expression: environment.servicesOverrides } }
                : {}
            )
          })
        } else if (!isNil(environment.serviceOverrideInputs) && !isEmpty(environment.serviceOverrideInputs)) {
          set(
            formState,
            'serviceOverrideInputs',
            getMultiTypeFromValue(environment.environmentRef) === MultiTypeInputType.FIXED && serviceIdentifiers?.length
              ? {
                  [environment.environmentRef as string]: {
                    [serviceIdentifiers?.[0] as string]: environment?.serviceOverrideInputs
                  }
                }
              : isValueExpression(environment.environmentRef)
              ? { environment: { expression: environment.serviceOverrideInputs } }
              : {}
          )
        }
      }

      const environmentFilters = defaultTo((environment as any).filters, [])
      if (environmentFilters.length) {
        set(formState, `environmentFilters.['${environment.environmentRef}']`, environmentFilters)
      } else {
        if (gitOpsEnabled) {
          if (Array.isArray(environment.gitOpsClusters)) {
            environment.gitOpsClusters.map((gitOpsCluster, clusterIndex) => {
              set(formState, `clusters.['${environment.environmentRef}'].${clusterIndex}`, {
                label: gitOpsCluster.identifier,
                value: gitOpsCluster.identifier,
                agentIdentifier: gitOpsCluster.agentIdentifier
              })
            })
          } else {
            set(formState, `clusters.['${environment.environmentRef}']`, environment.gitOpsClusters)
          }
        } else {
          if (environment.deployToAll !== true) {
            if (Array.isArray(environment.infrastructureDefinitions)) {
              environment.infrastructureDefinitions.map((infrastructure, infrastructureIndex) => {
                set(formState, `infrastructures.['${environment.environmentRef}'].${infrastructureIndex}`, {
                  label: infrastructure.identifier,
                  value: infrastructure.identifier
                })

                set(
                  formState,
                  `infrastructureInputs.['${environment.environmentRef}'].${infrastructure.identifier}`,
                  infrastructure.inputs
                )
              })
            } else {
              set(formState, `infrastructures.['${environment.environmentRef}']`, environment.infrastructureDefinitions)
            }
          }
        }
      }
    })
  }
  if (isEmpty(get(formState, 'gitMetadata', {}))) {
    unset(formState, 'gitMetadata')
  }
  return formState
}

export function processMultiEnvironmentInitialValues(
  initialValues: DeployEnvironmentEntityConfig,
  customStepProps: DeployEnvironmentEntityCustomStepProps
): DeployEnvironmentEntityFormState {
  const environmentValues = getEnvironmentsFormStateFromInitialValues(
    initialValues.environments?.values,
    false,
    customStepProps
  )
  const environmentFilters = defaultTo((initialValues.environments as any)?.filters, [])

  return {
    parallel: defaultTo(initialValues.environments?.metadata?.parallel, true),
    category: 'multi',
    ...getEnvironmentsFormStateFromInitialValues(initialValues.environments?.values, false, customStepProps),
    ...(environmentFilters.length &&
      (isValueRuntimeInput(environmentValues.environments) || !initialValues.environments?.values) && {
        environmentFilters: {
          [`${initialValues.environments?.values ? 'runtime' : 'fixedScenario'}`]: environmentFilters
        }
      })
  }
}
