/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Redirect, useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitionsV2'
import { RouteWithContext } from '@common/router/RouteWithContext/RouteWithContext'
import { NAV_MODE, delegateConfigProps, delegatePathProps, pathArrayForAllScopes } from '@common/utils/routeUtils'
import { PAGE_NAME } from '@modules/10-common/pages/pageContext/PageName'
import { AccountPathProps, ModulePathParams } from '@modules/10-common/interfaces/RouteInterfaces'
import DelegatesPage from './pages/delegates/DelegatesPage'
import DelegateListing from './pages/delegates/DelegateListing'
import DelegateConfigurations from './pages/delegates/DelegateConfigurations'
import DelegateDetails from './pages/delegates/DelegateDetails'
import DelegateProfileDetails from './pages/delegates/DelegateConfigurationDetailPage'
import DelegateTokens from './components/DelegateTokens/DelegateTokens'

const RedirectToDelegatesHome = ({ mode }: { mode: NAV_MODE }): React.ReactElement => {
  const { module, ...rest } = useParams<AccountPathProps & ModulePathParams>()
  return <Redirect to={routes.toDelegateList({ ...rest, mode, module })} />
}

function DelegateSettingsRouteDestinations({ mode }: { mode: NAV_MODE }): React.ReactElement {
  return (
    <>
      <RouteWithContext exact path={pathArrayForAllScopes(routes.toDelegatesSettings, mode)}>
        <RedirectToDelegatesHome mode={mode} />
      </RouteWithContext>
      <RouteWithContext
        exact
        path={pathArrayForAllScopes(routes.toDelegateList, mode)}
        pageName={PAGE_NAME.DelegateListing}
      >
        <DelegatesPage>
          <DelegateListing />
        </DelegatesPage>
      </RouteWithContext>
      <RouteWithContext
        exact
        path={pathArrayForAllScopes(routes.toDelegateConfigs, mode)}
        pageName={PAGE_NAME.DelegateConfigurations}
      >
        <DelegatesPage>
          <DelegateConfigurations />
        </DelegatesPage>
      </RouteWithContext>
      <RouteWithContext
        exact
        path={pathArrayForAllScopes(routes.toDelegatesDetails, mode, { ...delegatePathProps })}
        pageName={PAGE_NAME.DelegateDetails}
      >
        <DelegateDetails />
      </RouteWithContext>
      <RouteWithContext
        exact
        path={pathArrayForAllScopes(routes.toDelegateConfigsDetails, mode, { ...delegateConfigProps })}
        pageName={PAGE_NAME.DelegateProfileDetails}
      >
        <DelegateProfileDetails />
      </RouteWithContext>
      <RouteWithContext
        exact
        path={pathArrayForAllScopes(routes.toDelegateTokens, mode)}
        pageName={PAGE_NAME.DelegateTokens}
      >
        <DelegatesPage>
          <DelegateTokens />
        </DelegatesPage>
      </RouteWithContext>
    </>
  )
}

export default DelegateSettingsRouteDestinations
