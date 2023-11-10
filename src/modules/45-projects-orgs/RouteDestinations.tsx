/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams, Redirect, useLocation } from 'react-router-dom'
import { PageSpinner } from '@harness/uicore'
import AuditTrailsPage from '@audit-trail/pages/AuditTrails/AuditTrailsPage'
import AuditTrailFactory, { ResourceScope } from 'framework/AuditTrail/AuditTrailFactory'
import { RouteWithLayout } from '@common/router'
import routesV1 from '@common/RouteDefinitions'
import routesV2 from '@common/RouteDefinitionsV2'
import {
  accountPathProps,
  delegatePathProps,
  orgPathProps,
  projectPathProps,
  delegateConfigProps,
  resourceGroupPathProps,
  rolePathProps,
  userGroupPathProps,
  secretPathProps,
  userPathProps,
  connectorPathProps,
  serviceAccountProps,
  discoveryPathProps,
  networkMapPathProps
} from '@common/utils/routeUtils'

import ProjectsPage from '@projects-orgs/pages/projects/ProjectsPage'
import DelegateTokens from '@delegates/components/DelegateTokens/DelegateTokens'
import ProjectDetails from '@projects-orgs/pages/projects/views/ProjectDetails/ProjectDetails'
import OrganizationsPage from '@projects-orgs/pages/organizations/OrganizationsPage'
import OrganizationDetailsPage from '@projects-orgs/pages/organizations/OrganizationDetails/OrganizationDetailsPage'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import ProjectDetailsSideNav from '@projects-orgs/components/ProjectsSideNav/ProjectsSideNav'
import RbacFactory from '@rbac/factories/RbacFactory'
import AddProjectResourceModalBody from '@projects-orgs/components/ProjectResourceModalBody/ProjectResourceModalBody'
import OrgResourceModalBody from '@projects-orgs/components/OrgResourceModalBody/OrgResourceModalBody'
import type { Module, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import ConnectorsPage from '@platform/connectors/pages/connectors/ConnectorsPage'
import SecretsPage from '@secrets/pages/secrets/SecretsPage'
import DelegatesPage from '@delegates/pages/delegates/DelegatesPage'
import DelegateListing from '@delegates/pages/delegates/DelegateListing'
import DelegateConfigurations from '@delegates/pages/delegates/DelegateConfigurations'
import DelegateDetails from '@delegates/pages/delegates/DelegateDetails'
import ConnectorDetailsPage from '@platform/connectors/pages/connectors/ConnectorDetailsPage/ConnectorDetailsPage'
import SecretDetails from '@secrets/pages/secretDetails/SecretDetails'
import { RedirectToSecretDetailHome } from '@secrets/RouteDestinations'
import SecretReferences from '@secrets/pages/secretReferences/SecretReferences'
import SecretDetailsHomePage from '@secrets/pages/secretDetailsHomePage/SecretDetailsHomePage'
import { ResourceType, ResourceCategory } from '@rbac/interfaces/ResourceType'
import ResourceGroupDetails from '@rbac/pages/ResourceGroupDetails/ResourceGroupDetails'
import AccessControlPage from '@rbac/pages/AccessControl/AccessControlPage'
import ResourceGroups from '@rbac/pages/ResourceGroups/ResourceGroups'
import RoleDetails from '@rbac/pages/RoleDetails/RoleDetails'
import Roles from '@rbac/pages/Roles/Roles'
import UserGroups from '@rbac/pages/UserGroups/UserGroups'
import UsersPage from '@rbac/pages/Users/UsersPage'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { String } from 'framework/strings'
import UserGroupDetails from '@rbac/pages/UserGroupDetails/UserGroupDetails'
import UserDetails from '@rbac/pages/UserDetails/UserDetails'
import DelegateProfileDetails from '@delegates/pages/delegates/DelegateConfigurationDetailPage'
import CreateSecretFromYamlPage from '@secrets/pages/createSecretFromYaml/CreateSecretFromYamlPage'
import CreateConnectorFromYamlPage from '@platform/connectors/pages/createConnectorFromYaml/CreateConnectorFromYamlPage'
import { AccountSideNavProps, HomeSideNavProps, MainDashboardSideNavProps } from '@common/RouteDestinations'
import GitSyncEntityTab from '@gitsync/pages/entities/GitSyncEntityTab'
import GitSyncPage from '@gitsync/pages/GitSyncPage'
import GitSyncRepoTab from '@gitsync/pages/repos/GitSyncRepoTab'
import GitSyncErrors from '@gitsync/pages/errors/GitSyncErrors'
import ServiceAccountDetails from '@rbac/pages/ServiceAccountDetails/ServiceAccountDetails'
import ServiceAccountsPage from '@rbac/pages/ServiceAccounts/ServiceAccounts'
import { GovernanceRouteDestinations } from '@governance/RouteDestinations'
import type { AuditEventData, ResourceDTO } from 'services/audit'
import GitSyncConfigTab from '@gitsync/pages/config/GitSyncConfigTab'
import VariablesPage from '@variables/pages/variables/VariablesPage'
import FileStorePage from '@filestore/pages/filestore/FileStorePage'
import SettingsList from '@default-settings/pages/SettingsList'
import { NotificationPageList } from '@modules/27-platform/notifications/NotificationsPageList'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
// eslint-disable-next-line no-restricted-imports
import ExternalTicketSettings from '@sto/components/ExternalTickets/Settings/ExternalTicketSettings'
import SecretRuntimeUsage from '@common/pages/entityUsage/views/RuntimeUsageView/SecretRuntimeUsage'
import LandingDashboardPageV2 from './pages/LandingDashboardPageV2/LandingDashboardPageV2'
import LandingDashboardPage from './pages/LandingDashboardPage/LandingDashboardPage'

const DiscoveryDetails = React.lazy(
  () => import(/* webpackChunkName: "discoveryDetails"*/ '../73-discovery/pages/discovery-details/DiscoveryDetails')
)
const DiscoveryPage = React.lazy(
  () => import(/* webpackChunkName: "discoveryPage"*/ '../73-discovery/pages/home/DiscoveryPage')
)
const NetworkMapStudio = React.lazy(
  () => import(/* webpackChunkName: "networkMapStudio"*/ '../73-discovery/pages/network-map-studio/NetworkMapStudio')
)

export const ProjectDetailsSideNavProps: SidebarContext = {
  navComponent: ProjectDetailsSideNav,
  icon: 'nav-project',
  title: 'Projects'
}

RbacFactory.registerResourceTypeHandler(ResourceType.PROJECT, {
  icon: 'nav-project',
  label: 'projectsText',
  labelSingular: 'projectLabel',
  category: ResourceCategory.ADMINSTRATIVE_FUNCTIONS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_PROJECT]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.CREATE_PROJECT]: <String stringID="rbac.permissionLabels.create" />,
    [PermissionIdentifier.UPDATE_PROJECT]: <String stringID="rbac.permissionLabels.edit" />,
    [PermissionIdentifier.DELETE_PROJECT]: <String stringID="rbac.permissionLabels.delete" />
  },
  // eslint-disable-next-line react/display-name
  addResourceModalBody: props => <AddProjectResourceModalBody {...props} />
})

