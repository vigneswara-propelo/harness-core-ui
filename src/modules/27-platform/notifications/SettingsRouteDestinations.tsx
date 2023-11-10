/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
/* istanbul ignore file */

import React from 'react'
import routes from '@common/RouteDefinitionsV2'
import { RouteWithContext } from '@common/router/RouteWithContext/RouteWithContext'
import { NAV_MODE, pathArrayForAllScopes } from '@common/utils/routeUtils'
import { PAGE_NAME } from '@modules/10-common/pages/pageContext/PageName'

import { NotificationPageList } from './NotificationsPageList'

// Will Update it later
// const RedirectToCentralNotificationsHome = ({ mode }: { mode: NAV_MODE }): React.ReactElement => {
//   const { module, ...rest } = useParams<AccountPathProps & ModulePathParams>()
//   return <Redirect to={routes.toNotificationsManagement({ ...rest, mode, module })} />
// }

function NotificationsManagementSettingsRouteDestinations({ mode }: { mode: NAV_MODE }): React.ReactElement {
  return (
    <>
      <RouteWithContext
        exact
        path={pathArrayForAllScopes(routes.toNotificationsManagement, mode)}
        pageName={PAGE_NAME.Notifications}
      >
        <NotificationPageList />
      </RouteWithContext>
    </>
  )
}

export default NotificationsManagementSettingsRouteDestinations
