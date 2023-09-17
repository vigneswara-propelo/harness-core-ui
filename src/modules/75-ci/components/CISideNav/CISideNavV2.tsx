/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { matchPath, useHistory, useLocation, useParams } from 'react-router-dom'
import { SideNav } from '@common/navigation/SideNavV2/SideNavV2'
import routes from '@common/RouteDefinitionsV2'
import { Scope } from 'framework/types/types'
import { AccountPathProps, Module } from '@common/interfaces/RouteInterfaces'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useStrings } from 'framework/strings'
import { NAV_MODE } from '@common/utils/routeUtils'
import { useGetPipelines } from '@pipeline/hooks/useGetPipelines'
import { PagePMSPipelineSummaryResponse } from 'services/pipeline-ng'
import { useHostedBuilds } from '@common/hooks/useHostedBuild'

const module: Module = 'ci'
const CISideNavLinks = (mode: NAV_MODE): React.ReactElement => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { selectedProject } = useAppStore()
  const { identifier = '', orgIdentifier = '' } = selectedProject || {}
  const history = useHistory()
  const { enabledHostedBuildsForFreeUsers } = useHostedBuilds()
  const [getStartedWithCIFirst, setGetStartedWithCIFirst] = useState(false)
  const { pathname } = useLocation()

  const isOverviewPage = !!matchPath(pathname, {
    path: routes.toOverview({ accountId, projectIdentifier: identifier, orgIdentifier, module })
  })

  const {
    data: fetchPipelinesData,
    loading: fetchingPipelines,
    refetch: fetchPipelines
  } = useGetPipelines({
    accountIdentifier: accountId,
    projectIdentifier: identifier,
    orgIdentifier,
    lazy: true,
    size: 1
  })

  useEffect(() => {
    if (enabledHostedBuildsForFreeUsers && selectedProject?.identifier) {
      fetchPipelines()
    }
  }, [selectedProject?.identifier, getStartedWithCIFirst, enabledHostedBuildsForFreeUsers])

  useEffect(() => {
    if (!fetchingPipelines && fetchPipelinesData) {
      const { data, status } = fetchPipelinesData
      setGetStartedWithCIFirst(status === 'SUCCESS' && (data as PagePMSPipelineSummaryResponse)?.totalElements === 0)
    }
  }, [fetchPipelinesData, fetchingPipelines])

  useEffect(() => {
    if (getStartedWithCIFirst) {
      isOverviewPage &&
        history.replace(
          routes.toGetStartedWithCI({
            projectIdentifier: identifier,
            orgIdentifier,
            accountId,
            module
          })
        )
    }
  }, [getStartedWithCIFirst, history, accountId, orgIdentifier, identifier])

  const renderCommonNavLinks = (): JSX.Element => {
    return (
      <>
        <SideNav.Scope scope={Scope.PROJECT}>
          <SideNav.Link
            icon="nav-home"
            label={getString('overview')}
            to={routes.toOverview({ accountId, projectIdentifier: identifier, orgIdentifier, module })}
          />

          <SideNav.Link
            icon="nav-pipeline"
            label={getString('pipelines')}
            to={routes.toPipelines({ accountId, projectIdentifier: identifier, orgIdentifier, module })}
            hidden={mode === NAV_MODE.ALL}
          />

          <SideNav.Link
            icon="nav-builds"
            label={getString('buildsText')}
            to={routes.toDeployments({ accountId, projectIdentifier: identifier, orgIdentifier, module })}
            hidden={mode === NAV_MODE.ALL}
          />
        </SideNav.Scope>
      </>
    )
  }

  const renderGetStartedWithCI = (): JSX.Element => {
    return (
      <SideNav.Scope scope={Scope.PROJECT}>
        <SideNav.Link
          icon="get-started"
          label={getString('getStarted')}
          to={routes.toGetStartedWithCI({ accountId, projectIdentifier: identifier, orgIdentifier, module })}
        />
      </SideNav.Scope>
    )
  }

  return (
    <SideNav.Main>
      <SideNav.Section>
        {getStartedWithCIFirst ? (
          <>
            {renderGetStartedWithCI()}
            {renderCommonNavLinks()}
          </>
        ) : (
          <>
            {renderCommonNavLinks()}
            {renderGetStartedWithCI()}
          </>
        )}
      </SideNav.Section>
      <SideNav.SettingsLink mode={mode} module={module} />
    </SideNav.Main>
  )
}

export default CISideNavLinks