RbacFactory.registerResourceTypeHandler(ResourceType.ORGANIZATION, {
  icon: 'settings',
  label: 'orgsText',
  labelSingular: 'orgLabel',
  category: ResourceCategory.ADMINSTRATIVE_FUNCTIONS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_ORG]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.CREATE_ORG]: <String stringID="rbac.permissionLabels.create" />,
    [PermissionIdentifier.UPDATE_ORG]: <String stringID="rbac.permissionLabels.edit" />,
    [PermissionIdentifier.DELETE_ORG]: <String stringID="rbac.permissionLabels.delete" />
  },
  // eslint-disable-next-line react/display-name
  addResourceModalBody: props => <OrgResourceModalBody {...props} />
})

const platformLabel = 'common.resourceCenter.ticketmenu.platform'
AuditTrailFactory.registerResourceHandler('ORGANIZATION', {
  moduleIcon: {
    name: 'nav-settings'
  },
  moduleLabel: platformLabel,
  resourceLabel: 'orgLabel',
  resourceUrl: (
    _resource: ResourceDTO,
    resourceScope: ResourceScope,
    _module?: Module,
    _auditEventData?: AuditEventData,
    isNewNav?: boolean
  ) => {
    const { orgIdentifier, accountIdentifier } = resourceScope
    const path =
      !isNewNav && orgIdentifier
        ? routesV1.toOrganizationDetails({ orgIdentifier, accountId: accountIdentifier })
        : routesV2.toSettings({ orgIdentifier, accountId: accountIdentifier })
    return orgIdentifier ? path : undefined
  }
})

