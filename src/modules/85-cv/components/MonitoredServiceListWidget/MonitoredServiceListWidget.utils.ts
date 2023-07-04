import { UseStringsReturn } from 'framework/strings'
import type { Module } from 'framework/types/ModuleName'
import type { MonitoredServiceConfig } from './MonitoredServiceListWidget.types'

export function getIfModuleIsCD(config?: MonitoredServiceConfig): boolean {
  return config?.module === 'cd'
}

export const getListingNoDataCardMessage = (
  getString: UseStringsReturn['getString'],
  appliedSearchAndFilter: boolean,
  module?: Module | string
): string =>
  appliedSearchAndFilter
    ? getString('cv.monitoredServices.youHaveNoMonitoredServices')
    : module
    ? getString('connectors.cdng.monitoredService.monitoredServiceDef')
    : getString('cv.commonMonitoredServices.definition')
