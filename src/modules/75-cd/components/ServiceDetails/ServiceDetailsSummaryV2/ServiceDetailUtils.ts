/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo } from 'lodash-es'

import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import type { ArtifactDeploymentDetail, ArtifactInstanceDetail, ChartVersionInstanceDetail } from 'services/cd-ng'

export enum CardSortOption {
  ALL = 'All',
  PROD = 'Production',
  PRE_PROD = 'PreProduction'
}

export interface ServiceDetailsCardViewProps {
  setEnvId: React.Dispatch<React.SetStateAction<string | string[] | undefined>>
  setArtifactName: React.Dispatch<React.SetStateAction<string | undefined>>
  setChartVersionName: React.Dispatch<React.SetStateAction<string | undefined>>
}

export enum CardView {
  ENV = 'ENV',
  ARTIFACT = 'ARTIFACT',
  CHART_VERSIONS = 'CHART_VERSIONS'
}

export interface EnvCardProps {
  id: string
  name?: string
  environmentTypes?: ('PreProduction' | 'Production')[]
  artifactDeploymentDetails?: ArtifactDeploymentDetail[]
  count?: number
  isEnvGroup?: boolean
  isDrift?: boolean
  isRollback?: boolean
  isRevert?: boolean
}

export function createGroups(
  arr: ArtifactInstanceDetail[] | EnvCardProps[] | ChartVersionInstanceDetail[],
  groupSize: number
): (ArtifactInstanceDetail[] | EnvCardProps[] | ChartVersionInstanceDetail[])[] {
  const numGroups = Math.ceil(arr.length / groupSize)
  return new Array(numGroups).fill('').map((_, i) => arr.slice(i * groupSize, (i + 1) * groupSize))
}

export interface EnvCardComponentProps {
  setSelectedEnv: React.Dispatch<
    React.SetStateAction<
      | {
          envId?: string
          isEnvGroup: boolean
        }
      | undefined
    >
  >
  setEnvId: React.Dispatch<React.SetStateAction<string | string[] | undefined>>
  setIsDetailsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
  setEnvFilter: React.Dispatch<
    React.SetStateAction<{
      envId?: string
      isEnvGroup: boolean
    }>
  >
  env?: EnvCardProps
  selectedEnv?: {
    envId?: string
    isEnvGroup: boolean
  }
}

export const getLatestTimeArtifactChartVersion = (
  data: ArtifactDeploymentDetail[] | undefined
): ArtifactDeploymentDetail => {
  return defaultTo(
    data?.reduce(
      (latest, deployment) =>
        deployment.lastDeployedAt !== undefined &&
        latest.lastDeployedAt &&
        deployment.lastDeployedAt > latest.lastDeployedAt
          ? deployment
          : latest,
      { lastDeployedAt: Number.MIN_SAFE_INTEGER, artifact: undefined }
    ),
    { lastDeployedAt: Number.MIN_SAFE_INTEGER, artifact: undefined }
  )
}

export interface ArtifactCardProps {
  setArtifactName: React.Dispatch<React.SetStateAction<string | undefined>>
  setSelectedArtifact: React.Dispatch<React.SetStateAction<string | undefined>>
  setIsDetailsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
  setEnvFilter: React.Dispatch<
    React.SetStateAction<{
      envId?: string
      isEnvGroup: boolean
    }>
  >
  setArtifactFilter: React.Dispatch<React.SetStateAction<string | undefined>>
  artifact?: ArtifactInstanceDetail | null
  selectedArtifact?: string
  setArtifactFilterApplied?: React.Dispatch<React.SetStateAction<boolean>>
}

export interface ChartVersionCardProps {
  setChartVersionName: React.Dispatch<React.SetStateAction<string | undefined>>
  setSelectedChartVersion: React.Dispatch<React.SetStateAction<string | undefined>>
  setIsDetailsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
  setEnvFilter: React.Dispatch<
    React.SetStateAction<{
      envId?: string
      isEnvGroup: boolean
    }>
  >
  setChartVersionFilter: React.Dispatch<React.SetStateAction<string | undefined>>
  chartVersion: ChartVersionInstanceDetail
  selectedChartVersion?: string
  setChartVersionFilterApplied?: React.Dispatch<React.SetStateAction<boolean>>
}

export interface PipelineExecInfoProps {
  pipelineId: string
  planExecutionId: string
  lastDeployedAt: number
  count: number
  infrastructureMappingId?: string
  instanceKey?: string
  rollbackStatus?: 'UNAVAILABLE' | 'NOT_STARTED' | 'STARTED' | 'SUCCESS' | 'FAILURE'
  stageNodeExecutionId?: string
  stageSetupId?: string
}

export const shouldShowChartVersion = (selectedDeploymentType: ServiceDeploymentType): boolean => {
  return (
    selectedDeploymentType === ServiceDeploymentType.Kubernetes ||
    selectedDeploymentType === ServiceDeploymentType.NativeHelm
  )
}
