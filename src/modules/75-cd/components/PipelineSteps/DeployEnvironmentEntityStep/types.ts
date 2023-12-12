/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@harness/uicore'
import { StoreMetadata } from '@modules/10-common/constants/GitSyncTypes'
import type {
  ClusterResponse,
  ClusterYaml,
  DeploymentStageConfig,
  EntityGitDetails,
  EnvironmentGroupResponseDTO,
  EnvironmentYamlV2,
  ExecutionElementConfig,
  FilterYaml,
  InfrastructureDefinitionConfig,
  NGEnvironmentInfoConfig,
  ServiceDefinition,
  TemplateLinkConfig
} from 'services/cd-ng'
import { StageElementWrapperConfig } from 'services/pipeline-ng'
import type { ScopeAndIdentifier } from '@common/components/MultiSelectEntityReference/MultiSelectEntityReference'

export interface ClusterRecord extends ScopeAndIdentifier {
  agentIdentifier?: string
}
export interface ClusterItem {
  clusterRef: string
  value: string
  name: string
  agentIdentifier?: string
  identifier?: string
}
interface ClusterYamlV2 extends ClusterYaml {
  agentIdentifier?: string
}
interface EnvironmentYamlV3 extends EnvironmentYamlV2 {
  gitOpsClusters?: ClusterYamlV2[]
}
interface DeploymentStageConfigV2 extends DeploymentStageConfig {
  environment?: EnvironmentYamlV3
}
export interface DeployEnvironmentEntityConfig extends Omit<DeploymentStageConfig, 'execution'> {
  environment?: DeploymentStageConfigV2['environment']
  environments?: DeploymentStageConfig['environments']
  environmentGroup?: DeploymentStageConfig['environmentGroup']
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  gitMetadata?: Record<string, any>
  gitOpsClusters?: string | ClusterOption[] | SelectOption[]
}

export interface ClusterOption {
  identifier?: string
  label?: string
  value?: string | number | symbol
  agentIdentifier?: string
  scope?: string
}

export interface DeployEnvironmentEntityFormState {
  environment?: string
  environments?: SelectOption[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  environmentInputs?: Record<string, any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serviceOverrideInputs?: Record<string, any>
  parallel?: boolean
  infrastructure?: string
  infrastructures?: Record<string, SelectOption[]>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  infrastructureInputs?: Record<string, Record<string, any>>
  cluster?: string
  clusters?: Record<string, ClusterOption[] | string | SelectOption[]>
  environmentGroup?: string
  /** category is required to handle runtime input to fixed changes as well as cleaner identification during validation */
  category?: 'single' | 'multi' | 'group'
  environmentGroupFilters?: FilterYaml[]
  environmentFilters?: Record<string, FilterYaml[]>
  infraClusterFilters?: FilterYaml[]
  provisioner?: ExecutionElementConfig
  propagateFrom?: SelectOption
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  gitMetadata?: Record<string, any>
}

export interface DeployEnvironmentEntityCustomStepProps {
  serviceIdentifiers?: string[]
  stageIdentifier?: string
  deploymentType?: ServiceDefinition['type']
  gitOpsEnabled?: boolean
  customDeploymentRef?: TemplateLinkConfig
}

export interface DeployEnvironmentEntityCustomStepPropsWithStages extends DeployEnvironmentEntityCustomStepProps {
  stages?: StageElementWrapperConfig[] | undefined
}

export interface DeployEnvironmentEntityCustomInputStepProps extends DeployEnvironmentEntityCustomStepProps {
  pathToEnvironments?: string
  envGroupIdentifier?: string
  isMultiEnvironment?: boolean
  deployToAllEnvironments?: boolean
  areFiltersAdded?: boolean
}

// Environments

export interface EnvironmentData {
  environment: NGEnvironmentInfoConfig & { yaml: string }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  environmentInputs?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serviceOverrideInputs?: any
  connectorRef?: string
  entityGitDetails?: EntityGitDetails
  storeType?: 'INLINE' | 'REMOTE'
}

export interface EnvironmentWithInputs {
  environments: SelectOption[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  environmentInputs: Record<string, any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serviceOverrideInputs: Record<string, any>
  parallel?: boolean
}

// Infrastructures

// TODO: Update this type
export interface InfrastructureYaml {
  description?: string
  identifier: string
  name: string
  tags?: {
    [key: string]: string
  }
  deploymentType: InfrastructureDefinitionConfig['deploymentType']
}

export interface InfrastructureData {
  infrastructureDefinition: InfrastructureYaml & { yaml: string }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  infrastructureInputs?: any
  storeType?: StoreMetadata['storeType']
  connectorRef?: StoreMetadata['connectorRef']
  entityGitDetails?: EntityGitDetails
}

export interface InfrastructureWithInputs {
  infrastructures: Record<string, SelectOption[]>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  infrastructureInputs: Record<string, any>
}

export type ClusterData = Required<Pick<ClusterResponse, 'name' | 'clusterRef' | 'agentIdentifier'>>

export interface EnvironmentGroupConfig extends EnvironmentGroupResponseDTO {
  name: string
  identifier: string
}

export interface EnvironmentGroupData {
  envGroup?: EnvironmentGroupConfig
}
