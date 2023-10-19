/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { Color } from '@harness/design-system'
import { ScopeSwitchProps, SideNav } from '@common/navigation/SideNavV2/SideNavV2'
import { Scope } from 'framework/types/types'
import { AccountPathProps, OrgPathProps, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitionsV2'
import { useGetSelectedScope } from '@common/navigation/SideNavV2/SideNavV2.utils'
import { NAV_MODE } from '@common/utils/routeUtils'
import { useStrings } from 'framework/strings'
import { module } from '../constants'

const SEISideNavLinks = (mode: NAV_MODE): React.ReactElement => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { params } = useGetSelectedScope()
  const { projectIdentifier, orgIdentifier } = params || {}
  const { scope: selectedScope } = useGetSelectedScope()
  const history = useHistory()

  const projectLevelRedirectionProps: Partial<Record<Scope, ScopeSwitchProps>> = {
    [Scope.ACCOUNT]: {
      link: {
        icon: 'ccm-cloud-integration-settings',
        label: 'Go to Integrations',
        info: '',
        onClick: () => {
          history.push(routes.toSEIIntegrations({ accountId, module }))
        }
      }
    }
  }

  const accountLevelRedirectionProps: Partial<Record<Scope, ScopeSwitchProps>> = {
    [Scope.PROJECT]: {
      link: {
        icon: 'graph-increase',
        label: 'Go to Insights',
        info: '',
        onClick: (targetScopeParams?: ProjectPathProps | OrgPathProps) => {
          const { projectIdentifier: targetProject, orgIdentifier: targetOrg } = targetScopeParams as ProjectPathProps
          history.push(
            routes.toSEIInsights({
              accountId,
              projectIdentifier: targetProject,
              orgIdentifier: targetOrg,
              module
            })
          )
        }
      }
    }
  }

  return (
    <SideNav.Main>
      <SideNav.Section>
        <SideNav.Scope scope={[Scope.PROJECT]} scopeSwitchProps={projectLevelRedirectionProps}>
          <SideNav.Link
            label={'Get Started'}
            to={routes.toSEIGetStarted({ accountId, projectIdentifier, orgIdentifier, module })}
            icon="play"
          />
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
        {selectedScope === Scope.ACCOUNT ? <SideNav.Title label="sei.accountSettings.dataSettings.label" /> : null}
        <SideNav.Scope scope={[Scope.ACCOUNT]} scopeSwitchProps={accountLevelRedirectionProps}>
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
        </SideNav.Scope>
        {selectedScope === Scope.ACCOUNT ? <SideNav.Title label="sei.accountSettings.profile.label" /> : null}
        <SideNav.Scope scope={[Scope.ACCOUNT]} scopeSwitchProps={accountLevelRedirectionProps}>
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
            label={getString('sei.accountSettings.profile.trellisFactors')}
            to={routes.toSEITrellisScoreProfile({ accountId, module })}
            icon="clusterEffieiencyScore"
          />
        </SideNav.Scope>
        {selectedScope === Scope.ACCOUNT ? <SideNav.Title label="sei.accountSettings.advancedFeature.label" /> : null}
        <SideNav.Scope scope={[Scope.ACCOUNT]} scopeSwitchProps={accountLevelRedirectionProps}>
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
        </SideNav.Scope>
        {selectedScope === Scope.ACCOUNT ? <SideNav.Title label="sei.accountSettings.seiSettings.label" /> : null}
        <SideNav.Scope scope={[Scope.ACCOUNT]} scopeSwitchProps={accountLevelRedirectionProps}>
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
      <SideNav.SettingsLink mode={mode} module={module} />
    </SideNav.Main>
  )
}

export default SEISideNavLinks
