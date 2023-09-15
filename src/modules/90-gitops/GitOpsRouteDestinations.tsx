/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Switch } from 'react-router-dom'

import routes from '@common/RouteDefinitionsV2'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import { RouteWithContext } from '@common/router/RouteWithContext/RouteWithContext'
import { NAV_MODE, modulePathProps, projectPathProps } from '@common/utils/routeUtils'
import { GitOpsPage } from './RouteDestinations'

interface GitOpsRouteDestinationProps {
  mode: NAV_MODE
}

function GitOpsRouteDestinations({ mode = NAV_MODE.MODULE }: GitOpsRouteDestinationProps): React.ReactElement {
  return (
    <Switch>
      <RouteWithContext
        path={routes.toGitOps({ ...modulePathProps, ...projectPathProps, mode })}
        pageName={PAGE_NAME.GitOpsPage}
      >
        <GitOpsPage />
      </RouteWithContext>
    </Switch>
  )
}

export default GitOpsRouteDestinations
