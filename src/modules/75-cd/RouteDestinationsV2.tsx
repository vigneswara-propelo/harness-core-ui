/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Redirect, useParams, Switch } from 'react-router-dom'
import routes from '@common/RouteDefinitionsV2'
import { AccountPathProps, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import PipelineRouteDestinations from '@pipeline/PipelineRouteDestinations'
import { RouteWithContext } from '@common/router/RouteWithContext/RouteWithContext'
import { ResourceCategory, ResourceType } from '@rbac/interfaces/ResourceType'
import { String as LocaleString } from 'framework/strings'
import { ModuleName } from 'framework/types/ModuleName'
import { LICENSE_STATE_NAMES, LicenseRedirectProps } from 'framework/LicenseStore/LicenseStoreContext'
import {
  NAV_MODE,
  accountPathProps,
  environmentGroupPathProps,
  environmentPathProps,
  modulePathProps,
  orgPathProps,
  projectPathProps,
  servicePathProps
} from '@common/utils/routeUtils'
import { RedirectToModuleTrialHomeFactory, RedirectToSubscriptionsFactory } from '@common/Redirects'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import RbacFactory from '@rbac/factories/RbacFactory'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { Scope } from 'framework/types/types'
import LandingDashboardPage from '@projects-orgs/pages/LandingDashboardPage/LandingDashboardPage'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import TriggersRouteDestinations from '@triggers/TriggersRouteDestinations'
import { useGetSelectedScope } from '@common/navigation/SideNavV2/SideNavV2.utils'
import SRMRouteDestinations from '@modules/85-cv/SRMRouteDestinations'
import CDDashboardPage from './pages/dashboard/CDDashboardPage'
import CDHomePage from './pages/home/CDHomePage'
import ServiceStudio from './components/Services/ServiceStudio/ServiceStudio'
import EnvironmentDetails from './components/EnvironmentsV2/EnvironmentDetails/EnvironmentDetails'
import EnvironmentGroupsPage from './components/EnvironmentGroups/EnvironmentGroups'
import { Services } from './components/Services/Services'
import { EnvironmentsPage } from './RouteDestinations'
import EnvironmentGroupDetails from './components/EnvironmentGroups/EnvironmentGroupDetails/EnvironmentGroupDetails'
import ServiceOverrides from './components/ServiceOverrides/ServiceOverrides'
import CDOnboardingWizard from './pages/get-started-with-cd/CDOnboardingWizardWithCLI/CDOnboardingWizard'
import CDOnboardingFullScreen from './pages/get-started-with-cd/CDOnboardingWizardWithCLI/CDOnboardingFullScreen'

const CDOnboardingWizardWithCLI = React.lazy(
  () => import('./pages/get-started-with-cd/CDOnboardingWizardWithCLI/CDOnboardingWizard')
)

RbacFactory.registerResourceCategory(ResourceCategory.GITOPS, {
  icon: 'gitops-blue-circle',
  label: 'cd.gitOps'
})

RbacFactory.registerResourceTypeHandler(ResourceType.GITOPS_AGENT, {
  icon: 'gitops-agents-blue-circle',
  label: 'common.agents',
  labelSingular: 'common.agent',
  category: ResourceCategory.GITOPS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_GITOPS_AGENT]: <LocaleString stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_GITOPS_AGENT]: <LocaleString stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_GITOPS_AGENT]: <LocaleString stringID="delete" />
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.GITOPS_APP, {
  icon: 'gitops-applications-blue-circle',
  label: 'applications',
  labelSingular: 'common.application',
  category: ResourceCategory.GITOPS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_GITOPS_APPLICATION]: <LocaleString stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_GITOPS_APPLICATION]: <LocaleString stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_GITOPS_APPLICATION]: <LocaleString stringID="delete" />,
    [PermissionIdentifier.SYNC_GITOPS_APPLICATION]: <LocaleString stringID="common.sync" />,
    [PermissionIdentifier.OVERRIDE_GITOPS_APPLICATION]: <LocaleString stringID="override" />
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.GITOPS_CERT, {
  icon: 'gitops-repository-certificates-blue-circle',
  label: 'common.repositoryCertificates',
  labelSingular: 'common.singularLabels.repositoryCertificate',
  category: ResourceCategory.GITOPS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_GITOPS_CERT]: <LocaleString stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_GITOPS_CERT]: <LocaleString stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_GITOPS_CERT]: <LocaleString stringID="delete" />
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.GITOPS_CLUSTER, {
  icon: 'gitops-clusters-blue-circle',
  label: 'common.clusters',
  labelSingular: 'common.cluster',
  category: ResourceCategory.GITOPS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_GITOPS_CLUSTER]: <LocaleString stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_GITOPS_CLUSTER]: <LocaleString stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_GITOPS_CLUSTER]: <LocaleString stringID="delete" />
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.GITOPS_GPGKEY, {
  icon: 'gitops-gnupg-key-blue-circle',
  label: 'common.gnupgKeys',
  labelSingular: 'common.singularLabels.gnupgKey',
  category: ResourceCategory.GITOPS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_GITOPS_GPGKEY]: <LocaleString stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_GITOPS_GPGKEY]: <LocaleString stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_GITOPS_GPGKEY]: <LocaleString stringID="delete" />
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.GITOPS_REPOSITORY, {
  icon: 'gitops-repository-blue-circle',
  label: 'repositories',
  labelSingular: 'repository',
  category: ResourceCategory.GITOPS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_GITOPS_REPOSITORY]: <LocaleString stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_GITOPS_REPOSITORY]: <LocaleString stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_GITOPS_REPOSITORY]: <LocaleString stringID="delete" />
  }
})

