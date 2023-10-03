/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import routes from '@common/RouteDefinitionsV2'
import { RouteWithContext } from '@common/router/RouteWithContext/RouteWithContext'
import { NAV_MODE, pathArrayForAllScopes } from '@common/utils/routeUtils'
import AuditTrailsPage from './pages/AuditTrails/AuditTrailsPage'

function AuditTrailsSettingsRouteDestinations({ mode }: { mode: NAV_MODE }): React.ReactElement {
  return (
    <>
      <RouteWithContext exact path={pathArrayForAllScopes(routes.toAuditTrailSettings, mode)}>
        <AuditTrailsPage />
      </RouteWithContext>
    </>
  )
}

export default AuditTrailsSettingsRouteDestinations
