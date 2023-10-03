/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import routes from '@common/RouteDefinitionsV2'
import { RouteWithContext } from '@common/router/RouteWithContext/RouteWithContext'
import {
  NAV_MODE,
  environmentGroupPathProps,
  environmentPathProps,
  pathArrayForAllScopes,
  servicePathProps
} from '@common/utils/routeUtils'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import { LicenseRedirectProps } from 'framework/LicenseStore/LicenseStoreContext'
import WebhookEvents from '@modules/70-pipeline/pages/webhooks/WebhookEvents/WebhookEvents'
import { Webhooks } from '@modules/70-pipeline/pages/webhooks/Webhooks'
import { Services } from './components/Services/Services'
import ServiceStudio from './components/Services/ServiceStudio/ServiceStudio'
import { EnvironmentsPage } from './RouteDestinations'
import EnvironmentDetails from './components/EnvironmentsV2/EnvironmentDetails/EnvironmentDetails'
import EnvironmentGroupsPage from './components/EnvironmentGroups/EnvironmentGroups'
import EnvironmentGroupDetails from './components/EnvironmentGroups/EnvironmentGroupDetails/EnvironmentGroupDetails'
import ServiceOverrides from './components/ServiceOverrides/ServiceOverrides'

interface CDSettingsRouteDestinationProps {
  mode: NAV_MODE
  licenseRedirectData?: LicenseRedirectProps
}

function CDSettingsRouteDestinations({
  mode,
  licenseRedirectData
}: CDSettingsRouteDestinationProps): React.ReactElement {
  return (
    <>
      <RouteWithContext exact path={pathArrayForAllScopes(routes.toSettingsServices, mode)}>
        <Services calledFromSettingsPage={true} />
      </RouteWithContext>
      <RouteWithContext
        exact
        path={pathArrayForAllScopes(routes.toSettingsServiceDetails, mode, { ...servicePathProps })}
      >
        <ServiceStudio />
      </RouteWithContext>
      <RouteWithContext exact path={pathArrayForAllScopes(routes.toSettingsEnvironments, mode)}>
        <EnvironmentsPage calledFromSettingsPage={true} />
      </RouteWithContext>
      <RouteWithContext
        exact
        path={pathArrayForAllScopes(routes.toSettingsEnvironmentDetails, mode, { ...environmentPathProps })}
      >
        <EnvironmentDetails />
      </RouteWithContext>
      <RouteWithContext
        exact
        path={pathArrayForAllScopes(routes.toSettingsEnvironmentGroups, mode)}
        pageName={PAGE_NAME.EnvironmentGroups}
        licenseRedirectData={licenseRedirectData}
      >
        <EnvironmentGroupsPage calledFromSettingsPage={true} />
      </RouteWithContext>
      <RouteWithContext
        exact
        path={pathArrayForAllScopes(routes.toSettingsEnvironmentGroupDetails, mode, { ...environmentGroupPathProps })}
        licenseRedirectData={licenseRedirectData}
        pageName={PAGE_NAME.EnvironmentGroupDetails}
      >
        <EnvironmentGroupDetails />
      </RouteWithContext>
      <RouteWithContext exact path={pathArrayForAllScopes(routes.toSettingsServiceOverrides, mode)}>
        <ServiceOverrides />
      </RouteWithContext>

      <RouteWithContext
        exact
        path={pathArrayForAllScopes(routes.toWebhooksSettings, mode)}
        pageName={PAGE_NAME.Webhooks}
      >
        <Webhooks />
      </RouteWithContext>
      <RouteWithContext
        exact
        path={pathArrayForAllScopes(routes.toWebhooksEventsSettings, mode)}
        pageName={PAGE_NAME.WebhookEvents}
      >
        <WebhookEvents />
      </RouteWithContext>
    </>
  )
}

export default CDSettingsRouteDestinations