const CDRedirect: React.FC = () => {
  const { scope, params } = useGetSelectedScope()
  const { accountId } = useParams<AccountPathProps>()

  if (scope === Scope.PROJECT) {
    return (
      <Redirect
        to={routes.toOverview({
          projectIdentifier: params?.projectIdentifier,
          orgIdentifier: params?.orgIdentifier,
          accountId,
          module: 'cd'
        })}
      />
    )
  }

  if (scope === Scope.ORGANIZATION) {
    return <Redirect to={routes.toProjects({ orgIdentifier: params?.orgIdentifier, module: 'cd' })} />
  }

  if (scope === Scope.ACCOUNT) {
    return <Redirect to={routes.toOrgs({ module: 'cd' })} />
  }

  return <CDHomePage />
}

const RedirectToSubscriptions = RedirectToSubscriptionsFactory(ModuleName.CD)

const licenseRedirectData: LicenseRedirectProps = {
  licenseStateName: LICENSE_STATE_NAMES.CD_LICENSE_STATE,
  startTrialRedirect: RedirectToModuleTrialHomeFactory(ModuleName.CD),
  expiredTrialRedirect: RedirectToSubscriptions
}

const CDOnboardingWizardComponent = (): JSX.Element => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const PLG_CD_CLI_WIZARD_ENABLED = useFeatureFlag(FeatureFlag.PLG_CD_CLI_WIZARD_ENABLED)

  return PLG_CD_CLI_WIZARD_ENABLED ? (
    <Redirect to={routes.toCDOnboardingWizardWithCLI({ accountId, projectIdentifier, orgIdentifier, module: 'cd' })} />
  ) : (
    <CDOnboardingWizard />
  )
}

