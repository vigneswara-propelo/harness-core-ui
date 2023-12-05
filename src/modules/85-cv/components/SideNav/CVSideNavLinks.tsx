/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitionsV2'
import { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { Module } from 'framework/types/ModuleName'
import { useStrings } from 'framework/strings'
import { SideNav } from '@common/navigation/SideNavV2/SideNavV2'
import { Scope } from 'framework/types/types'
import { NAV_MODE } from '@common/utils/routeUtils'
import { useGetSelectedScope } from '@common/navigation/SideNavV2/SideNavV2.utils'

const module: Module = 'cv'
const CVSideNavLinks = (mode: NAV_MODE): React.ReactElement => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { params } = useGetSelectedScope()
  const { projectIdentifier, orgIdentifier } = params || {}

  return (
    <SideNav.Main>
      <SideNav.Section>
        <SideNav.Scope scope={[Scope.PROJECT, Scope.ACCOUNT]}>
          <SideNav.Link
            label={getString('cv.slos.title')}
            to={routes.toCVSLOs({ accountId, projectIdentifier, orgIdentifier, module })}
            iconProps={{ padding: { top: 'xsmall' } }}
            icon="slo"
          />
        </SideNav.Scope>
        <SideNav.Scope scope={Scope.PROJECT}>
          <SideNav.Link
            label={getString('cv.monitoredServices.title')}
            to={routes.toCVMonitoringServices({ accountId, projectIdentifier, orgIdentifier, module })}
            icon="monitored-service"
          />
          <SideNav.Link
            label={getString('changes')}
            to={routes.toCVChanges({ accountId, projectIdentifier, orgIdentifier, module })}
            icon="changes"
          />
        </SideNav.Scope>
      </SideNav.Section>
      <SideNav.CommonScopeLinks mode={mode} module={module} />
    </SideNav.Main>
  )
}

export default CVSideNavLinks
