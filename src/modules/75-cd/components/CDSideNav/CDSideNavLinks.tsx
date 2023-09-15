/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useHistory, useParams, matchPath, useLocation } from 'react-router-dom'
import { useToaster } from '@harness/uicore'

import { SettingType } from '@common/constants/Utils'
import { SideNav } from '@common/navigation/SideNavV2/SideNavV2'
import { Scope } from 'framework/types/types'
import routes from '@common/RouteDefinitionsV2'
import { AccountPathProps, Module } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { NAV_MODE } from '@common/utils/routeUtils'
import { useGetCommunity } from '@common/utils/utils'
import { useGetPipelines } from '@pipeline/hooks/useGetPipelines'
import { PagePMSPipelineSummaryResponse } from 'services/pipeline-ng'
import { useGetSettingValue } from 'services/cd-ng'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useGetSelectedScope } from '@common/navigation/SideNavV2/SideNavV2.utils'

const module: Module = 'cd'
const CDSideNavLinks = (mode: NAV_MODE): React.ReactElement => {
  const history = useHistory()
  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const { params } = useGetSelectedScope()
  const { projectIdentifier = '', orgIdentifier = '' } = params || {}
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const isCommunity = useGetCommunity()
  const { CDS_SERVICE_OVERRIDES_2_0, SRM_COMMON_MONITORED_SERVICE } = useFeatureFlags()

  const [isCDGetStartedVisible, setIsCDGetStartedVisible] = useState<boolean>()

  const { pathname } = useLocation()

  const isOverviewPage = !!matchPath(pathname, {
    path: routes.toOverview({ accountId, projectIdentifier, orgIdentifier, module })
  })

  const isGetStartedPage = !!matchPath(pathname, {
    path: routes.toGetStartedWithCD({ accountId, projectIdentifier, orgIdentifier, module })
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

  React.useEffect(() => {
    if (projectIdentifier) {
      fetchPipelines()
    }
  }, [projectIdentifier])

  React.useEffect(() => {
    if (!fetchingPipelines && fetchPipelinesData) {
      const { data, status } = fetchPipelinesData
      const isGettingStartedEnabled =
        status === 'SUCCESS' && (data as PagePMSPipelineSummaryResponse)?.totalElements === 0
      setIsCDGetStartedVisible(isGettingStartedEnabled)
      if (isGettingStartedEnabled) {
        isOverviewPage &&
          history.replace(routes.toGetStartedWithCD({ accountId, projectIdentifier, orgIdentifier, module }))
      } else {
        isGetStartedPage &&
          history.replace(routes.toDeployments({ accountId, projectIdentifier, orgIdentifier, module }))
      }
    }
  }, [fetchPipelinesData, fetchingPipelines, history, accountId, orgIdentifier, projectIdentifier])

  const { data: enableServiceOverrideSettings, error: enableServiceOverrideSettingsError } = useGetSettingValue({
    identifier: SettingType.ENABLE_SERVICE_OVERRIDE_V2,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: false
  })

  React.useEffect(() => {
    if (enableServiceOverrideSettingsError) {
      showError(getRBACErrorMessage(enableServiceOverrideSettingsError))
    }
  }, [enableServiceOverrideSettingsError])

  const isServiceOverridesEnabled = CDS_SERVICE_OVERRIDES_2_0 && enableServiceOverrideSettings?.data?.value === 'true'

  return (
    <SideNav.Main>
      <SideNav.Section>
        <SideNav.Scope scope={Scope.PROJECT}>
          <SideNav.Link
            icon="nav-home"
            label={getString('overview')}
            to={routes.toOverview({ accountId, projectIdentifier, orgIdentifier, module })}
            visible={!isCommunity && !isCDGetStartedVisible}
          />
          <SideNav.Link
            icon="get-started"
            label={getString('getStarted')}
            to={routes.toGetStartedWithCD({ accountId, projectIdentifier, orgIdentifier, module })}
            visible={isCDGetStartedVisible}
          />
          <SideNav.Link
            icon="execution"
            label={getString('executionsText')}
            to={routes.toDeployments({ accountId, projectIdentifier, orgIdentifier, module })}
            visible={mode !== NAV_MODE.ALL}
          />
          <SideNav.Link
            icon="nav-pipeline"
            label={getString('pipelines')}
            to={routes.toPipelines({ accountId, projectIdentifier, orgIdentifier, module })}
            visible={mode !== NAV_MODE.ALL}
          />
          <SideNav.Link
            icon="services"
            label={getString('services')}
            to={routes.toServices({ accountId, projectIdentifier, orgIdentifier, module })}
          />
          <SideNav.Link
            icon="nav-environments"
            label={getString('environments')}
            to={routes.toEnvironment({ accountId, projectIdentifier, orgIdentifier, module })}
          />
          <SideNav.Link
            icon="monitored-service"
            label={getString('common.monitoredServices')}
            to={routes.toMonitoredServices({ accountId, projectIdentifier, orgIdentifier, module })}
            visible={SRM_COMMON_MONITORED_SERVICE}
          />
          <SideNav.Link
            label={getString('common.overrides')}
            to={routes.toServiceOverrides({ accountId, projectIdentifier, orgIdentifier, module })}
            visible={isServiceOverridesEnabled}
            icon="layers-outline"
          />
          <SideNav.Link
            icon="gitops"
            label={getString('cd.gitOps')}
            to={routes.toGitOps({ ...params, module })}
            visible={!isCommunity}
          />
        </SideNav.Scope>
      </SideNav.Section>
      <SideNav.SettingsLink mode={mode} module={module} />
    </SideNav.Main>
  )
}

export default CDSideNavLinks
