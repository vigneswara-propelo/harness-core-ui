/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitionsV2'
import { NAV_MODE } from '@common/utils/routeUtils'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { SideNav } from '@common/navigation/SideNavV2/SideNavV2'
import { Scope } from 'framework/types/types'
import { AccountPathProps, Module } from '@common/interfaces/RouteInterfaces'
import { useGetSelectedScope } from '@common/navigation/SideNavV2/SideNavV2.utils'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'

const module: Module = 'chaos'

const ChaosSideNavLinks = (mode: NAV_MODE): React.ReactElement => {
  const { getString } = useStrings()
  const { params } = useGetSelectedScope()
  const { projectIdentifier, orgIdentifier } = params || {}
  const { accountId } = useParams<AccountPathProps>()
  const routeParams = {
    accountId,
    projectIdentifier,
    orgIdentifier,
    module
  }
  const { CHAOS_PROBE_ENABLED, CHAOS_DASHBOARD_ENABLED, CHAOS_SECURITY_GOVERNANCE, CHAOS_IMAGE_REGISTRY_DEV } =
    useFeatureFlags()
  const { CHAOS_LICENSE_STATE } = useLicenseStore()
  const isChaosLicenseStateNotStarted = CHAOS_LICENSE_STATE === 'NOT_STARTED'
  return (
    <SideNav.Main disableScopeSelector={isChaosLicenseStateNotStarted}>
      <SideNav.Section>
        <SideNav.Scope scope={Scope.PROJECT}>
          <SideNav.Link icon="nav-home" label={getString('overview')} to={routes.toChaosOverview(routeParams)} />

          <SideNav.Link
            icon="chaos-nav-experiments"
            label={getString('chaos.navLabels.chaosExperiments')}
            to={routes.toChaosExperiments(routeParams)}
          />

          <SideNav.Link
            icon="chaos-nav-chaoshub"
            label={getString('chaos.navLabels.chaosHubs')}
            to={routes.toChaosHubs(routeParams)}
          />

          <SideNav.Link
            icon="chaos-nav-gamedays"
            label={getString('chaos.navLabels.gamedays')}
            to={routes.toChaosGameDays(routeParams)}
          />

          <SideNav.Link
            icon="chaos-nav-resilience-probes"
            label={getString('chaos.navLabels.probes')}
            to={routes.toChaosProbes(routeParams)}
            hidden={!CHAOS_PROBE_ENABLED}
          />

          <SideNav.Link
            icon="default-dashboard"
            label={getString('chaos.navLabels.dashboards')}
            to={routes.toChaosDashboards(routeParams)}
            hidden={!CHAOS_DASHBOARD_ENABLED}
          />

          <SideNav.Link
            icon="nav-environments"
            label={getString('environments')}
            to={routes.toChaosEnvironments(routeParams)}
          />

          <SideNav.Link
            icon="chaos-nav-chaosguard"
            label={getString('chaos.navLabels.chaosGuard')}
            to={routes.toChaosSecurityGovernance(routeParams)}
            hidden={!CHAOS_SECURITY_GOVERNANCE}
          />

          <SideNav.Link
            icon="configure"
            label={getString('chaos.navLabels.imageRegistry')}
            to={routes.toChaosImageRegistry(routeParams)}
            hidden={!CHAOS_IMAGE_REGISTRY_DEV}
          />
        </SideNav.Scope>
      </SideNav.Section>
      <SideNav.CommonScopeLinks mode={mode} module={module} />
    </SideNav.Main>
  )
}

export default ChaosSideNavLinks
