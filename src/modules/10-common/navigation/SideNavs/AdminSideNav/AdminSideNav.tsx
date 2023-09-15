/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'
import { Scope } from 'framework/types/types'
import { SideNav } from '@common/navigation/SideNavV2/SideNavV2'
import routes from '@common/RouteDefinitionsV2'
import { useStrings } from 'framework/strings'
import { NAV_MODE } from '@common/utils/routeUtils'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { ProjectPathProps } from '@common/interfaces/RouteInterfaces'

const AdminSideNav: React.FC = (): React.ReactElement => {
  const { getString } = useStrings()
  const { selectedProject } = useAppStore()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  return (
    <SideNav.Main disableScopeSelector>
      <SideNav.Section>
        <SideNav.Link to={routes.toOverview()} label={getString('common.accountOverview')} icon="nav-home" />
      </SideNav.Section>
      <SideNav.Section>
        <SideNav.Scope scope={Scope.PROJECT}>
          <SideNav.Link
            to={routes.toProjects()}
            label={getString('common.backToProjects')}
            icon="arrow-left"
            iconProps={{ size: 14, padding: { right: 'xsmall' }, style: { alignSelf: 'center' } }}
          />
          <SideNav.Link
            to={routes.toProjectDetails({
              projectIdentifier: defaultTo(selectedProject?.identifier, projectIdentifier),
              orgIdentifier: defaultTo(selectedProject?.orgIdentifier, orgIdentifier),
              accountId
            })}
            label={getString('common.projectOverview')}
            icon="nav-project"
          />
        </SideNav.Scope>
        <SideNav.Scope scope={Scope.ORGANIZATION}>
          <SideNav.Link
            to={routes.toOrgs()}
            label={getString('common.backToOrgs')}
            icon="arrow-left"
            iconProps={{ size: 14, padding: { right: 'xsmall' }, style: { alignSelf: 'center' } }}
          />
        </SideNav.Scope>
        <SideNav.Scope scope={Scope.ACCOUNT}>
          <SideNav.Link to={routes.toOrgs()} label={getString('orgsText')} icon="nav-organization" />
          <SideNav.Link to={routes.toProjects()} label={getString('projectsText')} icon="nav-project" />
          <SideNav.Link
            to={routes.toSettings({ mode: NAV_MODE.ADMIN })}
            label={getString('common.accountSettings')}
            icon={'setting'}
          />
        </SideNav.Scope>
      </SideNav.Section>
      <SideNav.Scope scope={[Scope.PROJECT, Scope.ORGANIZATION]}>
        <SideNav.SettingsLink mode={NAV_MODE.ADMIN} />
      </SideNav.Scope>
    </SideNav.Main>
  )
}

export default AdminSideNav
