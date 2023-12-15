/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { PageSpinner } from '@harness/uicore'
import routes from '@common/RouteDefinitionsV2'
import { RouteWithContext } from '@common/router/RouteWithContext/RouteWithContext'
import { NAV_MODE, pathArrayForAllScopes } from '@common/utils/routeUtils'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'

const DiscoveryDetails = React.lazy(
  () => import(/* webpackChunkName: "discoveryDetails"*/ './pages/discovery-details/DiscoveryDetails')
)
const DiscoveryPage = React.lazy(() => import(/* webpackChunkName: "discoveryPage"*/ './pages/home/DiscoveryPage'))
const NetworkMapStudio = React.lazy(
  () => import(/* webpackChunkName: "networkMapStudio"*/ './pages/network-map-studio/NetworkMapStudio')
)

function DiscoverySettingsRouteDestinations({ mode }: { mode: NAV_MODE }): React.ReactElement {
  return (
    <>
      <RouteWithContext exact path={pathArrayForAllScopes(routes.toDiscovery, mode)} pageName={PAGE_NAME.DiscoveryPage}>
        <React.Suspense fallback={<PageSpinner />}>
          <DiscoveryPage />
        </React.Suspense>
      </RouteWithContext>
      <RouteWithContext
        exact
        path={pathArrayForAllScopes(routes.toDiscoveredResource, mode, { dAgentId: ':dAgentId' })}
        pageName={PAGE_NAME.DiscoveryDetails}
      >
        <React.Suspense fallback={<PageSpinner />}>
          <DiscoveryDetails />
        </React.Suspense>
      </RouteWithContext>
      <RouteWithContext
        exact
        path={pathArrayForAllScopes(routes.toCreateNetworkMap, mode, {
          dAgentId: ':dAgentId',
          networkMapId: ':networkMapId'
        })}
        pageName={PAGE_NAME.CreateNetworkMap}
      >
        <React.Suspense fallback={<PageSpinner />}>
          <NetworkMapStudio />
        </React.Suspense>
      </RouteWithContext>
    </>
  )
}

export default DiscoverySettingsRouteDestinations
