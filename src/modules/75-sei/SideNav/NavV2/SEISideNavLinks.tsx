/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { Color } from '@harness/design-system'
import { SideNav } from '@common/navigation/SideNavV2/SideNavV2'
import { Scope } from 'framework/types/types'
import { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitionsV2'
import { useGetSelectedScope } from '@common/navigation/SideNavV2/SideNavV2.utils'
import { NAV_MODE } from '@common/utils/routeUtils'
import { useStrings } from 'framework/strings'
import { module } from '../../constants'
import { getAccountLevelRedirectionProps, getProjectLevelRedirectionProps } from './SEISideNavLinks.utils'

const SEISideNavLinks = (mode: NAV_MODE): React.ReactElement => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { params } = useGetSelectedScope()
  const { projectIdentifier, orgIdentifier } = params || {}
  const history = useHistory()

  const projectLevelRedirectionProps = getProjectLevelRedirectionProps(history, accountId, getString)
  const accountLevelRedirectionProps = getAccountLevelRedirectionProps(history, accountId, getString)

  return (
    <SideNav.Main>
      <SideNav.Section>
        <SideNav.Scope scope={[Scope.PROJECT]} scopeSwitchProps={projectLevelRedirectionProps}>
          <SideNav.Link
            label={getString('sei.insights')}
            to={routes.toSEIInsights({ accountId, projectIdentifier, orgIdentifier, module })}
            icon="graph-increase"
          />
          <SideNav.Link
            label={getString('sei.projectSettings.integrationMapping')}
            to={routes.toSEIIntegrationMapping({ accountId, projectIdentifier, orgIdentifier, module })}
            icon="ccm-cloud-integration-settings"
          />
          <SideNav.Link
            label={getString('common.purpose.sei.collections')}
            to={routes.toSEICollection({ accountId, projectIdentifier, orgIdentifier, module })}
            icon="cascading"
          />
        </SideNav.Scope>
        <SideNav.Scope scope={[Scope.ACCOUNT]} scopeSwitchProps={accountLevelRedirectionProps}>
          <SideNav.Title label="sei.accountSettings.dataSettings.label" />
          <SideNav.Link
            label={getString('sei.accountSettings.dataSettings.integrations')}
            to={routes.toSEIIntegrations({ accountId, module })}
            iconProps={{ color: Color.GREY_500 }}
            icon="ccm-cloud-integration-settings"
          />
          <SideNav.Link
            label={getString('sei.accountSettings.dataSettings.contributors')}
            to={routes.toSEIContributors({ accountId, module })}
            icon="target-management"
          />
          <SideNav.Title label="sei.accountSettings.profile.label" />
          <SideNav.Link
            label={getString('sei.accountSettings.profile.workflow')}
            to={routes.toSEIWorklowProfilePage({ accountId, module })}
            icon="main-workflows"
          />
          <SideNav.Link
            label={getString('sei.accountSettings.profile.investment')}
            to={routes.toSEIEffortInvestment({ accountId, module })}
            icon="layers-outline"
          />
          <SideNav.Link
            label={getString('sei.accountSettings.profile.trellis')}
            to={routes.toSEITrellisScoreProfile({ accountId, module })}
            icon="resource-stack"
          />
          <SideNav.Title label="sei.accountSettings.advancedFeature.label" />
          <SideNav.Link
            label={getString('sei.accountSettings.advancedFeature.tables')}
            to={routes.toSEITables({ accountId, module })}
            icon="panel-table"
          />
          <SideNav.Link
            label={getString('sei.accountSettings.advancedFeature.propels')}
            to={routes.toSEIPropels({ accountId, module })}
            icon="looping"
          />
          <SideNav.Title label="sei.accountSettings.seiSettings.label" />
          <SideNav.Link
            label={getString('sei.accountSettings.seiSettings.customize')}
            to={routes.toSEICustomise({ accountId, module })}
            icon="customize"
          />
          <SideNav.Link
            label={getString('sei.accountSettings.seiSettings.activityLogs')}
            to={routes.toSEIActivityLogs({ accountId, module })}
            icon="audit-trail"
          />
          <SideNav.Link
            label={getString('sei.accountSettings.seiSettings.apiKeys')}
            to={routes.toSEIApiKeys({ accountId, module })}
            icon="gitops-gnupg-key-blue"
          />
        </SideNav.Scope>
      </SideNav.Section>
      <SideNav.CommonScopeLinks mode={mode} module={module} />
    </SideNav.Main>
  )
}

export default SEISideNavLinks
