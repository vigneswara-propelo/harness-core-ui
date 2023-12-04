/* istanbul ignore file - no sidenavs are tested in Unit tests rather test in integration tests */
/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { SideNav } from '@common/navigation/SideNavV2/SideNavV2'
import routes from '@common/RouteDefinitionsV2'
import { useStrings } from 'framework/strings'
import { NAV_MODE } from '@common/utils/routeUtils'
import { Scope } from 'framework/types/types'
import { useGetSelectedScope } from '@common/navigation/SideNavV2/SideNavV2.utils'

const module = 'iacm'

export default function IACMSideNav(mode: NAV_MODE): React.ReactElement {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { params } = useGetSelectedScope()
  const { projectIdentifier = '', orgIdentifier = '' } = params || {}

  return (
    <SideNav.Main>
      <SideNav.Section>
        <SideNav.Scope scope={Scope.PROJECT}>
          <SideNav.Link
            label={getString('overview')}
            icon="nav-home"
            to={routes.toIACMProjectOverview({ accountId, projectIdentifier, orgIdentifier, module })}
          />
          <SideNav.Link
            label={getString('iacm.workspaces')}
            icon="nav-workspaces"
            to={routes.toIACMWorkspaces({ accountId, projectIdentifier, orgIdentifier, module })}
          />
          <SideNav.Link
            label={getString('pipelines')}
            icon="nav-pipeline"
            to={routes.toPipelines({ accountId, projectIdentifier, orgIdentifier, module })}
            hidden={mode === NAV_MODE.ALL}
          />
        </SideNav.Scope>
      </SideNav.Section>
      <SideNav.SettingsLink mode={mode} module={module} />
    </SideNav.Main>
  )
}
