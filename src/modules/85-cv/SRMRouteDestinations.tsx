/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Switch } from 'react-router-dom'

import routes from '@common/RouteDefinitionsV2'
import { RouteWithContext } from '@common/router/RouteWithContext/RouteWithContext'
import { NAV_MODE, modulePathProps, projectPathProps } from '@common/utils/routeUtils'
import { CD_MONITORED_SERVICE_CONFIG } from './components/MonitoredServiceListWidget/MonitoredServiceListWidget.constants'
import MonitoredServiceListWidget from './components/MonitoredServiceListWidget/MonitoredServiceListWidget'
import { MonitoredServiceProvider } from './pages/monitored-service/MonitoredServiceContext'
import CommonMonitoredServiceDetails from './components/MonitoredServiceListWidget/components/CommonMonitoredServiceDetails/CommonMonitoredServiceDetails'
import { editParams } from './utils/routeUtils'

interface SRMRouteDestinationProps {
  mode: NAV_MODE
}

function SRMRouteDestinations({ mode = NAV_MODE.MODULE }: SRMRouteDestinationProps): React.ReactElement {
  return (
    <Switch>
      <RouteWithContext path={routes.toMonitoredServices({ ...modulePathProps, ...projectPathProps, mode })} exact>
        <MonitoredServiceListWidget config={CD_MONITORED_SERVICE_CONFIG} />
      </RouteWithContext>

      <RouteWithContext
        exact
        path={routes.toAddMonitoredServices({
          ...modulePathProps,
          ...projectPathProps,
          mode
        })}
      >
        <MonitoredServiceProvider isTemplate={false}>
          <CommonMonitoredServiceDetails config={CD_MONITORED_SERVICE_CONFIG} />
        </MonitoredServiceProvider>
      </RouteWithContext>

      <RouteWithContext
        path={routes.toMonitoredServicesConfigurations({
          ...modulePathProps,
          ...projectPathProps,
          ...editParams
        })}
        exact
      >
        <CommonMonitoredServiceDetails config={CD_MONITORED_SERVICE_CONFIG} />
      </RouteWithContext>
    </Switch>
  )
}

export default SRMRouteDestinations
