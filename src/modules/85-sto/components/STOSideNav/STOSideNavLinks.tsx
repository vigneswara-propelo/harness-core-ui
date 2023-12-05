/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { SideNav } from '@common/navigation/SideNavV2/SideNavV2'
import routes from '@common/RouteDefinitionsV2'
import { AccountPathProps, Module } from '@common/interfaces/RouteInterfaces'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useStrings } from 'framework/strings'
import { Scope } from 'framework/types/types'
import { NAV_MODE } from '@common/utils/routeUtils'

const module: Module = 'sto'

const STOSideNavLinks = (mode: NAV_MODE): React.ReactElement => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { selectedProject } = useAppStore()
  const { identifier: projectIdentifier = '', orgIdentifier = '' } = selectedProject || {}
  const { STO_ALL_ISSUES_PAGE } = useFeatureFlags()

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
            icon="main-issue"
            label={getString('sto.issues')}
            to={routes.toSTOIssues({ accountId, projectIdentifier, orgIdentifier, module })}
            hidden={!STO_ALL_ISSUES_PAGE}
          />

          <SideNav.Link
            icon="nav-pipeline"
            label={getString('pipelines')}
            to={routes.toPipelines({ accountId, projectIdentifier, orgIdentifier, module })}
            hidden={mode === NAV_MODE.ALL}
          />

          <SideNav.Link
            icon="execution"
            label={getString('executionsText')}
            to={routes.toDeployments({ accountId, projectIdentifier, orgIdentifier, module })}
            hidden={mode === NAV_MODE.ALL}
          />

          <SideNav.Link
            icon="error-tracking"
            label={getString('sto.targets.testTargets')}
            to={routes.toSTOTargets({ accountId, projectIdentifier, orgIdentifier, module })}
          />

          <SideNav.Link
            icon="ban-circle"
            label={getString('sto.exemptions')}
            to={routes.toSTOSecurityReview({ accountId, projectIdentifier, orgIdentifier, module })}
          />

          <SideNav.Link
            icon="get-started"
            label={getString('getStarted')}
            to={routes.toSTOGettingStarted({ accountId, projectIdentifier, orgIdentifier, module })}
          />
        </SideNav.Scope>
      </SideNav.Section>

      <SideNav.CommonScopeLinks mode={mode} module={module} />
    </SideNav.Main>
  )
}

export default STOSideNavLinks
