/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Switch } from 'react-router-dom'
import routes from '@common/RouteDefinitionsV2'
import ChildAppMounter from 'microfrontends/ChildAppMounter'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import { NAV_MODE, accountPathProps } from '@common/utils/routeUtils'
import { MultiTypeDelegateSelector } from '@common/components/MultiTypeDelegateSelector/MultiTypeDelegateSelector'
import { MultiTypeSecretInput } from '@secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'
import { useGetUserGroupAggregateList } from 'services/cd-ng'
import { ConnectorReferenceField } from '@platform/connectors/components/ConnectorReferenceField/ConnectorReferenceField'

import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import { RouteWithContext } from '@common/router/RouteWithContext/RouteWithContext'
import { Module } from '@common/interfaces/RouteInterfaces'
import CommonRouteDestinations from '@user-profile/CommonRouteDestinations'
import type { IDPCustomMicroFrontendProps } from './interfaces/IDPCustomMicroFrontendProps.types'

// eslint-disable-next-line import/no-unresolved
const IDPAdminMicroFrontend = React.lazy(() => import('idpadmin/MicroFrontendApp'))
const mode = NAV_MODE.MODULE
const module: Module = 'idp-admin'

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
      {CommonRouteDestinations({ mode: NAV_MODE.MODULE }).props.children}
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
