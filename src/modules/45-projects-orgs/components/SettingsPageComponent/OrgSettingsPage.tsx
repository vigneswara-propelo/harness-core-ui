/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Page } from '@common/exports'
import { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { String, useStrings } from 'framework/strings'
import { useGetSettingValue } from 'services/cd-ng'
import routesV2 from '@common/RouteDefinitionsV2'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { SettingType } from '@common/constants/Utils'
import { useAnyEnterpriseLicense } from '@common/hooks/useModuleLicenses'
import { isEnterprisePlan, useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { ModuleName } from 'framework/types/ModuleName'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import {
  SettingsPage,
  SettingsResourceCard,
  SettingsResources,
  SettingsResourcesCategory,
  isActiveLicense
} from '@common/pages/SettingsPages/SettingsPage'
import styles from '@modules/27-platform/notifications/Notifications.module.scss'

export const OrgSettingsPage: React.FC = () => {
  const { accountId, projectIdentifier, orgIdentifier, module } = useParams<ProjectPathProps & ModulePathParams>()
  const { getString } = useStrings()
  const { CDS_SERVICE_OVERRIDES_2_0, STO_JIRA_INTEGRATION, PL_CENTRAL_NOTIFICATIONS } = useFeatureFlags()
  const showGovCard = useAnyEnterpriseLicense()
  const { licenseInformation, CD_LICENSE_STATE, CI_LICENSE_STATE, STO_LICENSE_STATE } = useLicenseStore()
  const isEnterpriseEdition = isEnterprisePlan(licenseInformation, ModuleName.CD)
  const showDeploymentFreeze = isEnterpriseEdition

  //active licenses
  const haveCD = isActiveLicense(CD_LICENSE_STATE)
  const haveCI = isActiveLicense(CI_LICENSE_STATE)
  const haveSTO = isActiveLicense(STO_LICENSE_STATE)

  const haveCIorCDorSTO = haveCI || haveCD || haveSTO

  //Service overrides
  const { data: enableServiceOverrideSettings } = useGetSettingValue({
    identifier: SettingType.ENABLE_SERVICE_OVERRIDE_V2,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier
    },
    lazy: false
  })
  const isServiceOverridesEnabled = CDS_SERVICE_OVERRIDES_2_0 && enableServiceOverrideSettings?.data?.value === 'true'

  //Gitops
  const showGitOpsCard = (accountId || orgIdentifier) && !projectIdentifier

  return (
    <>
      <Page.Header title={getString('common.settingsPage.title.orgSettingsTitle')} breadcrumbs={<NGBreadcrumbs />} />
      <Page.Body>
        <SettingsPage.container>
          <SettingsPage.group
            id={SettingsResourcesCategory.General}
            title={getString('common.settingCategory.general')}
            description={getString('common.settingsPage.description.general')}
          >
            <SettingsResourceCard
              label={<String stringID="common.defaultSettings" />}
              id={SettingsResources.DefaultSettings}
              icon={'nav-settings'}
              route={routesV2.toDefaultSettings({ accountId, orgIdentifier, module })}
            />
            <SettingsResourceCard
              id={SettingsResources.NotificationsManagement}
              label={
                <String
                  className={styles.notificationsManagement}
                  stringID="common.notificationsManagement.label"
                  useRichText
                />
              }
              icon={'notification'}
              labelAlignment={'center'}
              route={routesV2.toNotificationsManagement({ accountId, orgIdentifier, module })}
              hidden={!PL_CENTRAL_NOTIFICATIONS}
            />
          </SettingsPage.group>
          <SettingsPage.group
            id={SettingsResourcesCategory.OrgResource}
            title={getString('common.settingsPage.title.orgLevelResources')}
            description={getString('common.settingsPage.description.orgLevelResources')}
          >
            <SettingsResourceCard
              label={<String stringID="services" />}
              id={SettingsResources.Services}
              icon={'services'}
              route={routesV2.toSettingsServices({ accountId, orgIdentifier, module })}
              hidden={!haveCD}
            />
            <SettingsResourceCard
              label={<String stringID="environments" />}
              id={SettingsResources.Environments}
              icon={'infrastructure'}
              route={routesV2.toSettingsEnvironments({ accountId, orgIdentifier, module })}
              hidden={!haveCD}
            />
            <SettingsResourceCard
              label={<String stringID="connectorsLabel" />}
              id={SettingsResources.Connectors}
              icon={'connectors-blue'}
              route={routesV2.toConnectors({ accountId, orgIdentifier, module })}
            />
            <SettingsResourceCard
              label={<String stringID="delegate.delegates" />}
              id={SettingsResources.Delegates}
              icon={'delegates-blue'}
              route={routesV2.toDelegatesSettings({ accountId, orgIdentifier, module })}
            />
            <SettingsResourceCard
              label={<String stringID="common.secrets" />}
              id={SettingsResources.Secrets}
              icon={'secrets-blue'}
              route={routesV2.toSecretsSettings({ accountId, orgIdentifier, module })}
            />
            <SettingsResourceCard
              label={<String stringID="resourcePage.fileStore" />}
              id={SettingsResources.FileStores}
              icon={'filestore'}
              route={routesV2.toFileStore({ accountId, orgIdentifier, module })}
            />
            <SettingsResourceCard
              label={<String stringID="common.templates" />}
              id={SettingsResources.Templates}
              icon={'templates-blue'}
              route={routesV2.toTemplates({ accountId, orgIdentifier, module })}
              hidden={!haveCIorCDorSTO}
            />
            <SettingsResourceCard
              label={<String stringID="common.variables" />}
              id={SettingsResources.Variables}
              icon={'variables-blue'}
              route={routesV2.toVariables({ accountId, orgIdentifier, module })}
            />
            <SettingsResourceCard
              label={<String stringID="common.overrides" />}
              id={SettingsResources.ServiceOverride}
              icon={'layers-outline'}
              route={routesV2.toSettingsServiceOverrides({ accountId, orgIdentifier, module })}
              hidden={!(isServiceOverridesEnabled && haveCD)}
            />
          </SettingsPage.group>
          <SettingsPage.group
            id={SettingsResourcesCategory.GitOps}
            title="GitOps"
            hidden={Boolean(!showGitOpsCard) && !haveCD}
            isChildGroup={true}
          >
            <SettingsResourceCard
              label={<String stringID="common.gitopsAgents" />}
              id={SettingsResources.Gitops_Agents}
              icon={'gitops-agent'}
              route={routesV2.toGitOpsResources({ accountId, orgIdentifier, module, entity: 'agents' })}
            />
            <SettingsResourceCard
              label={<String stringID="repositories" />}
              id={SettingsResources.Gitops_Repositorys}
              icon={'gitops-repository-blue'}
              route={routesV2.toGitOpsResources({ accountId, orgIdentifier, module, entity: 'repositories' })}
            />
            <SettingsResourceCard
              label={<String stringID="common.clusters" />}
              id={SettingsResources.Gitops_Clusters}
              icon={'gitops-clusters-blue'}
              route={routesV2.toGitOpsResources({ accountId, orgIdentifier, module, entity: 'clusters' })}
            />
            <SettingsResourceCard
              label={<String stringID="common.repositoryCertificates" />}
              id={SettingsResources.Gitops_Repo_Cert}
              icon={'gitops-repo-cert-blue'}
              route={routesV2.toGitOpsResources({ accountId, orgIdentifier, module, entity: 'repoCertificates' })}
            />
            <SettingsResourceCard
              label={<String stringID="common.gnupgKeys" />}
              id={SettingsResources.Gitops_Gnupg_Key}
              icon={'gitops-gnupg-key-blue'}
              route={routesV2.toGitOpsResources({ accountId, orgIdentifier, module, entity: 'gnuPGKeys' })}
            />
          </SettingsPage.group>
          <SettingsPage.group
            id={SettingsResourcesCategory.AccessControl}
            title={getString('accessControl')}
            description={getString('common.settingsPage.description.accessControl')}
          >
            <SettingsResourceCard
              label={<String stringID="users" />}
              id={SettingsResources.AccessControlUsers}
              icon={'user'}
              route={routesV2.toUsers({ accountId, orgIdentifier, module })}
            />
            <SettingsResourceCard
              label={<String stringID="common.userGroups" />}
              id={SettingsResources.AccessControlUserGroups}
              icon={'user-groups'}
              route={routesV2.toUserGroups({ accountId, orgIdentifier, module })}
            />
            <SettingsResourceCard
              label={<String stringID="common.serviceAccounts" />}
              id={SettingsResources.AccessControlServiceAccounts}
              icon={'service-accounts'}
              route={routesV2.toServiceAccounts({ accountId, orgIdentifier, module })}
            />
            <SettingsResourceCard
              label={<String stringID="resourceGroups" />}
              id={SettingsResources.AccessControlResourceGroups}
              icon={'resources'}
              route={routesV2.toResourceGroups({ accountId, orgIdentifier, module })}
            />
            <SettingsResourceCard
              label={<String stringID="roles" />}
              id={SettingsResources.AccessControlRoles}
              icon={'roles'}
              route={routesV2.toRoles({ accountId, orgIdentifier, module })}
            />
          </SettingsPage.group>
          <SettingsPage.group
            id={SettingsResourcesCategory.SecurityGovernance}
            title={getString('common.settingsPage.title.securityGovernance')}
            description={getString('common.settingsPage.description.securityGovernance')}
          >
            <SettingsResourceCard
              label={<String stringID="common.governance" />}
              id={SettingsResources.Governance}
              icon={'governance'}
              route={routesV2.toGovernanceSettings({ accountId, orgIdentifier, module })}
              hidden={!showGovCard}
            />
            <SettingsResourceCard
              label={<String stringID="common.freezeWindows" />}
              id={SettingsResources.FreezeWindow}
              icon={'FreezeWindow'}
              route={routesV2.toFreezeWindows({ accountId, orgIdentifier, module })}
              hidden={!showDeploymentFreeze}
            />
            <SettingsResourceCard
              label={<String stringID="common.auditTrail" />}
              id={SettingsResources.AuditTrails}
              icon={'file'}
              route={routesV2.toAuditTrailSettings({ accountId, orgIdentifier, module })}
            />
          </SettingsPage.group>
          <SettingsPage.group
            id={SettingsResourcesCategory.ExternalTickets}
            title={getString('common.tickets.externalTickets')}
            hidden={!(STO_JIRA_INTEGRATION && haveSTO)}
          >
            <SettingsResourceCard
              label={<String stringID="common.tickets.externalTickets" />}
              id={SettingsResources.ExternalTickets}
              icon={'service-jira'}
              route={routesV2.toTicketSettings({ accountId, orgIdentifier, module })}
            />
          </SettingsPage.group>
        </SettingsPage.container>
      </Page.Body>
    </>
  )
}
