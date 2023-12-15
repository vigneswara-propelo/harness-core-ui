/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { lazy } from 'react'
import { Redirect, useParams } from 'react-router-dom'
import { UserLabel } from '@common/components'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { MinimalLayout } from '@common/layouts'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import { RedirectToModuleTrialHomeFactory, RedirectToSubscriptionsFactory } from '@common/Redirects'
import routes from '@common/RouteDefinitions'
import { RouteWithLayout } from '@common/router'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { DefaultSettingsRouteDestinations } from '@default-settings/RouteDestinations'
import { DelegateRouteDestinations } from '@delegates/RouteDestinations'
import { GitSyncRouteDestinations } from '@gitsync/RouteDestinations'
import { GovernanceRouteDestinations } from '@governance/RouteDestinations'
import CardRailView from '@pipeline/components/Dashboards/CardRailView/CardRailView'
import ExecutionCard from '@pipeline/components/ExecutionCard/ExecutionCard'
import PipelineStudio from '@pipeline/components/PipelineStudio/PipelineStudio'
import { PipelineDeploymentList } from '@pipeline/pages/pipeline-deployment-list/PipelineDeploymentList'
import { PipelineRouteDestinations } from '@pipeline/RouteDestinations'
import { ConnectorRouteDestinations } from '@platform/connectors/RouteDestinations'
import { AccessControlRouteDestinations } from '@rbac/RouteDestinations'
import { SecretRouteDestinations } from '@secrets/RouteDestinations'
import ExternalTicketSettings from '@sto/components/ExternalTickets/Settings/ExternalTicketSettings'
import '@sto/components/PipelineStages/SecurityTestsStage'
import STOSideNav from '@sto/components/STOSideNav/STOSideNav'
import STOTrialHomePage from '@sto/pages/home/trialPage/STOTrialHomePage'
import { TemplateRouteDestinations } from '@templates-library/RouteDestinations'
import { TriggersRouteDestinations } from '@triggers/RouteDestinations'
import { VariableRouteDestinations } from '@variables/RouteDestinations'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { LICENSE_STATE_NAMES, LicenseRedirectProps } from 'framework/LicenseStore/LicenseStoreContext'
import { ModuleName } from 'framework/types/ModuleName'
import ChildAppMounter from 'microfrontends/ChildAppMounter'
import useStoRegistrations from '@sto/Registrations'

const STOSideNavProps: SidebarContext = {
  navComponent: STOSideNav,
  title: 'Security Tests',
  icon: 'sto-color-filled'
}

const moduleParams: ModulePathParams = {
  module: ':module(sto)'
}

const licenseRedirectData: LicenseRedirectProps = {
  licenseStateName: LICENSE_STATE_NAMES.STO_LICENSE_STATE,
  startTrialRedirect: RedirectToModuleTrialHomeFactory(ModuleName.STO),
  expiredTrialRedirect: RedirectToSubscriptionsFactory(ModuleName.STO)
}

const RedirectToProjectOverviewPage = (): React.ReactElement => {
  const { accountId } = useParams<ProjectPathProps>()
  const { selectedProject } = useAppStore()

  if (selectedProject) {
    return (
      <Redirect
        to={routes.toSTOProjectOverview({
          accountId,
          orgIdentifier: selectedProject.orgIdentifier || '',
          projectIdentifier: selectedProject.identifier
        })}
      />
    )
  } else {
    return <Redirect to={routes.toSTOOverview({ accountId })} />
  }
}

const RemoteSTOApp = lazy(() => import(`stoV2/App`))

