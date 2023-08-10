/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Container, Layout, Tabs, Text } from '@harness/uicore'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import routes from '@common/RouteDefinitions'
import { ProjectSelector } from '@projects-orgs/components/ProjectSelector/ProjectSelector'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useStrings } from 'framework/strings'
import ProjectSetupMenu from '@common/navigation/ProjectSetupMenu/ProjectSetupMenu'
import css from './SEISideNav.module.scss'

export default function SEISideNav(): React.ReactElement {
  const params = useParams<ProjectPathProps>()
  const { accountId } = params
  const { getString } = useStrings()
  const { updateAppStore, selectedOrg, selectedProject } = useAppStore()
  const history = useHistory()

  const projectTabContent = useMemo(
    () => (
      <>
        <ProjectSelector
          onSelect={data => {
            updateAppStore({ selectedProject: data })
            history.push(
              routes.toSEIInsights({
                projectIdentifier: data.identifier,
                orgIdentifier: data.orgIdentifier || /* istanbul ignore next */ '',
                accountId
              })
            )
          }}
        />
        {selectedProject && selectedOrg && (
          <>
            <Container className={css.group}>
              <SidebarLink
                label={getString('sei.insights')}
                to={routes.toSEIInsights({
                  projectIdentifier: selectedProject.identifier,
                  orgIdentifier: selectedOrg.identifier,
                  accountId
                })}
              />
            </Container>
            <ProjectSetupMenu module={'sei'} />
          </>
        )}
      </>
    ),
    [accountId, getString, history, selectedOrg, selectedProject, updateAppStore]
  )

  const accountTabContent = useMemo(
    () => (
      <>
        <Layout.Vertical className={css.group}>
          <Text className={css.groupHeader} font="xsmall">
            {getString('sei.accountSettings.dataSettings.label')}
          </Text>
          <SidebarLink
            label={getString('sei.accountSettings.dataSettings.integrations')}
            to={routes.toSEIConnectors({ ...params })}
          />
          <SidebarLink
            label={getString('sei.accountSettings.dataSettings.contributors')}
            to={routes.toSEIContributors({ ...params })}
          />
        </Layout.Vertical>
        <Layout.Vertical className={css.group}>
          <Text className={css.groupHeader} font="xsmall">
            {getString('sei.accountSettings.profile.label')}
          </Text>
          <SidebarLink
            label={getString('sei.accountSettings.profile.workflow')}
            to={routes.toSEIWorkflow({ ...params })}
          />
          <SidebarLink
            label={getString('sei.accountSettings.profile.investment')}
            to={routes.toSEIInvestment({ ...params })}
          />
          <SidebarLink
            label={getString('sei.accountSettings.profile.trellis')}
            to={routes.toSEITrellis({ ...params })}
          />
        </Layout.Vertical>
        <Layout.Vertical className={css.group}>
          <Text className={css.groupHeader} font="xsmall">
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
      </>
    ),
    [getString, params]
  )

  return (
    <Layout.Vertical spacing="small" className={css.seiSideNav}>
      <Tabs
        id={'seiNavigationTabs'}
        defaultSelectedTabId={'project'}
        tabList={[
          {
            id: 'project',
            title: getString('projectLabel'),
            panel: projectTabContent
          },
          { id: 'account', title: getString('account'), panel: accountTabContent }
        ]}
      />
    </Layout.Vertical>
  )
}
