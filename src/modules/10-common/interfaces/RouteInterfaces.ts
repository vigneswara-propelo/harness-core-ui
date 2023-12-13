/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type {
  ArtifactTriggerConfig,
  EntityGitDetails,
  ManifestTriggerConfig,
  NGTriggerSourceV2,
  TriggerCatalogItem,
  WebhookTriggerConfigV2
} from 'services/pipeline-ng'
import type { Module as ModuleName } from 'framework/types/ModuleName'
import type { StoreMetadata } from '@common/constants/GitSyncTypes'
import { CommonPaginationQueryParams } from '@common/hooks/useDefaultPaginationProps'

export interface AccountPathProps {
  accountId: string
}

export interface OrgPathProps extends AccountPathProps {
  orgIdentifier: string
}

export interface DashboardFolderPathProps extends AccountPathProps {
  folderId: string
}

export interface DashboardEmbedPathProps extends DashboardFolderPathProps {
  viewId: string
}

export interface GitQueryParams {
  branch?: EntityGitDetails['branch']
  repoIdentifier?: EntityGitDetails['repoIdentifier']
  repoName?: StoreMetadata['repoName']
  connectorRef?: StoreMetadata['connectorRef']
  storeType?: StoreMetadata['storeType']
}

export interface InfrastructureGitQueryParams {
  infraStoreType?: StoreMetadata['storeType']
  infraConnectorRef?: StoreMetadata['connectorRef']
  infraRepoName?: EntityGitDetails['repoName']
  infraBranch?: EntityGitDetails['branch']
}

export interface InputSetGitQueryParams extends GitQueryParams {
  inputSetBranch?: EntityGitDetails['branch']
  inputSetRepoIdentifier?: EntityGitDetails['repoIdentifier']
  inputSetRepoName?: EntityGitDetails['repoName']
  inputSetConnectorRef?: StoreMetadata['connectorRef']
}
export interface PipelineStudioQueryParams extends GitQueryParams, RunPipelineQueryParams {
  stageId?: string
  stepId?: string
  sectionId?: string
}
export interface RunPipelineQueryParams extends GitQueryParams, InputSetGitQueryParams {
  runPipeline?: boolean
  executionId?: string
  inputSetType?: string
  inputSetLabel?: string
  inputSetValue?: string
  stagesExecuted?: string[]
}

export interface ProjectPathProps extends OrgPathProps {
  projectIdentifier: string
  stageId?: string
  stepId?: string
}

export interface PipelinePathProps extends ProjectPathProps {
  pipelineIdentifier: string
}

export interface PipelineLogsPathProps extends ExecutionPathProps {
  stageIdentifier: string
  stepIndentifier: string
}

export interface GitOpsAppPathProps extends ProjectPathProps {
  applicationId: string
}

export interface DiscoveryPathProps {
  dAgentId: string
}

export interface NetworkMapPathProps extends DiscoveryPathProps {
  networkMapId: string
}

export interface GitOpsAppQueryParams {
  agentId?: string // this is query param
}

export type TemplateType =
  | 'Step'
  | 'Stage'
  | 'Pipeline'
  | 'CustomDeployment'
  | 'ArtifactSource'
  | 'Service'
  | 'Infrastructure'
  | 'StepGroup'
  | 'Execution'
  | 'MonitoredService'
  | 'SecretManager'
  | ':templateType(Step)'
  | ':templateType(Stage)'
  | ':templateType(Pipeline)'
  | ':templateType(CustomDeployment)'
  | ':templateType(Service)'
  | ':templateType(Infrastructure)'
  | ':templateType(StepGroup)'
  | ':templateType(Execution)'
  | ':templateType(MonitoredService)'
  | ':templateType(SecretManager)'
  | ':templateType(ArtifactSource)'
  | ':templateType'

export interface TemplateStudioPathProps extends ProjectPathProps {
  templateType: TemplateType
  templateIdentifier: string
}
export interface InputSetPathProps extends PipelinePathProps {
  inputSetIdentifier: string
}
export interface TriggerPathProps extends PipelinePathProps, TriggerQueryParams {}

export interface TriggerQueryParams {
  triggerIdentifier: string
  triggerType?: Exclude<NGTriggerSourceV2['type'], 'MultiRegionArtifact'>
  sourceRepo?: Exclude<WebhookTriggerConfigV2['type'], 'AwsCodeCommit'>
  artifactType?: ArtifactTriggerConfig['type']
  manifestType?: ManifestTriggerConfig['type']
  scheduleType?: Extract<TriggerCatalogItem['triggerCatalogType'][number], 'Cron'>
}

export interface ExecutionPathProps extends PipelinePathProps {
  executionIdentifier: string
  source: 'deployments' | 'executions' | 'builds' | ':source(deployments|executions|builds)'
  stage?: string
  step?: string
  stageExecId?: string
}
export interface ExecutionQueryParams {
  stage?: string
  childStage?: string
}

