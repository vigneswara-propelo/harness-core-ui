/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getMultiTypeFromValue, MultiTypeInputType, RUNTIME_INPUT_VALUE, SelectOption } from '@harness/uicore'
import type {
  HealthSource,
  MonitoredServiceDTO,
  MonitoredServiceWithHealthSources,
  ResponseMonitoredServiceResponse
} from 'services/cv'
import { isAnExpression } from '@cv/components/PipelineSteps/ContinousVerification/components/ContinousVerificationWidget/components/ContinousVerificationWidgetSections/components/MonitoredService/MonitoredService.utils'
import {
  AnalyzeDeploymentImpactData,
  AnalyzeStepMonitoredService
} from '@cv/components/PipelineSteps/AnalyzeDeploymentImpact/AnalyzeDeploymentImpact.types'
import { MONITORED_SERVICE_TYPE } from '@cv/components/PipelineSteps/AnalyzeDeploymentImpact/AnalyzeDeploymentImpact.constants'

export function isMonitoredServiceFixedInput(monitoredServiceRef: string): boolean {
  return !!(monitoredServiceRef !== RUNTIME_INPUT_VALUE && monitoredServiceRef && !isAnExpression(monitoredServiceRef))
}

export function isFirstTimeOpenForConfiguredMonitoredSvc(
  formValues: AnalyzeDeploymentImpactData,
  monitoredServiceData: ResponseMonitoredServiceResponse | null
): boolean {
  return !!(!formValues?.spec?.monitoredServiceRef && monitoredServiceData?.data?.monitoredService?.identifier)
}

export function getMonitoredServiceOptions(
  serviceIdentifier: string,
  environmentIdentifier: string,
  monitoredServiceWithHealthSources?: MonitoredServiceWithHealthSources[]
): SelectOption[] {
  let options = []
  const defaultOption = getDefaultOption(serviceIdentifier, environmentIdentifier)
  const monitoredServiceOptions =
    monitoredServiceWithHealthSources?.map(monitoredService => ({
      label: monitoredService.name ?? '',
      value: monitoredService.identifier ?? ''
    })) ?? []
  options = [defaultOption, ...monitoredServiceOptions]
  return options
}

export function getDefaultOption(serviceIdentifier: string, environmentIdentifier: string): SelectOption {
  let defaultOption = { label: `Default (${serviceIdentifier}_${environmentIdentifier})`, value: 'Default' }
  if (isServiceAndEnvNotFixed(serviceIdentifier, environmentIdentifier)) {
    defaultOption = { label: `Default <+input>`, value: 'Default' }
  }
  return defaultOption
}

export function isServiceAndEnvNotFixed(serviceIdentifier: string, environmentIdentifier: string): boolean {
  return (
    getMultiTypeFromValue(serviceIdentifier) !== MultiTypeInputType.FIXED ||
    getMultiTypeFromValue(environmentIdentifier) !== MultiTypeInputType.FIXED
  )
}

export function isMonitoredServiceValidFixedInput(
  monitoredServiceRef: string,
  serviceIdentifier: string,
  environmentIdentifier: string
): boolean {
  return (
    isMonitoredServiceFixedInput(monitoredServiceRef) &&
    !isServiceAndEnvNotFixed(serviceIdentifier, environmentIdentifier)
  )
}

export function getMonitoredServiceIdentifier(
  monitoredServiceRef: string,
  serviceIdentifier: string,
  environmentIdentifier: string
): string {
  let monitoredServiceIdentifier = monitoredServiceRef
  if (monitoredServiceRef === 'Default') {
    monitoredServiceIdentifier = `${serviceIdentifier}_${environmentIdentifier}`
  }
  return monitoredServiceIdentifier
}

export function getMonitoredServiceNotPresentErrorMessage(monitoredServiceRef: string): string {
  return `Invalid request: Monitored Source Entity with identifier ${monitoredServiceRef} is not present`
}

export const getUpdatedSpecs = (
  monitoredServiceData: MonitoredServiceDTO | undefined,
  formValues: AnalyzeDeploymentImpactData,
  monitoredServiceRef: string
): AnalyzeDeploymentImpactData['spec'] => {
  const monitoredService = getMonitoredService(monitoredServiceRef)
  const healthSources = getHealthSourcesSpecs(monitoredServiceData)
  return { ...formValues.spec, monitoredService, healthSources, monitoredServiceRef }
}

function getMonitoredService(monitoredServiceRef: string): AnalyzeStepMonitoredService {
  let monitoredService: AnalyzeStepMonitoredService = {
    type: MONITORED_SERVICE_TYPE.CONFIGURED,
    spec: { monitoredServiceRef }
  }
  if (monitoredServiceRef === MONITORED_SERVICE_TYPE.DEFAULT) {
    monitoredService = {
      ...monitoredService,
      type: MONITORED_SERVICE_TYPE.DEFAULT
    }
  }
  return monitoredService
}

function getHealthSourcesSpecs(monitoredServiceData: MonitoredServiceDTO | undefined): {
  identifier: string
}[] {
  return (
    monitoredServiceData?.sources?.healthSources?.map(el => {
      return { identifier: (el as HealthSource)?.identifier as string }
    }) || []
  )
}
