/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultMonitoredServiceSpec, MONITORED_SERVICE_TYPE } from './AnalyzeDeploymentImpact.constants'
import { AnalyzeDeploymentImpactData, AnalyzeStepMonitoredService } from './AnalyzeDeploymentImpact.types'

export function getMonitoredServiceYamlData(spec: AnalyzeDeploymentImpactData['spec']): AnalyzeStepMonitoredService {
  let monitoredService: AnalyzeStepMonitoredService = defaultMonitoredServiceSpec

  switch (spec?.monitoredService?.type) {
    case MONITORED_SERVICE_TYPE.DEFAULT:
      monitoredService = defaultMonitoredServiceSpec
      break
    case MONITORED_SERVICE_TYPE.CONFIGURED:
      monitoredService = {
        type: MONITORED_SERVICE_TYPE.CONFIGURED,
        spec: {
          monitoredServiceRef: getMonitoredServiceRef(spec)
        }
      }
      break
    default:
      monitoredService = defaultMonitoredServiceSpec
  }
  return monitoredService
}

export function getMonitoredServiceRef(spec: AnalyzeDeploymentImpactData['spec']): string {
  return spec?.monitoredService?.spec?.monitoredServiceRef as string
}

/**
 * returns forms data for spec field.
 * @param specInfo
 * @returns spec
 */
export function getSpecFormData(spec: AnalyzeDeploymentImpactData['spec']): AnalyzeDeploymentImpactData['spec'] {
  let monitoredService = { ...spec?.monitoredService }
  if (spec?.monitoredService?.type === MONITORED_SERVICE_TYPE.DEFAULT) {
    monitoredService = { ...monitoredService, spec: { monitoredServiceRef: MONITORED_SERVICE_TYPE.DEFAULT } }
  }
  return { ...spec, monitoredService }
}
