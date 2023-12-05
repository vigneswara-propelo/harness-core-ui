/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { matchPath, useHistory, useLocation, useParams } from 'react-router-dom'
import { SideNav } from '@common/navigation/SideNavV2/SideNavV2'
import routes from '@common/RouteDefinitionsV2'
import { Scope } from 'framework/types/types'
import { AccountPathProps, Module } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { NAV_MODE } from '@common/utils/routeUtils'
import { useGetPipelines } from '@pipeline/hooks/useGetPipelines'
import { PagePMSPipelineSummaryResponse } from 'services/pipeline-ng'
import { useHostedBuilds } from '@common/hooks/useHostedBuild'
import { useGetSelectedScope } from '@common/navigation/SideNavV2/SideNavV2.utils'

const module: Module = 'ci'
const CISideNavLinks = (mode: NAV_MODE): React.ReactElement => {
  const { getString } = useStrings()
  const { params } = useGetSelectedScope()
  const { projectIdentifier = '', orgIdentifier = '' } = params || {}
  const { accountId } = useParams<AccountPathProps>()
  const history = useHistory()
  const { enabledHostedBuildsForFreeUsers } = useHostedBuilds()
  const { pathname } = useLocation()

  const isOverviewPage = !!matchPath(pathname, {
    path: routes.toOverview({ accountId, projectIdentifier, orgIdentifier, module })
  })

  const isGetStartedPage = !!matchPath(pathname, {
    path: routes.toGetStartedWithCI({ accountId, projectIdentifier, orgIdentifier, module })
  })

  const {
    data: fetchPipelinesData,
    loading: fetchingPipelines,
    refetch: fetchPipelines
  } = useGetPipelines({
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    lazy: true,
    size: 1
  })

  useEffect(() => {
    if (enabledHostedBuildsForFreeUsers && projectIdentifier) {
      fetchPipelines()
    }
  }, [projectIdentifier, enabledHostedBuildsForFreeUsers])

  useEffect(() => {
    if (!fetchingPipelines && fetchPipelinesData) {
      const { data, status } = fetchPipelinesData
      const isGettingStartedEnabled =
        status === 'SUCCESS' && (data as PagePMSPipelineSummaryResponse)?.totalElements === 0
      if (isGettingStartedEnabled && isOverviewPage) {
        history.replace(routes.toGetStartedWithCI({ accountId, projectIdentifier, orgIdentifier, module }))
      } else if (!isGettingStartedEnabled && isGetStartedPage) {
        history.replace(routes.toDeployments({ accountId, projectIdentifier, orgIdentifier, module }))
      }
    }
  }, [fetchPipelinesData, fetchingPipelines, history, accountId, orgIdentifier, projectIdentifier])

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
            icon="nav-pipeline"
            label={getString('pipelines')}
            to={routes.toPipelines({ accountId, projectIdentifier, orgIdentifier, module })}
            hidden={mode === NAV_MODE.ALL}
          />

          <SideNav.Link
            icon="nav-builds"
            label={getString('buildsText')}
            to={routes.toDeployments({ accountId, projectIdentifier, orgIdentifier, module })}
            hidden={mode === NAV_MODE.ALL}
          />

          <SideNav.Link
            icon="get-started"
            label={getString('getStarted')}
            to={routes.toGetStartedWithCI({ accountId, projectIdentifier, orgIdentifier, module })}
          />
        </SideNav.Scope>
      </SideNav.Section>
      <SideNav.CommonScopeLinks mode={mode} module={module} />
    </SideNav.Main>
  )
}

export default CISideNavLinks
