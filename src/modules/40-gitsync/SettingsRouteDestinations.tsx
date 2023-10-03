/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Redirect, useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitionsV2'
import { RouteWithContext } from '@common/router/RouteWithContext/RouteWithContext'
import { NAV_MODE, pathArrayForAllScopes } from '@common/utils/routeUtils'
import { PAGE_NAME } from '@modules/10-common/pages/pageContext/PageName'
import { ModulePathParams, ProjectPathProps } from '@modules/10-common/interfaces/RouteInterfaces'
import GitSyncPage from './pages/GitSyncPage'
import GitSyncRepoTab from './pages/repos/GitSyncRepoTab'
import GitSyncEntityTab from './pages/entities/GitSyncEntityTab'
import GitSyncErrors from './pages/errors/GitSyncErrors'
import GitSyncConfigTab from './pages/config/GitSyncConfigTab'

export function RedirectToGitSyncHome({ mode }: { mode: NAV_MODE }): React.ReactElement {
  const { module, ...rest } = useParams<ProjectPathProps & ModulePathParams>()
  return <Redirect to={routes.toGitSyncReposAdmin({ ...rest, module, mode })} />
}

function GitSyncSettingsRouteDestinations({ mode }: { mode: NAV_MODE }): React.ReactElement {
  return (
    <>
      <RouteWithContext
        exact
        path={pathArrayForAllScopes(routes.toGitSyncAdmin, mode)}
        pageName={PAGE_NAME.GitSyncRepoTab}
      >
        <RedirectToGitSyncHome mode={mode} />
      </RouteWithContext>
      <RouteWithContext
        exact
        path={pathArrayForAllScopes(routes.toGitSyncReposAdmin, mode)}
        pageName={PAGE_NAME.GitSyncRepoTab}
      >
        <GitSyncPage>
          <GitSyncRepoTab />
        </GitSyncPage>
      </RouteWithContext>
      <RouteWithContext
        exact
        path={pathArrayForAllScopes(routes.toGitSyncEntitiesAdmin, mode)}
        pageName={PAGE_NAME.GitSyncEntityTab}
      >
        <GitSyncPage>
          <GitSyncEntityTab />
        </GitSyncPage>
      </RouteWithContext>
      <RouteWithContext
        exact
        path={pathArrayForAllScopes(routes.toGitSyncErrors, mode)}
        pageName={PAGE_NAME.GitSyncErrors}
      >
        <GitSyncPage>
          <GitSyncErrors />
        </GitSyncPage>
      </RouteWithContext>
      <RouteWithContext
        exact
        path={pathArrayForAllScopes(routes.toGitSyncConfig, mode)}
        pageName={PAGE_NAME.GitSyncConfigTab}
      >
        <GitSyncPage>
          <GitSyncConfigTab />
        </GitSyncPage>
      </RouteWithContext>
    </>
  )
}

export default GitSyncSettingsRouteDestinations
