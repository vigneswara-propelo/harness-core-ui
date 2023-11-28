/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams, Redirect, Switch, Route } from 'react-router-dom'
import { createClient, Provider, dedupExchange, cacheExchange, fetchExchange } from 'urql'
import { requestPolicyExchange } from '@urql/exchange-request-policy'
import { get } from 'lodash-es'
import routes from '@common/RouteDefinitionsV2'
import { accountPathProps, NAV_MODE } from '@common/utils/routeUtils'
import type { AccountPathProps, ModulePathParams } from '@common/interfaces/RouteInterfaces'
import SessionToken from 'framework/utils/SessionToken'
// eslint-disable-next-line no-restricted-imports
import ChildAppMounter from 'microfrontends/ChildAppMounter'

import { ModuleName, Module } from 'framework/types/ModuleName'
import { getConfig } from 'services/config'
import { LicenseRedirectProps, LICENSE_STATE_NAMES } from 'framework/LicenseStore/LicenseStoreContext'
import featureFactory from 'framework/featureStore/FeaturesFactory'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { BannerType } from '@common/layouts/Constants'
import { FEATURE_USAGE_WARNING_LIMIT } from '@common/layouts/FeatureBanner'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import AuditTrailFactory, { ResourceScope } from 'framework/AuditTrail/AuditTrailFactory'
import type { ResourceDTO } from 'services/audit'
import RbacFactory from '@rbac/factories/RbacFactory'
import { ResourceCategory, ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { String as LocaleString } from 'framework/strings'
import type { CCMUIAppCustomProps } from '@ce/interface/CCMUIApp.types'
import {
  ConnectorReferenceField,
  DefaultSettingConnectorField
} from '@platform/connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import FeatureWarningBanner from '@common/components/FeatureWarning/FeatureWarningBanner'
import { FeatureWarningTooltip } from '@common/components/FeatureWarning/FeatureWarningWithTooltip'
import useTestConnectionModal from '@platform/connectors/common/useTestConnectionModal/useTestConnectionModal'
import DefaultSettingsFactory from '@default-settings/factories/DefaultSettingsFactory'
import { SettingGroups } from '@default-settings/interfaces/SettingType.types'
import { SettingType } from '@common/constants/Utils'
import { RouteWithContext } from '@common/router/RouteWithContext/RouteWithContext'
import { Connectors } from '@connectors/constants'
import NotFoundPage from '@common/pages/404/NotFoundPage'
import { useFeatureFlags } from '@modules/10-common/hooks/useFeatureFlag'
import CEHomePage from './pages/home/CEHomePage'
import CETrialHomePage from './pages/home/CETrialHomePage'

// import OverviewPage from './pages/overview/OverviewPage'
import formatCost from './utils/formatCost'
import OverviewAddCluster from './components/OverviewPage/OverviewAddCluster'
import GatewayListFilters from './components/COGatewayList/GatewayListFilters'
import PerspectiveResourceModalBody from './components/ResourceGroupModals/Perspective/PerspectiveResourceModalBody'
import PerspectiveResourceRenderer from './components/ResourceGroupModals/Perspective/PerspectiveResourceRenderer'
import GovernanceRulesResourceModalBody from './components/ResourceGroupModals/GovernanceRules/GovernanceRulesResourceModalBody'
import GovernanceRulesResourceRenderer from './components/ResourceGroupModals/GovernanceRules/GovernanceRulesResourceRenderer'

const module: Module = 'ce'

RbacFactory.registerResourceCategory(ResourceCategory.CLOUD_COSTS, {
  icon: 'ccm-solid',
  label: 'common.purpose.ce.continuous'
})

RbacFactory.registerResourceTypeHandler(ResourceType.CCM_OVERVIEW, {
  icon: 'ccm-solid',
  label: 'overview',
  category: ResourceCategory.CLOUD_COSTS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_CCM_OVERVIEW]: <LocaleString stringID="rbac.permissionLabels.view" />
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.CCM_PERSPECTIVE, {
  icon: 'ccm-solid',
  label: 'ce.perspectives.sideNavText',
  labelSingular: 'ce.sideNav.perspective',
  category: ResourceCategory.CLOUD_COSTS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_CCM_PERSPECTIVE]: <LocaleString stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_CCM_PERSPECTIVE]: <LocaleString stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_CCM_PERSPECTIVE]: <LocaleString stringID="delete" />
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.CCM_PERSPECTIVE_FOLDERS, {
  icon: 'ccm-solid',
  label: 'ce.perspectives.folders.customFolders',
  category: ResourceCategory.CLOUD_COSTS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_CCM_PERSPECTIVE_FOLDERS]: <LocaleString stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_CCM_PERSPECTIVE_FOLDERS]: <LocaleString stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_CCM_PERSPECTIVE_FOLDERS]: <LocaleString stringID="delete" />
  },
  addResourceModalBody: props => <PerspectiveResourceModalBody {...props} />,
  staticResourceRenderer: props => <PerspectiveResourceRenderer {...props} />
})

