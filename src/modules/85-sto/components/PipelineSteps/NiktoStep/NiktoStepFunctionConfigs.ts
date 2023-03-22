/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import { Types as ValidationFieldTypes } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { Types as TransformValuesTypes } from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import {
  additionalFieldsValidationConfigEitView,
  additionalFieldsValidationConfigInputSet,
  commonFieldsTransformConfig,
  commonFieldsValidationConfig,
  ingestionFieldValidationConfig
} from '../constants'
import type { Field, InputSetViewValidateFieldsConfig } from '../types'
import type { NiktoStepData } from './NiktoStep'

const instanceFieldsTransformConfig = [
  {
    name: 'spec.instance.domain',
    type: TransformValuesTypes.Text,
    label: 'secrets.winRmAuthFormFields.domain'
  },
  {
    name: 'spec.instance.protocol',
    type: TransformValuesTypes.Text,
    label: 'ce.common.protocol'
  }
]

const instanceFieldsValidationConfig: InputSetViewValidateFieldsConfig[] = [
  {
    name: 'spec.instance.domain',
    type: ValidationFieldTypes.Text,
    label: 'secrets.winRmAuthFormFields.domain',
    isRequired: true
  },
  {
    name: 'spec.instance.protocol',
    type: ValidationFieldTypes.Text,
    label: 'ce.common.protocol',
    isRequired: true
  }
]

const orchestrationTransformFields = [
  {
    name: 'spec.instance.port',
    type: TransformValuesTypes.Text,
    label: 'common.smtp.port'
  },
  {
    name: 'spec.instance.path',
    type: TransformValuesTypes.Text,
    label: 'common.path'
  }
]

const orchestrationValidationFields: InputSetViewValidateFieldsConfig[] = [
  {
    name: 'spec.instance.port',
    type: ValidationFieldTypes.Numeric,
    label: 'common.smtp.port'
  },
  {
    name: 'spec.instance.path',
    type: ValidationFieldTypes.Text,
    label: 'common.path'
  }
]

export const transformValuesFieldsConfig = (data: NiktoStepData): Field[] => {
  const transformValuesFieldsConfigValues = [...commonFieldsTransformConfig(data), ...instanceFieldsTransformConfig]

  if (data.spec.mode === 'orchestration') {
    transformValuesFieldsConfigValues.push(...orchestrationTransformFields)
  }
  return transformValuesFieldsConfigValues
}

export const editViewValidateFieldsConfig = (data: NiktoStepData) => {
  const editViewValidationConfig = [
    ...commonFieldsValidationConfig,
    ...ingestionFieldValidationConfig(data),
    ...additionalFieldsValidationConfigEitView,
    ...instanceFieldsValidationConfig
  ]

  if (data.spec.mode === 'orchestration') {
    editViewValidationConfig.push(...orchestrationValidationFields)
  }

  return editViewValidationConfig
}

export function getInputSetViewValidateFieldsConfig(data: NiktoStepData): InputSetViewValidateFieldsConfig[] {
  const inputSetViewValidateFieldsConfig: InputSetViewValidateFieldsConfig[] = [
    ...commonFieldsValidationConfig,
    ...ingestionFieldValidationConfig(data),
    ...additionalFieldsValidationConfigInputSet,
    ...instanceFieldsValidationConfig
  ]

  if (data.spec.mode === 'orchestration') {
    inputSetViewValidateFieldsConfig.push(...orchestrationValidationFields)
  }

  return inputSetViewValidateFieldsConfig
}