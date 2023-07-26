/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@harness/uicore'
import type { IconProps } from '@harness/icons'

import type { StringKeys } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import { StringUtils } from '@common/exports'
import { Connectors } from '@platform/connectors/constants'

export const AuthTypes = {
  CLIENT_KEY_CERT: 'ClientKeyCert',
  USER_PASSWORD: 'UsernamePassword',
  SERVICE_ACCOUNT: 'ServiceAccount',
  OIDC: 'OpenIdConnect',
  ANNONYMOUS: 'Anonymous',
  BEARER_TOKEN: 'Bearer Token(HTTP Header)',
  PERSONAL_ACCESS_TOKEN: 'PersonalAccessToken',
  ADFS: 'AdfsClientCredentialsWithCertificate',
  API_TOKEN: 'ApiToken',
  API_CLIENT_TOKEN: 'ApiClientToken',
  BEARER_TOKEN_RANCHER: 'BearerToken',
  REFRESH_TOKEN: 'RefreshTokenGrantType'
}

export enum GitAuthTypes {
  USER_PASSWORD = 'UsernamePassword',
  USER_TOKEN = 'UsernameToken',
  KERBEROS = 'Kerberos',
  OAUTH = 'OAuth',
  GITHUB_APP = 'GithubApp'
}

export const GitAPIAuthTypes = {
  GITHUB_APP: 'GithubApp',
  TOKEN: 'Token',
  OAUTH: 'OAuth'
}

export const dockerProviderTypes = {
  CLIENT_KEY_CERT: 'ClientKeyCert',
  USER_PASSWORD: 'UsernamePassword',
  SERVICE_ACCOUNT: 'ServiceAccount',
  OIDC: 'OpenIdConnect',
  ANNONYMOUS: 'Anonymous'
}

export const getKubInitialValues = () => {
  return {
    type: 'KUBERNETES_CLUSTER',
    name: 'NAME',
    description: '',
    identifier: '',
    tags: {},
    delegateMode: '',
    credentialType: '',
    credential: {
      masterUrl: '',
      manualCredentialType: '',
      manualCredentials: {
        userName: '',
        encryptedPassword: ''
      }
    }
  }
}

export const getHeadingIdByType = (type: string): StringKeys => {
  switch (type) {
    case Connectors.VAULT:
      return 'platform.connectors.hashicorpVaultDetails'
    case Connectors.LOCAL:
      return 'platform.connectors.secretManagerDetails'
    case Connectors.APP_DYNAMICS:
      return 'platform.connectors.appDynamicsDetails'
    case Connectors.SPLUNK:
      return 'platform.connectors.splunkConnectorDetails'
    case Connectors.ELK:
      return 'platform.connectors.elk.elkConnectorDetails'
    case Connectors.Rancher:
      return 'platform.connectors.rancherConnectorDetails'
    case 'Gcr':
      return 'platform.connectors.gcrConnectorDetails'
    default:
      return 'overview'
  }
}

