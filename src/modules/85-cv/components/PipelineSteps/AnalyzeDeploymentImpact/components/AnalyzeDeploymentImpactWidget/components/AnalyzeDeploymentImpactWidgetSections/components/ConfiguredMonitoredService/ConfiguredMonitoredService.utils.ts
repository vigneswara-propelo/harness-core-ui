/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getMultiTypeFromValue, MultiTypeInputType, RUNTIME_INPUT_VALUE, SelectOption } from '@harness/uicore'
import { GetDataError } from 'restful-react'
import type { HealthSource, MonitoredServiceDTO, MonitoredServiceWithHealthSources } from 'services/cv'
import { isAnExpression } from '@cv/components/PipelineSteps/ContinousVerification/components/ContinousVerificationWidget/components/ContinousVerificationWidgetSections/components/MonitoredService/MonitoredService.utils'
import {
  AnalyzeDeploymentImpactData,
  AnalyzeStepMonitoredService
} from '@cv/components/PipelineSteps/AnalyzeDeploymentImpact/AnalyzeDeploymentImpact.types'
import { MONITORED_SERVICE_TYPE } from '@cv/components/PipelineSteps/AnalyzeDeploymentImpact/AnalyzeDeploymentImpact.constants'
import { DEFAULT_INPUT_VALUE, DEFAULT_VALUE } from './ConfiguredMonitoredService.constants'

export function isMonitoredServiceFixedInput(monitoredServiceRef: string): boolean {
  return !!(monitoredServiceRef !== RUNTIME_INPUT_VALUE && monitoredServiceRef && !isAnExpression(monitoredServiceRef))
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
  const label =
    serviceIdentifier && environmentIdentifier
      ? `${DEFAULT_VALUE} (${serviceIdentifier}_${environmentIdentifier})`
      : DEFAULT_VALUE
  let defaultOption = { label, value: DEFAULT_VALUE }
  if (isServiceAndEnvNotFixed(serviceIdentifier, environmentIdentifier)) {
    defaultOption = { label: `${DEFAULT_INPUT_VALUE}`, value: DEFAULT_VALUE }
  }
  return defaultOption
}

export function isServiceAndEnvNotFixed(serviceIdentifier: string, environmentIdentifier: string): boolean {
  return (
    getMultiTypeFromValue(serviceIdentifier) !== MultiTypeInputType.FIXED ||
    getMultiTypeFromValue(environmentIdentifier) !== MultiTypeInputType.FIXED
  )
}

export function isMonitoredServiceValidFixedInput(monitoredServiceRef: string): boolean {
  return isMonitoredServiceFixedInput(monitoredServiceRef)
}

export function getMonitoredServiceIdentifier(
  monitoredServiceRef: string,
  serviceIdentifier: string,
  environmentIdentifier: string
): string {
  let monitoredServiceIdentifier = monitoredServiceRef
  const isDefaultMonitoredService = monitoredServiceRef === DEFAULT_VALUE
  if (isDefaultMonitoredService) {
    if (getIsMonitoredServiceDefaultInput(monitoredServiceRef, serviceIdentifier, environmentIdentifier)) {
      monitoredServiceIdentifier = ''
    } else {
      monitoredServiceIdentifier = `${serviceIdentifier}_${environmentIdentifier}`
    }
  }
  return monitoredServiceIdentifier
}

export const getUpdatedSpecs = (
  monitoredServiceData: MonitoredServiceDTO | undefined,
  formValues: AnalyzeDeploymentImpactData,
  monitoredServiceRef: string
): AnalyzeDeploymentImpactData['spec'] => {
  const monitoredService = getMonitoredService(monitoredServiceRef)
  const healthSources = getHealthSourcesSpecs(monitoredServiceData)
  return { ...formValues.spec, monitoredService, healthSources }
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

export function getIsMonitoredServiceDefaultInput(
  monitoredServiceRef: string,
  serviceIdentifier: string,
  environmentIdentifier: string,
  hasMultiServiceOrEnv?: boolean,
  isTemplate?: boolean
): boolean {
  const isDefaultMonitoredService = monitoredServiceRef === DEFAULT_VALUE
  if (hasMultiServiceOrEnv && isDefaultMonitoredService) {
    return true
  }
  if (isTemplate && isDefaultMonitoredService) {
    return isDefaultMonitoredService
  }
  return isDefaultMonitoredService && isServiceAndEnvNotFixed(serviceIdentifier, environmentIdentifier)
}

export function getShouldFetchMonitoredServiceData({
  isMonitoredServiceDefaultInput,
  monitoredService,
  formValues,
  monitoredServiceRef,
  setFieldValue,
  isAccountLevel
}: {
  isAccountLevel?: boolean
  isMonitoredServiceDefaultInput: boolean
  monitoredService?: MonitoredServiceDTO
  formValues: AnalyzeDeploymentImpactData
  monitoredServiceRef: string
  setFieldValue: (field: string, value: unknown, shouldValidate?: boolean) => void
}): boolean {
  let shouldFetchMonitoredServiceData = false
  // storing if monitored service is Default Input OR RUNTIME inside formik
  if (isAccountLevel || isMonitoredServiceDefaultInput || monitoredServiceRef === RUNTIME_INPUT_VALUE) {
    updateAnalyseImpactFormik({
      monitoredService,
      formValues,
      monitoredServiceRef,
      setFieldValue,
      isMonitoredServiceDefaultInput
    })
  }
  // When monitored service is fixed
  else {
    setFieldValue('spec.isMonitoredServiceDefaultInput', false)
    shouldFetchMonitoredServiceData = isMonitoredServiceValidFixedInput(monitoredServiceRef)
  }
  return shouldFetchMonitoredServiceData
}

export function updateAnalyseImpactFormik({
  monitoredService,
  formValues,
  monitoredServiceRef,
  setFieldValue,
  isMonitoredServiceDefaultInput
}: {
  monitoredService: MonitoredServiceDTO | undefined
  formValues: AnalyzeDeploymentImpactData
  monitoredServiceRef: string
  setFieldValue: (field: string, value: unknown, shouldValidate?: boolean | undefined) => void
  isMonitoredServiceDefaultInput: boolean
}): void {
  let newSpecs = getUpdatedSpecs(monitoredService, formValues, monitoredServiceRef)
  newSpecs = { ...newSpecs, isMonitoredServiceDefaultInput } as AnalyzeDeploymentImpactData['spec']
  setFieldValue('spec', newSpecs)
}

export function checkIfMonitoredServiceIsNotPresent(message: string, monitoredServiceRef: string): boolean {
  return (
    message?.includes(`Invalid request: Monitored Source Entity with identifier ${monitoredServiceRef}`) &&
    message?.includes('is not present')
  )
}

export function getShouldRenderNotifications(
  monitoredServiceError: GetDataError<unknown> | null,
  monitoredServiceIdentifier: string,
  shouldFetchMonitoredServiceDetails: boolean,
  monitoredServiceLoading: boolean
): boolean {
  return (
    !checkIfMonitoredServiceIsNotPresent((monitoredServiceError?.data as Error)?.message, monitoredServiceIdentifier) &&
    shouldFetchMonitoredServiceDetails &&
    !monitoredServiceLoading
  )
}

export function shouldUpdateSpecs(
  shouldFetchMonitoredServiceDetails: boolean,
  monitoredService?: MonitoredServiceDTO
): boolean {
  return Boolean(monitoredService || (!monitoredService && shouldFetchMonitoredServiceDetails))
}
