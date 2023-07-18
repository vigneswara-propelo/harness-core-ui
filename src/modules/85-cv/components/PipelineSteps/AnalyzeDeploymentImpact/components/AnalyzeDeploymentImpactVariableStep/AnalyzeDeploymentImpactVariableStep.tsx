import React from 'react'
import { pick } from 'lodash-es'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'

import { VariableResponseMapValue } from 'services/pipeline-ng'
import { AnalyzeDeploymentImpactData } from '../../AnalyzeDeploymentImpact.types'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

export interface AnalyzeDeploymentImpactVariableStepProps {
  metadataMap: Record<string, VariableResponseMapValue>
  stageIdentifier: string
  variablesData: AnalyzeDeploymentImpactData
  originalData: AnalyzeDeploymentImpactData
}

export default function AnalyzeDeploymentImpactVariableStep(
  props: AnalyzeDeploymentImpactVariableStepProps
): JSX.Element {
  const { variablesData = {} as AnalyzeDeploymentImpactData, originalData, metadataMap } = props

  const data = pick(variablesData.spec, [
    'serviceRef',
    'envRef',
    'monitoredService.spec.monitoredServiceRef',
    'duration'
  ])

  return (
    <VariablesListTable
      className={pipelineVariableCss.variablePaddingL2}
      data={data}
      originalData={originalData?.spec}
      metadataMap={metadataMap}
    />
  )
}
