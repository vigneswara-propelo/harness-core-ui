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
  ingestionFieldValidationConfig,
  instanceFieldsTransformConfig,
  instanceFieldsValidationConfig
} from '../constants'
import type { Field, InputSetViewValidateFieldsConfig } from '../types'
import type { NiktoStepData } from './NiktoStep'

export const transformValuesFieldsConfig = (data: NiktoStepData): Field[] => {
  const transformValuesFieldsConfigValues = [
    ...commonFieldsTransformConfig(data),
    ...instanceFieldsTransformConfig(data)
  ]

  return transformValuesFieldsConfigValues
}

export const editViewValidateFieldsConfig = (data: NiktoStepData) => {
  const editViewValidationConfig = [
    ...commonFieldsValidationConfig(data),
    ...ingestionFieldValidationConfig(data),
    ...additionalFieldsValidationConfigEitView,
    ...instanceFieldsValidationConfig(data)
  ]

  return editViewValidationConfig
}

export function getInputSetViewValidateFieldsConfig(data: NiktoStepData): InputSetViewValidateFieldsConfig[] {
  const inputSetViewValidateFieldsConfig: InputSetViewValidateFieldsConfig[] = [
    ...commonFieldsValidationConfig(data, StepViewType.InputSet),
    ...ingestionFieldValidationConfig(data, StepViewType.InputSet),
    ...additionalFieldsValidationConfigInputSet,
    ...instanceFieldsValidationConfig(data, StepViewType.InputSet)
  ]

  return inputSetViewValidateFieldsConfig
}
