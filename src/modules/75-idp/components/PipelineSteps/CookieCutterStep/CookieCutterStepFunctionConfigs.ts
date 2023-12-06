/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Types as ValidationFieldTypes } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { Types as TransformValuesTypes } from '../utils'

export const transformValuesFieldsConfig = [
  {
    name: 'identifier',
    type: TransformValuesTypes.Text
  },
  {
    name: 'name',
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.templateType',
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.publicTemplateUrl',
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.outputDirectory',
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.cookieCutterVariables',
    type: TransformValuesTypes.Map
  }
]

export const getInputSetViewValidateFieldsConfig = (
  isRequired = true
): Array<{ name: string; type: ValidationFieldTypes; label?: string; isRequired?: boolean }> => {
  return [
    {
      name: 'spec.publicTemplateUrl',
      type: ValidationFieldTypes.Text,
      label: 'idp.cookieCutterStep.cookieCutterTemplateURL',
      isRequired
    }
  ]
}

export const editViewValidateFieldsConfig = [
  {
    name: 'identifier',
    type: ValidationFieldTypes.Identifier,
    label: 'identifier',
    isRequired: true
  },
  {
    name: 'name',
    type: ValidationFieldTypes.Name,
    label: 'pipelineSteps.stepNameLabel',
    isRequired: true
  },
  {
    name: 'spec.publicTemplateUrl',
    type: ValidationFieldTypes.Text,
    label: 'idp.cookieCutterStep.cookieCutterTemplateURL'
  }
  //   {
  //     name: 'spec.cookieCutterVariables',
  //     type: ValidationFieldTypes.KeyValue,
  //     label: 'idp.cookieCutterStep.cookieCutterVariables'
  //   }
]
