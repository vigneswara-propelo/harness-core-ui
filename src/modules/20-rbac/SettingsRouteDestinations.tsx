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
import {
  NAV_MODE,
  pathArrayForAllScopes,
  resourceGroupPathProps,
  rolePathProps,
  serviceAccountProps,
  userGroupPathProps,
  userPathProps
} from '@common/utils/routeUtils'
import { PipelineType, ProjectPathProps } from '@modules/10-common/interfaces/RouteInterfaces'
import AccessControlPage from './pages/AccessControl/AccessControlPage'
import UsersPage from './pages/Users/UsersPage'
import UserDetails from './pages/UserDetails/UserDetails'
import UserGroups from './pages/UserGroups/UserGroups'
import UserGroupDetails from './pages/UserGroupDetails/UserGroupDetails'
import ServiceAccountsPage from './pages/ServiceAccounts/ServiceAccounts'
import ServiceAccountDetails from './pages/ServiceAccountDetails/ServiceAccountDetails'
import ResourceGroups from './pages/ResourceGroups/ResourceGroups'
import ResourceGroupDetails from './pages/ResourceGroupDetails/ResourceGroupDetails'
import Roles from './pages/Roles/Roles'
import RoleDetails from './pages/RoleDetails/RoleDetails'

const RedirectToModuleAccessControlHome = ({ mode }: { mode: NAV_MODE }): React.ReactElement => {
  const { module, ...rest } = useParams<PipelineType<ProjectPathProps>>()

  return <Redirect to={routes.toUsers({ ...rest, module, mode })} />
}

function RbacSettingsRouteDestinations({ mode }: { mode: NAV_MODE }): React.ReactElement {
  return (
    <>
      <RouteWithContext exact path={pathArrayForAllScopes(routes.toAccessControl, mode)}>
        <RedirectToModuleAccessControlHome mode={mode} />
      </RouteWithContext>
      <RouteWithContext exact path={pathArrayForAllScopes(routes.toUsers, mode)}>
        <AccessControlPage>
          <UsersPage />
        </AccessControlPage>
      </RouteWithContext>
      <RouteWithContext exact path={pathArrayForAllScopes(routes.toUserDetails, mode, { ...userPathProps })}>
        <UserDetails />
      </RouteWithContext>
      <RouteWithContext exact path={pathArrayForAllScopes(routes.toUserGroups, mode)}>
        <AccessControlPage>
          <UserGroups />
        </AccessControlPage>
      </RouteWithContext>
      <RouteWithContext exact path={pathArrayForAllScopes(routes.toUserGroupDetails, mode, { ...userGroupPathProps })}>
        <UserGroupDetails />
      </RouteWithContext>
      <RouteWithContext exact path={pathArrayForAllScopes(routes.toServiceAccounts, mode)}>
        <AccessControlPage>
          <ServiceAccountsPage />
        </AccessControlPage>
      </RouteWithContext>
      <RouteWithContext
        exact
        path={pathArrayForAllScopes(routes.toServiceAccountDetails, mode, {
          ...serviceAccountProps
        })}
      >
        <ServiceAccountDetails />
      </RouteWithContext>
      <RouteWithContext exact path={pathArrayForAllScopes(routes.toResourceGroups, mode)}>
        <AccessControlPage>
          <ResourceGroups />
        </AccessControlPage>
      </RouteWithContext>
      <RouteWithContext
        exact
        path={pathArrayForAllScopes(routes.toResourceGroupDetails, mode, {
          ...resourceGroupPathProps
        })}
      >
        <ResourceGroupDetails />
      </RouteWithContext>
      <RouteWithContext exact path={pathArrayForAllScopes(routes.toRoles, mode)}>
        <AccessControlPage>
          <Roles />
        </AccessControlPage>
      </RouteWithContext>
      <RouteWithContext exact path={pathArrayForAllScopes(routes.toRoleDetails, mode, { ...rolePathProps })}>
        <RoleDetails />
      </RouteWithContext>
    </>
  )
}

export default RbacSettingsRouteDestinations
