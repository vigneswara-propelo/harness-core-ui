/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Route, Switch } from 'react-router-dom'

import { ModuleName, moduleNameToModuleMapping } from 'framework/types/ModuleName'
import { NAV_MODE, accountPathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitionsV2'
import { NavModuleName } from '@common/hooks/useNavModuleInfo'
import CommonRouteDestinations from '@user-profile/CommonRouteDestinations'
import CDSideNavLinks from '@cd/components/CDSideNav/CDSideNavLinks'
import CDRouteDestinations from '@modules/75-cd/RouteDestinationsV2'
import CISideNavLinks from '@ci/components/CISideNav/CISideNavV2'
import CVRouteDestinations from '@modules/85-cv/RouteDestinationsV2'
import CIRouteDestinations from '@modules/75-ci/RouteDestinationsV2'
import CFSideNav from '@cf/components/SideNav/CFSideNav'
import CODESideNavLinks from '@modules/60-code/components/SideNav/CODESideNavLinks'
import CODERouteDestinations from '@code/CODERouteDestinations'
import CFRouteDestinations from '@modules/75-cf/RouteDestinationsV2'
import CVSideNavLinks from '@cv/components/SideNav/CVSideNavLinks'
import CCMSideNavLinks from '@ce/components/CESideNav/CESideNavV2'
import CERouteDestinations from '@modules/75-ce/RouteDestinationsV2'
import ChaosSideNavLinks from '@chaos/components/ChaosSideNav/ChaosSideNavLinks'
import ChaosRouteDestinations from '@modules/75-chaos/RouteDestinationsV2'
import STOSideNavLinks from '@sto/components/STOSideNav/STOSideNavLinks'
import STORouteDestinations from '@modules/85-sto/RouteDestinationsV2'
import GitOpsRouteDestinations from '@gitops/GitOpsRouteDestinations'
import SSCASideNavLinks from '@ssca/components/SSCASideNavLinks'
import SSCARouteDestinations from '@modules/75-ssca/RouteDestinationsV2'
import IACMSideNavLinks from '@iacm/components/IACMSideNav/Nav2'
import IACMRouteDestinations from '@iacm/RouteDestinationsV2'
import CETRouteDestinations from '@modules/75-cet/RouteDestinationsV2'
import CETSideNavLinks from '@cet/components/SideNav/CETSideNavLinks'
import { SIDE_NAV_STATE } from '@common/router/RouteWithLayoutV2'
import SEISideNavLinks from '@modules/75-sei/SideNav/NavV2/SEISideNavLinks'
import SEIRouteDestinations from '@modules/75-sei/RouteDestinationsV2'

export interface ModuleLinksProps {
  sideNavState: SIDE_NAV_STATE
}
interface IModuleRouteConfig {
  sideNavLinks: (mode: NAV_MODE, props?: ModuleLinksProps) => React.ReactElement
  routes: (mode: NAV_MODE) => React.ReactElement
}

const ModuleRouteConfig: Record<NavModuleName, IModuleRouteConfig> = {
  [ModuleName.CD]: {
    sideNavLinks: CDSideNavLinks,
    routes: CDRouteDestinations
  },
  [ModuleName.CI]: {
    sideNavLinks: CISideNavLinks,
    routes: CIRouteDestinations
  },
  [ModuleName.CF]: {
    sideNavLinks: CFSideNav,
    routes: CFRouteDestinations
  },
  [ModuleName.CV]: {
    sideNavLinks: CVSideNavLinks,
    routes: CVRouteDestinations
  },
  [ModuleName.CHAOS]: {
    sideNavLinks: ChaosSideNavLinks,
    routes: ChaosRouteDestinations
  },
  [ModuleName.CODE]: {
    sideNavLinks: CODESideNavLinks,
    routes: CODERouteDestinations
  },
  [ModuleName.CET]: {
    sideNavLinks: CETSideNavLinks,
    routes: CETRouteDestinations
  },
  [ModuleName.CE]: {
    sideNavLinks: CCMSideNavLinks,
    routes: CERouteDestinations
  },
  [ModuleName.STO]: {
    sideNavLinks: STOSideNavLinks,
    routes: STORouteDestinations
  },
  [ModuleName.IACM]: {
    sideNavLinks: IACMSideNavLinks,
    routes: IACMRouteDestinations
  },
  [ModuleName.IDP]: {
    sideNavLinks: () => <></>,
    routes: () => <></>
  },
  [ModuleName.SSCA]: {
    sideNavLinks: SSCASideNavLinks,
    routes: SSCARouteDestinations
  },
  [ModuleName.SEI]: {
    sideNavLinks: SEISideNavLinks,
    routes: SEIRouteDestinations
  }
}

export const ModulesRouteDestinations: React.FC<{ mode?: NAV_MODE }> = ({ mode = NAV_MODE.MODULE }) => {
  const modules = Object.keys(ModuleRouteConfig)

  return (
    <>
      {modules.map(module => (
        <Route
          key={module}
          path={routes.toModule({
            mode,
            module: moduleNameToModuleMapping[module as NavModuleName],
            ...accountPathProps
          })}
        >
          <Switch>
            {CommonRouteDestinations({ mode }).props.children}
            {GitOpsRouteDestinations({ mode }).props.children}
            {ModuleRouteConfig[module as NavModuleName].routes(mode)}
          </Switch>
        </Route>
      ))}
    </>
  )
}

export default ModuleRouteConfig
