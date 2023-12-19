/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import { Types as ValidationFieldTypes } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { Types as TransformValuesTypes } from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import {
  additionalFieldsValidationConfigEitView,
  additionalFieldsValidationConfigInputSet,
  commonFieldsTransformConfig,
  commonFieldsValidationConfig,
  imageFieldsValidationConfig,
  ingestionFieldValidationConfig,
  instanceFieldsTransformConfig,
  instanceFieldsValidationConfig
} from '../constants'
import type { Field, InputSetViewValidateFieldsConfig } from '../types'
import type { ZapStepData } from './ZapStep'

const toolFieldsTransformConfig = (data: ZapStepData) =>
  data.spec.mode === 'orchestration'
    ? [
        {
          name: 'spec.tool.context',
          type: TransformValuesTypes.Text
        },
        {
          name: 'spec.tool.port',
          type: TransformValuesTypes.Text
        }
      ]
    : []

export const transformValuesFieldsConfig = (data: ZapStepData): Field[] => {
  const transformValuesFieldsConfigValues = [
    ...commonFieldsTransformConfig(data),
    ...toolFieldsTransformConfig(data),
    ...instanceFieldsTransformConfig(data)
  ]
  return transformValuesFieldsConfigValues
}

const toolFieldsValidationConfig = (
  data: ZapStepData,
  stepViewType?: StepViewType
): InputSetViewValidateFieldsConfig[] =>
  data.spec.mode === 'orchestration' || stepViewType === StepViewType.InputSet
    ? [
        {
          name: 'spec.tool.context',
          type: ValidationFieldTypes.Text,
          label: 'sto.stepField.tool.context'
        },
        {
          name: 'spec.tool.port',
          type: ValidationFieldTypes.Text,
          label: 'sto.stepField.tool.context'
        }
      ]
    : []

export const editViewValidateFieldsConfig = (data: ZapStepData) => {
  const editViewValidationConfig = [
    ...commonFieldsValidationConfig(data),
    ...ingestionFieldValidationConfig(data),
    ...imageFieldsValidationConfig(data),
    ...additionalFieldsValidationConfigEitView,
    ...instanceFieldsValidationConfig(data),
    ...toolFieldsValidationConfig(data)
  ]

  return editViewValidationConfig
}

export function getInputSetViewValidateFieldsConfig(data: ZapStepData): InputSetViewValidateFieldsConfig[] {
  const inputSetViewValidateFieldsConfig: InputSetViewValidateFieldsConfig[] = [
    ...commonFieldsValidationConfig(data, StepViewType.InputSet),
    ...ingestionFieldValidationConfig(data, StepViewType.InputSet),
    ...imageFieldsValidationConfig(data, StepViewType.InputSet),
    ...additionalFieldsValidationConfigInputSet,
    ...instanceFieldsValidationConfig(data, StepViewType.InputSet),
    ...toolFieldsValidationConfig(data, StepViewType.InputSet)
  ]

  return inputSetViewValidateFieldsConfig
}
