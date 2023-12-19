/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import {
  additionalFieldsValidationConfigEitView,
  additionalFieldsValidationConfigInputSet,
  commonFieldsTransformConfig,
  commonFieldsValidationConfig,
  imageFieldsValidationConfig,
  ingestionFieldValidationConfig,
  sbomFieldsTransformConfig,
  sbomFieldValidationConfig
} from '../constants'
import type { Field, InputSetViewValidateFieldsConfig } from '../types'
import type { AquatrivyStepData } from './AquatrivyStep'

export const transformValuesFieldsConfig = (data: AquatrivyStepData): Field[] => {
  const transformValuesFieldsConfigValues = [...commonFieldsTransformConfig(data), ...sbomFieldsTransformConfig(data)]

  return transformValuesFieldsConfigValues
}

export const editViewValidateFieldsConfig = (data: AquatrivyStepData) => {
  const editViewValidationConfig = [
    ...commonFieldsValidationConfig(data),
    ...ingestionFieldValidationConfig(data),
    ...imageFieldsValidationConfig(data),
    ...sbomFieldValidationConfig(),
    ...additionalFieldsValidationConfigEitView
  ]

  return editViewValidationConfig
}

export function getInputSetViewValidateFieldsConfig(data: AquatrivyStepData): InputSetViewValidateFieldsConfig[] {
  const inputSetViewValidateFieldsConfig: InputSetViewValidateFieldsConfig[] = [
    ...commonFieldsValidationConfig(data, StepViewType.InputSet),
    ...ingestionFieldValidationConfig(data, StepViewType.InputSet),
    ...imageFieldsValidationConfig(data, StepViewType.InputSet),
    ...sbomFieldValidationConfig(),
    ...additionalFieldsValidationConfigInputSet
  ]

  return inputSetViewValidateFieldsConfig
}
