/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getErrorMessage } from '@cv/utils/CommonUtils'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { isTemplatizedView } from '@pipeline/utils/stepUtils'
import { GetStageServiceAndEnvArgs, GetStageServiceAndEnvReturn } from './AnalyzeDeploymentImpactWidgetSections.types'

export async function getStageServiceAndEnv({
  pipeline,
  selectedStage,
  selectedStageId,
  getDeploymentStageMeta
}: GetStageServiceAndEnvArgs): Promise<GetStageServiceAndEnvReturn> {
  const data = {
    serviceIdentifier: '',
    environmentIdentifier: '',
    hasMultiServiceOrEnv: false,
    errorInfo: ''
  }
  if (pipeline && selectedStage) {
    try {
      const stageMeta = await getDeploymentStageMeta({
        pipelineYaml: yamlStringify({ pipeline }),
        stageIdentifier: selectedStageId as string
      })
      const { serviceEnvRefList = [] } = stageMeta?.data || {}
      if (serviceEnvRefList.length === 1) {
        data.serviceIdentifier = serviceEnvRefList[0]?.serviceRef || ''
        data.environmentIdentifier = serviceEnvRefList[0]?.environmentRef || ''
      } else if (serviceEnvRefList.length > 1) {
        data.hasMultiServiceOrEnv = true
      }
    } catch (errorInfo) {
      data['errorInfo'] = getErrorMessage(errorInfo) || ''
    }
  }
  return data
}

export function getShouldRenderConfiguredMonitoredService({
  serviceIdentifier,
  environmentIdentifier,
  stepViewType,
  hasMultiServiceOrEnvVaue
}: {
  serviceIdentifier: string
  environmentIdentifier: string
  stepViewType?: StepViewType
  hasMultiServiceOrEnvVaue?: boolean
}): boolean {
  return Boolean(
    isTemplatizedView(stepViewType) ||
      stepViewType === StepViewType.Template ||
      (stepViewType === StepViewType.Edit && serviceIdentifier && environmentIdentifier) ||
      (stepViewType === StepViewType.Edit && hasMultiServiceOrEnvVaue)
  )
}