AuditTrailFactory.registerResourceHandler('PROJECT', {
  moduleIcon: {
    name: 'nav-settings'
  },
  moduleLabel: platformLabel,
  resourceLabel: 'projectLabel',
  resourceUrl: (
    _resource: ResourceDTO,
    resourceScope: ResourceScope,
    _module?: Module,
    _auditEventData?: AuditEventData,
    isNewNav?: boolean
  ) => {
    const { orgIdentifier, accountIdentifier, projectIdentifier } = resourceScope
    const routes = isNewNav ? routesV2 : routesV1

    if (orgIdentifier && projectIdentifier) {
      return routes.toProjectDetails({ orgIdentifier, accountId: accountIdentifier, projectIdentifier })
    }
    return undefined
  }
})

const RedirectToAccessControlHome = (): React.ReactElement => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  return <Redirect to={routesV1.toUsers({ accountId, projectIdentifier, orgIdentifier })} />
}

const RedirectToGitSyncHome = (): React.ReactElement => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  return <Redirect to={routesV1.toGitSyncReposAdmin({ projectIdentifier, accountId, orgIdentifier })} />
}

const RedirectToDelegatesHome = (): React.ReactElement => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  return <Redirect to={routesV1.toDelegateList({ accountId, projectIdentifier, orgIdentifier })} />
}

const ProjectsRedirect = (): React.ReactElement => {
  const { accountId } = useParams<ProjectPathProps>()
  const { search } = useLocation()

  return (
    <Redirect
      to={{
        pathname: routesV1.toAllProjects({
          accountId
        }),
        search
      }}
    />
  )
}

const MainDashboardRedirect = (): React.ReactElement => {
  const { LANDING_OVERVIEW_PAGE_V2 } = useFeatureFlags()

  return LANDING_OVERVIEW_PAGE_V2 ? <LandingDashboardPageV2 /> : <LandingDashboardPage />
}

const LandingDashboardPageRedirect = (): React.ReactElement => {
  const { LANDING_OVERVIEW_PAGE_V2 } = useFeatureFlags()

  if (LANDING_OVERVIEW_PAGE_V2) {
    return <LandingDashboardPageV2 />
  }

  return <LandingDashboardPage />
}

