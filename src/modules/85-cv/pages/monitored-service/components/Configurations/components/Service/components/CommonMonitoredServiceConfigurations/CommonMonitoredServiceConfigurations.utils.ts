/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Views } from '@harness/uicore'
import type { History } from 'history'
import type { MonitoredServiceConfig } from '@cv/components/MonitoredServiceListWidget/MonitoredServiceListWidget.types'
import { Module } from 'framework/types/ModuleName'
import { getSearchString } from '@cv/utils/CommonUtils'
import routes from '@common/RouteDefinitions'
import { MonitoredServiceEnum } from '@cv/pages/monitored-service/MonitoredServicePage.constants'

export function handleTabChange({
  nextTab,
  tab,
  config,
  history,
  accountId,
  orgIdentifier,
  projectIdentifier,
  identifier,
  view,
  notificationTime,
  isTemplate
}: {
  nextTab: MonitoredServiceEnum
  tab: MonitoredServiceEnum
  config?: MonitoredServiceConfig
  history: History
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
  identifier: string
  view?: Views
  notificationTime?: number
  isTemplate?: boolean
}): void {
  if (nextTab !== tab && !isTemplate && identifier) {
    if (config) {
      history.push({
        pathname: routes.toMonitoredServicesConfigurations({
          accountId,
          orgIdentifier,
          projectIdentifier,
          identifier,
          ...(config?.module && { module: config.module as Module })
        }),
        search: getSearchString({ view, tab, subTab: nextTab, notificationTime })
      })
    } else {
      history.push({
        pathname: routes.toCVAddMonitoringServicesEdit({
          accountId,
          orgIdentifier,
          projectIdentifier,
          identifier,
          module: 'cv'
        }),
        search: getSearchString({ view, tab, subTab: nextTab, notificationTime })
      })
    }
  }
}
