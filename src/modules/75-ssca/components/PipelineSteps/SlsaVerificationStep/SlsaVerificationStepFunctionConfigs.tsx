/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Types as TransformValuesTypes } from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import { Types as ValidationFieldTypes } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { StringKeys } from 'framework/strings'

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
    name: 'spec.source.type',
    type: TransformValuesTypes.List
  },
  {
    name: 'spec.source.spec.connector',
    type: TransformValuesTypes.ConnectorRef
  },
  {
    name: 'spec.source.spec.image_path',
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.source.spec.tag',
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.verify_attestation.type',
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.verify_attestation.spec.public_key',
    type: TransformValuesTypes.Text
  },
  {
    name: 'timeout',
    type: TransformValuesTypes.Text
  }
]

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
    name: 'spec.verify_attestation.spec.public_key',
    type: ValidationFieldTypes.Text,
    label: 'ssca.publicKey'
  },
  {
    name: 'spec.source.type',
    type: ValidationFieldTypes.List,
    label: 'pipeline.artifactsSelection.artifactType'
  },
  {
    name: 'spec.source.spec.connector',
    type: ValidationFieldTypes.Text,
    label: 'pipelineSteps.connectorLabel',
    isRequired: true
  },
  {
    name: 'spec.source.spec.image_path',
    type: ValidationFieldTypes.Text,
    label: 'imageLabel',
    isRequired: true
  },
  {
    name: 'spec.source.spec.tag',
    type: ValidationFieldTypes.Text,
    label: 'tagLabel',
    isRequired: true
  },
  {
    name: 'timeout',
    type: ValidationFieldTypes.Timeout,
    label: 'pipelineSteps.timeoutLabel'
  }
]

export const getInputSetViewValidateFieldsConfig = (
  // Called only with required
  /* istanbul ignore next */
  isRequired = true
): Array<{ name: string; type: ValidationFieldTypes; label?: StringKeys; isRequired?: boolean }> => {
  return [
    {
      name: 'spec.source.spec.connector',
      type: ValidationFieldTypes.Text,
      label: 'pipelineSteps.connectorLabel',
      isRequired
    },
    {
      name: 'spec.source.spec.image_path',
      type: ValidationFieldTypes.Text,
      label: 'imageLabel',
      isRequired
    },
    {
      name: 'spec.source.spec.tag',
      type: ValidationFieldTypes.Text,
      label: 'tagLabel',
      isRequired
    },
    {
      name: 'spec.verify_attestation.spec.public_key',
      type: ValidationFieldTypes.Text,
      label: 'ssca.publicKey'
    },
    {
      name: 'timeout',
      type: ValidationFieldTypes.Timeout,
      label: 'pipelineSteps.timeoutLabel'
    }
  ]
}
