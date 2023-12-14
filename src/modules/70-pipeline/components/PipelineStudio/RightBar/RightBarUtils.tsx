/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import * as Yup from 'yup'
import { MultiTypeInputType, getMultiTypeFromValue } from '@harness/uicore'
import { set } from 'lodash-es'
import type { UseStringsReturn } from 'framework/strings'
import {
  generateSchemaForLimitCPU,
  generateSchemaForLimitMemory
} from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'

const onlyPositiveIntegerKeyRef = 'pipeline.onlyPositiveInteger'
export interface CodebaseRuntimeInputsInterface {
  connectorRef?: boolean
  repoName?: boolean
}

export const runtimeInputGearWidth = 58

export const blankspacesRegex = /^(?!\s+$).*/

export const validateCIForm = ({
  values,
  getString
}: {
  values: { [key: string]: any }
  getString: UseStringsReturn['getString']
}): { [key: string]: any } => {
  const errors = {}
  if (getMultiTypeFromValue(values.depth) === MultiTypeInputType.FIXED) {
    try {
      Yup.number()
        .notRequired()
        .integer(getString(onlyPositiveIntegerKeyRef))
        .min(0, getString(onlyPositiveIntegerKeyRef))
        .typeError(getString(onlyPositiveIntegerKeyRef))
        .validateSync(values.depth === '' ? undefined : values.depth)
    } catch (error) {
      set(errors, 'depth', error.message)
    }
  }
  try {
    generateSchemaForLimitMemory({ getString }).validateSync(values.memoryLimit)
  } catch (error) {
    set(errors, 'memoryLimit', error.message)
  }
  try {
    generateSchemaForLimitCPU({ getString }).validateSync(values.cpuLimit)
  } catch (error) {
    set(errors, 'cpuLimit', error.message)
  }
  return errors
}
