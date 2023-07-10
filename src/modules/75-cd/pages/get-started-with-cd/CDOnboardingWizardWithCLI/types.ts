import type { IconName } from '@harness/icons'
import type { DelegateCommonProblemTypes } from '@delegates/constants'
import type { StringsMap } from 'stringTypes'
export interface EntityType {
  id: string
  label: string
  icon?: IconName
}
export interface DeploymentStrategyTypes extends EntityType {
  subtitle?: string
  steps?: { title: string; description: string }[]
  pipelineCommand: keyof StringsMap
}
export interface EntityMap {
  [key: string]: EntityType
}
export interface DeploymentFlowType extends EntityType {
  subtitle: string
}

export enum CDOnboardingSteps {
  WHAT_TO_DEPLOY = 'whatToDeploy',
  HOW_N_WHERE_TO_DEPLOY = 'howNwhere',
  DEPLOYMENT_STEPS = 'deploymentSteps',
  REVIEW_AND_RUN_PIPELINE = 'reviewAndRunPipeline'
}
export interface WhatToDeployType {
  svcType?: EntityType
  artifactType?: EntityType
}
export type DelegateStatus = 'PENDING' | 'TRYING' | 'SUCCESS' | 'FAILED'
export interface WhereAndHowToDeployType {
  type?: DeploymentFlowType
  delegateName?: string
  delegateType?: DelegateCommonProblemTypes
  delegateProblemType?: string
  isDelegateVerified?: boolean
  installDelegateTried?: boolean
  delegateStatus: DelegateStatus
}

export interface PipelineSetupState {
  apiKey: string
  githubUsername: string
  githubPat: string
  strategy?: DeploymentStrategyTypes
  pipelineVerified?: boolean
}

export interface ApiKeySetupProps {
  onKeyGenerate: (data: PipelineSetupState) => void
}
