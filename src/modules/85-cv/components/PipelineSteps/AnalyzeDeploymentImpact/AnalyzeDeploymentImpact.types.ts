/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@harness/uicore'
import type { AllFailureStrategyConfig } from '@pipeline/components/PipelineSteps/AdvancedSteps/FailureStrategyPanel/utils'
import type { StepElementConfig } from 'services/cd-ng'
import type { VariableResponseMapValue } from 'services/pipeline-ng'
import { MONITORED_SERVICE_TYPE } from './AnalyzeDeploymentImpact.constants'

export interface AnalyzeDeploymentImpactVariableStepProps {
  metadataMap: Record<string, VariableResponseMapValue>
  stageIdentifier: string
  variablesData: AnalyzeDeploymentImpactData
  originalData: AnalyzeDeploymentImpactData
}

export interface MonitoredServiceTemplateVariable {
  name: string
  type: string
  value: string
}

export interface AnalyzeStepMonitoredServiceSpec {
  monitoredServiceRef?: string | SelectOption
  monitoredServiceTemplateRef?: string
  versionLabel?: string
}

export interface AnalyzeStepMonitoredService {
  type: MONITORED_SERVICE_TYPE | string
  spec: AnalyzeStepMonitoredServiceSpec
}

export interface AnalyzeDeploymentImpactData extends StepElementConfig {
  failureStrategies: AllFailureStrategyConfig[]
  spec: {
    duration: string
    monitoredServiceRef?: string
    healthSources?: {
      identifier: string
    }[]
    monitoredService: AnalyzeStepMonitoredService
    isMonitoredServiceDefaultInput?: boolean
  }
}
