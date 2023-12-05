/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { defaultTo } from 'lodash-es'
import { useLocation } from 'react-router-dom'
import { Scope } from 'framework/types/types'
import { SideNav } from '@common/navigation/SideNavV2/SideNavV2'
import routes from '@common/RouteDefinitionsV2'
import { useStrings } from 'framework/strings'
import { NAV_MODE, getRouteParams } from '@common/utils/routeUtils'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { ProjectPathProps } from '@common/interfaces/RouteInterfaces'

const AdminSideNav: React.FC = (): React.ReactElement => {
  const { getString } = useStrings()
  const { selectedProject } = useAppStore()
  const { accountId, orgIdentifier, projectIdentifier } = getRouteParams<ProjectPathProps>()
  const locationProps = useLocation<{ prevPageUrl: string }>()
  const [prevPageUrl, setPrevPageUrl] = useState<string | undefined>()

  useEffect(() => {
    if (projectIdentifier && orgIdentifier) {
      if (locationProps?.state?.prevPageUrl) {
        setPrevPageUrl(locationProps?.state?.prevPageUrl)
      }
    } else {
      setPrevPageUrl(undefined)
    }
  }, [locationProps])

  return (
    <SideNav.Main disableScopeSelector>
      <SideNav.Scope scope={Scope.ACCOUNT}>
        <SideNav.Section>
          <SideNav.Link to={routes.toOverview()} label={getString('common.accountOverview')} icon="nav-home" />
        </SideNav.Section>
      </SideNav.Scope>

      <SideNav.Scope scope={Scope.PROJECT}>
        <SideNav.Section>
          <SideNav.Link
            to={prevPageUrl || routes.toProjects()}
            label={getString('back')}
            icon="arrow-left"
            iconProps={{ size: 14, padding: { right: 'xsmall' }, style: { alignSelf: 'center' } }}
            disableHighlightOnActive={true}
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
        </SideNav.Section>
      </SideNav.Scope>
      <SideNav.Scope scope={Scope.ORGANIZATION}>
        <SideNav.Section>
          <SideNav.Link
            to={prevPageUrl || routes.toOrgs()}
            label={getString('common.backToOrgs')}
            icon="arrow-left"
            iconProps={{ size: 14, padding: { right: 'xsmall' }, style: { alignSelf: 'center' } }}
            disableHighlightOnActive={true}
          />
        </SideNav.Section>
      </SideNav.Scope>
      <SideNav.CommonScopeLinks mode={NAV_MODE.ADMIN} projectsLinkLabel={getString('common.projectsInOrgLabel')} />
    </SideNav.Main>
  )
}

export default AdminSideNav
