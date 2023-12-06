/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Redirect, Switch, useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitionsV2'
import { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { Scope } from 'framework/types/types'
import { RouteWithContext } from '@common/router/RouteWithContext/RouteWithContext'
import { RouteWithLayout } from '@common/router'
import { NAV_MODE, accountPathProps, modulePathProps, projectPathProps, orgPathProps } from '@common/utils/routeUtils'
import { RedirectToModuleTrialHomeFactory, RedirectToSubscriptionsFactory } from '@common/Redirects'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import { useGetSelectedScope } from '@common/navigation/SideNavV2/SideNavV2.utils'
import { LICENSE_STATE_NAMES, LicenseRedirectProps } from 'framework/LicenseStore/LicenseStoreContext'
import { ModuleName } from 'framework/types/ModuleName'
import PipelineRouteDestinations from '@pipeline/PipelineRouteDestinations'
import TriggersRouteDestinations from '@triggers/TriggersRouteDestinations'
import CIHomePage from './pages/home/CIHomePage'
import CIDashboardPage from './pages/dashboard/CIDashboardPage'
import CITrialHomePage from './pages/home/CITrialHomePage'
import GetStartedWithCI from './pages/get-started-with-ci/GetStartedWithCI'

export const licenseRedirectData: LicenseRedirectProps = {
  licenseStateName: LICENSE_STATE_NAMES.CI_LICENSE_STATE,
  startTrialRedirect: RedirectToModuleTrialHomeFactory(ModuleName.CI),
  expiredTrialRedirect: RedirectToSubscriptionsFactory(ModuleName.CI)
}

const CIRedirect: React.FC = () => {
  const { scope, params } = useGetSelectedScope()
  const { accountId } = useParams<AccountPathProps>()

  if (scope === Scope.PROJECT) {
    return (
      <Redirect
        to={routes.toOverview({
          projectIdentifier: params?.projectIdentifier,
          orgIdentifier: params?.orgIdentifier,
          accountId,
          module: 'ci'
        })}
      />
    )
  }

  if (scope === Scope.ORGANIZATION) {
    // redirect to settings page
    return <Redirect to={routes.toSettings({ orgIdentifier: params?.orgIdentifier, module: 'ci' })} />
  }

  if (scope === Scope.ACCOUNT) {
    // redirect to settings page
    return <Redirect to={routes.toSettings({ module: 'ci' })} />
  }

  return <CIHomePage />
}

const CIRouteDestinations = (mode = NAV_MODE.MODULE): React.ReactElement => {
  return (
    <Switch>
      <RouteWithContext
        exact
        path={[
          routes.toMode({ ...projectPathProps, module: 'ci', mode }),
          routes.toMode({ ...orgPathProps, module: 'ci', mode }),
          routes.toMode({ ...accountPathProps, module: 'ci', mode })
        ]}
      >
        <CIRedirect />
      </RouteWithContext>
      <RouteWithContext
        exact
        path={routes.toOverview({ ...modulePathProps, ...projectPathProps, mode })}
        licenseRedirectData={licenseRedirectData}
      >
        <CIDashboardPage />
      </RouteWithContext>
      <RouteWithLayout
        exact
        path={routes.toModuleTrialHome({ ...accountPathProps, mode, module: 'ci' })}
        pageName={PAGE_NAME.CITrialHomePage}
      >
        <CITrialHomePage />
      </RouteWithLayout>
      <RouteWithLayout
        exact
        path={routes.toGetStartedWithCI({ ...modulePathProps, ...projectPathProps, mode })}
        licenseRedirectData={licenseRedirectData}
        pageName={PAGE_NAME.GetStartedWithCI}
      >
        <GetStartedWithCI />
      </RouteWithLayout>
      <RouteWithContext
        licenseRedirectData={licenseRedirectData}
        path={[routes.toCIHome({ ...accountPathProps, mode, module: 'ci' })]}
        pageName={PAGE_NAME.CIHomePage}
        exact
      >
        <CIHomePage />
      </RouteWithContext>
      {PipelineRouteDestinations({ mode, pipelineStudioPageName: PAGE_NAME.CIPipelineStudio }).props.children}
      {TriggersRouteDestinations({ mode }).props.children}
    </Switch>
  )
}

export default CIRouteDestinations
