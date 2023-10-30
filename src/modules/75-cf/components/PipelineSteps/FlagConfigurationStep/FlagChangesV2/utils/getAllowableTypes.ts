/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { AllowedTypes, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import { Feature } from 'services/cf'
import { isMultiTypeExpression, isMultiTypeRuntime } from '@common/utils/utils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'

interface FlagAndEnvOptions {
  flag?: Feature | string
  environmentIdentifier?: string
}

export function getAllowableTypes(mode: StepViewType, options: FlagAndEnvOptions = {}): AllowedTypes {
  if (mode === StepViewType.DeploymentForm) return [MultiTypeInputType.FIXED]

  let allowableTypes = [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION, MultiTypeInputType.RUNTIME]

  if ('flag' in options) {
    const flagInputType =
      typeof options.flag === 'string' ? getMultiTypeFromValue(options.flag) : MultiTypeInputType.FIXED

    if (isMultiTypeRuntime(flagInputType)) {
      allowableTypes = negotiateTypes(allowableTypes, [MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION])
    } else if (isMultiTypeExpression(flagInputType)) {
      allowableTypes = negotiateTypes(allowableTypes, [MultiTypeInputType.EXPRESSION])
    }
  }

  if ('environmentIdentifier' in options) {
    const environmentInputType = getMultiTypeFromValue(options.environmentIdentifier)

    if (isMultiTypeRuntime(environmentInputType)) {
      allowableTypes = negotiateTypes(allowableTypes, [MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION])
    } else if (isMultiTypeExpression(environmentInputType)) {
      allowableTypes = negotiateTypes(allowableTypes, [MultiTypeInputType.EXPRESSION])
    }
  }

  return allowableTypes as AllowedTypes
}

function negotiateTypes(typesA: MultiTypeInputType[], typesB: MultiTypeInputType[]): MultiTypeInputType[] {
  return typesA.length < typesB.length ? typesA : typesB
}
