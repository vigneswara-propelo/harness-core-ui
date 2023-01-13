/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { UseStringsReturn } from 'framework/strings'
import { Types as ValidationFieldTypes } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { Types as TransformValuesTypes } from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import type { InputSetViewValidateFieldsConfig, SecurityStepData, SecurityStepSpec } from './types'

type optionsProps = UseStringsReturn['getString']

export const dividerBottomMargin = 'var(--spacing-6)'

export const ORCHESTRATION_SCAN_MODE = {
  value: 'orchestration',
  label: 'Orchestration'
}
export const EXTRACTION_SCAN_MODE = {
  value: 'extraction',
  label: 'Extraction'
}
export const INGESTION_SCAN_MODE = {
  value: 'ingestion',
  label: 'Ingestion'
}
export const REPOSITORY_TARGET_TYPE = {
  value: 'repository',
  label: 'Repository'
}
export const CONTAINER_TARGET_TYPE = {
  value: 'container',
  label: 'Container Image'
}
export const LOCAL_IMAGE_CONTAINER_TYPE = {
  value: 'local_image',
  label: 'Local Image'
}
export const DOCKER_V2_CONTAINER_TYPE = {
  value: 'docker_v2',
  label: 'Docker v2'
}
export const JFROG_ARTIFACTORY_CONTAINER_TYPE = {
  value: 'jfrog_artifactory',
  label: 'Jfrog Artifactory'
}
export const AWS_ECR_CONTAINER_TYPE = {
  value: 'aws_ecr',
  label: 'AWS ECR'
}

export const logLevelOptions = (getString: optionsProps) => [
  {
    label: getString('sto.stepField.optionLabels.logLevel.debug'),
    value: 'debug'
  },
  {
    label: getString('sto.Info'),
    value: 'info'
  },
  {
    label: getString('common.warning'),
    value: 'warning'
  },
  {
    label: getString('error'),
    value: 'error'
  }
]

export const severityOptions = (getString: optionsProps) => [
  {
    label: getString('sto.Critical'),
    value: 'critical'
  },
  {
    label: getString('connectors.cdng.verificationSensitivityLabel.high'),
    value: 'high'
  },
  {
    label: getString('connectors.cdng.verificationSensitivityLabel.medium'),
    value: 'medium'
  },
  {
    label: getString('connectors.cdng.verificationSensitivityLabel.low'),
    value: 'low'
  },
  {
    label: getString('none'),
    value: 'none'
  }
]

const specPrivileged = 'spec.privileged'
const specSettings = 'spec.settings'
const specRunAsUser = 'spec.runAsUser'

export const authFieldsTransformConfig = (data: SecurityStepData<SecurityStepSpec>) =>
  data.spec.mode === 'orchestration'
    ? [
        {
          name: 'spec.auth.accessToken',
          type: TransformValuesTypes.Text
        },
        {
          name: 'spec.auth.domain',
          type: TransformValuesTypes.Text
        },
        {
          name: 'spec.auth.ssl',
          type: TransformValuesTypes.Boolean
        }
      ]
    : []

export const commonFieldsTransformConfig = (data: SecurityStepData<SecurityStepSpec>) => {
  const transformValuesFieldsConfigValues = [
    {
      name: 'identifier',
      type: TransformValuesTypes.Text
    },
    {
      name: 'name',
      type: TransformValuesTypes.Text
    },
    {
      name: 'description',
      type: TransformValuesTypes.Text
    },
    {
      name: 'spec.mode',
      type: TransformValuesTypes.Map
    },
    {
      name: 'spec.config',
      type: TransformValuesTypes.Text
    },
    {
      name: 'spec.target.name',
      type: TransformValuesTypes.Text
    },
    {
      name: 'spec.target.type',
      type: TransformValuesTypes.Text
    },
    {
      name: 'spec.target.variant',
      type: TransformValuesTypes.Text
    },
    {
      name: 'spec.advanced.log.level',
      type: TransformValuesTypes.Text
    },
    {
      name: 'spec.advanced.log.serializer',
      type: TransformValuesTypes.Text
    },
    // { // for future implementation
    //   name: 'spec.advanced.args.passthrough',
    //   type: TransformValuesTypes.Text
    // },
    {
      name: 'spec.advanced.fail_on_severity',
      type: TransformValuesTypes.Text
    },
    {
      name: 'spec.advanced.include_raw',
      type: TransformValuesTypes.Text
    },
    {
      name: specSettings,
      type: TransformValuesTypes.Map
    },
    {
      name: 'spec.limitMemory',
      type: TransformValuesTypes.LimitMemory
    },
    {
      name: 'spec.limitCPU',
      type: TransformValuesTypes.LimitCPU
    },
    {
      name: 'timeout',
      type: TransformValuesTypes.Text
    },
    {
      name: specPrivileged,
      type: TransformValuesTypes.Boolean
    },
    {
      name: specRunAsUser,
      type: TransformValuesTypes.Boolean
    },
    {
      name: 'spec.imagePullPolicy',
      type: TransformValuesTypes.ImagePullPolicy
    }
  ]

  if (data.spec.target.type === 'container' && data.spec.image?.type === 'aws_ecr') {
    transformValuesFieldsConfigValues.push({
      name: 'spec.image.region',
      type: TransformValuesTypes.Text
    })
  }
  if (data.spec.target.type === 'container' && data.spec.image?.type === 'local_image') {
    transformValuesFieldsConfigValues.push(
      {
        name: 'spec.image.access_token',
        type: TransformValuesTypes.Text
      },
      {
        name: 'spec.image.access_id',
        type: TransformValuesTypes.Text
      }
    )
  }

  if (data.spec.target.type === 'container' && data.spec.mode === 'orchestration') {
    transformValuesFieldsConfigValues.push(
      {
        name: 'spec.image.type',
        type: TransformValuesTypes.Text
      },
      {
        name: 'spec.image.name',
        type: TransformValuesTypes.Text
      },
      {
        name: 'spec.image.domain',
        type: TransformValuesTypes.Text
      }
    )
  }

  if (data.spec.mode === 'ingestion') {
    transformValuesFieldsConfigValues.push({
      name: 'spec.ingestion.file',
      type: TransformValuesTypes.Text
    })
  }

  if (data.spec.mode !== 'ingestion') {
    transformValuesFieldsConfigValues.push({
      name: 'spec.advanced.args.cli',
      type: TransformValuesTypes.Text
    })
  }

  if (data.spec.mode === 'orchestration') {
    transformValuesFieldsConfigValues.push({
      name: 'spec.target.workspace',
      type: TransformValuesTypes.Text
    })
  }

  return transformValuesFieldsConfigValues
}

