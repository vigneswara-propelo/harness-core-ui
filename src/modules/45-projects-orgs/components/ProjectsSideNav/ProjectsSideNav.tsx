/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams, useHistory, useRouteMatch, matchPath, useLocation } from 'react-router-dom'
import { omit } from 'lodash-es'
import { Container, Layout, useToaster } from '@harness/uicore'
import { compile } from 'path-to-regexp'
import { useGetSettingValue } from 'services/cd-ng'

import { SettingType } from '@common/constants/Utils'
import routes from '@common/RouteDefinitions'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { ProjectSelector } from '@projects-orgs/components/ProjectSelector/ProjectSelector'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import ProjectSetupMenu from '@common/navigation/ProjectSetupMenu/ProjectSetupMenu'
import css from './ProjectSideNav.module.scss'
export default function ProjectsSideNav(): React.ReactElement {
  const params = useParams<PipelinePathProps>()
  const routeMatch = useRouteMatch()
  const location = useLocation()
  const history = useHistory()
  const { selectedProject, updateAppStore } = useAppStore()
  const { NEW_LEFT_NAVBAR_SETTINGS, CDS_SERVICE_OVERRIDES_2_0, SRM_COMMON_MONITORED_SERVICE } = useFeatureFlags()

  const { getString } = useStrings()
  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()

  const projectDetailsParams = {
    accountId: params.accountId,
    projectIdentifier: selectedProject?.identifier ? selectedProject.identifier : '',
    orgIdentifier: selectedProject?.orgIdentifier ? selectedProject.orgIdentifier : ''
  }

  const { data: enableServiceOverrideSettings, error: enableServiceOverrideSettingsError } = useGetSettingValue({
    identifier: SettingType.ENABLE_SERVICE_OVERRIDE_V2,
    queryParams: {
      accountIdentifier: params.accountId,
      ...omit(projectDetailsParams, 'accountId')
    },
    lazy: false
  })

  React.useEffect(() => {
    if (enableServiceOverrideSettingsError) {
      showError(getRBACErrorMessage(enableServiceOverrideSettingsError))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enableServiceOverrideSettingsError])

  const allProjectsPath = matchPath(location.pathname, {
    path: routes.toAllProjects({ accountId: params.accountId }),
    exact: true,
    strict: false
  })
  const isServiceOverridesEnabled = CDS_SERVICE_OVERRIDES_2_0 && enableServiceOverrideSettings?.data?.value === 'true'

  return (
    <Layout.Vertical spacing="small">
      {NEW_LEFT_NAVBAR_SETTINGS && (
        <>
          <SidebarLink
            label={getString('rbac.scopeItems.allProjects')}
            to={routes.toAllProjects({ accountId: params.accountId })}
            icon="nav-project"
            style={{ marginTop: 'var(--spacing-medium)', marginBottom: 'var(--spacing-small)' }}
            className={css.iconColor}
            exact
          />
          <div className={css.divStyle} />
        </>
      )}
      {selectedProject && (
        <Container className={allProjectsPath?.isExact ? css.projectSelectorContainer : undefined}>
          <Container className={css.selector}>
            <ProjectSelector
              onSelect={data => {
                updateAppStore({ selectedProject: data })
                // changing project
                if (NEW_LEFT_NAVBAR_SETTINGS) {
                  history.push(
                    routes.toProjectDetails({
                      accountId: params.accountId,
                      orgIdentifier: data.orgIdentifier || '',
                      projectIdentifier: data.identifier
                    })
                  )
                } else {
                  history.push(
                    compile(routeMatch.path)({
                      ...routeMatch.params,
                      projectIdentifier: data.identifier,
                      orgIdentifier: data.orgIdentifier
                    })
                  )
                }
              }}
            />
          </Container>
          <Layout.Vertical spacing="small">
            <SidebarLink label={getString('overview')} to={routes.toProjectDetails(projectDetailsParams)} />
            {NEW_LEFT_NAVBAR_SETTINGS && (
              <>
                <SidebarLink
                  label={getString('common.pipelineExecution')}
                  to={routes.toDeployments(projectDetailsParams)}
                />
                <SidebarLink label={getString('pipelines')} to={routes.toPipelines(projectDetailsParams)} />
                <SidebarLink label={getString('services')} to={routes.toServices(projectDetailsParams)} />
                <SidebarLink label={getString('environments')} to={routes.toEnvironment(projectDetailsParams)} />
                {SRM_COMMON_MONITORED_SERVICE ? (
                  <SidebarLink
                    label={getString('common.monitoredServices')}
                    to={routes.toMonitoredServices(projectDetailsParams)}
                  />
                ) : null}
                {isServiceOverridesEnabled && (
                  <SidebarLink
                    label={getString('common.overrides')}
                    to={routes.toServiceOverrides(projectDetailsParams)}
                  />
                )}
              </>
            )}
          </Layout.Vertical>
          <ProjectSetupMenu defaultExpanded={NEW_LEFT_NAVBAR_SETTINGS} />
        </Container>
      )}
    </Layout.Vertical>
  )
}
