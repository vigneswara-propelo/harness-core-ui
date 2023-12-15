/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { lazy } from 'react'
import { Redirect, Route, Switch, useParams } from 'react-router-dom'
import { UserLabel } from '@common/components'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import CardRailView from '@pipeline/components/Dashboards/CardRailView/CardRailView'
import ExecutionCard from '@pipeline/components/ExecutionCard/ExecutionCard'
import UsefulOrNot from '@common/components/UsefulOrNot/UsefulOrNot'
import ExternalTicketSettings from '@sto/components/ExternalTickets/Settings/ExternalTicketSettings'
import STOTrialHomePage from '@sto/pages/home/trialPage/STOTrialHomePage'
import ChildAppMounter from 'microfrontends/ChildAppMounter'
import NotFoundPage from '@common/pages/404/NotFoundPage'
import routes from '@common/RouteDefinitionsV2'
import { AccountPathProps, Module } from '@common/interfaces/RouteInterfaces'
import { RouteWithContext } from '@common/router/RouteWithContext/RouteWithContext'
import { NAV_MODE, accountPathProps, projectPathProps, orgPathProps } from '@common/utils/routeUtils'
import { RedirectToModuleTrialHomeFactory, RedirectToSubscriptionsFactory } from '@common/Redirects'
import { LICENSE_STATE_NAMES, LicenseRedirectProps } from 'framework/LicenseStore/LicenseStoreContext'
import { Scope } from 'framework/types/types'
import { ModuleName } from 'framework/types/ModuleName'
import PipelineRouteDestinations from '@pipeline/PipelineRouteDestinations'
import { useGetSelectedScope } from '@common/navigation/SideNavV2/SideNavV2.utils'
import { useGetPipelineSummary } from 'services/pipeline-ng'
import { useGetSettingValue } from 'services/cd-ng'
import useStoRegistrations from '@sto/Registrations'

const module: Module = 'sto'

export const licenseRedirectData: LicenseRedirectProps = {
  licenseStateName: LICENSE_STATE_NAMES.STO_LICENSE_STATE,
  startTrialRedirect: RedirectToModuleTrialHomeFactory(ModuleName.STO),
  expiredTrialRedirect: RedirectToSubscriptionsFactory(ModuleName.STO)
}

const STORedirect: React.FC = () => {
  const { scope, params } = useGetSelectedScope()
  const { accountId } = useParams<AccountPathProps>()

  if (scope === Scope.ACCOUNT) {
    // redirect to settings page
    return <Redirect to={routes.toSettings({ module })} />
  }

  if (scope === Scope.ORGANIZATION) {
    // redirect to settings page
    return <Redirect to={routes.toSettings({ orgIdentifier: params?.orgIdentifier, module })} />
  }

  if (scope === Scope.PROJECT) {
    return (
      <Redirect
        to={routes.toOverview({
          projectIdentifier: params?.projectIdentifier,
          orgIdentifier: params?.orgIdentifier,
          accountId,
          module
        })}
      />
    )
  }
  return <STOTrialHomePage />
}

const RemoteSTOApp = lazy(() => import(`stoV2/App`))

const STORouteDestinations = (mode = NAV_MODE.MODULE): React.ReactElement => {
  const { STO_ALL_ISSUES_PAGE, STO_JIRA_INTEGRATION } = useFeatureFlags()
  useStoRegistrations()

  return (
    <Switch>
      <RouteWithContext
        exact
        path={[
          routes.toMode({ ...projectPathProps, module, mode }),
          routes.toMode({ ...orgPathProps, module, mode }),
          routes.toMode({ ...accountPathProps, module, mode })
        ]}
      >
        <STORedirect />
      </RouteWithContext>

      <RouteWithContext path={routes.toModuleTrialHome({ ...accountPathProps, module, mode })} exact>
        <STOTrialHomePage />
      </RouteWithContext>

      <RouteWithContext
        exact
        path={routes.toOverview({ ...projectPathProps, module, mode })}
        licenseRedirectData={licenseRedirectData}
      >
        <ChildAppMounter ChildApp={RemoteSTOApp} customComponents={{ ExecutionCard, CardRailView }} />
      </RouteWithContext>

      {STO_ALL_ISSUES_PAGE && (
        <RouteWithContext
          exact
          licenseRedirectData={licenseRedirectData}
          path={[routes.toSTOIssues({ ...projectPathProps, module, mode })]}
        >
          <ChildAppMounter
            ChildApp={RemoteSTOApp}
            customComponents={{ UsefulOrNot, UserLabel }}
            customHooks={{ useGetSettingValue, useGetPipelineSummary }}
          />
        </RouteWithContext>
      )}

      <RouteWithContext
        exact
        licenseRedirectData={licenseRedirectData}
        path={[routes.toSTOTargets({ ...projectPathProps, module, mode })]}
      >
        <ChildAppMounter ChildApp={RemoteSTOApp} customComponents={{ UserLabel }} />
      </RouteWithContext>

      <RouteWithContext
        exact
        licenseRedirectData={licenseRedirectData}
        path={[routes.toSTOSecurityReview({ ...projectPathProps, module, mode })]}
      >
        <ChildAppMounter
          ChildApp={RemoteSTOApp}
          customComponents={{ UserLabel, UsefulOrNot }}
          customHooks={{ useGetSettingValue, useGetPipelineSummary }}
        />
      </RouteWithContext>

      <RouteWithContext
        exact
        licenseRedirectData={licenseRedirectData}
        path={[routes.toSTOGettingStarted({ ...projectPathProps, module, mode })]}
      >
        <ChildAppMounter ChildApp={RemoteSTOApp} customComponents={{ UserLabel }} />
      </RouteWithContext>

      {STO_JIRA_INTEGRATION && (
        <RouteWithContext
          exact
          licenseRedirectData={licenseRedirectData}
          path={[routes.toSTOTicketSummary({ ...projectPathProps, module, mode, issueId: ':issueId' })]}
        >
          <ChildAppMounter
            ChildApp={RemoteSTOApp}
            customComponents={{ UserLabel, UsefulOrNot }}
            customHooks={{ useGetSettingValue, useGetPipelineSummary }}
          />
        </RouteWithContext>
      )}

      {STO_JIRA_INTEGRATION && (
        <RouteWithContext
          exact
          licenseRedirectData={licenseRedirectData}
          path={[routes.toTicketSettings({ ...projectPathProps, module, mode })]}
        >
          <ExternalTicketSettings />
        </RouteWithContext>
      )}

      {PipelineRouteDestinations({ mode }).props.children}

      {/* Fall back to showing the 404 page. This MUST be the last route in this <Switch> */}
      <Route>
        <NotFoundPage />
      </Route>
    </Switch>
  )
}

export default STORouteDestinations
