/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { flatObject } from '@ci/components/PipelineSteps/StepsFlatObject'
import type { ProwlerStepData } from './ProwlerStep'

export interface ProwlerStepVariablesProps {
  initialValues: ProwlerStepData
  stageIdentifier: string
  onUpdate?(data: ProwlerStepData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: ProwlerStepData
}

export const ProwlerStepVariables: React.FC<ProwlerStepVariablesProps> = ({
  variablesData,
  metadataMap,
  initialValues
}) => <VariablesListTable data={flatObject(variablesData)} originalData={initialValues} metadataMap={metadataMap} />
