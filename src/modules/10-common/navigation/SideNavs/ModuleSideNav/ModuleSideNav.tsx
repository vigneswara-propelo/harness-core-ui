/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Route, Switch } from 'react-router-dom'
import ModuleRouteConfig from '@modules/ModuleRouteConfig'
import routes from '@common/RouteDefinitionsV2'
import { NAV_MODE, accountPathProps } from '@common/utils/routeUtils'
import { Module } from 'framework/types/ModuleName'
import { NavModuleName } from '@common/hooks/useNavModuleInfo'

const SideNavLinksComponent: React.FC<{ module: NavModuleName; mode: NAV_MODE }> = props => {
  const Component = ModuleRouteConfig[props.module].sideNavLinks(props.mode)

  return <>{Component} </>
}
export const ModuleSideNavLinks: React.FC<{ mode?: NAV_MODE }> = ({ mode = NAV_MODE.MODULE }) => {
  const modules = Object.keys(ModuleRouteConfig)

  return (
    <Switch>
      {modules.map(module => {
        return (
          <Route
            key={module}
            path={[
              routes.toModule({
                mode,
                module: `:module(${module.toLowerCase()})` as Module,
                ...accountPathProps
              })
            ]}
          >
            <SideNavLinksComponent module={module as NavModuleName} mode={NAV_MODE.MODULE} />
          </Route>
        )
      })}
    </Switch>
  )
}
export default ModuleSideNavLinks