export interface BuildPathProps extends ProjectPathProps {
  buildIdentifier: string
}

export interface ConnectorPathProps {
  connectorId: string
}

export interface VerificationPathProps {
  verificationId: string
}
export interface SecretsPathProps {
  secretId: string
}

export interface VariablesPathProps {
  variableId: string
}
export interface RolePathProps {
  roleIdentifier: string
}
export interface ResourceGroupPathProps {
  resourceGroupIdentifier: string
}
export interface DelegatePathProps {
  delegateIdentifier: string
}

export interface DelegateConfigProps {
  delegateConfigIdentifier: string
}

export interface FeatureFlagPathProps {
  featureFlagIdentifier: string
}

export interface SegmentPathProps {
  segmentIdentifier: string
}
export interface TargetPathProps {
  targetIdentifier: string
}

export interface EnvironmentPathProps {
  environmentIdentifier: string
}
export interface WebhooksPathProps {
  webhookIdentifier: string
}

export interface EnvironmentQueryParams extends InfrastructureGitQueryParams {
  sectionId?: 'CONFIGURATION' | 'INFRASTRUCTURE' | 'SERVICE_OVERRIDES' | 'GITOPS' | 'SUMMARY' | 'REFERENCED_BY'
  infrastructureId?: string
  infraDetailsTab?: 'CONFIGURATION' | 'REFERENCEDBY'
}

export interface EnvironmentGroupPathProps {
  environmentGroupIdentifier: string
}

export interface EnvironmentGroupQueryParams {
  sectionId?: 'CONFIGURATION' | 'ENVIRONMENTS'
}

export interface ServiceOverridesQueryParams {
  serviceOverrideType?:
    | 'ENV_GLOBAL_OVERRIDE'
    | 'ENV_SERVICE_OVERRIDE'
    | 'INFRA_GLOBAL_OVERRIDE'
    | 'INFRA_SERVICE_OVERRIDE'
  page?: number
  filters?: {
    serviceIdentifiers?: string[]
    environmentIdentifiers?: string[]
  }
}

export interface CVDataSourceTypePathProps {
  dataSourceType: string
}

export interface ServicePathProps {
  serviceId: string
}

export interface ModePathProps {
  mode: string
}

export type ModuleNameMatch =
  | ':module'
  | ':module(ci)'
  | ':module(cd)'
  | ':module(cf)'
  | ':module(cv)'
  | ':module(ce)'
  | ':module(sto)'
  | ':module(chaos)'
  | ':module(iacm)'
  | ':module(ssca)'
  | ':module(idp)'
  | ':module(idp-admin)'
  | ':module(dashboards)'
  | ':module(cet)'
  | ':module(sei)'

export type Module = ModuleName | ModuleNameMatch

export interface ModulePathParams {
  module: Module
}

export type ModuleHomeParams = {
  module: Module
  source?: string
}

export type PipelineType<T> = T & Partial<ModulePathParams>

export type PathFn<T> = (props: AccountPathProps & T) => string

export interface ResourceGroupDetailsPathProps extends ProjectPathProps {
  resourceGroupIdentifier: string
}

export interface UserGroupPathProps {
  userGroupIdentifier: string
}

export interface UserPathProps {
  userIdentifier: string
}

export interface ServiceAccountPathProps {
  serviceAccountIdentifier: string
}

export interface SubscriptionQueryParams {
  moduleCard?: Module
  tab?: 'OVERVIEW' | 'PLANS' | 'BILLING'
}

export interface TemplateStudioQueryParams extends GitQueryParams {
  versionLabel?: string
}

export type RequiredField<T, K extends keyof T> = T & Required<Pick<T, K>>

export interface GovernancePathProps
  extends RequiredField<
    Partial<Pick<ProjectPathProps, 'accountId' | 'orgIdentifier' | 'projectIdentifier'> & ModulePathParams>,
    'accountId'
  > {
  policyIdentifier?: string
  policySetIdentifier?: string
  evaluationId?: string
}

export interface GitOpsPathProps {
  entity: string
  orgIdentifier?: string
}

export interface IACMPathProps {
  workspaceIdentifier: string
}

/**
 * At Account level we have two places for nav links
 * At home dashboard level or account resources(settings) level
 */
export type AccountRoutePlacement = 'settings' | 'dashboard'

// Discovery Route interfaces
export interface NetworkMapQueryParams extends CommonPaginationQueryParams {
  unsavedChanges?: string
  tab?: string
  relatedServicesOf: string
}

export interface DiscoveredResourceQueryParams {
  tab?: string
}

export interface FileStoreResourceQueryParams {
  path?: string
}
