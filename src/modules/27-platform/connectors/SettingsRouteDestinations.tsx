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
import { NAV_MODE, connectorPathProps, pathArrayForAllScopes } from '@common/utils/routeUtils'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import CreateConnectorFromYamlPage from './pages/createConnectorFromYaml/CreateConnectorFromYamlPage'
import ConnectorDetailsPage from './pages/connectors/ConnectorDetailsPage/ConnectorDetailsPage'
import ConnectorsPage from './pages/connectors/ConnectorsPage'

function ConnectorsSettingsRouteDestinations({ mode }: { mode: NAV_MODE }): React.ReactElement {
  return (
    <Switch>
      <RouteWithContext
        exact
        path={pathArrayForAllScopes(routes.toConnectors, mode)}
        pageName={PAGE_NAME.ConnectorsPage}
      >
        <ConnectorsPage />
      </RouteWithContext>
      <RouteWithContext
        exact
        path={pathArrayForAllScopes(routes.toConnectorDetails, mode, { ...connectorPathProps })}
        pageName={PAGE_NAME.ConnectorDetailsPage}
      >
        <ConnectorDetailsPage />
      </RouteWithContext>
      <RouteWithContext
        exact
        path={pathArrayForAllScopes(routes.toCreateConnectorFromYamlSettings, mode)}
        pageName={PAGE_NAME.CreateConnectorFromYamlPage}
      >
        <CreateConnectorFromYamlPage />
      </RouteWithContext>
    </Switch>
  )
}

export default ConnectorsSettingsRouteDestinations
