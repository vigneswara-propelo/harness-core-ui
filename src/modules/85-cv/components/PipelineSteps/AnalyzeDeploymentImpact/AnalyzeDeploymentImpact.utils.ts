/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { FormikErrors } from 'formik'
import { isEmpty, set } from 'lodash-es'
import { getMultiTypeFromValue, MultiTypeInputType, SelectOption } from '@harness/uicore'
import type { UseStringsReturn } from 'framework/strings'
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

export function checkIfRunTimeInput(field: string | SelectOption | number | undefined): boolean {
  return getMultiTypeFromValue(field as string) === MultiTypeInputType.RUNTIME
}

export function validateField({
  fieldValue,
  fieldKey,
  data,
  errors,
  getString,
  isRequired = true
}: {
  fieldValue: string
  fieldKey: string
  data: AnalyzeDeploymentImpactData
  errors: FormikErrors<AnalyzeDeploymentImpactData>
  getString: UseStringsReturn['getString']
  isRequired: boolean
}): void {
  if (checkIfRunTimeInput(fieldValue) && isRequired && isEmpty((data?.spec as any)?.[fieldKey])) {
    set(errors, `spec.${fieldKey}`, getString('fieldRequired', { field: fieldKey }))
  }
}

export function validateMonitoredServiceForRunTimeView({
  monitoredService,
  data,
  errors,
  getString,
  isRequired = true
}: {
  monitoredService: AnalyzeStepMonitoredService | undefined
  data: AnalyzeDeploymentImpactData
  errors: FormikErrors<AnalyzeDeploymentImpactData>
  getString: UseStringsReturn['getString']
  isRequired: boolean
}): void {
  if (
    checkIfRunTimeInput(monitoredService?.spec?.monitoredServiceRef) &&
    isRequired &&
    isEmpty(data?.spec?.monitoredService?.spec?.monitoredServiceRef)
  ) {
    set(
      errors,
      `spec.monitoredService.spec.monitoredServiceRef`,
      getString('fieldRequired', { field: 'Monitored Service' })
    )
  }
}