RbacFactory.registerResourceTypeHandler(ResourceType.CCM_BUDGETS, {
  icon: 'ccm-solid',
  label: 'ce.budgets.sideNavText',
  labelSingular: 'ce.common.budget',
  category: ResourceCategory.CLOUD_COSTS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_CCM_BUDGET]: <LocaleString stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_CCM_BUDGET]: <LocaleString stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_CCM_BUDGET]: <LocaleString stringID="delete" />
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.CCM_COST_CATEGORY, {
  icon: 'ccm-solid',
  label: 'ce.businessMapping.sideNavText',
  labelSingular: 'ce.businessMapping.costCategory',
  category: ResourceCategory.CLOUD_COSTS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_CCM_COST_CATEGORY]: <LocaleString stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_CCM_COST_CATEGORY]: <LocaleString stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_CCM_COST_CATEGORY]: <LocaleString stringID="delete" />
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.AUTOSTOPPINGRULE, {
  icon: 'ccm-solid',
  label: 'ce.co.breadCrumb.rules',
  labelSingular: 'common.singularLabels.autoStoppingRule',
  category: ResourceCategory.CLOUD_COSTS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_CCM_AUTOSTOPPING_RULE]: <LocaleString stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_CCM_AUTOSTOPPING_RULE]: <LocaleString stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_CCM_AUTOSTOPPING_RULE]: <LocaleString stringID="delete" />
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.LOADBALANCER, {
  icon: 'ccm-solid',
  label: 'common.loadBalancer',
  category: ResourceCategory.CLOUD_COSTS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_CCM_LOADBALANCER]: <LocaleString stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_CCM_LOADBALANCER]: <LocaleString stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_CCM_LOADBALANCER]: <LocaleString stringID="delete" />
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.CCM_CURRENCYPREFERENCE, {
  icon: 'ccm-solid',
  label: 'ce.currencyPreferences.sideNavText',
  category: ResourceCategory.CLOUD_COSTS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_CCM_CURRENCYPREFERENCE]: <LocaleString stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_CCM_CURRENCYPREFERENCE]: <LocaleString stringID="rbac.permissionLabels.createEdit" />
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.CCM_CLOUD_ASSET_GOVERNANCE_RULE, {
  icon: 'ccm-solid',
  label: 'ce.governance.rules',
  category: ResourceCategory.CLOUD_COSTS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_CCM_CLOUD_ASSET_GOVERNANCE_RULE]: <LocaleString stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_CCM_CLOUD_ASSET_GOVERNANCE_RULE]: (
      <LocaleString stringID="rbac.permissionLabels.createEdit" />
    ),
    [PermissionIdentifier.DELETE_CCM_CLOUD_ASSET_GOVERNANCE_RULE]: <LocaleString stringID="delete" />,
    [PermissionIdentifier.EXECUTE_CCM_CLOUD_ASSET_GOVERNANCE_RULE]: <LocaleString stringID="common.execute" />
  },
  addResourceModalBody: props => <GovernanceRulesResourceModalBody {...props} />,
  staticResourceRenderer: props => <GovernanceRulesResourceRenderer {...props} />
})

