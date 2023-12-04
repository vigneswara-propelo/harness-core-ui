/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Redirect, Switch, useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitionsV2'
import { accountPathProps, modulePathProps, NAV_MODE, orgPathProps, projectPathProps } from '@common/utils/routeUtils'
import PipelineRouteDestinations from '@pipeline/PipelineRouteDestinations'
import '@iacm/components/IACMStage'
import type { AccountPathProps, Module } from '@common/interfaces/RouteInterfaces'
import { RouteWithContext } from '@common/router/RouteWithContext/RouteWithContext'
import { Scope } from 'framework/types/types'
import { useGetSelectedScope } from '@common/navigation/SideNavV2/SideNavV2.utils'
import AuditTrailFactory, { ResourceScope } from 'framework/AuditTrail/AuditTrailFactory'
import TriggersRouteDestinations from '@triggers/TriggersRouteDestinations'
import type { ResourceDTO } from 'services/audit'
import { IACMApp } from './components/IACMApp'

const module: Module = 'iacm'

const IACMRedirect: React.FC = () => {
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
        to={routes.toIACMWorkspaces({
          projectIdentifier: params?.projectIdentifier || '',
          orgIdentifier: params?.orgIdentifier || '',
          accountId,
          module
        })}
      />
    )
  }

  return <IACMApp />
}

const IACMV2Routes = (mode = NAV_MODE.MODULE): JSX.Element => {
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
        <IACMRedirect />
      </RouteWithContext>

      {PipelineRouteDestinations({ mode }).props.children}
      {TriggersRouteDestinations({ mode }).props.children}
      <RouteWithContext path={routes.toIACM({ ...modulePathProps, ...projectPathProps, mode })}>
        <IACMApp />
      </RouteWithContext>
    </Switch>
  )
}

export default IACMV2Routes

AuditTrailFactory.registerResourceHandler('WORKSPACE', {
  moduleIcon: {
    name: 'iacm'
  },
  moduleLabel: 'common.iacm',
  resourceLabel: 'pipelineSteps.workspace',
  resourceUrl: (resource: ResourceDTO, resourceScope: ResourceScope) => {
    const { orgIdentifier = '', accountIdentifier, projectIdentifier = '' } = resourceScope
    return routes.toIACMWorkspace({
      orgIdentifier,
      accountId: accountIdentifier,
      projectIdentifier,
      workspaceIdentifier: resource.identifier
    })
  }
})
