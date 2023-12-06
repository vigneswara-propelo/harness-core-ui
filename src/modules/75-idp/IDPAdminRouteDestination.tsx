/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Redirect, Switch, useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitionsV2'
import ChildAppMounter from 'microfrontends/ChildAppMounter'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import { NAV_MODE, accountPathProps, orgPathProps, projectPathProps } from '@common/utils/routeUtils'
import { MultiTypeDelegateSelector } from '@common/components/MultiTypeDelegateSelector/MultiTypeDelegateSelector'
import { MultiTypeSecretInput } from '@secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'
import { useGetUserGroupAggregateList } from 'services/cd-ng'
import { ConnectorReferenceField } from '@platform/connectors/components/ConnectorReferenceField/ConnectorReferenceField'

import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import { RouteWithContext } from '@common/router/RouteWithContext/RouteWithContext'
import { AccountPathProps, Module } from '@common/interfaces/RouteInterfaces'
import CommonRouteDestinations from '@user-profile/CommonRouteDestinations'
import PipelineRouteDestinations from '@pipeline/PipelineRouteDestinations'
import TriggersRouteDestinations from '@triggers/TriggersRouteDestinations'
import { useGetSelectedScope } from '@common/navigation/SideNavV2/SideNavV2.utils'
import { Scope } from 'framework/types/types'
import type { IDPCustomMicroFrontendProps } from './interfaces/IDPCustomMicroFrontendProps.types'
import IDPPipelinesOverview from './components/IDPPipelinesOverview/IDPPipelinesOverview'
import { registerIDPPipelineStage } from './components/IDPStage'
import { registerIDPPipelineStep } from './components/PipelineSteps'

// eslint-disable-next-line import/no-unresolved
const IDPAdminMicroFrontend = React.lazy(() => import('idpadmin/MicroFrontendApp'))
const mode = NAV_MODE.MODULE
const module: Module = 'idp-admin'

registerIDPPipelineStage()
registerIDPPipelineStep()

const IDPAdminRedirect: React.FC = () => {
  const { scope, params } = useGetSelectedScope()
  const { accountId } = useParams<AccountPathProps>()

  if (scope === Scope.PROJECT) {
    return (
      <Redirect
        to={routes.toPipelines({
          accountId,
          projectIdentifier: params?.projectIdentifier,
          orgIdentifier: params?.orgIdentifier,
          module
        })}
      />
    )
  }

  return <Redirect to={routes.toIDPAdmin({ accountId, module, mode })} />
}

const IDPAdminRouteDestinations = (): React.ReactElement => {
  const mfePaths = [
    routes.toIDPAdmin({ ...accountPathProps, module, mode }),
    routes.toGetStartedWithIDP({ ...accountPathProps, module, mode }),
    routes.toAdminHome({ ...accountPathProps, module, mode }),
    routes.toPluginsPage({ ...accountPathProps, module, mode }),
    routes.toConfigurations({ ...accountPathProps, module, mode }),
    routes.toLayoutConfig({ ...accountPathProps, module, mode }),
    routes.toIDPAccessControl({ ...accountPathProps, module, mode }),
    routes.toConnectorsPage({ ...accountPathProps, module, mode }),
    routes.toIDPOAuthConfig({ ...accountPathProps, module, mode }),
    routes.toIDPAllowListURL({ ...accountPathProps, module, mode }),
    routes.toScorecards({ ...accountPathProps, module, mode })
  ]
  return (
    <Switch>
      {CommonRouteDestinations({ mode }).props.children}
      {PipelineRouteDestinations({ mode }).props.children}
      {TriggersRouteDestinations({ mode }).props.children}

      <RouteWithContext
        exact
        path={[routes.toMode({ ...projectPathProps, module, mode }), routes.toMode({ ...orgPathProps, module, mode })]}
      >
        <IDPAdminRedirect />
      </RouteWithContext>

      <RouteWithContext path={routes.toIDPProjectSetup({ ...accountPathProps, module, mode })}>
        <IDPPipelinesOverview />
      </RouteWithContext>
      <RouteWithContext path={[...mfePaths]} pageName={PAGE_NAME.IDPAdminPage}>
        <ChildAppMounter<IDPCustomMicroFrontendProps>
          ChildApp={IDPAdminMicroFrontend}
          customComponents={{ ConnectorReferenceField, MultiTypeSecretInput, MultiTypeDelegateSelector }}
          customHooks={{ useQueryParams, useUpdateQueryParams }}
          idpServices={{ useGetUserGroupAggregateList }}
        />
      </RouteWithContext>
    </Switch>
  )
}

export default IDPAdminRouteDestinations