export const getConnectorTitleIdByType = (type: string): StringKeys => {
  switch (type) {
    case Connectors.KUBERNETES_CLUSTER:
      return 'platform.connectors.title.k8sCluster'
    case Connectors.HttpHelmRepo:
      return 'platform.connectors.title.helmConnector'
    case Connectors.OciHelmRepo:
      return 'platform.connectors.title.ociHelmConnector'
    case Connectors.GIT:
      return 'platform.connectors.title.gitConnector'
    case Connectors.GITHUB:
      return 'platform.connectors.title.githubConnector'
    case Connectors.GITLAB:
      return 'platform.connectors.title.gitlabConnector'
    case Connectors.BITBUCKET:
      return 'platform.connectors.title.bitbucketConnector'
    case Connectors.AZURE_REPO:
      return 'platform.connectors.title.azureRepoConnector'
    case Connectors.VAULT:
      return 'platform.connectors.title.hashicorpVault'
    case Connectors.GCP_KMS:
      return 'platform.connectors.title.gcpKms'
    case Connectors.LOCAL:
      return 'platform.connectors.title.secretManager'
    case Connectors.APP_DYNAMICS:
      return 'platform.connectors.title.appdynamics'
    case Connectors.SPLUNK:
      return 'platform.connectors.title.splunk'
    case Connectors.SignalFX:
      return 'platform.connectors.signalFXLabel'
    case Connectors.DOCKER:
      return 'dockerRegistry'
    case Connectors.JENKINS:
      return 'platform.connectors.jenkins.jenkins'
    case Connectors.Bamboo:
      return 'platform.connectors.bamboo.bamboo'
    case Connectors.CEAWS:
      return 'platform.connectors.title.ceAws'
    case Connectors.AWS:
      return 'platform.connectors.title.aws'
    case Connectors.AWS_CODECOMMIT:
      return 'platform.connectors.title.awsCodeCommit'
    case Connectors.NEXUS:
      return 'platform.connectors.title.nexus'
    case Connectors.Jira:
      return 'platform.connectors.title.jira'
    case Connectors.SERVICE_NOW:
      return 'platform.connectors.title.serviceNow'
    case Connectors.ARTIFACTORY:
      return 'platform.connectors.title.artifactory'
    case Connectors.GCP:
      return 'platform.connectors.title.gcpConnector'
    case Connectors.PDC:
      return 'platform.connectors.title.pdcConnector'
    case 'Gcr':
      return 'platform.connectors.GCR.fullName'
    case Connectors.AWS_KMS:
      return 'platform.connectors.title.awsKms'
    case Connectors.AWS_SECRET_MANAGER:
      return 'platform.connectors.title.awsSecretManager'
    case Connectors.CE_AZURE:
      return 'platform.connectors.title.ceAzureConnector'
    case Connectors.DATADOG:
      return 'platform.connectors.title.datadog'
    case Connectors.SUMOLOGIC:
      return 'platform.connectors.title.sumologic'
    case Connectors.AZURE_KEY_VAULT:
      return 'platform.connectors.title.azureKeyVault'
    case Connectors.ERROR_TRACKING:
      return 'common.purpose.errorTracking.title'
    case Connectors.AZURE:
      return 'platform.connectors.title.azure'
    case Connectors.CUSTOM_SECRET_MANAGER:
      return 'platform.connectors.title.customSecretManager'
    case Connectors.NEW_RELIC:
      return 'platform.connectors.newRelicLabel'
    case Connectors.PROMETHEUS:
      return 'platform.connectors.prometheusLabel'
    case Connectors.DYNATRACE:
      return 'platform.connectors.dynatraceLabel'
    case Connectors.CE_GCP:
      return 'common.gcp'
    case Connectors.PAGER_DUTY:
      return 'common.pagerDuty'
    case Connectors.CUSTOM_HEALTH:
      return 'platform.connectors.customLabel'
    case Connectors.ELK:
      return 'platform.connectors.elk.elkLabel'
    case Connectors.AWSSECRETMANAGER:
      return 'platform.connectors.title.awsSecretManager'
    case Connectors.GcpSecretManager:
      return 'platform.connectors.title.gcpSecretManager'
    case Connectors.SPOT:
      return 'cd.steps.elastigroup.connectorSpot'
    case Connectors.AZURE_ARTIFACTS:
      return 'platform.connectors.title.azureArtifacts'
    case Connectors.TAS:
      return 'platform.connectors.title.tas'
    case Connectors.TERRAFORM_CLOUD:
      return 'platform.connectors.title.terraform'
    case Connectors.Rancher:
      return 'platform.connectors.title.rancherCluster'

    default:
      return 'connector'
  }
}

