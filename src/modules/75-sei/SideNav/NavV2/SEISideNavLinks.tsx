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
import { usePermission } from '@modules/20-rbac/hooks/usePermission'
import { PermissionIdentifier } from '@modules/20-rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@modules/20-rbac/interfaces/ResourceType'
import { module } from '../../constants'
import { getAccountLevelRedirectionProps, getProjectLevelRedirectionProps } from './SEISideNavLinks.utils'

const SEISideNavLinks = (mode: NAV_MODE): React.ReactElement => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { params } = useGetSelectedScope()
  const { projectIdentifier, orgIdentifier } = params || {}
  const { scope: selectedScope } = useGetSelectedScope()
  const history = useHistory()
  const accountIdentifier = accountId || ''

  const [hasAccountAccess] = usePermission({
    resourceScope: {
      accountIdentifier
    },
    resource: {
      resourceType: ResourceType.SEI_CONFIGURATION_SETTINGS
    },
    permissions: [PermissionIdentifier.VIEW_SEI_CONFIGURATIONSETTINGS]
  })

  const [canViewCollections] = usePermission({
    resourceScope: {
      accountIdentifier,
      projectIdentifier,
      orgIdentifier
    },
    resource: {
      resourceType: ResourceType.SEI_COLLECTIONS
    },
    permissions: [PermissionIdentifier.VIEW_SEI_COLLECTIONS]
  })

  const projectLevelRedirectionProps = getProjectLevelRedirectionProps(history, accountId, getString, hasAccountAccess)
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
          {hasAccountAccess ? (
            <SideNav.Link
              label={getString('sei.projectSettings.integrationMapping')}
              to={routes.toSEIIntegrationMapping({ accountId, projectIdentifier, orgIdentifier, module })}
              icon="ccm-cloud-integration-settings"
            />
          ) : (
            <></>
          )}
          {canViewCollections ? (
            <SideNav.Link
              label={getString('common.purpose.sei.collections')}
              to={routes.toSEICollection({ accountId, projectIdentifier, orgIdentifier, module })}
              icon="cascading"
            />
          ) : (
            <></>
          )}
        </SideNav.Scope>
        {hasAccountAccess ? (
          <>
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
                label={getString('sei.accountSettings.profile.trellis')}
                to={routes.toSEITrellisScoreProfile({ accountId, module })}
                icon="resource-stack"
              />
            </SideNav.Scope>
            {selectedScope === Scope.ACCOUNT ? (
              <SideNav.Title label="sei.accountSettings.advancedFeature.label" />
            ) : null}
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
          </>
        ) : null}
      </SideNav.Section>
      <SideNav.SettingsLink mode={mode} module={module} />
    </SideNav.Main>
  )
}

export default SEISideNavLinks
