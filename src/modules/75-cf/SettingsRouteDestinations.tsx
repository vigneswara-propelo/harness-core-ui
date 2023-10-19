/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import routes from '@modules/10-common/RouteDefinitionsV2'
import { RouteWithContext } from '@modules/10-common/router/RouteWithContext/RouteWithContext'
import { NAV_MODE, pathArrayForAllScopes } from '@modules/10-common/utils/routeUtils'
import ProxyKeyPage from './pages/proxy-key-management/ProxyKeyPage'

function CFSettingsRouteDestinations({ mode }: { mode: NAV_MODE }): React.ReactElement {
  return (
    <>
      <RouteWithContext exact path={pathArrayForAllScopes(routes.toFeatureFlagsProxySettings, mode)}>
        <ProxyKeyPage />
      </RouteWithContext>
    </>
  )
}

export default CFSettingsRouteDestinations
