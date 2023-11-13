/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Container, Layout, Tabs, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { ResourceType } from '@modules/20-rbac/interfaces/ResourceType'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import routes from '@common/RouteDefinitions'
import { ProjectSelector } from '@projects-orgs/components/ProjectSelector/ProjectSelector'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useStrings } from 'framework/strings'
import { usePermission } from '@modules/20-rbac/hooks/usePermission'
import { PermissionIdentifier } from '@modules/20-rbac/interfaces/PermissionIdentifier'
import NavExpandable from '@modules/10-common/navigation/NavExpandable/NavExpandable'
import css from './SEISideNav.module.scss'

export default function SEISideNav(): React.ReactElement {
  const [selectedTabId, setSelectedTabId] = useState<string>('project')
  const params = useParams<ProjectPathProps>()
  const { accountId } = params
  const { getString } = useStrings()
  const { updateAppStore, selectedProject } = useAppStore()
  const { identifier: projectIdentifier = '', orgIdentifier = '' } = selectedProject || {}
  const history = useHistory()

  const [hasAccountAccess] = usePermission({
    resourceScope: {
      accountIdentifier: accountId
    },
    resource: {
      resourceType: ResourceType.SEI_CONFIGURATION_SETTINGS
    },
    permissions: [PermissionIdentifier.VIEW_SEI_CONFIGURATIONSETTINGS]
  })

  const projectTabContent = useMemo(
    () => (
      <>
        <ProjectSelector
          onSelect={data => {
            updateAppStore({ selectedProject: data })
            history.push(
              routes.toSEIInsights({
                projectIdentifier: data.identifier,
                orgIdentifier: data.orgIdentifier || '',
                accountId
              })
            )
          }}
        />
        {selectedProject && (
          <>
            <Container className={css.group}>
              <SidebarLink
                label={getString('sei.insights')}
                to={routes.toSEIInsights({ accountId, projectIdentifier, orgIdentifier })}
              />
            </Container>
            <NavExpandable
              title={getString('common.projectSetup')}
              route={routes.toSEIMicroFrontend(params)}
              defaultExpanded={false}
            >
              <Layout.Vertical spacing="small">
                <SidebarLink
                  label={getString('sei.projectSettings.integrationMapping')}
                  to={routes.toSEIIntegrationMapping({ accountId, projectIdentifier, orgIdentifier })}
                />
                <SidebarLink
                  label={getString('common.purpose.sei.collections')}
                  to={routes.toSEICollection({ accountId, projectIdentifier, orgIdentifier })}
                />
                <SidebarLink
                  to={routes.toAccessControl({ accountId, projectIdentifier, orgIdentifier, module: 'sei' })}
                  label={getString('accessControl')}
                />
              </Layout.Vertical>
            </NavExpandable>
          </>
        )}
      </>
    ),
    [accountId, getString, history, orgIdentifier, params, projectIdentifier, selectedProject, updateAppStore]
  )

  const accountTabContent = useMemo(
    () => (
      <>
        <Layout.Vertical className={css.group}>
          <Text
            className={css.groupHeader}
            font={{ variation: FontVariation.TINY }}
            color={Color.GREY_500}
            padding={{ right: 'medium', bottom: 'small', left: 'medium' }}
          >
            {getString('sei.accountSettings.dataSettings.label')}
          </Text>
          <SidebarLink
            label={getString('sei.accountSettings.dataSettings.integrations')}
            to={routes.toSEIIntegrations({ ...params })}
          />
          <SidebarLink
            label={getString('sei.accountSettings.dataSettings.contributors')}
            to={routes.toSEIContributors({ ...params })}
          />
        </Layout.Vertical>
        <Layout.Vertical className={css.group}>
          <Text
            className={css.groupHeader}
            font={{ variation: FontVariation.TINY }}
            color={Color.GREY_500}
            padding={{ right: 'medium', bottom: 'small', left: 'medium' }}
          >
            {getString('sei.accountSettings.profile.label')}
          </Text>
          <SidebarLink
            label={getString('sei.accountSettings.profile.workflow')}
            to={routes.toSEIWorklowProfilePage({ ...params })}
          />
          <SidebarLink
            label={getString('sei.accountSettings.profile.investment')}
            to={routes.toSEIEffortInvestment({ ...params })}
          />
          <SidebarLink
            label={getString('sei.accountSettings.profile.trellis')}
            to={routes.toSEITrellisScoreProfile({ ...params })}
          />
        </Layout.Vertical>
        <Layout.Vertical className={css.group}>
          <Text
            className={css.groupHeader}
            font={{ variation: FontVariation.TINY }}
            color={Color.GREY_500}
            padding={{ right: 'medium', bottom: 'small', left: 'medium' }}
          >
            {getString('sei.accountSettings.advancedFeature.label')}
          </Text>
          <SidebarLink
            label={getString('sei.accountSettings.advancedFeature.tables')}
            to={routes.toSEITables({ ...params })}
          />
          <SidebarLink
            label={getString('sei.accountSettings.advancedFeature.propels')}
            to={routes.toSEIPropels({ ...params })}
          />
        </Layout.Vertical>
        <Layout.Vertical className={css.group}>
          <Text
            className={css.groupHeader}
            font={{ variation: FontVariation.TINY }}
            color={Color.GREY_500}
            padding={{ right: 'medium', bottom: 'small', left: 'medium' }}
          >
            {getString('sei.accountSettings.seiSettings.label')}
          </Text>
          <SidebarLink
            label={getString('sei.accountSettings.seiSettings.customize')}
            to={routes.toSEICustomise(params)}
          />
          <SidebarLink
            label={getString('sei.accountSettings.seiSettings.activityLogs')}
            to={routes.toSEIActivityLogs(params)}
          />
          <SidebarLink label={getString('sei.accountSettings.seiSettings.apiKeys')} to={routes.toSEIApiKeys(params)} />
        </Layout.Vertical>
      </>
    ),
    [getString, params]
  )

  useEffect(() => {
    let tab = 'project'
    if (
      (history.location.pathname.includes('configuration') ||
        history.location.pathname.includes('tables') ||
        history.location.pathname.includes('propels')) &&
      !history.location.pathname.endsWith('configuration/organization')
    ) {
      tab = 'account'
    }
    setSelectedTabId(tab)
  }, [history.location.pathname])

  return (
    <Layout.Vertical spacing="small" className={css.seiSideNav}>
      {hasAccountAccess ? (
        <Tabs
          id={'seiNavigationTabs'}
          selectedTabId={selectedTabId}
          tabList={[
            {
              id: 'project',
              title: getString('projectLabel'),
              panel: projectTabContent
            },
            { id: 'account', title: getString('account'), panel: accountTabContent }
          ]}
          onChange={nextTab => setSelectedTabId(nextTab as string)}
        />
      ) : (
        projectTabContent
      )}
    </Layout.Vertical>
  )
}
