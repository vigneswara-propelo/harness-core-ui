/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Redirect, Switch, useParams } from 'react-router-dom'
import { isEmpty } from 'lodash-es'
import { useGetStatusInfoTypeV2Query } from '@harnessio/react-idp-service-client'
import routes from '@common/RouteDefinitionsV2'
import ChildAppMounter from 'microfrontends/ChildAppMounter'
import { NAV_MODE, accountPathProps } from '@common/utils/routeUtils'
import { RouteWithContext } from '@common/router/RouteWithContext/RouteWithContext'
import CommonRouteDestinations from '@user-profile/CommonRouteDestinations'
import { AccountPathProps, Module } from '@common/interfaces/RouteInterfaces'

// eslint-disable-next-line import/no-unresolved
const IDPMicroFrontend = React.lazy(() => import('idp/MicroFrontendApp'))
const mode = NAV_MODE.MODULE
const IDPModule: Module = 'idp'
const IDPAdminModule: Module = 'idp-admin'

const IDPRouteDestinations = (): React.ReactElement => {
  function RedirectToIDPDefaultPath(): React.ReactElement {
    const { accountId } = useParams<AccountPathProps>()

    const { data } = useGetStatusInfoTypeV2Query(
      { type: 'onboarding' },
      {
        staleTime: 15 * 60 * 1000
      }
    )
    const onboardingStatus = data?.content?.onboarding?.current_status

    if (!isEmpty(onboardingStatus)) {
      if (onboardingStatus === 'COMPLETED') {
        return <Redirect to={routes.toIDP({ module: IDPModule, accountId, mode })} />
      }
      return <Redirect to={routes.toGetStartedWithIDP({ accountId, module: IDPAdminModule, mode })} />
    }
    return <></>
  }

  return (
    <Switch>
      {CommonRouteDestinations({ mode: NAV_MODE.MODULE }).props.children}
      <RouteWithContext exact path={routes.toIDPDefaultPath({ module: IDPModule, ...accountPathProps, mode })}>
        <RedirectToIDPDefaultPath />
      </RouteWithContext>
      <RouteWithContext path={routes.toIDP({ module: IDPModule, ...accountPathProps, mode })}>
        <ChildAppMounter ChildApp={IDPMicroFrontend} />
      </RouteWithContext>
    </Switch>
  )
}

export default IDPRouteDestinations