RbacFactory.registerResourceTypeHandler(ResourceType.CCM_CLOUD_ASSET_GOVERNANCE_RULE_SET, {
  icon: 'ccm-solid',
  label: 'ce.governance.ruleSets',
  category: ResourceCategory.CLOUD_COSTS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_CCM_CLOUD_ASSET_GOVERNANCE_RULE_SET]: (
      <LocaleString stringID="rbac.permissionLabels.view" />
    ),
    [PermissionIdentifier.EDIT_CCM_CLOUD_ASSET_GOVERNANCE_RULE_SET]: (
      <LocaleString stringID="rbac.permissionLabels.createEdit" />
    ),
    [PermissionIdentifier.DELETE_CCM_CLOUD_ASSET_GOVERNANCE_RULE_SET]: <LocaleString stringID="delete" />
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.CCM_CLOUD_ASSET_GOVERNANCE_RULE_ENFORCEMENT, {
  icon: 'ccm-solid',
  label: 'ce.governance.enforcements',
  category: ResourceCategory.CLOUD_COSTS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_CCM_CLOUD_ASSET_GOVERNANCE_RULE_ENFORCEMENT]: (
      <LocaleString stringID="rbac.permissionLabels.view" />
    ),
    [PermissionIdentifier.EDIT_CCM_CLOUD_ASSET_GOVERNANCE_RULE_ENFORCEMENT]: (
      <LocaleString stringID="rbac.permissionLabels.createEdit" />
    ),
    [PermissionIdentifier.DELETE_CCM_CLOUD_ASSET_GOVERNANCE_RULE_ENFORCEMENT]: <LocaleString stringID="delete" />
  }
})

featureFactory.registerFeaturesByModule('ce', {
  features: [FeatureIdentifier.PERSPECTIVES],
  renderMessage: (_, getString, additionalLicenseProps, usageAndLimitInfo) => {
    const { isFreeEdition } = additionalLicenseProps || {}
    const { limitData, usageData } = usageAndLimitInfo || {}

    const usageCost = get(usageData, 'usage.ccm.activeSpend.count', 0)
    const limitCost = get(limitData, 'limit.ccm.totalSpendLimit', 1)

    const usagePercentage = (usageCost / limitCost) * 100

    if (usageCost >= limitCost) {
      return isFreeEdition
        ? {
            message: () =>
              getString('ce.enforcementMessage.exceededSpendLimitFreePlan', {
                usage: formatCost(Number(usageCost), {
                  shortFormat: true
                }),
                limit: formatCost(Number(limitCost), {
                  shortFormat: true
                })
              }),
            bannerType: BannerType.LEVEL_UP
          }
        : {
            message: () => getString('ce.enforcementMessage.exceededSpendLimit'),
            bannerType: BannerType.OVERUSE
          }
    }

    if (usagePercentage > FEATURE_USAGE_WARNING_LIMIT) {
      return {
        message: () =>
          getString('ce.enforcementMessage.usageInfo', {
            percentage: Math.ceil(usagePercentage)
          }),
        bannerType: BannerType.INFO
      }
    }

    return {
      message: () => '',
      bannerType: BannerType.LEVEL_UP
    }
  }
})

DefaultSettingsFactory.registerSettingHandler(SettingType.TICKETING_TOOL_CONNECTOR, {
  label: 'platform.defaultSettings.ticketingToolConnectorLabel',
  settingRenderer: props => {
    return (
      <DefaultSettingConnectorField
        {...props}
        type={
          props.categoryAllSettings.get(SettingType.TICKETING_TOOL)?.value === 'Servicenow'
            ? [Connectors.SERVICE_NOW]
            : [Connectors.Jira]
        }
      />
    )
  },
  settingCategory: 'CE',
  groupId: SettingGroups.TICKETING_PREFERENCES
})

// eslint-disable-next-line import/no-unresolved
const CcmMicroFrontendPath = React.lazy(() => import('ccmui/MicroFrontendApp'))

AuditTrailFactory.registerResourceHandler('PERSPECTIVE', {
  moduleIcon: { name: 'ccm-solid' },
  moduleLabel: 'common.purpose.ce.continuous',
  resourceLabel: 'ce.sideNav.perspective',
  resourceUrl: (resource: ResourceDTO, resourceScope: ResourceScope) => {
    const { accountIdentifier } = resourceScope
    return routes.toPerspectiveDetails({
      accountId: accountIdentifier,
      module,
      mode: NAV_MODE.MODULE,
      perspectiveId: resource.identifier,
      perspectiveName: resource.labels?.resourceName || resource.identifier
    })
  }
})

AuditTrailFactory.registerResourceHandler('PERSPECTIVE_BUDGET', {
  moduleIcon: { name: 'ccm-solid' },
  moduleLabel: 'common.purpose.ce.continuous',
  resourceLabel: 'ce.perspectives.budgets.perspectiveBudgets',
  resourceUrl: (resource: ResourceDTO, resourceScope: ResourceScope) => {
    const { accountIdentifier } = resourceScope
    return routes.toCEBudgetDetails({
      accountId: accountIdentifier,
      module,
      mode: NAV_MODE.MODULE,
      budgetId: resource.identifier,
      budgetName: resource.labels?.resourceName || resource.identifier
    })
  }
})