export const authFieldsValidationConfig = (
  data: SecurityStepData<SecurityStepSpec>
): InputSetViewValidateFieldsConfig[] => [
  {
    name: 'spec.auth.accessToken',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.authToken',
    isRequired: data.spec.mode !== 'ingestion'
  },
  {
    name: 'spec.auth.domain',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.authDomain'
  },
  {
    name: 'spec.auth.ssl',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.authSsl'
  }
]

export const ingestionFieldValidationConfig = (
  data: SecurityStepData<SecurityStepSpec>
): InputSetViewValidateFieldsConfig[] => [
  {
    name: 'spec.ingestion.file',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.ingestion.file',
    isRequired: data.spec.mode === 'ingestion'
  }
]

export const imageFieldsValidationConfig = (
  data: SecurityStepData<SecurityStepSpec>
): InputSetViewValidateFieldsConfig[] => [
  {
    name: 'spec.image.type',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.image.type',
    isRequired: data.spec.target?.type === 'container' && data.spec.mode === 'orchestration'
  },
  {
    name: 'spec.image.name',
    type: ValidationFieldTypes.Text,
    label: 'imageNameLabel',
    isRequired: data.spec.target?.type === 'container' && data.spec.mode === 'orchestration'
  },
  {
    name: 'spec.image.domain',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.image.domain',
    isRequired: data.spec.target?.type === 'container' && data.spec.mode === 'orchestration'
  },
  {
    name: 'spec.image.access_token',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.image.token',
    isRequired: data.spec.target?.type === 'container' && data.spec.mode === 'orchestration'
  },
  {
    name: 'spec.image.region',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.image.region',
    isRequired: data.spec.image?.type === 'aws_ecr'
  },
  {
    name: 'spec.image.access_id',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.image.accessId',
    isRequired: data.spec.image?.type === 'local_image'
  }
]

export const commonFieldsValidationConfig: InputSetViewValidateFieldsConfig[] = [
  {
    name: 'spec.mode',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.mode',
    isRequired: true
  },
  {
    name: 'spec.config',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.config',
    isRequired: true
  },
  {
    name: 'spec.target.name',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.target.name',
    isRequired: true
  },
  {
    name: 'spec.target.type',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.target.type',
    isRequired: true
  },
  {
    name: 'spec.target.variant',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.target.variant',
    isRequired: true
  },
  {
    name: 'spec.target.workspace',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.target.workspace'
  },
  {
    name: 'spec.advanced.log.level',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.advanced.logLevel'
  },
  {
    name: 'spec.advanced.log.serializer',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.advanced.serializer'
  },
  {
    name: 'spec.advanced.args.cli',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.advanced.cli'
  },
  // { // for future implementation
  //   name: 'spec.advanced.args.passthrough',
  //   type: ValidationFieldTypes.Text,
  //   label: 'sto.stepField.advanced.passthrough'
  // },
  {
    name: 'spec.advanced.fail_on_severity',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.advanced.failOnSeverity'
  },
  {
    name: 'spec.advanced.include_raw',
    type: ValidationFieldTypes.Boolean,
    label: 'sto.stepField.advanced.includeRaw'
  },
  {
    name: specSettings,
    type: ValidationFieldTypes.Map
  },
  {
    name: specRunAsUser,
    type: ValidationFieldTypes.Numeric
  },
  {
    name: specPrivileged,
    type: ValidationFieldTypes.Boolean,
    label: 'pipeline.buildInfra.privileged'
  },
  {
    name: 'timeout',
    type: ValidationFieldTypes.Timeout
  },
  {
    name: 'spec.limitMemory',
    type: ValidationFieldTypes.LimitMemory
  },
  {
    name: 'spec.limitCPU',
    type: ValidationFieldTypes.LimitCPU
  }
]

export const additionalFieldsValidationConfigEitView = [
  {
    name: 'spec.limitMemory',
    type: ValidationFieldTypes.LimitMemory
  },
  {
    name: 'spec.limitCPU',
    type: ValidationFieldTypes.LimitCPU
  }
]

export const additionalFieldsValidationConfigInputSet = [
  {
    name: 'spec.limitMemory',
    type: ValidationFieldTypes.LimitMemory
  },
  {
    name: 'spec.limitCPU',
    type: ValidationFieldTypes.LimitCPU
  }
]
