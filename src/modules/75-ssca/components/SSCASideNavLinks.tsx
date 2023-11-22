/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
/* istanbul ignore file - no sidenavs are tested in Unit tests rather test in integration tests, currently other sidenav do a just snapshot which is not correct way to do*/

import React from 'react'
import { useParams } from 'react-router-dom'
import { SideNav } from '@common/navigation/SideNavV2/SideNavV2'
import routes from '@common/RouteDefinitionsV2'
import { AccountPathProps, Module } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { Scope } from 'framework/types/types'
import { NAV_MODE } from '@common/utils/routeUtils'
import { useGetSelectedScope } from '@common/navigation/SideNavV2/SideNavV2.utils'

const module: Module = 'ssca'

const SSCASideNavLinks = (mode: NAV_MODE): React.ReactElement => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { params } = useGetSelectedScope()
  const { projectIdentifier = '', orgIdentifier = '' } = params || {}

  return (
    <SideNav.Main>
      <SideNav.Section>
        <SideNav.Scope scope={Scope.PROJECT}>
          <SideNav.Link
            icon="nav-home"
            label={getString('overview')}
            to={routes.toOverview({ accountId, projectIdentifier, orgIdentifier, module })}
          />
          <SideNav.Link
            icon="ssca-artifacts"
            label={getString('artifacts')}
            to={routes.toSSCAArtifacts({ accountId, projectIdentifier, orgIdentifier, module })}
          />
          <SideNav.Link
            icon="nav-pipeline"
            label={getString('pipelines')}
            to={routes.toPipelines({ accountId, projectIdentifier, orgIdentifier, module })}
            hidden={mode === NAV_MODE.ALL}
          />
        </SideNav.Scope>
      </SideNav.Section>

      <SideNav.SettingsLink mode={mode} module={module} />
    </SideNav.Main>
  )
}

export default SSCASideNavLinks
