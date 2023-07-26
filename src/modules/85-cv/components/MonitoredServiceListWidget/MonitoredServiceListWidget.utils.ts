/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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
    ? getString('platform.connectors.cdng.monitoredService.monitoredServiceDef')
    : getString('cv.commonMonitoredServices.definition')
