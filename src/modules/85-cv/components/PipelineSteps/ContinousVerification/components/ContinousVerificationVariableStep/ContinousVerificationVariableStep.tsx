/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { pick } from 'lodash-es'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'

import type { ContinousVerificationData } from '../../types'
import type { ContinousVerificationVariableStepProps } from './types'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

export function ContinousVerificationVariableStep(props: ContinousVerificationVariableStepProps): React.ReactElement {
  const {
    variablesData = {} as ContinousVerificationData,
    originalData = {} as ContinousVerificationData,
    metadataMap
  } = props
  const data: any = pick(variablesData.spec.spec, [
    'serviceRef',
    'envRef',
    'sensitivity',
    'duration',
    'baseline',
    'deploymentTag',
    'trafficsplit'
  ])

  return (
    <VariablesListTable
      className={pipelineVariableCss.variablePaddingL2}
      data={data}
      originalData={originalData?.spec?.spec}
      metadataMap={metadataMap}
    />
  )
}