const CDRouteDestinations = (mode = NAV_MODE.MODULE): React.ReactElement => {
  // check if we need RouteWithLayout or create a new component
  return (
    <Switch>
      <RouteWithContext
        exact
        path={[
          routes.toMode({ ...projectPathProps, module: 'cd', mode }),
          routes.toMode({ ...orgPathProps, module: 'cd', mode }),
          routes.toMode({ ...accountPathProps, module: 'cd', mode })
        ]}
      >
        <CDRedirect />
      </RouteWithContext>

      <RouteWithContext path={routes.toOverview({ ...modulePathProps, ...projectPathProps, mode })}>
        <CDDashboardPage />
      </RouteWithContext>

      <RouteWithContext path={routes.toOverview({ ...modulePathProps, ...accountPathProps, mode })}>
        <LandingDashboardPage />
      </RouteWithContext>

      <RouteWithContext
        exact
        pageName={PAGE_NAME.GetStartedWithCD}
        path={routes.toGetStartedWithCD({ ...modulePathProps, ...projectPathProps, mode })}
      >
        <CDOnboardingFullScreen />
      </RouteWithContext>

      {/* services routes */}
      <RouteWithContext
        exact
        path={routes.toServices({ ...modulePathProps, ...projectPathProps, mode })}
        pageName={PAGE_NAME.Services}
      >
        <Services showServicesDashboard />
      </RouteWithContext>

      <RouteWithContext
        exact
        path={routes.toServiceStudio({
          ...modulePathProps,
          ...projectPathProps,
          ...servicePathProps,
          mode
        })}
      >
        <ServiceStudio />
      </RouteWithContext>

      {/* environment routes */}

      <RouteWithContext
        exact
        path={routes.toEnvironment({ ...modulePathProps, ...projectPathProps, mode })}
        pageName={PAGE_NAME.Environments}
      >
        <EnvironmentsPage />
      </RouteWithContext>

      <RouteWithContext
        exact
        path={routes.toEnvironmentDetails({
          ...modulePathProps,
          ...projectPathProps,
          ...environmentPathProps,
          mode
        })}
        pageName={PAGE_NAME.EnvironmentDetails}
      >
        <EnvironmentDetails />
      </RouteWithContext>
      <RouteWithContext
        exact
        path={routes.toEnvironmentGroups({
          ...modulePathProps,
          ...projectPathProps,
          ...environmentPathProps,
          mode
        })}
        pageName={PAGE_NAME.EnvironmentGroups}
      >
        <EnvironmentGroupsPage />
      </RouteWithContext>
      <RouteWithContext
        exact
        path={routes.toEnvironmentGroupDetails({
          ...modulePathProps,
          ...projectPathProps,
          ...environmentGroupPathProps,
          mode
        })}
        pageName={PAGE_NAME.EnvironmentGroupDetails}
      >
        <EnvironmentGroupDetails />
      </RouteWithContext>

      <RouteWithContext
        exact
        licenseRedirectData={licenseRedirectData}
        path={routes.toServiceOverrides({ ...projectPathProps, ...modulePathProps, mode })}
        pageName={PAGE_NAME.ServiceOverrides}
      >
        <ServiceOverrides />
      </RouteWithContext>

      <RouteWithContext
        exact
        licenseRedirectData={licenseRedirectData}
        path={routes.toCDOnboardingWizard({ ...modulePathProps, ...projectPathProps, mode })}
        pageName={PAGE_NAME.CDOnboardingWizard}
      >
        <CDOnboardingWizardComponent />
      </RouteWithContext>

      <RouteWithContext
        exact
        licenseRedirectData={licenseRedirectData}
        path={routes.toCDOnboardingWizardWithCLI({ ...projectPathProps, ...modulePathProps, mode })}
        pageName={PAGE_NAME.CDOnboardingWizard}
      >
        <CDOnboardingWizardWithCLI />
      </RouteWithContext>

      {
        PipelineRouteDestinations({ mode, pipelineStudioPageName: PAGE_NAME.CDPipelineStudio, licenseRedirectData })
          .props.children
      }
      {TriggersRouteDestinations({ mode }).props.children}
      {SRMRouteDestinations({ mode }).props.children}
    </Switch>
  )
}

export default CDRouteDestinations
