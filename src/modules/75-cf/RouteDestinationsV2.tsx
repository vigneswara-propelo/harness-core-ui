/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, ReactElement } from 'react'
import { Redirect, Switch, useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitionsV2'
import type { AccountPathProps, ProjectPathProps, Module } from '@common/interfaces/RouteInterfaces'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { Scope } from 'framework/types/types'
import { RouteWithContext } from '@common/router/RouteWithContext/RouteWithContext'
import {
  accountPathProps,
  environmentPathProps,
  featureFlagPathProps,
  projectPathProps,
  segmentPathProps,
  targetPathProps,
  modulePathProps,
  NAV_MODE,
  orgPathProps
} from '@common/utils/routeUtils'
import CFHomePage from '@cf/pages/home/CFHomePage'
import FeatureFlagsDetailPage from '@cf/pages/feature-flags-detail/FeatureFlagsDetailPage'
import EnvironmentsPage from '@cf/pages/environments/EnvironmentsPage'
import EnvironmentDetails from '@cf/pages/environment-details/EnvironmentDetails'
import CFWorkflowsPage from '@cf/pages/workflows/CFWorkflowsPage'
import { ModuleName } from 'framework/types/ModuleName'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import RbacFactory from '@rbac/factories/RbacFactory'
import { ResourceCategory, ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import featureFactory from 'framework/featureStore/FeaturesFactory'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import { RedirectToModuleTrialHomeFactory, RedirectToSubscriptionsFactory } from '@common/Redirects'
import type { AuditEventData, ResourceDTO } from 'services/audit'
import AuditTrailFactory, { ResourceScope } from 'framework/AuditTrail/AuditTrailFactory'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { getBannerText } from '@cf/utils/UsageLimitUtils'
import { String } from 'framework/strings'
import PipelineRouteDestinations from '@pipeline/PipelineRouteDestinations'
import { LICENSE_STATE_NAMES, LicenseRedirectProps } from 'framework/LicenseStore/LicenseStoreContext'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useGetSelectedScope } from '@common/navigation/SideNavV2/SideNavV2.utils'
import TriggersRouteDestinations from '@triggers/TriggersRouteDestinations'
import TagsAttributeModalBody from './components/TagsAttributeModalBody/TagsAttributeModalBody'
import { registerFeatureFlagPipelineStage } from './pages/pipeline-studio/views/FeatureFlagStage'
import { registerFlagConfigurationPipelineStep } from './components/PipelineSteps'
import { TargetsPage } from './pages/target-management/targets/TargetsPage'
import TargetDetailPage from './pages/target-detail/TargetDetailPage'
import { SegmentsPage } from './pages/target-management/segments/SegmentsPage'
import TargetGroupDetailPage from './pages/target-group-detail/TargetGroupDetailPage'
import { OnboardingPage } from './pages/onboarding/OnboardingPage'
import { OnboardingDetailPage } from './pages/onboarding/OnboardingDetailPage'
import CFTrialHomePage from './pages/home/trialPage/CFTrialHomePage'
import ConfigurePath from './pages/onboarding/ConfigurePath'
import FFUIApp from './pages/FFUIApp/FFUIApp'
import { FFGitSyncProvider } from './contexts/ff-git-sync-context/FFGitSyncContext'
import FeatureFlagsLandingPage from './pages/feature-flags/FeatureFlagsLandingPage'

featureFactory.registerFeaturesByModule('cf', {
  features: [FeatureIdentifier.MAUS],
  renderMessage: (props, getString, additionalLicenseProps = {}) => {
    const monthlyActiveUsers = props.features.get(FeatureIdentifier.MAUS)
    const count = monthlyActiveUsers?.featureDetail?.count
    const limit = monthlyActiveUsers?.featureDetail?.limit

    const { message, bannerType } = getBannerText(getString, additionalLicenseProps, count, limit)

    return {
      message: () => message,
      bannerType
    }
  }
})

const licenseRedirectData: LicenseRedirectProps = {
  licenseStateName: LICENSE_STATE_NAMES.FF_LICENSE_STATE,
  startTrialRedirect: RedirectToModuleTrialHomeFactory(ModuleName.CF),
  expiredTrialRedirect: RedirectToSubscriptionsFactory(ModuleName.CF)
}

AuditTrailFactory.registerResourceHandler('FEATURE_FLAG', {
  moduleIcon: {
    name: 'nav-cf'
  },
  moduleLabel: 'cf.auditTrail.label',
  resourceLabel: 'common.moduleTitles.cf',
  resourceUrl: (resource: ResourceDTO, resourceScope: ResourceScope) => {
    const { accountIdentifier, orgIdentifier, projectIdentifier } = resourceScope

    return routes.toCFFeatureFlagsDetail({
      orgIdentifier: orgIdentifier as string,
      projectIdentifier: projectIdentifier as string,
      featureFlagIdentifier: resource.identifier,
      accountId: accountIdentifier
    })
  }
})

AuditTrailFactory.registerResourceHandler('TARGET_GROUP', {
  moduleIcon: {
    name: 'nav-cf'
  },
  moduleLabel: 'cf.auditTrail.label',
  resourceLabel: 'cf.auditTrail.tgResourceLabel',
  resourceUrl: (
    resource: ResourceDTO,
    resourceScope: ResourceScope,
    _module?: Module,
    auditEventData?: AuditEventData
  ) => {
    const { accountIdentifier, orgIdentifier, projectIdentifier } = resourceScope
    return routes.toCFSegmentDetailsWithEnv({
      accountId: accountIdentifier,
      orgIdentifier: orgIdentifier as string,
      projectIdentifier: projectIdentifier as string,
      segmentIdentifier: resource.identifier,
      environmentIdentifier: (auditEventData as any)?.environment
    })
  }
})

RbacFactory.registerResourceCategory(ResourceCategory.FEATUREFLAG_FUNCTIONS, {
  icon: 'nav-cf',
  label: 'cf.rbac.category'
})

RbacFactory.registerResourceTypeHandler(ResourceType.FEATUREFLAG, {
  icon: 'nav-cf',
  label: 'cf.rbac.featureflag.label',
  labelSingular: 'common.moduleTitles.cf',
  category: ResourceCategory.FEATUREFLAG_FUNCTIONS,
  addAttributeModalBody: props => <TagsAttributeModalBody {...props} />,
  permissionLabels: {
    [PermissionIdentifier.TOGGLE_FF_FEATUREFLAG]: <String stringID="cf.rbac.featureflag.toggle" />,
    [PermissionIdentifier.EDIT_FF_FEATUREFLAG]: <String stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_FF_FEATUREFLAG]: <String stringID="cf.rbac.featureflag.delete" />
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.TARGETGROUP, {
  icon: 'nav-cf',
  label: 'cf.rbac.targetgroup.label',
  category: ResourceCategory.FEATUREFLAG_FUNCTIONS,
  permissionLabels: {
    [PermissionIdentifier.EDIT_FF_TARGETGROUP]: <String stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_FF_TARGETGROUP]: <String stringID="cf.rbac.targetgroup.delete" />
  }
})

const RedirectToTargets = (): ReactElement => {
  const { withActiveEnvironment } = useActiveEnvironment()
  const params = useParams<ProjectPathProps & AccountPathProps>()

  return <Redirect to={withActiveEnvironment(routes.toCFTargets(params))} />
}

const RedirectToCFProject = (): ReactElement => {
  const params = useParams<ProjectPathProps>()
  const { selectedProject } = useAppStore()

  if (selectedProject?.modules?.includes(ModuleName.CF)) {
    return <Redirect to={routes.toCFConfigurePath(params)} />
  } else {
    return <Redirect to={routes.toCFHome(params)} />
  }
}

registerFeatureFlagPipelineStage()
registerFlagConfigurationPipelineStep()

const CFRedirect: FC = () => {
  const { scope, params } = useGetSelectedScope()
  const { accountId } = useParams<AccountPathProps>()

  if (scope === Scope.PROJECT) {
    return (
      <Redirect
        to={routes.toCFConfigurePath({
          accountId,
          orgIdentifier: params?.orgIdentifier as string,
          projectIdentifier: params?.projectIdentifier as string,
          module: 'cf'
        })}
      />
    )
  }

  if (scope === Scope.ORGANIZATION) {
    return <Redirect to={routes.toSettings({ orgIdentifier: params?.orgIdentifier, module: 'cf' })} />
  }

  if (scope === Scope.ACCOUNT) {
    return <Redirect to={routes.toSettings({ module: 'cf' })} />
  }

  return <CFHomePage />
}

const CFRouteDestinations = (mode = NAV_MODE.MODULE): ReactElement => {
  const {
    FFM_3959_FF_MFE_Environment_Detail,
    FFM_5939_MFE_TARGET_GROUPS_LISTING,
    FFM_6666_FF_MFE_Target_Group_Detail,
    FFM_5256_FF_MFE_Environment_Listing,
    FFM_5951_FF_MFE_Targets_Listing,
    FFM_6665_FF_MFE_Target_Detail,
    FFM_6800_FF_MFE_ONBOARDING,
    FFM_7127_FF_MFE_ONBOARDING_DETAIL
  } = useFeatureFlags()

  return (
    <Switch>
      <RouteWithContext
        exact
        path={[
          routes.toMode({ ...projectPathProps, module: 'cf', mode }),
          routes.toMode({ ...orgPathProps, module: 'cf', mode }),
          routes.toMode({ ...accountPathProps, module: 'cf', mode })
        ]}
      >
        <CFRedirect />
      </RouteWithContext>

      <RouteWithContext
        licenseRedirectData={licenseRedirectData}
        path={routes.toCFProject({ ...accountPathProps, ...projectPathProps, mode })}
        exact
      >
        <RedirectToCFProject />
      </RouteWithContext>

      <RouteWithContext
        path={routes.toModuleTrialHome({ ...accountPathProps, module: 'cf', mode })}
        exact
        pageName={PAGE_NAME.CFTrialHomePage}
      >
        <CFTrialHomePage />
      </RouteWithContext>

      <RouteWithContext
        path={routes.toFeatureFlagsProxySettings({ ...accountPathProps })}
        exact
        pageName={PAGE_NAME.FeatureFlagsProxy}
      >
        <FFUIApp />
      </RouteWithContext>

      <RouteWithContext
        licenseRedirectData={licenseRedirectData}
        path={routes.toCFFeatureFlags({ ...accountPathProps, ...projectPathProps, ...modulePathProps, mode })}
        exact
        pageName={PAGE_NAME.FeatureFlagsLandingPage}
      >
        <FFGitSyncProvider>
          <FeatureFlagsLandingPage />
        </FFGitSyncProvider>
      </RouteWithContext>

      <RouteWithContext
        licenseRedirectData={licenseRedirectData}
        path={routes.toCFFeatureFlagsDetail({
          ...accountPathProps,
          ...projectPathProps,
          ...featureFlagPathProps,
          ...modulePathProps,
          mode
        })}
        exact
        pageName={PAGE_NAME.FeatureFlagsDetailPage}
      >
        <FFGitSyncProvider>
          <FeatureFlagsDetailPage />
        </FFGitSyncProvider>
      </RouteWithContext>

      <RouteWithContext
        licenseRedirectData={licenseRedirectData}
        path={routes.toCFSegmentDetails({
          ...accountPathProps,
          ...projectPathProps,
          ...segmentPathProps,
          ...modulePathProps,
          mode
        })}
        exact
        pageName={PAGE_NAME.TargetGroupDetailPage}
      >
        <FFGitSyncProvider>
          {FFM_6666_FF_MFE_Target_Group_Detail ? <FFUIApp /> : <TargetGroupDetailPage />}
        </FFGitSyncProvider>
      </RouteWithContext>

      <RouteWithContext
        licenseRedirectData={licenseRedirectData}
        path={routes.toCFTargetDetails({
          ...accountPathProps,
          ...projectPathProps,
          ...targetPathProps,
          ...modulePathProps,
          mode
        })}
        exact
        pageName={PAGE_NAME.TargetDetailPage}
      >
        <FFGitSyncProvider>{FFM_6665_FF_MFE_Target_Detail ? <FFUIApp /> : <TargetDetailPage />}</FFGitSyncProvider>
      </RouteWithContext>

      <RouteWithContext
        licenseRedirectData={licenseRedirectData}
        path={routes.toCFTargetManagement({ ...accountPathProps, ...projectPathProps, ...modulePathProps, mode })}
        exact
      >
        <RedirectToTargets />
      </RouteWithContext>

      <RouteWithContext
        licenseRedirectData={licenseRedirectData}
        path={routes.toCFSegments({ ...accountPathProps, ...projectPathProps, ...modulePathProps, mode })}
        exact
        pageName={PAGE_NAME.SegmentsPage}
      >
        <FFGitSyncProvider>{FFM_5939_MFE_TARGET_GROUPS_LISTING ? <FFUIApp /> : <SegmentsPage />}</FFGitSyncProvider>
      </RouteWithContext>

      <RouteWithContext
        licenseRedirectData={licenseRedirectData}
        path={routes.toCFTargets({ ...accountPathProps, ...projectPathProps, ...modulePathProps, mode })}
        exact
        pageName={PAGE_NAME.TargetsPage}
      >
        {FFM_5951_FF_MFE_Targets_Listing ? <FFUIApp /> : <TargetsPage />}
      </RouteWithContext>

      <RouteWithContext
        licenseRedirectData={licenseRedirectData}
        path={routes.toCFEnvironments({ ...accountPathProps, ...projectPathProps, ...modulePathProps, mode })}
        exact
        pageName={PAGE_NAME.EnvironmentsPage}
      >
        <FFGitSyncProvider>
          {FFM_5256_FF_MFE_Environment_Listing ? <FFUIApp /> : <EnvironmentsPage />}
        </FFGitSyncProvider>
      </RouteWithContext>

      <RouteWithContext
        licenseRedirectData={licenseRedirectData}
        path={routes.toCFEnvironmentDetails({
          ...projectPathProps,
          ...modulePathProps,
          ...environmentPathProps,
          mode
        })}
        exact
        pageName={PAGE_NAME.EnvironmentDetails}
      >
        {FFM_3959_FF_MFE_Environment_Detail ? <FFUIApp /> : <EnvironmentDetails />}
      </RouteWithContext>

      <RouteWithContext
        licenseRedirectData={licenseRedirectData}
        path={routes.toCFOnboarding({
          ...accountPathProps,
          ...projectPathProps,
          ...environmentPathProps,
          ...modulePathProps,
          mode
        })}
        exact
        pageName={PAGE_NAME.OnboardingPage}
      >
        {FFM_6800_FF_MFE_ONBOARDING ? <FFUIApp /> : <OnboardingPage />}
      </RouteWithContext>

      <RouteWithContext
        licenseRedirectData={licenseRedirectData}
        path={routes.toCFOnboardingDetail({
          ...accountPathProps,
          ...projectPathProps,
          ...environmentPathProps,
          ...modulePathProps,
          mode
        })}
        exact
        pageName={PAGE_NAME.OnboardingDetailPage}
      >
        {FFM_7127_FF_MFE_ONBOARDING_DETAIL ? <FFUIApp /> : <OnboardingDetailPage />}
      </RouteWithContext>

      <RouteWithContext
        licenseRedirectData={licenseRedirectData}
        path={routes.toCFConfigurePath({
          ...accountPathProps,
          ...projectPathProps,
          ...environmentPathProps,
          ...modulePathProps,
          mode
        })}
        exact
        pageName={PAGE_NAME.CFConfigurePath}
      >
        {FFM_6800_FF_MFE_ONBOARDING ? <FFUIApp /> : <ConfigurePath />}
      </RouteWithContext>

      <RouteWithContext
        licenseRedirectData={licenseRedirectData}
        path={routes.toCFWorkflows({ ...accountPathProps, ...projectPathProps, ...modulePathProps, mode })}
        exact
        pageName={PAGE_NAME.CFWorkflowsPage}
      >
        <CFWorkflowsPage />
      </RouteWithContext>
      {PipelineRouteDestinations({ mode }).props.children}
      {TriggersRouteDestinations({ mode }).props.children}
    </Switch>
  )
}

export default CFRouteDestinations
