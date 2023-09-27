/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Switch } from 'react-router-dom'
import routes from '@common/RouteDefinitionsV2'
import { RouteWithContext } from '@common/router/RouteWithContext/RouteWithContext'
import { NAV_MODE, accountPathProps, modulePathProps, orgPathProps, projectPathProps } from '@common/utils/routeUtils'
import UserProfilePage from '@user-profile/pages/UserProfile/UserProfilePage'
import SettingsRouteDestinations from '@modules/SettingsRouteDestinations'

function CommonRouteDestinations({ mode }: { mode: NAV_MODE }): React.ReactElement {
  return (
    <Switch>
      <RouteWithContext
        path={[
          routes.toUserProfile({ ...accountPathProps, ...modulePathProps, ...projectPathProps, mode }),
          routes.toUserProfile({ ...accountPathProps, ...modulePathProps, ...orgPathProps, mode }),
          routes.toUserProfile({ ...accountPathProps, ...modulePathProps, mode }),
          routes.toUserProfile({ ...accountPathProps, ...projectPathProps, mode }),
          routes.toUserProfile({ ...accountPathProps, ...orgPathProps, mode }),
          routes.toUserProfile({ ...accountPathProps, mode })
        ]}
      >
        <UserProfilePage />
      </RouteWithContext>
      {SettingsRouteDestinations({ mode }).props.children}
    </Switch>
  )
}

export default CommonRouteDestinations
