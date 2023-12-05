/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Module } from 'framework/types/ModuleName'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitionsV2'
import { USER_JOURNEY_EVENTS } from '@ce/TrackingEventsConstants'
import { featureNames } from '@ce/constants'
import { SideNav } from '@common/navigation/SideNavV2/SideNavV2'
import { Scope } from 'framework/types/types'
import { NAV_MODE } from '@common/utils/routeUtils'

const module: Module = 'ce'

const CCMSideNavLinks = (mode: NAV_MODE): React.ReactElement => {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()
  const { CCM_COMMORCH: showCO, CCM_CLUSTER_ORCH, CCM_MSP } = useFeatureFlags()

  return (
    <SideNav.Main disableScopeSelector>
      <SideNav.Section>
        <SideNav.Scope scope={Scope.ACCOUNT}>
          <SideNav.Link
            label={getString('overview')}
            icon="nav-home"
            to={routes.toCEOverview({ accountId, module })}
            onClick={() => {
              trackEvent(USER_JOURNEY_EVENTS.CCM_FEATURE_NAVIGATION, { feature_name: featureNames.OVERVIEW_FEATURE })
            }}
          />
        </SideNav.Scope>
        <SideNav.Title label="ce.sideNav.sectionTitles.costReporting" />
        <SideNav.Scope scope={Scope.ACCOUNT}>
          <SideNav.Link
            label={getString('ce.perspectives.sideNavText')}
            icon="ccm-nav-perspectives"
            to={routes.toCEPerspectives({ accountId, module })}
            onClick={() => {
              trackEvent(USER_JOURNEY_EVENTS.CCM_FEATURE_NAVIGATION, {
                feature_name: featureNames.PERSPECTIVES_FEATURE
              })
            }}
          />
          <SideNav.Link
            label={getString('ce.budgets.sideNavText')}
            icon="ccm-nav-budgets"
            to={routes.toCEBudgets({ accountId, module })}
            onClick={() => {
              trackEvent(USER_JOURNEY_EVENTS.CCM_FEATURE_NAVIGATION, { feature_name: featureNames.BUDGETS_FEATURE })
            }}
          />
          <SideNav.Link
            label={getString('ce.businessMapping.sideNavText')}
            icon="ccm-nav-cost-categories"
            to={routes.toBusinessMapping({ accountId, module })}
            onClick={() => {
              trackEvent(USER_JOURNEY_EVENTS.CCM_FEATURE_NAVIGATION, {
                feature_name: featureNames.COST_CATEGORY_FEATURE
              })
            }}
          />
          <SideNav.Link
            label={getString('ce.biDashboard.sideNavText')}
            icon="ccm-nav-bi-dashboards"
            to={routes.toCEDashboards({ accountId, module })}
            onClick={() => {
              trackEvent(USER_JOURNEY_EVENTS.CCM_FEATURE_NAVIGATION, {
                feature_name: featureNames.BI_DASHBOARD_FEATURE
              })
            }}
          />
          <SideNav.Link
            hidden={!CCM_MSP}
            label={getString('ce.msp.sideNavText')}
            icon="ccm-policy-details"
            to={routes.toCEManagedServiceProvider({ accountId, module })}
            onClick={() => {
              trackEvent(USER_JOURNEY_EVENTS.CCM_FEATURE_NAVIGATION, {
                feature_name: featureNames.MSP
              })
            }}
          />
        </SideNav.Scope>

        <SideNav.Title label="ce.sideNav.sectionTitles.costOptimization" />
        <SideNav.Scope scope={Scope.ACCOUNT}>
          <SideNav.Link
            label={getString('ce.co.breadCrumb.rules')}
            icon="ccm-nav-autostopping-rules"
            to={routes.toCECORules({ accountId, filterParams: '', module })}
            onClick={() => {
              trackEvent(USER_JOURNEY_EVENTS.CCM_FEATURE_NAVIGATION, {
                feature_name: featureNames.AUTOSTOPPING_FEATURE
              })
            }}
          />
          <SideNav.Link
            label={getString('ce.recommendation.sideNavText')}
            icon="ccm-nav-recommendations"
            to={routes.toCERecommendations({ accountId, module })}
            onClick={() => {
              trackEvent(USER_JOURNEY_EVENTS.CCM_FEATURE_NAVIGATION, {
                feature_name: featureNames.RECOMMENDATIONS_FEATURE
              })
            }}
          />
          <SideNav.Link
            hidden={!showCO}
            label={getString('ce.commitmentOrchestration.sideNavLabel')}
            icon="ccm-nav-commitments"
            to={routes.toCommitmentOrchestration({ accountId, module })}
            onClick={() => {
              trackEvent(USER_JOURNEY_EVENTS.CCM_FEATURE_NAVIGATION, {
                feature_name: featureNames.COMMITMENT_ORCHESTRATOR_FEATURE
              })
            }}
          />
          <SideNav.Link
            hidden={!CCM_CLUSTER_ORCH}
            label={getString('ce.co.clusterOrchestratorLabel')}
            icon="ccm-nav-cluster-orchestration"
            to={routes.toClusterOrchestrator({ accountId, module })}
            onClick={() => {
              trackEvent(USER_JOURNEY_EVENTS.CCM_FEATURE_NAVIGATION, {
                feature_name: featureNames.CLUSTER_ORCHESTRATOR_FEATURE
              })
            }}
          />
        </SideNav.Scope>
        <SideNav.Title label="ce.sideNav.sectionTitles.costGovernance" />
        <SideNav.Scope scope={Scope.ACCOUNT}>
          <SideNav.Link
            label={getString('ce.governance.sideNavText')}
            icon="ccm-nav-asset-governance"
            to={routes.toCEGovernance({ accountId, module })}
            onClick={() => {
              trackEvent(USER_JOURNEY_EVENTS.CCM_FEATURE_NAVIGATION, { feature_name: featureNames.GOVERNANCE })
            }}
          />
          <SideNav.Link
            label={getString('ce.anomalyDetection.sideNavText')}
            icon="ccm-nav-anomalies"
            to={routes.toCEAnomalyDetection({ accountId, module })}
            onClick={() => {
              trackEvent(USER_JOURNEY_EVENTS.CCM_FEATURE_NAVIGATION, { feature_name: featureNames.ANOMALIES_FEATURE })
            }}
          />
        </SideNav.Scope>
      </SideNav.Section>
      <SideNav.Section>
        <SideNav.Scope scope={Scope.ACCOUNT}>
          <SideNav.Link
            to={routes.toSettings({ mode, module })}
            label={getString('common.accountSettings')}
            icon={'setting'}
          />
        </SideNav.Scope>
      </SideNav.Section>
    </SideNav.Main>
  )
}

export default CCMSideNavLinks
