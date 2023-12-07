/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Route, useParams, Redirect } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import { RouteWithLayout } from '@common/router'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { MinimalLayout } from '@common/layouts'
import ChildAppMounter from 'microfrontends/ChildAppMounter'
import RbacFactory from '@rbac/factories/RbacFactory'
import { ResourceType, ResourceCategory } from '@rbac/interfaces/ResourceType'
import type { ResourceDTO } from 'services/audit'
import AuditTrailFactory, { ResourceScope } from 'framework/AuditTrail/AuditTrailFactory'
import DashboardResourceModalBody from '@dashboards/components/DashboardResourceModalBody/DashboardResourceModalBody'
import DashboardResourceRenderer from '@dashboards/components/DashboardResourceRenderer/DashboardResourceRenderer'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { String } from 'framework/strings'
import DashboardsPage from './pages/DashboardsPage'
import DashboardViewPage from './pages/dashboardView/DashboardViewPage'
import HomePage from './pages/home/HomePage'
import FoldersPage from './pages/folders/FoldersPage'

const RedirectToHome = (): React.ReactElement => {
  const params = useParams<AccountPathProps>()

  return <Redirect to={routes.toCustomDashboardHome(params)} />
}

const viewPathProps: { viewId: string; folderId: string } = {
  viewId: ':viewId',
  folderId: ':folderId'
}

RbacFactory.registerResourceTypeHandler(ResourceType.DASHBOARDS, {
  icon: 'support-account',
  label: 'common.dashboards',
  labelSingular: 'dashboardLabel',
  labelOverride: 'common.folders',
  category: ResourceCategory.SHARED_RESOURCES,
  permissionLabels: {
    [PermissionIdentifier.VIEW_DASHBOARD]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_DASHBOARD]: <String stringID="rbac.permissionLabels.manage" />
  },
  // eslint-disable-next-line react/display-name
  addResourceModalBody: props => <DashboardResourceModalBody {...props} />,
  // eslint-disable-next-line react/display-name
  staticResourceRenderer: props => <DashboardResourceRenderer {...props} />
})

/**
 * Register for Audit Trail
 * */
AuditTrailFactory.registerResourceHandler('DASHBOARD', {
  moduleIcon: {
    name: 'dashboards-solid-border'
  },
  moduleLabel: 'common.resourceCenter.ticketmenu.platform',
  resourceLabel: 'dashboardLabel',
  resourceUrl: (resource: ResourceDTO, resourceScope: ResourceScope) => {
    const { identifier, labels } = resource
    const { accountIdentifier } = resourceScope
    const folderId = labels?.folderId || 'shared'

    return routes.toViewCustomDashboard({ accountId: accountIdentifier, viewId: identifier, folderId: folderId })
  }
})

// eslint-disable-next-line import/no-unresolved
const CdbMicroFrontendPath = React.lazy(() => import('cdbui/MicroFrontendApp'))

export const CdbNonMfeRoutes = (
  <>
    <Route path={routes.toCustomDashboard({ ...accountPathProps })} exact>
      <RedirectToHome />
    </Route>
    <RouteWithLayout
      layout={MinimalLayout}
      exact
      path={routes.toCustomDashboardHome({ ...accountPathProps, folderId: ':folderId' })}
    >
      <DashboardsPage>
        <HomePage />
      </DashboardsPage>
    </RouteWithLayout>
    <RouteWithLayout layout={MinimalLayout} path={routes.toCustomFolderHome({ ...accountPathProps })} exact>
      <DashboardsPage>
        <FoldersPage />
      </DashboardsPage>
    </RouteWithLayout>
    <RouteWithLayout
      layout={MinimalLayout}
      path={routes.toViewCustomDashboard({ ...accountPathProps, ...viewPathProps })}
      exact
    >
      <DashboardViewPage />
    </RouteWithLayout>
  </>
)

export const CdbMfeRoutes = (
  <>
    <RouteWithLayout
      layout={MinimalLayout}
      path={[
        routes.toCustomDashboard({ ...accountPathProps }),
        routes.toCustomDashboardHome({ ...accountPathProps, folderId: ':folderId' }),
        routes.toCustomFolderHome({ ...accountPathProps }),
        routes.toViewCustomDashboard({ ...accountPathProps, ...viewPathProps })
      ]}
    >
      <ChildAppMounter ChildApp={CdbMicroFrontendPath} />
    </RouteWithLayout>
  </>
)
