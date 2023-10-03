/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import routes from '@common/RouteDefinitionsV2'
import { RouteWithContext } from '@common/router/RouteWithContext/RouteWithContext'
import { NAV_MODE, getRouteParams, pathArrayForAllScopes } from '@common/utils/routeUtils'
import { Module } from 'framework/types/ModuleName'
import {
  CD_MONITORED_SERVICE_CONFIG,
  PROJECT_MONITORED_SERVICE_CONFIG
} from './components/MonitoredServiceListWidget/MonitoredServiceListWidget.constants'
import MonitoredServiceListWidget from './components/MonitoredServiceListWidget/MonitoredServiceListWidget'
import { MonitoredServiceProvider } from './pages/monitored-service/MonitoredServiceContext'
import CommonMonitoredServiceDetails from './components/MonitoredServiceListWidget/components/CommonMonitoredServiceDetails/CommonMonitoredServiceDetails'
import { editParams } from './utils/routeUtils'
import SLODowntimePage from './pages/slos/SLODowntimePage/SLODowntimePage'
import CVCreateDowntime from './pages/slos/components/CVCreateDowntime/CVCreateDowntime'
import CVMonitoredService from './pages/monitored-service/CVMonitoredService/CVMonitoredService'

function CVSettingsRouteDestinations({ mode }: { mode: NAV_MODE }): React.ReactElement {
  const { module } = getRouteParams<{ module: Module }>()
  const monitoredServiceConfig = module === 'cd' ? CD_MONITORED_SERVICE_CONFIG : PROJECT_MONITORED_SERVICE_CONFIG
  return (
    <>
      {/* SLO Downtime */}
      <RouteWithContext exact path={pathArrayForAllScopes(routes.toCVSLODowntime, mode)}>
        <SLODowntimePage />
      </RouteWithContext>
      <RouteWithContext exact path={pathArrayForAllScopes(routes.toCVCreateSLODowntime, mode)}>
        <CVCreateDowntime />
      </RouteWithContext>
      <RouteWithContext exact path={pathArrayForAllScopes(routes.toCVEditSLODowntime, mode, { ...editParams })}>
        <CVCreateDowntime />
      </RouteWithContext>

      {/* Monitored Service */}
      <RouteWithContext path={pathArrayForAllScopes(routes.toMonitoredServicesSettings, mode)} exact>
        <MonitoredServiceListWidget config={monitoredServiceConfig} calledFromSettings={true} />
      </RouteWithContext>
      <RouteWithContext exact path={pathArrayForAllScopes(routes.toCVMonitoringServicesSettings, mode)}>
        <MonitoredServiceProvider isTemplate={false}>
          <CVMonitoredService calledFromSettings={true} />
        </MonitoredServiceProvider>
      </RouteWithContext>
      <RouteWithContext exact path={pathArrayForAllScopes(routes.toAddMonitoredServicesSettings, mode)}>
        <MonitoredServiceProvider isTemplate={false}>
          <CommonMonitoredServiceDetails config={monitoredServiceConfig} calledFromSettings={true} />
        </MonitoredServiceProvider>
      </RouteWithContext>
      <RouteWithContext
        path={pathArrayForAllScopes(routes.toMonitoredServicesConfigurations, mode, { ...editParams })}
        exact
      >
        <CommonMonitoredServiceDetails config={monitoredServiceConfig} calledFromSettings={true} />
      </RouteWithContext>
    </>
  )
}

export default CVSettingsRouteDestinations
