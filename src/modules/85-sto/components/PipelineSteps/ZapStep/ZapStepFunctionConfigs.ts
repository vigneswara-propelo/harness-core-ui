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
  imageFieldsValidationConfig,
  ingestionFieldValidationConfig
} from '../constants'
import type { Field, InputSetViewValidateFieldsConfig } from '../types'
import type { ZapStepData } from './ZapStep'

const instanceFieldsTransformConfig = (data: ZapStepData) =>
  data.spec.mode === 'orchestration'
    ? [
        {
          name: 'spec.instance.domain',
          type: TransformValuesTypes.Text,
          label: 'secrets.winRmAuthFormFields.domain'
        },
        {
          name: 'spec.instance.protocol',
          type: TransformValuesTypes.Text,
          label: 'ce.common.protocol'
        },
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
    : []

const instanceFieldsValidationConfig = (data: ZapStepData) =>
  data.spec.mode === 'orchestration'
    ? ([
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
      ] as InputSetViewValidateFieldsConfig[])
    : []

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

const toolFieldsValidationConfig = (data: ZapStepData): InputSetViewValidateFieldsConfig[] =>
  data.spec.mode === 'orchestration'
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
    ...commonFieldsValidationConfig,
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
    ...commonFieldsValidationConfig,
    ...ingestionFieldValidationConfig(data),
    ...imageFieldsValidationConfig(data),
    ...additionalFieldsValidationConfigInputSet,
    ...instanceFieldsValidationConfig(data),
    ...toolFieldsValidationConfig(data)
  ]

  return inputSetViewValidateFieldsConfig
}
