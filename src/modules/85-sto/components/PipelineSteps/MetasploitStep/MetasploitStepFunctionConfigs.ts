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
  ingestionFieldValidationConfig
} from '../constants'
import type { Field, InputSetViewValidateFieldsConfig } from '../types'
import type { MetasploitStepData } from './MetasploitStep'

const instanceFieldsTransformConfig = [
  {
    name: 'spec.instance.domain',
    type: TransformValuesTypes.Text,
    label: 'platform.secrets.winRmAuthFormFields.domain'
  },
  {
    name: 'spec.instance.protocol',
    type: TransformValuesTypes.Text,
    label: 'ce.common.protocol'
  },
  {
    name: 'spec.instance.port',
    type: TransformValuesTypes.Numeric,
    label: 'platform.secrets.winRmAuthFormFields.domain'
  },
  {
    name: 'spec.instance.path',
    type: TransformValuesTypes.Text,
    label: 'ce.common.protocol'
  }
]

const instanceFieldsValidationConfig: InputSetViewValidateFieldsConfig[] = [
  {
    name: 'spec.instance.domain',
    type: ValidationFieldTypes.Text,
    label: 'platform.secrets.winRmAuthFormFields.domain',
    isRequired: true
  },
  {
    name: 'spec.instance.protocol',
    type: ValidationFieldTypes.Text,
    label: 'ce.common.protocol',
    isRequired: true
  },
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

export const transformValuesFieldsConfig = (data: MetasploitStepData): Field[] => {
  const transformValuesFieldsConfigValues = [...commonFieldsTransformConfig(data), ...instanceFieldsTransformConfig]

  return transformValuesFieldsConfigValues
}

export const editViewValidateFieldsConfig = (data: MetasploitStepData) => {
  const editViewValidationConfig = [
    ...commonFieldsValidationConfig(data),
    ...ingestionFieldValidationConfig(data),
    ...additionalFieldsValidationConfigEitView,
    ...instanceFieldsValidationConfig
  ]

  return editViewValidationConfig
}

export function getInputSetViewValidateFieldsConfig(data: MetasploitStepData): InputSetViewValidateFieldsConfig[] {
  const inputSetViewValidateFieldsConfig: InputSetViewValidateFieldsConfig[] = [
    ...commonFieldsValidationConfig(data, StepViewType.InputSet),
    ...ingestionFieldValidationConfig(data, StepViewType.InputSet),
    ...additionalFieldsValidationConfigInputSet,
    ...instanceFieldsValidationConfig
  ]

  return inputSetViewValidateFieldsConfig
}