export const getConnectorIconByType = (type: string): IconName => {
  switch (type) {
    case Connectors.KUBERNETES_CLUSTER:
    case Connectors.CE_KUBERNETES:
      return 'app-kubernetes'
    case Connectors.Rancher:
      return 'rancher-inverse' as IconName
    case Connectors.GIT:
      return 'service-github'
    case Connectors.HttpHelmRepo:
      return 'service-helm'
    case Connectors.OciHelmRepo:
      return 'helm-oci'
    case Connectors.GITHUB:
      return 'github'
    case Connectors.GITLAB:
      return 'service-gotlab'
    case Connectors.BITBUCKET:
      return 'bitbucket-selected'
    case Connectors.VAULT:
      return 'hashiCorpVault'
    case Connectors.GCP_KMS:
      return 'gcp-kms'
    case Connectors.LOCAL:
      return 'lock'
    case Connectors.APP_DYNAMICS:
      return 'service-appdynamics'
    case Connectors.SPLUNK:
    case Connectors.SignalFX:
      return 'service-splunk'
    case Connectors.NEW_RELIC:
      return 'service-newrelic'
    case Connectors.PROMETHEUS:
      return 'service-prometheus'
    case Connectors.DYNATRACE:
      return 'service-dynatrace'
    case Connectors.JENKINS:
      return 'service-jenkins-inverse'
    case Connectors.Bamboo:
      return 'service-bamboo'
    case Connectors.DOCKER:
    case 'Dockerhub':
      return 'service-dockerhub'
    case Connectors.AWS:
      return 'service-aws'
    case Connectors.AWS_CODECOMMIT:
      return 'aws-codecommit'
    case Connectors.NEXUS:
      return 'service-nexus'
    case Connectors.ARTIFACTORY:
      return 'service-artifactory'
    case Connectors.Jira:
      return 'service-jira'
    case Connectors.SERVICE_NOW:
      return 'service-servicenow'
    case Connectors.GCP:
    case Connectors.CE_GCP:
    case 'Gcr':
      return 'service-gcp'
    case Connectors.PDC:
      return 'pdc-inverse'
    case Connectors.AWS_KMS:
      return 'aws-kms'
    case Connectors.CE_AZURE:
    case Connectors.AZURE_REPO:
      return 'service-azure'
    case Connectors.AZURE_ARTIFACTS:
      return 'service-azure-artifacts'
    case Connectors.DATADOG:
      return 'service-datadog'
    case Connectors.AZURE_KEY_VAULT:
      return 'azure-key-vault'
    case Connectors.SUMOLOGIC:
      return 'service-sumologic'
    case Connectors.CEAWS:
      return 'service-aws'
    case Connectors.AWS_SECRET_MANAGER:
      return 'aws-secret-manager'
    case Connectors.PAGER_DUTY:
      return 'service-pagerduty'
    case Connectors.ARGO:
      return 'argo'
    case Connectors.HARNESS_MANAGED_GITOPS:
      return 'harness'
    case Connectors.CUSTOM_HEALTH:
      return 'service-custom-connector'
    case Connectors.ELK:
      return 'service-elk'
    case Connectors.ERROR_TRACKING:
      return 'error-tracking'
    case Connectors.AZURE:
      return 'microsoft-azure'
    case Connectors.CUSTOM_SECRET_MANAGER:
      return 'custom-sm'
    case Connectors.GcpSecretManager:
      return 'gcp-secret-manager'
    case Connectors.SPOT:
      return 'spot'
    case Connectors.TAS:
      return 'tas'
    case Connectors.TERRAFORM_CLOUD:
      return 'terraform-cloud'
    case 'GrafanaLoki':
      return 'service-grafana-loki'
    default:
      return 'placeholder'
  }
}

export enum ConnectorDetailsView {
  'overview' = 'overview',
  'referencedBy' = 'referencedBy',
  'activityHistory' = 'activityHistory'
}

export const getConnectorIconPropsByType = (type: string): Omit<IconProps, 'name'> => {
  switch (type) {
    case Connectors.CUSTOM_HEALTH:
      return { size: 37, background: 'white', margin: { bottom: 'xlarge' } }
    default:
      return { size: 37, margin: { bottom: 'xlarge' } }
  }
}

export const generateDefaultSecretConfig = (name: string, type: string) => {
  return StringUtils.getIdentifierFromName(name || '').concat(type)
}

export const getLabelForAuthType = (type: string) => {
  switch (type) {
    case AuthTypes.USER_PASSWORD:
      return 'Username and Password'
    case AuthTypes.SERVICE_ACCOUNT:
      return 'Service Account Token'
    case AuthTypes.OIDC:
      return 'OIDC Token'
    case AuthTypes.CLIENT_KEY_CERT:
      return 'Client Key Certificate'
    case AuthTypes.BEARER_TOKEN_RANCHER:
    case AuthTypes.BEARER_TOKEN:
      return 'Bearer Token'
    case AuthTypes.API_CLIENT_TOKEN:
      return 'API Client'
    default:
      return ''
  }
}

export enum BackOffStrategy {
  FixedDelayBackoffStrategy = 'FixedDelayBackoffStrategy',
  EqualJitterBackoffStrategy = 'EqualJitterBackoffStrategy',
  FullJitterBackoffStrategy = 'FullJitterBackoffStrategy'
}

export interface IBackoffStrategyTypeLabelMapping {
  [BackOffStrategy.FixedDelayBackoffStrategy]: keyof StringsMap
  [BackOffStrategy.EqualJitterBackoffStrategy]: keyof StringsMap
  [BackOffStrategy.FullJitterBackoffStrategy]: keyof StringsMap
}
export const backoffStrategyTypeLabelMapping: IBackoffStrategyTypeLabelMapping = {
  [BackOffStrategy.FixedDelayBackoffStrategy]: 'platform.connectors.aws.fixedDelay',
  [BackOffStrategy.EqualJitterBackoffStrategy]: 'platform.connectors.aws.equalJitter',
  [BackOffStrategy.FullJitterBackoffStrategy]: 'platform.connectors.aws.fullJitter'
}
