/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import routes from '@common/RouteDefinitionsV2'
import { Scope } from 'framework/types/types'
import { SideNav } from '@common/navigation/SideNavV2/SideNavV2'
import { useStrings } from 'framework/strings'
import ModulesAccordion from '@common/navigation/SideNavV2/ModulesAccordion/ModulesAccordion'

import { NAV_MODE } from '@common/utils/routeUtils'
import { useGetSelectedScope } from '@common/navigation/SideNavV2/SideNavV2.utils'

const AllModeSideNav = (): React.ReactElement => {
  const { getString } = useStrings()
  const { params } = useGetSelectedScope()
  const { orgIdentifier, projectIdentifier } = params || {}

  return (
    <SideNav.Main>
      <SideNav.Section>
        <SideNav.Scope scope={[Scope.ACCOUNT, Scope.PROJECT]}>
          <SideNav.Link
            to={routes.toOverview({ orgIdentifier, projectIdentifier })}
            label={getString('overview')}
            icon="nav-home"
          />
        </SideNav.Scope>
        <SideNav.Scope scope={Scope.PROJECT}>
          <SideNav.Link
            to={routes.toPipelines({
              projectIdentifier,
              orgIdentifier
            })}
            icon="nav-pipeline"
            label={getString('pipelines')}
          />
          <SideNav.Link
            icon="execution"
            label={getString('executionsText')}
            to={routes.toDeployments({ projectIdentifier, orgIdentifier })}
          />
        </SideNav.Scope>
      </SideNav.Section>
      <SideNav.Section>
        <ModulesAccordion />
      </SideNav.Section>
      <SideNav.CommonScopeLinks mode={NAV_MODE.ALL} />
    </SideNav.Main>
  )
}

export default AllModeSideNav