AuditTrailFactory.registerResourceHandler('BUDGET_GROUP', {
  moduleIcon: { name: 'ccm-solid' },
  moduleLabel: 'common.purpose.ce.continuous',
  resourceLabel: 'ce.perspectives.budgets.perspectiveBudgetGroup',
  resourceUrl: (resource: ResourceDTO, resourceScope: ResourceScope) => {
    const { accountIdentifier } = resourceScope
    return routes.toCEBudgetDetails({
      accountId: accountIdentifier,
      module,
      mode: NAV_MODE.MODULE,
      budgetId: resource.identifier,
      budgetName: resource.labels?.resourceName || resource.identifier
    })
  }
})

AuditTrailFactory.registerResourceHandler('PERSPECTIVE_REPORT', {
  moduleIcon: { name: 'ccm-solid' },
  moduleLabel: 'common.purpose.ce.continuous',
  resourceLabel: 'ce.perspectives.reports.perspectiveReport',
  resourceUrl: (resource: ResourceDTO, resourceScope: ResourceScope) => {
    const { accountIdentifier } = resourceScope
    const perspectiveId = resource.labels?.RelatedPerspectiveId

    if (perspectiveId) {
      return routes.toPerspectiveDetails({
        accountId: accountIdentifier,
        module,
        mode: NAV_MODE.MODULE,
        perspectiveId: perspectiveId,
        perspectiveName: perspectiveId
      })
    }
    return undefined
  }
})

AuditTrailFactory.registerResourceHandler('COST_CATEGORY', {
  moduleIcon: { name: 'ccm-solid' },
  moduleLabel: 'common.purpose.ce.continuous',
  resourceLabel: 'ce.businessMapping.costCategory'
})

AuditTrailFactory.registerResourceHandler('PERSPECTIVE_FOLDER', {
  moduleIcon: { name: 'ccm-solid' },
  moduleLabel: 'common.purpose.ce.continuous',
  resourceLabel: 'ce.perspectives.folders.title',
  resourceUrl: (resource: ResourceDTO, resourceScope: ResourceScope) => {
    const { accountIdentifier } = resourceScope
    return `${routes.toCEPerspectives({
      accountId: accountIdentifier,
      module,
      mode: NAV_MODE.MODULE
    })}?folderId="${resource.identifier}"`
  }
})

AuditTrailFactory.registerResourceHandler('CLOUD_ASSET_GOVERNANCE_RULE', {
  moduleIcon: { name: 'ccm-solid' },
  moduleLabel: 'common.purpose.ce.continuous',
  resourceLabel: 'ce.governance.rule',
  resourceUrl: (resource: ResourceDTO, resourceScope: ResourceScope) => {
    const { accountIdentifier } = resourceScope
    return routes.toCEGovernanceRuleEditor({
      accountId: accountIdentifier,
      module,
      mode: NAV_MODE.MODULE,
      ruleId: resource.identifier
    })
  }
})

AuditTrailFactory.registerResourceHandler('CLOUD_ASSET_GOVERNANCE_RULE_SET', {
  moduleIcon: { name: 'ccm-solid' },
  moduleLabel: 'common.purpose.ce.continuous',
  resourceLabel: 'ce.governance.ruleSet',
  resourceUrl: (_resource: ResourceDTO, resourceScope: ResourceScope) => {
    const { accountIdentifier } = resourceScope
    return `${routes.toCEGovernanceRules({
      accountId: accountIdentifier,
      module,
      mode: NAV_MODE.MODULE
    })}?tab="RuleSets"`
  }
})

AuditTrailFactory.registerResourceHandler('CLOUD_ASSET_GOVERNANCE_RULE_ENFORCEMENT', {
  moduleIcon: { name: 'ccm-solid' },
  moduleLabel: 'common.purpose.ce.continuous',
  resourceLabel: 'ce.governance.enforcement',
  resourceUrl: (resource: ResourceDTO, resourceScope: ResourceScope) => {
    const { accountIdentifier } = resourceScope
    return `${routes.toCEGovernanceEnforcements({
      accountId: accountIdentifier,
      module,
      mode: NAV_MODE.MODULE
    })}?s="${resource.labels?.resourceName}"`
  }
})

