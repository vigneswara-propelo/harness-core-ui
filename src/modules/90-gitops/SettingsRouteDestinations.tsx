/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { PAGE_NAME } from '@modules/10-common/pages/pageContext/PageName'
import { NAV_MODE, pathArrayForAllScopes } from '@modules/10-common/utils/routeUtils'
import { RouteWithContext } from '@modules/10-common/router/RouteWithContext/RouteWithContext'
import routes from '@modules/10-common/RouteDefinitionsV2'
import { GitOpsPage } from './RouteDestinations'

function GitOpsSettingsRouteDestinations({ mode }: { mode: NAV_MODE }): React.ReactElement {
  return (
    <>
      <RouteWithContext
        path={[
          ...pathArrayForAllScopes(routes.toGitOpsResources, mode, { entity: 'agents' }),
          ...pathArrayForAllScopes(routes.toGitOpsResources, mode, { entity: 'repositories' }),
          ...pathArrayForAllScopes(routes.toGitOpsResources, mode, { entity: 'repoCertificates' }),
          ...pathArrayForAllScopes(routes.toGitOpsResources, mode, { entity: 'clusters' }),
          ...pathArrayForAllScopes(routes.toGitOpsResources, mode, { entity: 'gnuPGKeys' })
        ]}
        pageName={PAGE_NAME.GitOpsPage}
      >
        <GitOpsPage />
      </RouteWithContext>
    </>
  )
}

export default GitOpsSettingsRouteDestinations
