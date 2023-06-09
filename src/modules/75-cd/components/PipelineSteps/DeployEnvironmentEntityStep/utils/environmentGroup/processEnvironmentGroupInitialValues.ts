/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import { defaultTo, set } from 'lodash-es'
import { isValueRuntimeInput } from '@common/utils/utils'
import type {
  DeployEnvironmentEntityConfig,
  DeployEnvironmentEntityCustomStepProps,
  DeployEnvironmentEntityFormState
} from '../../types'
import { getEnvironmentsFormStateFromInitialValues } from '../multiEnvironment/processMultiEnvironmentInitialValues'

export function processEnvironmentGroupInitialValues(
  initialValues: DeployEnvironmentEntityConfig,
  customStepProps: DeployEnvironmentEntityCustomStepProps
): DeployEnvironmentEntityFormState {
  let formState: DeployEnvironmentEntityFormState = {}

  if (initialValues.environmentGroup && initialValues.environmentGroup.envGroupRef) {
    set(formState, `environmentGroup`, initialValues.environmentGroup.envGroupRef)

    if (
      getMultiTypeFromValue(initialValues.environmentGroup?.envGroupRef as unknown as string) ===
      MultiTypeInputType.FIXED
    ) {
      formState = {
        ...formState,
        ...getEnvironmentsFormStateFromInitialValues(
          initialValues.environmentGroup.environments,
          initialValues.environmentGroup.deployToAll,
          customStepProps
        )
      }
    }

    const isEnvironmentGroupRuntime = isValueRuntimeInput(initialValues.environmentGroup.envGroupRef)
    const areEnvironmentsRuntime = isValueRuntimeInput(initialValues.environmentGroup.environments as unknown as string)

    const filters = defaultTo(initialValues.environmentGroup?.filters, [])
    if (filters.length) {
      set(
        formState,
        areEnvironmentsRuntime
          ? isEnvironmentGroupRuntime
            ? 'infraClusterFilters'
            : 'environmentFilters.runtime'
          : 'environmentGroupFilters',
        filters
      )
    }
  }

  formState.category = 'group'
  formState.parallel = defaultTo(initialValues.environmentGroup?.metadata?.parallel, true)
  return formState
}