export default (
  <>
    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routesV1.toAllProjects({ ...accountPathProps })}
      exact
    >
      <ProjectsPage />
    </RouteWithLayout>

    <RouteWithLayout sidebarProps={HomeSideNavProps} path={routesV1.toProjects({ ...accountPathProps })} exact>
      <ProjectsRedirect />
    </RouteWithLayout>

    <RouteWithLayout sidebarProps={HomeSideNavProps} path={routesV1.toLandingDashboard({ ...accountPathProps })} exact>
      <LandingDashboardPageRedirect />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={MainDashboardSideNavProps}
      path={routesV1.toMainDashboard({ ...accountPathProps })}
      exact
    >
      <MainDashboardRedirect />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routesV1.toProjectDetails({ ...accountPathProps, ...projectPathProps })}
      exact
    >
      <ProjectDetails />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routesV1.toConnectors({ ...projectPathProps })}
      exact
    >
      <ConnectorsPage />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routesV1.toVariables({ ...accountPathProps, ...projectPathProps })}
      exact
    >
      <VariablesPage />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routesV1.toSecrets({ ...accountPathProps, ...projectPathProps })}
      exact
    >
      <SecretsPage />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routesV1.toDelegatesDetails({ ...projectPathProps, ...delegatePathProps })}
      exact
    >
      <DelegateDetails />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routesV1.toDelegatesDetails({ ...orgPathProps, ...delegatePathProps })}
      exact
    >
      <DelegateDetails />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routesV1.toDelegates({ ...accountPathProps, ...projectPathProps })}
      exact
    >
      <RedirectToDelegatesHome />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routesV1.toDelegates({ ...accountPathProps, ...orgPathProps })}
      exact
    >
      <RedirectToDelegatesHome />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routesV1.toDelegateList({ ...accountPathProps, ...projectPathProps })}
      exact
    >
      <DelegatesPage>
        <DelegateListing />
      </DelegatesPage>
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routesV1.toDelegateList({ ...accountPathProps, ...orgPathProps })}
      exact
    >
      <DelegatesPage>
        <DelegateListing />
      </DelegatesPage>
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routesV1.toDelegateConfigs({ ...accountPathProps, ...projectPathProps })}
      exact
    >
      <DelegatesPage>
        <DelegateConfigurations />
      </DelegatesPage>
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routesV1.toDelegateConfigs({ ...accountPathProps, ...orgPathProps })}
      exact
    >
      <DelegatesPage>
        <DelegateConfigurations />
      </DelegatesPage>
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routesV1.toDelegateConfigsDetails({
        ...accountPathProps,
        ...projectPathProps,
        ...delegateConfigProps
      })}
      exact
    >
      <DelegateProfileDetails />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routesV1.toDelegateConfigsDetails({
        ...accountPathProps,
        ...orgPathProps,
        ...delegateConfigProps
      })}
      exact
    >
      <DelegateProfileDetails />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routesV1.toDelegateTokens({
        ...accountPathProps,
        ...projectPathProps
      })}
      exact
    >
      <DelegatesPage>
        <DelegateTokens />
      </DelegatesPage>
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routesV1.toDelegateTokens({
        ...accountPathProps,
        ...orgPathProps
      })}
      exact
    >
      <DelegatesPage>
        <DelegateTokens />
      </DelegatesPage>
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routesV1.toEditDelegateConfigsDetails({
        ...accountPathProps,
        ...projectPathProps,
        ...delegateConfigProps
      })}
      exact
    >
      <DelegateProfileDetails />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routesV1.toEditDelegateConfigsDetails({
        ...accountPathProps,
        ...orgPathProps,
        ...delegateConfigProps
      })}
      exact
    >
      <DelegateProfileDetails />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routesV1.toConnectorDetails({ ...accountPathProps, ...projectPathProps, ...connectorPathProps })}
      exact
    >
      <ConnectorDetailsPage />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routesV1.toConnectorDetails({ ...orgPathProps, ...connectorPathProps })}
      exact
    >
      <ConnectorDetailsPage />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routesV1.toSecretDetails({ ...accountPathProps, ...projectPathProps, ...secretPathProps })}
      exact
    >
      <RedirectToSecretDetailHome />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routesV1.toSecretDetailsOverview({ ...accountPathProps, ...projectPathProps, ...secretPathProps })}
      exact
    >
      <SecretDetailsHomePage>
        <SecretDetails />
      </SecretDetailsHomePage>
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routesV1.toSecretDetailsRuntimeUsage({ ...accountPathProps, ...projectPathProps, ...secretPathProps })}
      exact
    >
      <SecretDetailsHomePage>
        <SecretRuntimeUsage />
      </SecretDetailsHomePage>
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routesV1.toSecretDetailsReferences({ ...accountPathProps, ...projectPathProps, ...secretPathProps })}
      exact
    >
      <SecretDetailsHomePage>
        <SecretReferences />
      </SecretDetailsHomePage>
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routesV1.toCreateSecretFromYaml({
        ...accountPathProps,
        ...projectPathProps,
        ...orgPathProps
      })}
      exact
    >
      <CreateSecretFromYamlPage />
    </RouteWithLayout>

    {/* Discovery Routes */}
    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routesV1.toDiscovery({ ...accountPathProps, ...projectPathProps })}
      exact
    >
      <React.Suspense fallback={<PageSpinner />}>
        <DiscoveryPage />
      </React.Suspense>
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routesV1.toDiscoveredResource({
        ...accountPathProps,
        ...projectPathProps,
        ...discoveryPathProps
      })}
      exact
    >
      <React.Suspense fallback={<PageSpinner />}>
        <DiscoveryDetails />
      </React.Suspense>
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routesV1.toCreateNetworkMap({
        ...accountPathProps,
        ...projectPathProps,
        ...networkMapPathProps
      })}
      exact
    >
      <React.Suspense fallback={<PageSpinner />}>
        <NetworkMapStudio />
      </React.Suspense>
    </RouteWithLayout>

    <RouteWithLayout sidebarProps={AccountSideNavProps} path={routesV1.toOrganizations({ ...accountPathProps })} exact>
      <OrganizationsPage />
    </RouteWithLayout>
    <RouteWithLayout sidebarProps={AccountSideNavProps} path={routesV1.toConnectors({ ...orgPathProps })} exact>
      <ConnectorsPage />
    </RouteWithLayout>
    <RouteWithLayout sidebarProps={AccountSideNavProps} path={routesV1.toVariables({ ...orgPathProps })} exact>
      <VariablesPage />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routesV1.toConnectorDetails({ ...orgPathProps, ...connectorPathProps })}
      exact
    >
      <ConnectorDetailsPage />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routesV1.toCreateConnectorFromYaml({ ...accountPathProps, ...projectPathProps })}
      exact
    >
      <CreateConnectorFromYamlPage />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routesV1.toCreateConnectorFromYaml({ ...orgPathProps })}
      exact
    >
      <CreateConnectorFromYamlPage />
    </RouteWithLayout>
    <RouteWithLayout sidebarProps={AccountSideNavProps} path={routesV1.toSecrets({ ...orgPathProps })} exact>
      <SecretsPage />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routesV1.toSecretDetails({
        ...orgPathProps,
        ...secretPathProps
      })}
      exact
    >
      <RedirectToSecretDetailHome />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routesV1.toSecretDetailsOverview({
        ...orgPathProps,
        ...secretPathProps
      })}
      exact
    >
      <SecretDetailsHomePage>
        <SecretDetails />
      </SecretDetailsHomePage>
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routesV1.toSecretDetailsReferences({
        ...orgPathProps,
        ...secretPathProps
      })}
      exact
    >
      <SecretDetailsHomePage>
        <SecretReferences />
      </SecretDetailsHomePage>
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routesV1.toSecretDetailsRuntimeUsage({ ...orgPathProps, ...secretPathProps })}
      exact
    >
      <SecretDetailsHomePage>
        <SecretRuntimeUsage />
      </SecretDetailsHomePage>
    </RouteWithLayout>

    {/* Discovery Routes */}
    <RouteWithLayout sidebarProps={AccountSideNavProps} path={routesV1.toDiscovery({ ...orgPathProps })} exact>
      <React.Suspense fallback={<PageSpinner />}>
        <DiscoveryPage />
      </React.Suspense>
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routesV1.toDiscoveredResource({
        ...orgPathProps,
        ...discoveryPathProps
      })}
      exact
    >
      <React.Suspense fallback={<PageSpinner />}>
        <DiscoveryDetails />
      </React.Suspense>
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routesV1.toCreateNetworkMap({
        ...orgPathProps,
        ...networkMapPathProps
      })}
      exact
    >
      <React.Suspense fallback={<PageSpinner />}>
        <NetworkMapStudio />
      </React.Suspense>
    </RouteWithLayout>

    <RouteWithLayout sidebarProps={AccountSideNavProps} path={routesV1.toFileStore({ ...orgPathProps })} exact>
      <FileStorePage />
    </RouteWithLayout>
    <RouteWithLayout sidebarProps={AccountSideNavProps} path={routesV1.toAuditTrail({ ...orgPathProps })} exact>
      <AuditTrailsPage />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routesV1.toCreateSecretFromYaml({ ...orgPathProps })}
      exact
    >
      <CreateSecretFromYamlPage />
    </RouteWithLayout>
    <RouteWithLayout sidebarProps={AccountSideNavProps} path={[routesV1.toAccessControl({ ...orgPathProps })]} exact>
      <RedirectToAccessControlHome />
    </RouteWithLayout>
    <RouteWithLayout sidebarProps={AccountSideNavProps} path={[routesV1.toUsers({ ...orgPathProps })]} exact>
      <AccessControlPage>
        <UsersPage />
      </AccessControlPage>
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={[routesV1.toUserDetails({ ...orgPathProps, ...userPathProps })]}
      exact
    >
      <UserDetails />
    </RouteWithLayout>
    <RouteWithLayout sidebarProps={AccountSideNavProps} path={[routesV1.toUserGroups({ ...orgPathProps })]} exact>
      <AccessControlPage>
        <UserGroups />
      </AccessControlPage>
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={[routesV1.toUserGroupDetails({ ...orgPathProps, ...userGroupPathProps })]}
      exact
    >
      <UserGroupDetails />
    </RouteWithLayout>
    <RouteWithLayout sidebarProps={AccountSideNavProps} path={routesV1.toServiceAccounts({ ...orgPathProps })} exact>
      <AccessControlPage>
        <ServiceAccountsPage />
      </AccessControlPage>
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routesV1.toServiceAccountDetails({ ...orgPathProps, ...serviceAccountProps })}
      exact
    >
      <ServiceAccountDetails />
    </RouteWithLayout>
    <RouteWithLayout sidebarProps={AccountSideNavProps} path={[routesV1.toResourceGroups({ ...orgPathProps })]} exact>
      <AccessControlPage>
        <ResourceGroups />
      </AccessControlPage>
    </RouteWithLayout>
    <RouteWithLayout sidebarProps={AccountSideNavProps} path={[routesV1.toRoles({ ...orgPathProps })]} exact>
      <AccessControlPage>
        <Roles />
      </AccessControlPage>
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={[routesV1.toRoleDetails({ ...orgPathProps, ...rolePathProps })]}
      exact
    >
      <RoleDetails />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={[routesV1.toResourceGroupDetails({ ...orgPathProps, ...resourceGroupPathProps })]}
      exact
    >
      <ResourceGroupDetails />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routesV1.toDefaultSettings({ ...projectPathProps })}
      exact
    >
      <SettingsList />
    </RouteWithLayout>
    <RouteWithLayout sidebarProps={AccountSideNavProps} path={routesV1.toDefaultSettings({ ...orgPathProps })} exact>
      <SettingsList />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routesV1.toNotificationsManagement({ ...accountPathProps, ...projectPathProps })}
      exact
    >
      <NotificationPageList />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routesV1.toNotificationsManagement({ ...accountPathProps, ...orgPathProps })}
      exact
    >
      <NotificationPageList />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routesV1.toOrganizationDetails({ ...accountPathProps, ...orgPathProps })}
      exact
    >
      <OrganizationDetailsPage />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={[routesV1.toAccessControl({ ...projectPathProps })]}
      exact
    >
      <RedirectToAccessControlHome />
    </RouteWithLayout>
    <RouteWithLayout sidebarProps={ProjectDetailsSideNavProps} path={[routesV1.toUsers({ ...projectPathProps })]} exact>
      <AccessControlPage>
        <UsersPage />
      </AccessControlPage>
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routesV1.toFileStore({ ...projectPathProps })}
      exact
    >
      <FileStorePage />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={[routesV1.toUserDetails({ ...projectPathProps, ...userPathProps })]}
      exact
    >
      <UserDetails />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={[routesV1.toUserGroups({ ...projectPathProps })]}
      exact
    >
      <AccessControlPage>
        <UserGroups />
      </AccessControlPage>
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={[routesV1.toUserGroupDetails({ ...projectPathProps, ...userGroupPathProps })]}
      exact
    >
      <UserGroupDetails />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routesV1.toServiceAccounts({ ...projectPathProps })}
      exact
    >
      <AccessControlPage>
        <ServiceAccountsPage />
      </AccessControlPage>
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routesV1.toServiceAccountDetails({ ...projectPathProps, ...serviceAccountProps })}
      exact
    >
      <ServiceAccountDetails />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={[routesV1.toResourceGroups({ ...projectPathProps })]}
      exact
    >
      <AccessControlPage>
        <ResourceGroups />
      </AccessControlPage>
    </RouteWithLayout>
    <RouteWithLayout sidebarProps={ProjectDetailsSideNavProps} path={[routesV1.toRoles({ ...projectPathProps })]} exact>
      <AccessControlPage>
        <Roles />
      </AccessControlPage>
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={[routesV1.toRoleDetails({ ...projectPathProps, ...rolePathProps })]}
      exact
    >
      <RoleDetails />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={[routesV1.toResourceGroupDetails({ ...projectPathProps, ...resourceGroupPathProps })]}
      exact
    >
      <ResourceGroupDetails />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      exact
      path={[routesV1.toGitSyncAdmin({ ...accountPathProps, ...projectPathProps })]}
    >
      <RedirectToGitSyncHome />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={ProjectDetailsSideNavProps}
      path={routesV1.toGitSyncReposAdmin({ ...accountPathProps, ...projectPathProps })}
    >
      <GitSyncPage>
        <GitSyncRepoTab />
      </GitSyncPage>
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routesV1.toGitSyncEntitiesAdmin({ ...accountPathProps, ...projectPathProps })}
      exact
    >
      <GitSyncPage>
        <GitSyncEntityTab />
      </GitSyncPage>
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routesV1.toGitSyncErrors({ ...accountPathProps, ...projectPathProps })}
      exact
    >
      <GitSyncPage>
        <GitSyncErrors />
      </GitSyncPage>
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routesV1.toGitSyncConfig({ ...accountPathProps, ...projectPathProps })}
      exact
    >
      <GitSyncPage>
        <GitSyncConfigTab />
      </GitSyncPage>
    </RouteWithLayout>
    {GovernanceRouteDestinations({
      sidebarProps: ProjectDetailsSideNavProps,
      pathProps: { ...projectPathProps }
    })}
    {GovernanceRouteDestinations({
      sidebarProps: AccountSideNavProps,
      pathProps: { ...accountPathProps, ...orgPathProps }
    })}
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={[routesV1.toOrganizationTicketSettings({ ...accountPathProps, ...orgPathProps })]}
      exact
    >
      <ExternalTicketSettings />
    </RouteWithLayout>
  </>
)
