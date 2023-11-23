/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Redirect, Switch, Route } from 'react-router-dom'
import routes from '@common/RouteDefinitionsV2'
import { NAV_MODE, accountPathProps, modePathProps, orgPathProps, projectPathProps } from '@common/utils/routeUtils'
import LandingDashboardPage from '@projects-orgs/pages/LandingDashboardPage/LandingDashboardPage'
import CommonRouteDestinations from '@user-profile/CommonRouteDestinations'
import NotFoundPage from '@common/pages/404/NotFoundPage'
import { RouteWithContext } from '@common/router/RouteWithContext/RouteWithContext'
import { useGetSelectedScope } from '@common/navigation/SideNavV2/SideNavV2.utils'
import { Scope } from 'framework/types/types'
import OrganizationsPage from './pages/organizations/OrganizationsPage'
import ProjectsListPage from './pages/projects/ProjectsPage'
import ProjectDetails from './pages/projects/views/ProjectDetails/ProjectDetails'

const AdminRedirect: React.FC = () => {
  const { scope, params } = useGetSelectedScope()

  if (scope === Scope.ORGANIZATION) {
    return <Redirect to={routes.toSettings({ ...params })} />
  }

  if (scope === Scope.PROJECT && params?.projectIdentifier && params.orgIdentifier) {
    return (
      <Redirect
        to={routes.toProjectDetails({
          projectIdentifier: params.projectIdentifier,
          orgIdentifier: params.orgIdentifier,
          accountId: params.accountId
        })}
      />
    )
  }

  return <Redirect to={routes.toOverview()} />
}

const AdminRouteDestinations = (): React.ReactElement => {
  return (
    <Switch>
      <RouteWithContext
        exact
        path={[
          routes.toMode({ ...projectPathProps, mode: NAV_MODE.ADMIN }),
          routes.toMode({ ...orgPathProps, mode: NAV_MODE.ADMIN }),
          routes.toMode({ mode: NAV_MODE.ADMIN, ...accountPathProps })
        ]}
      >
        <AdminRedirect />
      </RouteWithContext>
      <RouteWithContext exact path={routes.toLandingDashboard({ ...accountPathProps })}>
        <Redirect to={routes.toOverview()} />
      </RouteWithContext>
      <RouteWithContext path={routes.toOverview({ ...accountPathProps, ...modePathProps })}>
        <LandingDashboardPage />
      </RouteWithContext>
      <RouteWithContext path={routes.toOrgs({ ...accountPathProps, ...modePathProps })}>
        <OrganizationsPage />
      </RouteWithContext>
      <RouteWithContext path={routes.toProjects({ ...accountPathProps, ...modePathProps })}>
        <ProjectsListPage />
      </RouteWithContext>
      <RouteWithContext exact path={routes.toProjects({ ...orgPathProps, ...modePathProps })}>
        <ProjectsListPage />
      </RouteWithContext>
      <RouteWithContext exact path={routes.toProjectDetails({ ...projectPathProps, ...modePathProps })}>
        <ProjectDetails />
      </RouteWithContext>
      {CommonRouteDestinations({ mode: NAV_MODE.ADMIN }).props.children}
      <Route path="*" component={NotFoundPage} />
    </Switch>
  )
}

export default AdminRouteDestinations