const RouteDestinations: React.FC = () => {
  const { STO_ALL_ISSUES_PAGE, STO_JIRA_INTEGRATION } = useFeatureFlags()
  useStoRegistrations()

  return (
    <>
      <RouteWithLayout exact licenseRedirectData={licenseRedirectData} path={routes.toSTO({ ...accountPathProps })}>
        <RedirectToProjectOverviewPage />
      </RouteWithLayout>

      <RouteWithLayout
        exact
        licenseRedirectData={licenseRedirectData}
        sidebarProps={STOSideNavProps}
        path={[
          routes.toSTOOverview({ ...accountPathProps }),
          routes.toSTOProjectOverview({ ...accountPathProps, ...projectPathProps })
        ]}
      >
        <ChildAppMounter ChildApp={RemoteSTOApp} customComponents={{ ExecutionCard, CardRailView }} />
      </RouteWithLayout>

      {STO_ALL_ISSUES_PAGE && (
        <RouteWithLayout
          exact
          licenseRedirectData={licenseRedirectData}
          sidebarProps={STOSideNavProps}
          path={[
            routes.toSTOIssues({ ...accountPathProps }),
            routes.toSTOProjectIssues({ ...accountPathProps, ...projectPathProps })
          ]}
        >
          <ChildAppMounter ChildApp={RemoteSTOApp} />
        </RouteWithLayout>
      )}

      <RouteWithLayout
        layout={MinimalLayout}
        path={routes.toModuleTrialHome({ ...accountPathProps, module: 'sto' })}
        exact
      >
        <STOTrialHomePage />
      </RouteWithLayout>

      <RouteWithLayout
        exact
        licenseRedirectData={licenseRedirectData}
        sidebarProps={STOSideNavProps}
        path={[
          routes.toSTOTargets({ ...accountPathProps }),
          routes.toSTOProjectTargets({ ...accountPathProps, ...projectPathProps })
        ]}
      >
        <ChildAppMounter ChildApp={RemoteSTOApp} customComponents={{ UserLabel }} />
      </RouteWithLayout>

      <RouteWithLayout
        exact
        licenseRedirectData={licenseRedirectData}
        sidebarProps={STOSideNavProps}
        path={[
          routes.toSTOSecurityReview({ ...accountPathProps }),
          routes.toSTOProjectSecurityReview({ ...accountPathProps, ...projectPathProps })
        ]}
      >
        <ChildAppMounter ChildApp={RemoteSTOApp} customComponents={{ UserLabel }} />
      </RouteWithLayout>

      <RouteWithLayout
        exact
        licenseRedirectData={licenseRedirectData}
        sidebarProps={STOSideNavProps}
        path={[
          routes.toSTOGettingStarted({ ...accountPathProps }),
          routes.toSTOProjectGettingStarted({ ...accountPathProps, ...projectPathProps })
        ]}
      >
        <ChildAppMounter ChildApp={RemoteSTOApp} customComponents={{ UserLabel }} />
      </RouteWithLayout>

      {STO_JIRA_INTEGRATION && (
        <RouteWithLayout
          exact
          licenseRedirectData={licenseRedirectData}
          sidebarProps={STOSideNavProps}
          layout={MinimalLayout}
          path={[routes.toSTOProjectTicketSummary({ ...accountPathProps, ...projectPathProps, issueId: ':issueId' })]}
        >
          <ChildAppMounter ChildApp={RemoteSTOApp} customComponents={{ UserLabel }} />
        </RouteWithLayout>
      )}

      {STO_JIRA_INTEGRATION && (
        <RouteWithLayout
          exact
          sidebarProps={STOSideNavProps}
          licenseRedirectData={licenseRedirectData}
          path={[routes.toProjectTicketSettings({ ...accountPathProps, ...projectPathProps, ...moduleParams })]}
        >
          <ExternalTicketSettings />
        </RouteWithLayout>
      )}

      {
        PipelineRouteDestinations({
          pipelineStudioComponent: PipelineStudio,
          pipelineDeploymentListComponent: PipelineDeploymentList,
          moduleParams,
          licenseRedirectData,
          sidebarProps: STOSideNavProps
        })?.props.children
      }
      {
        AccessControlRouteDestinations({
          moduleParams,
          licenseRedirectData,
          sidebarProps: STOSideNavProps
        })?.props.children
      }
      {
        ConnectorRouteDestinations({
          moduleParams,
          licenseRedirectData,
          sidebarProps: STOSideNavProps
        })?.props.children
      }
      {
        DefaultSettingsRouteDestinations({
          moduleParams,
          licenseRedirectData,
          sidebarProps: STOSideNavProps
        })?.props.children
      }
      {
        SecretRouteDestinations({
          moduleParams,
          licenseRedirectData,
          sidebarProps: STOSideNavProps
        })?.props.children
      }
      {
        VariableRouteDestinations({
          moduleParams,
          licenseRedirectData,
          sidebarProps: STOSideNavProps
        })?.props.children
      }
      {
        DelegateRouteDestinations({
          moduleParams,
          licenseRedirectData,
          sidebarProps: STOSideNavProps
        })?.props.children
      }
      {
        TemplateRouteDestinations({
          moduleParams,
          licenseRedirectData,
          sidebarProps: STOSideNavProps
        })?.props.children
      }
      {
        GitSyncRouteDestinations({
          moduleParams,
          licenseRedirectData,
          sidebarProps: STOSideNavProps
        })?.props.children
      }
      {
        TriggersRouteDestinations({
          moduleParams,
          licenseRedirectData,
          sidebarProps: STOSideNavProps
        })?.props.children
      }
      {
        GovernanceRouteDestinations({
          sidebarProps: STOSideNavProps,
          pathProps: { ...accountPathProps, ...projectPathProps, ...moduleParams }
        })?.props.children
      }
    </>
  )
}

export default RouteDestinations