const RedirectToModuleTrialHome = (): React.ReactElement => {
  const { accountId } = useParams<{
    accountId: string
  }>()

  return (
    <Redirect
      to={routes.toModuleTrialHome({
        accountId,
        module
      })}
    />
  )
}

const RedirectToNewAccessPointsPage = (): React.ReactElement => {
  const { accountId } = useParams<{
    accountId: string
  }>()

  return (
    <Redirect
      to={routes.toCECOAccessPoints({
        accountId,
        module,
        mode: NAV_MODE.MODULE
      })}
    />
  )
}

const RedirectToBudgetDetails = (): React.ReactElement => {
  const { accountId, budgetId, budgetName } = useParams<{
    accountId: string
    budgetId: string
    budgetName: string
  }>()

  return (
    <Redirect
      to={routes.toCEBudgetDetails({
        accountId,
        module,
        mode: NAV_MODE.MODULE,
        budgetName,
        budgetId
      })}
    />
  )
}

const RedirectToSubscriptions = (): React.ReactElement => {
  const { accountId } = useParams<{
    accountId: string
  }>()

  return (
    <Redirect
      to={routes.toSubscriptions({
        accountId,
        moduleCard: ModuleName.CE.toLowerCase() as Module
      })}
    />
  )
}

const RedirectToNewNodeRecommendationDetailsRoute = (): React.ReactElement => {
  const { recommendation, recommendationName, accountId } = useParams<{
    recommendationName: string
    recommendation: string
    accountId: string
  }>()
  return (
    <Redirect
      to={routes.toCENodeRecommendationDetails({
        accountId,
        module,
        mode: NAV_MODE.MODULE,
        recommendationName,
        recommendation
      })}
    />
  )
}

const licenseRedirectData: LicenseRedirectProps = {
  licenseStateName: LICENSE_STATE_NAMES.CCM_LICENSE_STATE,
  startTrialRedirect: RedirectToModuleTrialHome,
  expiredTrialRedirect: RedirectToSubscriptions
}

