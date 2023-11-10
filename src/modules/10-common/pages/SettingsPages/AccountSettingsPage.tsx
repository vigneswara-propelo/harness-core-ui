/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import {
  Button,
  ButtonSize,
  Text,
  Layout,
  Icon,
  getErrorInfoFromErrorObject,
  useToaster,
  Container
} from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { Page } from '@common/exports'
import { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { String, useStrings } from 'framework/strings'
import { useGetSettingValue, useGetSmtpConfig } from 'services/cd-ng'
import routesV2 from '@common/RouteDefinitionsV2'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { SettingType } from '@common/constants/Utils'
import { useAnyEnterpriseLicense } from '@common/hooks/useModuleLicenses'
import { isEnterprisePlan, useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { ModuleName } from 'framework/types/ModuleName'
import {
  ResourceTileProps,
  SettingsPage,
  SettingsResourceCard,
  SettingsResources,
  SettingsResourcesCategory,
  isActiveLicense
} from './SettingsPage'
import styles from '@modules/27-platform/notifications/Notifications.module.scss'

export const AccountSettingsPage: React.FC = () => {
  const { accountId, projectIdentifier, orgIdentifier, module } = useParams<ProjectPathProps & ModulePathParams>()
  const { getString } = useStrings()
  const history = useHistory()
  const {
    CDS_SERVICE_OVERRIDES_2_0,
    STO_JIRA_INTEGRATION,
    PIE_GIT_BI_DIRECTIONAL_SYNC,
    NG_LICENSES_ENABLED,
    CCM_CURRENCY_PREFERENCES,
    FFM_9497_PROXY_KEY_MANAGEMENT: proxyKeysEnabled,
    PL_CENTRAL_NOTIFICATIONS
  } = useFeatureFlags()
  const showGovCard = useAnyEnterpriseLicense()
  const { licenseInformation, CD_LICENSE_STATE, CI_LICENSE_STATE, STO_LICENSE_STATE, CV_LICENSE_STATE } =
    useLicenseStore()
  const isEnterpriseEdition = isEnterprisePlan(licenseInformation, ModuleName.CD)
  const showDeploymentFreeze = isEnterpriseEdition
  const { showError } = useToaster()

  //active licenses
  const haveCD = isActiveLicense(CD_LICENSE_STATE)
  const haveCI = isActiveLicense(CI_LICENSE_STATE)
  const haveSTO = isActiveLicense(STO_LICENSE_STATE)
  const haveCV = isActiveLicense(CV_LICENSE_STATE)

  const haveCIorCDorSTO = haveCI || haveCD || haveSTO || haveCV

  //Service overrides
  const { data: enableServiceOverrideSettings, error: enableServiceOverrideSettingsError } = useGetSettingValue({
    identifier: SettingType.ENABLE_SERVICE_OVERRIDE_V2,
    queryParams: {
      accountIdentifier: accountId
    },
    lazy: false
  })

  const isServiceOverridesEnabled = CDS_SERVICE_OVERRIDES_2_0 && enableServiceOverrideSettings?.data?.value === 'true'

  const { data: enableBidirectionalSyncSettings, error: enableBidirectionalSyncSettingsError } = useGetSettingValue({
    identifier: SettingType.ENABLE_BI_DIRECTIONAL_SYNC,
    queryParams: {
      accountIdentifier: accountId
    },
    lazy: !PIE_GIT_BI_DIRECTIONAL_SYNC
  })

  React.useEffect(() => {
    if (enableBidirectionalSyncSettingsError) {
      showError(getErrorInfoFromErrorObject(enableBidirectionalSyncSettingsError))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enableBidirectionalSyncSettingsError])

  const isBidirectionalSyncEnabled = enableBidirectionalSyncSettings?.data?.value === 'true'

  //Gitops
  const showGitOpsCard = accountId && !orgIdentifier && !projectIdentifier

  React.useEffect(() => {
    if (enableServiceOverrideSettingsError) {
      showError(getErrorInfoFromErrorObject(enableServiceOverrideSettingsError))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enableServiceOverrideSettingsError])

  //Smtp
  const { loading, data } = useGetSmtpConfig({ queryParams: { accountId } })

  const smtpResource: ResourceTileProps = {
    label: <String stringID="common.smtp.conifg" />,
    id: SettingsResources.Smtp,
    icon: 'smtp-configuration-blue',
    disabled: loading,
    onClick: () => {
      if (!loading) {
        history.push(routesV2.toAccountSMTP({ accountId, module }))
      }
    },
    subLabel: (
      <>
        {loading ? (
          <Icon name="spinner" size={14} />
        ) : (
          <>
            {!data?.data ? (
              <Button intent="primary" icon={'small-plus'} size={ButtonSize.SMALL} text={getString('common.setup')} />
            ) : (
              <Layout.Horizontal flex={{ alignItems: 'center' }} margin={'xsmall'} spacing="xsmall">
                <Icon name="tick-circle" size={14} color={Color.GREEN_500} />

                <Text font={{ variation: FontVariation.FORM_HELP }}>{getString('common.smtp.configured')}</Text>
              </Layout.Horizontal>
            )}
          </>
        )}
      </>
    )
  }

  return (
    <>
      <Page.Header title={getString('common.accountSettings')} breadcrumbs={<NGBreadcrumbs />} />
      <Page.Body>
        <SettingsPage.container
          moduleSpecificSettings={
            module === 'ce' ? (
              <Container padding={'large'} background={Color.PRIMARY_1} width={'100%'}>
                <Text font={{ variation: FontVariation.H4 }} color={Color.BLACK} margin={{ bottom: 'medium' }}>
                  {getString('common.ccmSettings.highlightSettingsSectionTitle')}
                </Text>
                <Layout.Horizontal spacing={'large'}>
                  <SettingsResourceCard
                    label={<String stringID="common.ccmSettings.cloudCostIntegration" useRichText />}
                    id={SettingsResources.CloudCostIntegration}
                    icon={'ccm-cloud-integration-settings'}
                    route={routesV2.toCECloudIntegration({ accountId, module })}
                    subLabel={
                      <Text font={{ variation: FontVariation.TINY }} color={Color.GREY_300}>
                        {`(${getString('generalSettings')})`}
                      </Text>
                    }
                    horizontalAlignment
                  />
                  <SettingsResourceCard
                    label={<String stringID="common.defaultSettings" />}
                    id={SettingsResources.DefaultSettings}
                    icon={'nav-settings'}
                    route={routesV2.toDefaultSettings({ accountId, module })}
                    subLabel={
                      <Text font={{ variation: FontVariation.TINY }} color={Color.GREY_300}>
                        {`(${getString('generalSettings')})`}
                      </Text>
                    }
                    horizontalAlignment
                  />
                  {CCM_CURRENCY_PREFERENCES && (
                    <SettingsResourceCard
                      label={<String stringID="common.ccmSettings.cloudCostCurrency" useRichText />}
                      id={SettingsResources.CloudCostIntegration}
                      icon={'ccm-currency-settings'}
                      route={routesV2.toCECurrencyPreferences({ accountId, module })}
                      subLabel={
                        <Text font={{ variation: FontVariation.TINY }} color={Color.GREY_300}>
                          {`(${getString('generalSettings')})`}
                        </Text>
                      }
                      horizontalAlignment
                    />
                  )}
                </Layout.Horizontal>
              </Container>
            ) : undefined
          }
        >
          <SettingsPage.group
            id={SettingsResourcesCategory.General}
            title={getString('common.settingCategory.general')}
            description={getString('common.settingsPage.description.general')}
          >
            <SettingsResourceCard
              label={<String stringID="common.accountDetails" />}
              id={SettingsResources.AccountOverview}
              icon={'file'}
              route={routesV2.toAccountSettingsOverview({ accountId, module })}
            />
            <SettingsResourceCard
              label={<String stringID="common.defaultSettings" />}
              id={SettingsResources.DefaultSettings}
              icon={'nav-settings'}
              route={routesV2.toDefaultSettings({ accountId, module })}
            />
            <SettingsResourceCard
              label={<String stringID="common.ccmSettings.cloudCostIntegration" useRichText />}
              id={SettingsResources.CloudCostIntegration}
              icon={'ccm-cloud-integration-settings'}
              route={routesV2.toCECloudIntegration({ accountId, module })}
              labelAlignment="center"
            />
            <SettingsResourceCard
              label={<String stringID="common.ccmSettings.cloudCostCurrency" useRichText />}
              id={SettingsResources.CloudCostIntegration}
              icon={'ccm-currency-settings'}
              route={routesV2.toCECurrencyPreferences({ accountId, module })}
              labelAlignment="center"
              hidden={!CCM_CURRENCY_PREFERENCES}
            />
            <SettingsResourceCard {...smtpResource} />
            <SettingsResourceCard
              id={SettingsResources.NotificationsManagement}
              label={
                <String
                  className={styles.notificationsManagement}
                  stringID="common.notificationsManagement.label"
                  useRichText
                />
              }
              icon={'ccm-currency-settings'}
              labelAlignment={'center'}
              route={routesV2.toNotificationsManagement({ accountId, module })}
              hidden={!PL_CENTRAL_NOTIFICATIONS}
            />
          </SettingsPage.group>
          <SettingsPage.group
            id={SettingsResourcesCategory.AccountResource}
            title={getString('common.settingsPage.title.accountLevelResources')}
            description={getString('common.settingsPage.description.accountLevelResources')}
          >
            <SettingsResourceCard
              label={<String stringID="services" />}
              id={SettingsResources.Services}
              icon={'services'}
              route={routesV2.toSettingsServices({ accountId, module })}
              hidden={!haveCD}
            />
            <SettingsResourceCard
              label={<String stringID="environments" />}
              id={SettingsResources.Environments}
              icon={'infrastructure'}
              route={routesV2.toSettingsEnvironments({ accountId, module })}
              hidden={!haveCD}
            />
            <SettingsResourceCard
              label={<String stringID="connectorsLabel" />}
              id={SettingsResources.Connectors}
              icon={'connectors-blue'}
              route={routesV2.toConnectors({ accountId, module })}
            />
            <SettingsResourceCard
              label={<String stringID="delegate.delegates" />}
              id={SettingsResources.Delegates}
              icon={'delegates-blue'}
              route={routesV2.toDelegatesSettings({ accountId, module })}
            />
            <SettingsResourceCard
              label={<String stringID="common.secrets" />}
              id={SettingsResources.Secrets}
              icon={'secrets-blue'}
              route={routesV2.toSecretsSettings({ accountId, module })}
            />
            <SettingsResourceCard
              label={<String stringID="resourcePage.fileStore" />}
              id={SettingsResources.FileStores}
              icon={'filestore'}
              route={routesV2.toFileStore({ accountId, module })}
            />
            <SettingsResourceCard
              label={<String stringID="common.templates" />}
              id={SettingsResources.Templates}
              icon={'templates-blue'}
              route={routesV2.toTemplates({ accountId, module })}
              hidden={!haveCIorCDorSTO}
            />
            <SettingsResourceCard
              label={<String stringID="common.webhooks" />}
              id={SettingsResources.Webhooks}
              icon={'code-webhook'}
              hidden={!isBidirectionalSyncEnabled}
              route={routesV2.toWebhooks({ accountId, module })}
            />
            <SettingsResourceCard
              label={<String stringID="common.variables" />}
              id={SettingsResources.Variables}
              icon={'variables-blue'}
              route={routesV2.toVariables({ accountId, module })}
            />
            <SettingsResourceCard
              label={<String stringID="common.ffProxy" />}
              id={SettingsResources.FFProxyKeys}
              icon={'gitops-gnupg-key-blue'}
              hidden={!proxyKeysEnabled}
              route={routesV2.toFeatureFlagsProxySettings({ accountId })}
            />
            <SettingsResourceCard
              label={<String stringID="common.overrides" />}
              id={SettingsResources.ServiceOverride}
              icon={'layers-outline'}
              route={routesV2.toSettingsServiceOverrides({ accountId, module })}
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
              route={routesV2.toGitOpsResources({ accountId, module, entity: 'agents' })}
            />
            <SettingsResourceCard
              label={<String stringID="repositories" />}
              id={SettingsResources.Gitops_Repositorys}
              icon={'gitops-repository-blue'}
              route={routesV2.toGitOpsResources({ accountId, module, entity: 'repositories' })}
            />
            <SettingsResourceCard
              label={<String stringID="common.clusters" />}
              id={SettingsResources.Gitops_Clusters}
              icon={'gitops-clusters-blue'}
              route={routesV2.toGitOpsResources({ accountId, module, entity: 'clusters' })}
            />
            <SettingsResourceCard
              label={<String stringID="common.repositoryCertificates" />}
              id={SettingsResources.Gitops_Repo_Cert}
              icon={'gitops-repo-cert-blue'}
              route={routesV2.toGitOpsResources({ accountId, module, entity: 'repoCertificates' })}
            />
            <SettingsResourceCard
              label={<String stringID="common.gnupgKeys" />}
              id={SettingsResources.Gitops_Gnupg_Key}
              icon={'gitops-gnupg-key-blue'}
              route={routesV2.toGitOpsResources({ accountId, module, entity: 'gnuPGKeys' })}
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
              route={routesV2.toUsers({ accountId, module })}
            />
            <SettingsResourceCard
              label={<String stringID="common.userGroups" />}
              id={SettingsResources.AccessControlUserGroups}
              icon={'user-groups'}
              route={routesV2.toUserGroups({ accountId, module })}
            />
            <SettingsResourceCard
              label={<String stringID="common.serviceAccounts" />}
              id={SettingsResources.AccessControlServiceAccounts}
              icon={'service-accounts'}
              route={routesV2.toServiceAccounts({ accountId, module })}
            />
            <SettingsResourceCard
              label={<String stringID="resourceGroups" />}
              id={SettingsResources.AccessControlResourceGroups}
              icon={'resources'}
              route={routesV2.toResourceGroups({ accountId, module })}
            />
            <SettingsResourceCard
              label={<String stringID="roles" />}
              id={SettingsResources.AccessControlRoles}
              icon={'roles'}
              route={routesV2.toRoles({ accountId, module })}
            />
          </SettingsPage.group>
          <SettingsPage.group
            id={SettingsResourcesCategory.SecurityGovernance}
            title={getString('common.settingsPage.title.securityGovernance')}
            description={getString('common.settingsPage.description.securityGovernance')}
          >
            <SettingsResourceCard
              label={<String stringID="authentication" />}
              id={SettingsResources.Authentication}
              icon={'setting'}
              route={routesV2.toAuthenticationSettings({ accountId, module })}
            />
            <SettingsResourceCard
              label={<String stringID="common.governance" />}
              id={SettingsResources.Governance}
              icon={'governance'}
              route={routesV2.toGovernanceSettings({ accountId, module })}
              hidden={!showGovCard}
            />
            <SettingsResourceCard
              label={<String stringID="common.freezeWindows" />}
              id={SettingsResources.FreezeWindow}
              icon={'FreezeWindow'}
              route={routesV2.toFreezeWindows({ accountId, module })}
              hidden={!showDeploymentFreeze}
            />
            <SettingsResourceCard
              label={<String stringID="common.auditTrail" />}
              id={SettingsResources.AuditTrails}
              icon={'file'}
              route={routesV2.toAuditTrailSettings({ accountId, module })}
            />
          </SettingsPage.group>
          <SettingsPage.group
            id={SettingsResourcesCategory.Subscription}
            title={getString('common.subscriptions.title')}
            description={getString('common.settingsPage.description.subscription')}
          >
            <SettingsResourceCard
              label={<String stringID="common.billing" />}
              id={SettingsResources.Billing}
              icon={'file'}
              route={routesV2.toBillingSettings({ accountId, module })}
              hidden={false}
            />
            <SettingsResourceCard
              label={<String stringID="common.subscriptions.title" />}
              id={SettingsResources.Subscription}
              icon={'subscriptions'}
              route={routesV2.toSubscriptions({ accountId, module })}
              hidden={!NG_LICENSES_ENABLED}
            />
            <SettingsResourceCard
              label={<String stringID="common.subscriptions.tabs.plans" />}
              id={SettingsResources.Plans}
              icon={'filestore'}
              route={routesV2.toPlans({ accountId, module })}
              hidden={false}
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
              route={routesV2.toTicketSettings({ accountId, module })}
            />
          </SettingsPage.group>
        </SettingsPage.container>
      </Page.Body>
    </>
  )
}
