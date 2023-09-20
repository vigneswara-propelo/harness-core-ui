/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Redirect, Switch, useParams } from 'react-router-dom'
import { Duration, NavigationCheck } from '@common/exports'
import routes from '@common/RouteDefinitionsV2'
import { AccountPathProps, Module } from '@common/interfaces/RouteInterfaces'
import { RouteWithContext } from '@common/router/RouteWithContext/RouteWithContext'
import { NAV_MODE, accountPathProps, modulePathProps, orgPathProps, projectPathProps } from '@common/utils/routeUtils'
import { OverviewChartsWithToggle } from '@common/components/OverviewChartsWithToggle/OverviewChartsWithToggle'
import SchedulePanel from '@common/components/SchedulePanel/SchedulePanel'
import { ScheduleFreezeForm } from '@freeze-windows/components/ScheduleFreezeForm/ScheduleFreezeForm'
import ConnectorReferenceField from '@platform/connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import ChildAppMounter from 'microfrontends/ChildAppMounter'
import { UserGroupsInput } from '@rbac/components/UserGroupsInput/UserGroupsInput'
import { LICENSE_STATE_NAMES, LicenseRedirectProps } from 'framework/LicenseStore/LicenseStoreContext'
import { RedirectToSubscriptionsFactory } from '@common/Redirects'
import { useGetSelectedScope } from '@common/navigation/SideNavV2/SideNavV2.utils'
import { ModuleName } from 'framework/types/ModuleName'
import AuditTrailFactory, { ResourceScope } from 'framework/AuditTrail/AuditTrailFactory'
import { ResourceDTO } from 'services/audit'
import { Scope } from 'framework/types/types'
import ChaosHomePage from './pages/home/ChaosHomePage'
import ChaosTrialHomePage from './pages/home/ChaosTrialHomePage'
import { ChaosCustomMicroFrontendProps } from './interfaces/Chaos.types'

// eslint-disable-next-line import/no-unresolved
const ChaosMicroFrontend = React.lazy(() => import('chaos/MicroFrontendApp'))

const module: Module = 'chaos'

const ChaosRedirect: React.FC = () => {
  const { scope, params } = useGetSelectedScope()
  const { accountId } = useParams<AccountPathProps>()
  const { projectIdentifier, orgIdentifier } = params || {}

  if (scope === Scope.PROJECT) {
    return (
      <Redirect
        to={routes.toChaosOverview({
          projectIdentifier,
          orgIdentifier,
          accountId,
          module
        })}
      />
    )
  }

  if (scope === Scope.ORGANIZATION) {
    return <Redirect to={routes.toSettings({ orgIdentifier, module })} />
  }

  if (scope === Scope.ACCOUNT) {
    return <Redirect to={routes.toSettings({ module })} />
  }

  return <ChaosHomePage />
}

const TrialRedirect: React.FC = () => {
  const { accountId } = useParams<AccountPathProps>()
  return (
    <Redirect
      to={routes.toModuleTrialHome({
        accountId,
        module
      })}
    />
  )
}

const licenseRedirectData: LicenseRedirectProps = {
  licenseStateName: LICENSE_STATE_NAMES.CHAOS_LICENSE_STATE,
  startTrialRedirect: () => <TrialRedirect />,
  expiredTrialRedirect: RedirectToSubscriptionsFactory(ModuleName.CHAOS)
}

// AuditTrail registrations
AuditTrailFactory.registerResourceHandler('CHAOS_HUB', {
  moduleIcon: { name: 'chaos-nav-chaoshub' },
  moduleLabel: 'chaos.chaosHub',
  resourceLabel: 'chaos.chaosHub',
  resourceUrl: ({ identifier }: ResourceDTO, resourceScope: ResourceScope) => {
    const { accountIdentifier: accountId, orgIdentifier, projectIdentifier } = resourceScope
    return routes.toChaosHub({
      accountId,
      orgIdentifier,
      projectIdentifier,
      module,
      identifier
    })
  }
})

const ChaosRouteDestinations = (mode = NAV_MODE.MODULE): React.ReactElement => {
  return (
    <Switch>
      <RouteWithContext
        path={[
          routes.toMode({ ...projectPathProps, module, mode }),
          routes.toMode({ ...orgPathProps, module, mode }),
          routes.toMode({ ...accountPathProps, module, mode })
        ]}
        licenseRedirectData={licenseRedirectData}
        exact
      >
        <ChaosRedirect />
      </RouteWithContext>
      <RouteWithContext path={routes.toModuleTrialHome({ ...accountPathProps, module, mode })} exact>
        <ChaosTrialHomePage />
      </RouteWithContext>
      <RouteWithContext
        path={routes.toChaosMicroFrontend({ ...modulePathProps, ...projectPathProps, mode })}
        licenseRedirectData={licenseRedirectData}
      >
        <ChildAppMounter<ChaosCustomMicroFrontendProps>
          ChildApp={ChaosMicroFrontend}
          customComponents={{
            ConnectorReferenceField,
            OverviewChartsWithToggle,
            Duration,
            NavigationCheck,
            SchedulePanel,
            UserGroupsInput,
            ScheduleFreezeForm
          }}
        />
      </RouteWithContext>
    </Switch>
  )
}

export default ChaosRouteDestinations