const getRequestOptions = (): Partial<RequestInit> => {
  const token = SessionToken.getToken()

  const headers: RequestInit['headers'] = {}

  if (token && token.length > 0) {
    if (!window.noAuthHeader) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  return { headers }
}

// const CENonMFERoutes = (
//   <>
//     <RouteWithLayout
//       licenseRedirectData={licenseRedirectData}
//       sidebarProps={CESideNavProps}
//       path={routes.toCEOverview({ ...accountPathProps, ...projectPathProps })}
//       pageName={PAGE_NAME.CEOverviewPage}
//     >
//       <OverviewPage />
//     </RouteWithLayout>
//   </>
// )

const CERouteDestinations = (mode = NAV_MODE.MODULE): React.ReactElement => {
  const { accountId } = useParams<AccountPathProps>()
  const { CCM_COMMORCH } = useFeatureFlags()

  if (CCM_COMMORCH) {
    RbacFactory.registerResourceTypeHandler(ResourceType.CCM_COMMITMENT_ORCHESTRATOR, {
      icon: 'ccm-solid',
      label: 'ce.commitmentOrchestration.sideNavLabel',
      category: ResourceCategory.CLOUD_COSTS,
      permissionLabels: {
        [PermissionIdentifier.VIEW_CCM_COMMITMENT_ORCHESTRATOR]: <LocaleString stringID="rbac.permissionLabels.view" />,
        [PermissionIdentifier.EDIT_CCM_COMMITMENT_ORCHESTRATOR]: (
          <LocaleString stringID="rbac.permissionLabels.createEdit" />
        )
      }
    })
  }

  const urqlClient = React.useMemo(() => {
    const url = getConfig(`ccm/api/graphql?accountIdentifier=${accountId}&routingId=${accountId}`)
    return createClient({
      url: url,
      fetchOptions: getRequestOptions,
      exchanges: [dedupExchange, requestPolicyExchange({}), cacheExchange, fetchExchange],
      requestPolicy: 'cache-first'
    })
  }, [accountId])

  const mfePaths = [
    routes.toCEBudgets({ ...accountPathProps, module, mode }),
    routes.toCEBudgetDetails({ ...accountPathProps, module, mode, budgetId: ':budgetId', budgetName: ':budgetName' }),
    routes.toCERecommendations({ ...accountPathProps, module, mode }),
    routes.toCERecommendationDetails({
      ...accountPathProps,
      module,
      mode,
      recommendationName: ':recommendationName',
      recommendation: ':recommendation'
    }),
    routes.toCEOverview({ ...accountPathProps, module, mode }),
    routes.toCENodeRecommendationDetails({
      ...accountPathProps,
      module,
      mode,
      recommendationName: ':recommendationName',
      recommendation: ':recommendation'
    }),
    routes.toCEECSRecommendationDetails({
      ...accountPathProps,
      module,
      mode,
      recommendationName: ':recommendationName',
      recommendation: ':recommendation'
    }),
    routes.toBusinessMapping({ ...accountPathProps, module, mode }),
    routes.toCEAnomalyDetection({ ...accountPathProps, module, mode }),
    routes.toCEPerspectives({ ...accountPathProps, module, mode }),
    routes.toCECreatePerspective({ ...accountPathProps, module, mode, perspectiveId: ':perspectiveId' }),
    routes.toCECORuleDetails({ ...accountPathProps, module, mode, id: ':ruleId' }),
    routes.toPerspectiveDetails({
      ...accountPathProps,
      module,
      mode,
      perspectiveId: ':perspectiveId',
      perspectiveName: ':perspectiveName'
    }),
    routes.toCEPerspectiveWorkloadDetails({
      ...accountPathProps,
      module,
      mode,
      perspectiveId: ':perspectiveId',
      perspectiveName: ':perspectiveName',
      clusterName: ':clusterName',
      namespace: ':namespace',
      workloadName: ':workloadName'
    }),
    routes.toCERecommendationWorkloadDetails({
      ...accountPathProps,
      module,
      mode,
      recommendation: ':recommendation',
      recommendationName: ':recommendationName',
      clusterName: ':clusterName',
      namespace: ':namespace',
      workloadName: ':workloadName'
    }),
    routes.toCEPerspectiveServiceDetails({
      ...accountPathProps,
      module,
      mode,
      perspectiveId: ':perspectiveId',
      perspectiveName: ':perspectiveName',
      clusterName: ':clusterName',
      serviceName: ':serviceName'
    }),
    routes.toCERecommendationServiceDetails({
      ...accountPathProps,
      module,
      mode,
      recommendation: ':recommendation',
      recommendationName: ':recommendationName',
      clusterName: ':clusterName',
      serviceName: ':serviceName'
    }),
    routes.toCEPerspectiveNodeDetails({
      ...accountPathProps,
      module,
      mode,
      perspectiveId: ':perspectiveId',
      perspectiveName: ':perspectiveName',
      clusterName: ':clusterName',
      nodeId: ':nodeId'
    }),
    routes.toCEDashboards({ ...accountPathProps, module, mode }),
    routes.toCECOCreateGateway({ ...accountPathProps, module, mode }),
    routes.toCECOAccessPoints({ ...accountPathProps, module, mode }),
    routes.toCECOEditGateway({
      ...accountPathProps,
      module,
      mode,
      gatewayIdentifier: ':gatewayIdentifier'
    }),
    routes.toCECORules({ ...accountPathProps, module, mode, filterParams: '' }),
    routes.toCommitmentOrchestration({ ...accountPathProps, module, mode }),
    routes.toCommitmentOrchestrationSetup({ ...accountPathProps, module, mode }),
    routes.toCEGovernance({ ...accountPathProps, module, mode }),
    routes.toCEGovernanceRules({ ...accountPathProps, module, mode }),
    routes.toCEGovernanceEnforcements({ ...accountPathProps, module, mode }),
    routes.toCEGovernanceEvaluations({ ...accountPathProps, module, mode }),
    routes.toCEGovernanceRuleEditor({ ...accountPathProps, module, mode, ruleId: ':ruleId' }),
    routes.toCECurrencyPreferences({ ...accountPathProps, module, mode }),
    routes.toClusterOrchestrator({ ...accountPathProps, module, mode }),
    routes.toClusterDetailsPage({ ...accountPathProps, module, mode, id: ':id' }),
    routes.toClusterWorkloadsDetailsPage({ ...accountPathProps, module, mode, id: ':id' }),
    routes.toClusterNodepoolDetailsPage({ ...accountPathProps, module, mode, id: ':id' }),
    routes.toComputeGroupsSetup({ ...accountPathProps, module, mode, id: ':id' }),
    routes.toCECloudIntegration({ ...accountPathProps, module, mode }),
    routes.toCEManagedServiceProvider({ ...accountPathProps, module, mode })
  ]

  return (
    <Provider value={urqlClient}>
      <Switch>
        <RouteWithContext
          path={routes.toModuleTrialHome({ ...accountPathProps, module })}
          exact
          pageName={PAGE_NAME.CETrialHomePage}
        >
          <CETrialHomePage />
        </RouteWithContext>

        <RouteWithContext
          licenseRedirectData={licenseRedirectData}
          path={[
            routes.toCE({ ...accountPathProps, module, mode }),
            routes.toCEHome({ ...accountPathProps, module, mode })
          ]}
          exact
        >
          <CEHomePage />
        </RouteWithContext>
        <RouteWithContext
          licenseRedirectData={licenseRedirectData}
          path={routes.toOldCECOAccessPoints({ ...accountPathProps, module, mode })}
          exact
        >
          <RedirectToNewAccessPointsPage />
        </RouteWithContext>
        <RouteWithContext
          licenseRedirectData={licenseRedirectData}
          path={routes.toOldCECloudIntegration({ ...accountPathProps, module, mode })}
          exact
        >
          <Redirect
            to={routes.toCECloudIntegration({
              accountId,
              module,
              mode: NAV_MODE.MODULE
            })}
          />
        </RouteWithContext>
        <RouteWithContext
          licenseRedirectData={licenseRedirectData}
          path={routes.toOldCECurrencyPreferences({ ...accountPathProps, module, mode })}
          exact
        >
          <Redirect
            to={routes.toCECurrencyPreferences({
              accountId,
              module,
              mode: NAV_MODE.MODULE
            })}
          />
        </RouteWithContext>
        {/* {!enableMicroFrontend && CENonMFERoutes.props.children} */}

        <RouteWithContext
          licenseRedirectData={licenseRedirectData}
          path={routes.toCEBudgetDetailsOld({
            ...accountPathProps,
            module,
            mode,
            budgetId: ':budgetId',
            budgetName: ':budgetName'
          })}
          pageName={PAGE_NAME.CEBudgetDetails}
        >
          <RedirectToBudgetDetails />
        </RouteWithContext>

        <RouteWithContext
          licenseRedirectData={licenseRedirectData}
          path={routes.toOldCENodeRecommendationDetails({
            ...accountPathProps,
            module,
            mode,
            recommendationName: ':recommendationName',
            recommendation: ':recommendation'
          })}
          exact
        >
          <RedirectToNewNodeRecommendationDetailsRoute />
        </RouteWithContext>
        <RouteWithContext path={[...mfePaths, routes.toCCMMFE({ ...accountPathProps, module, mode })]}>
          <ChildAppMounter<CCMUIAppCustomProps>
            customComponents={{
              OverviewAddCluster,
              ConnectorReferenceField,
              GatewayListFilters,
              FeatureWarningBanner,
              FeatureWarningTooltip
            }}
            customHooks={{
              useTestConnectionModal
            }}
            ChildApp={CcmMicroFrontendPath}
          />
        </RouteWithContext>
        {/* {enableMicroFrontend ? (
        ) : null} */}

        <Route path="*">
          <NotFoundPage />
        </Route>
      </Switch>
    </Provider>
  )
}

export const CESettingsRouteDestination = ({ path }: { path?: string | string[] }): React.ReactElement => {
  const { accountId } = useParams<AccountPathProps & ModulePathParams>()
  const urqlClient = React.useMemo(() => {
    const url = getConfig(`ccm/api/graphql?accountIdentifier=${accountId}&routingId=${accountId}`)
    return createClient({
      url: url,
      fetchOptions: getRequestOptions,
      exchanges: [dedupExchange, requestPolicyExchange({}), cacheExchange, fetchExchange],
      requestPolicy: 'cache-first'
    })
  }, [accountId])

  if (location.pathname.match(/\/module\/ce/g)?.length) return <></>

  return (
    <Provider value={urqlClient}>
      <RouteWithContext exact path={path} pageName={PAGE_NAME.CCMSettingsPage}>
        <ChildAppMounter<CCMUIAppCustomProps>
          customComponents={{
            OverviewAddCluster,
            ConnectorReferenceField,
            GatewayListFilters,
            FeatureWarningBanner,
            FeatureWarningTooltip
          }}
          customHooks={{
            useTestConnectionModal
          }}
          ChildApp={CcmMicroFrontendPath}
        />
      </RouteWithContext>
    </Provider>
  )
}

export default CERouteDestinations
