/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import routes from '@common/RouteDefinitionsV2'
import { accountPathProps, modePathProps, orgPathProps, projectPathProps, NAV_MODE } from '@common/utils/routeUtils'
import { Scope } from 'framework/types/types'
import ProjectDetails from '@projects-orgs/pages/projects/views/ProjectDetails/ProjectDetails'
import LandingDashboardWelcomeView from '@projects-orgs/pages/LandingDashboardPage/LandingDashboardWelcomeView'
import PipelineRouteDestinations from '@pipeline/PipelineRouteDestinations'
import CommonRouteDestinations from '@user-profile/CommonRouteDestinations'
import NotFoundPage from '@common/pages/404/NotFoundPage'
import { RouteWithContext } from '@common/router/RouteWithContext/RouteWithContext'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import { useGetSelectedScope } from '@common/navigation/SideNavV2/SideNavV2.utils'
import TriggersRouteDestinations from '@triggers/TriggersRouteDestinations'
import LandingDashboardPage from '@projects-orgs/pages/LandingDashboardPage/LandingDashboardPage'

// eslint-disable-next-line
import { ModulesRouteDestinations } from './ModuleRouteConfig'

const RedirectAllMode: React.FC = () => {
  const { scope, params } = useGetSelectedScope()
  const { projectIdentifier, orgIdentifier } = params || {}

  if (scope === Scope.PROJECT) {
    return <Redirect to={routes.toOverview({ orgIdentifier, projectIdentifier: projectIdentifier })} />
  }

  if (scope === Scope.ORGANIZATION) {
    // redirect to settings page
    return <Redirect to={routes.toSettings({ orgIdentifier: params?.orgIdentifier })} />
  }

  if (scope === Scope.ACCOUNT) {
    return <Redirect to={routes.toOverview()} />
  }

  // Create a different common component instead of this welcome component
  return (
    <LandingDashboardWelcomeView
      setView={() => {
        // empty
      }}
    />
  )
}

const AllModeRouteDestinations = (): React.ReactElement => {
  return (
    <Switch>
      <RouteWithContext
        exact
        path={[
          routes.toMode({ ...projectPathProps, mode: NAV_MODE.ALL }),
          routes.toMode({ ...orgPathProps, mode: NAV_MODE.ALL }),
          routes.toMode({ ...accountPathProps, mode: NAV_MODE.ALL })
        ]}
      >
        <RedirectAllMode />
      </RouteWithContext>

      <RouteWithContext path={routes.toOverview({ ...projectPathProps, ...modePathProps })}>
        <ProjectDetails />
      </RouteWithContext>

      <RouteWithContext path={routes.toOverview({ ...accountPathProps, ...modePathProps })}>
        <LandingDashboardPage />
      </RouteWithContext>

      {ModulesRouteDestinations({ mode: NAV_MODE.ALL })?.props.children}
      {
        PipelineRouteDestinations({ mode: NAV_MODE.ALL, pipelineStudioPageName: PAGE_NAME.AllModePipelineStudio }).props
          .children
      }
      {TriggersRouteDestinations({ mode: NAV_MODE.ALL }).props.children}
      {CommonRouteDestinations({ mode: NAV_MODE.ALL }).props.children}
      <Route path="*" component={NotFoundPage} />
    </Switch>
  )
}

export default AllModeRouteDestinations
