/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Redirect, Switch, useHistory, useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitionsV2'
import { RouteWithContext } from '@common/router/RouteWithContext/RouteWithContext'
import {
  NAV_MODE,
  accountPathProps,
  getRouteParams,
  modulePathProps,
  orgPathProps,
  pathArrayForAllScopes,
  projectPathProps
} from '@common/utils/routeUtils'
import UserProfilePage from '@user-profile/pages/UserProfile/UserProfilePage'
import SettingsRouteDestinations from '@modules/SettingsRouteDestinations'
import ProjectsListPage from '@modules/45-projects-orgs/pages/projects/ProjectsPage'
import { ModulePathParams } from '@modules/10-common/interfaces/RouteInterfaces'
import OrganizationsPage from '@modules/45-projects-orgs/pages/organizations/OrganizationsPage'
import UserPreferencesPage from './pages/UserPreferences/UserPreferences'

const RedirectToUserHome = ({ mode }: { mode: NAV_MODE }): React.ReactElement => {
  const { module, ...rest } = useParams<ModulePathParams>()
  return <Redirect to={routes.toUserProfile({ ...rest, module, mode })} />
}

function CommonRouteDestinations({ mode }: { mode: NAV_MODE }): React.ReactElement {
  const history = useHistory()
  const { module } = getRouteParams<ModulePathParams>()

  return (
    <Switch>
      <RouteWithContext
        path={[
          routes.toUserProfile({ ...accountPathProps, ...modulePathProps, ...projectPathProps, mode }),
          routes.toUserProfile({ ...accountPathProps, ...modulePathProps, ...orgPathProps, mode }),
          routes.toUserProfile({ ...accountPathProps, ...modulePathProps, mode }),
          routes.toUserProfile({ ...accountPathProps, ...projectPathProps, mode }),
          routes.toUserProfile({ ...accountPathProps, ...orgPathProps, mode }),
          routes.toUserProfile({ ...accountPathProps, mode })
        ]}
      >
        <UserProfilePage />
      </RouteWithContext>
      <RouteWithContext
        exact
        path={[
          routes.toOrgs({ ...accountPathProps, ...modulePathProps, mode }),
          routes.toOrgs({ ...accountPathProps, mode })
        ]}
      >
        <OrganizationsPage
          onOrgClick={org => {
            history.push(routes.toMode({ module, orgIdentifier: org.organizationResponse.organization.identifier }))
          }}
        />
      </RouteWithContext>
      <RouteWithContext
        exact
        path={[
          routes.toProjects({ ...modulePathProps, ...orgPathProps, mode }),
          routes.toProjects({ ...modulePathProps, ...accountPathProps, mode }),
          routes.toProjects({ ...orgPathProps, mode }),
          routes.toProjects({ ...accountPathProps, mode })
        ]}
      >
        <ProjectsListPage
          onProjectClick={project => {
            history.push(
              routes.toMode({
                projectIdentifier: project.projectResponse.project.identifier,
                orgIdentifier: project.projectResponse.project.orgIdentifier,
                module
              })
            )
          }}
        />
      </RouteWithContext>
      <RouteWithContext
        exact
        path={[
          routes.toUser({ ...accountPathProps, ...modulePathProps, mode }),
          routes.toUser({ ...accountPathProps, mode })
        ]}
      >
        <RedirectToUserHome mode={mode} />
      </RouteWithContext>
      <RouteWithContext exact path={pathArrayForAllScopes(routes.toUserPreferences, mode)}>
        <UserPreferencesPage />
      </RouteWithContext>

      {SettingsRouteDestinations({ mode }).props.children}
    </Switch>
  )
}

export default CommonRouteDestinations
