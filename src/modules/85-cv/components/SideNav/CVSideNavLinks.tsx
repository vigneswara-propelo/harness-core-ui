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
import SideNavLink from '@common/navigation/SideNavV2/SideNavLink/SideNavLink'
import { useStrings } from 'framework/strings'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
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
  const SRM_ET_EXPERIMENTAL = useFeatureFlag(FeatureFlag.SRM_ET_EXPERIMENTAL)

  return (
    <SideNav.Main>
      <SideNav.Section>
        <SideNav.Scope scope={[Scope.PROJECT, Scope.ACCOUNT]}>
          <SideNavLink
            label={getString('cv.slos.title')}
            to={routes.toCVSLOs({ accountId, projectIdentifier, orgIdentifier, module })}
            iconProps={{ padding: { top: 'xsmall' } }}
            icon="slo"
          />
        </SideNav.Scope>
        <SideNav.Scope scope={Scope.PROJECT}>
          <SideNavLink
            label={getString('cv.monitoredServices.title')}
            to={routes.toCVMonitoringServices({ accountId, projectIdentifier, orgIdentifier, module })}
            icon="monitored-service"
          />
          <SideNavLink
            label={getString('changes')}
            to={routes.toCVChanges({ accountId, projectIdentifier, orgIdentifier, module })}
            icon="changes"
          />
        </SideNav.Scope>
        {SRM_ET_EXPERIMENTAL ? (
          <SideNav.Scope scope={Scope.PROJECT}>
            <SideNavLink
              label={getString('cv.codeErrors.title')}
              to={routes.toCVCodeErrors({ accountId, projectIdentifier, orgIdentifier, module })}
            />
          </SideNav.Scope>
        ) : null}
      </SideNav.Section>
      <SideNav.SettingsLink mode={mode} module={module} />
    </SideNav.Main>
  )
}

export default CVSideNavLinks
