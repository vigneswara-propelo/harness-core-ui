/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getMultiTypeFromValue, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { defaultTo, isEmpty, isNil } from 'lodash-es'
import type {
  DeployEnvironmentEntityConfig,
  DeployEnvironmentEntityCustomStepProps,
  DeployEnvironmentEntityFormState
} from '../../types'
import { getEnvironmentsFormValuesFromFormState } from '../multiEnvironment/processMultiEnvironmentFormValues'

export function processEnvironmentGroupFormValues(
  data: DeployEnvironmentEntityFormState,
  customStepProps: DeployEnvironmentEntityCustomStepProps
): DeployEnvironmentEntityConfig {
  if (!isNil(data.environmentGroup)) {
    const filters = defaultTo(data?.environmentGroupFilters, [])
    const environmentFilters = defaultTo(data?.environmentFilters?.runtime, [])
    const infraClusterFilters = defaultTo(data?.infraClusterFilters, [])

    if (getMultiTypeFromValue(data.environmentGroup) === MultiTypeInputType.RUNTIME) {
      return {
        environmentGroup: {
          envGroupRef: RUNTIME_INPUT_VALUE,
          metadata: {
            parallel: data.parallel
          },
          ...(filters.length
            ? { filters }
            : {
                deployToAll: RUNTIME_INPUT_VALUE as any,
                environments: RUNTIME_INPUT_VALUE as any
              }),
          ...(infraClusterFilters.length && { filters: infraClusterFilters })
        }
      }
    } else {
      const deployToAll =
        getMultiTypeFromValue(data.environments) === MultiTypeInputType.RUNTIME
          ? (RUNTIME_INPUT_VALUE as any)
          : isEmpty(data.environments)

      return {
        environmentGroup: {
          envGroupRef: data.environmentGroup,
          metadata: {
            parallel: data.parallel
          },
          ...(filters?.length
            ? { filters }
            : {
                deployToAll,
                // this an off condition that is used to handle deployToAll in environment groups
                ...(deployToAll === true && { environments: RUNTIME_INPUT_VALUE as any }),
                ...(!isEmpty(data.environments) && {
                  environments: getEnvironmentsFormValuesFromFormState(data, customStepProps)
                })
              }),
          ...(environmentFilters.length && { filters: environmentFilters })
        }
      }
    }
  }

  return {
    environmentGroup: {
      envGroupRef: ''
    }
  }
}
