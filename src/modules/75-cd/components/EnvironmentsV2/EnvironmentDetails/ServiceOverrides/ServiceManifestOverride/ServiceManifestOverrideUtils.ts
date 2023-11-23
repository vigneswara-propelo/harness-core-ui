/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@harness/icons'
import { FeatureFlag } from '@modules/10-common/featureFlags'
import { ManifestStores } from '@modules/70-pipeline/components/ManifestSelection/ManifestInterface'
import { ServiceDeploymentType } from '@modules/70-pipeline/utils/stageHelpers'
import type { StringKeys } from 'framework/strings'
import { ServiceDefinition } from 'services/cd-ng'

export type OverrideManifestTypes =
  | 'Values'
  | 'OpenshiftParam'
  | 'KustomizePatches'
  | 'TasManifest'
  | 'TasVars'
  | 'TasAutoScaler'
  | 'HelmRepoOverride'
  | 'EcsTaskDefinition'
  | 'EcsServiceDefinition'
  | 'EcsScalableTargetDefinition'
  | 'EcsScalingPolicyDefinition'

export type OverrideManifestStoresTypes =
  | 'Git'
  | 'Github'
  | 'GitLab'
  | 'Bitbucket'
  | 'InheritFromManifest'
  | 'Harness'
  | 'CustomRemote'
  | 'AzureRepo'
  | 'Gcs'
  | 'Http'
  | 'OciHelmChart'
  | 'S3'
  | 'ArtifactBundle'

export const OverrideManifests: Record<OverrideManifestTypes, OverrideManifestTypes> = {
  Values: 'Values',
  OpenshiftParam: 'OpenshiftParam',
  KustomizePatches: 'KustomizePatches',
  TasManifest: 'TasManifest',
  TasVars: 'TasVars',
  TasAutoScaler: 'TasAutoScaler',
  HelmRepoOverride: 'HelmRepoOverride',
  EcsTaskDefinition: 'EcsTaskDefinition',
  EcsServiceDefinition: 'EcsServiceDefinition',
  EcsScalableTargetDefinition: 'EcsScalableTargetDefinition',
  EcsScalingPolicyDefinition: 'EcsScalingPolicyDefinition'
}
export const OverrideManifestStores: Record<OverrideManifestStoresTypes, OverrideManifestStoresTypes> = {
  Git: 'Git',
  Github: 'Github',
  GitLab: 'GitLab',
  Bitbucket: 'Bitbucket',
  InheritFromManifest: 'InheritFromManifest',
  Harness: 'Harness',
  CustomRemote: 'CustomRemote',
  AzureRepo: 'AzureRepo',
  Gcs: 'Gcs',
  Http: 'Http',
  OciHelmChart: 'OciHelmChart',
  S3: 'S3',
  ArtifactBundle: 'ArtifactBundle'
}
export const AllowedManifestOverrideTypes = [
  OverrideManifests.Values,
  OverrideManifests.OpenshiftParam,
  OverrideManifests.KustomizePatches,
  OverrideManifests.HelmRepoOverride
]

const gitStoreTypes: Array<OverrideManifestStoresTypes> = [
  OverrideManifestStores.Git,
  OverrideManifestStores.Github,
  OverrideManifestStores.GitLab,
  OverrideManifestStores.Bitbucket
]
export const OverrideManifestStoreMap: Record<OverrideManifestTypes, OverrideManifestStoresTypes[]> = {
  Values: [
    ...gitStoreTypes,
    OverrideManifestStores.AzureRepo,
    OverrideManifestStores.InheritFromManifest,
    OverrideManifestStores.Harness,
    OverrideManifestStores.CustomRemote
  ],
  OpenshiftParam: [
    ...gitStoreTypes,
    OverrideManifestStores.AzureRepo,
    OverrideManifestStores.InheritFromManifest,
    OverrideManifestStores.Harness,
    OverrideManifestStores.CustomRemote
  ],
  KustomizePatches: [
    ...gitStoreTypes,
    OverrideManifestStores.AzureRepo,
    OverrideManifestStores.InheritFromManifest,
    OverrideManifestStores.Harness
  ],
  TasManifest: [
    ...gitStoreTypes,
    OverrideManifestStores.Harness,
    OverrideManifestStores.CustomRemote,
    OverrideManifestStores.ArtifactBundle
  ],
  TasVars: [...gitStoreTypes, OverrideManifestStores.Harness, OverrideManifestStores.CustomRemote],
  TasAutoScaler: [...gitStoreTypes, OverrideManifestStores.Harness, OverrideManifestStores.CustomRemote],
  HelmRepoOverride: [
    OverrideManifestStores.Http,
    OverrideManifestStores.OciHelmChart,
    OverrideManifestStores.S3,
    OverrideManifestStores.Gcs
  ],
  EcsTaskDefinition: [
    ...gitStoreTypes,
    OverrideManifestStores.AzureRepo,
    OverrideManifestStores.Harness,
    OverrideManifestStores.S3
  ],
  EcsServiceDefinition: [
    ...gitStoreTypes,
    OverrideManifestStores.AzureRepo,
    OverrideManifestStores.Harness,
    OverrideManifestStores.S3
  ],
  EcsScalableTargetDefinition: [
    ...gitStoreTypes,
    OverrideManifestStores.AzureRepo,
    OverrideManifestStores.Harness,
    OverrideManifestStores.S3
  ],
  EcsScalingPolicyDefinition: [
    ...gitStoreTypes,
    OverrideManifestStores.AzureRepo,
    OverrideManifestStores.Harness,
    OverrideManifestStores.S3
  ]
}

export const getManifestStoresByDeploymentType = (
  selectedDeploymentType: ServiceDefinition['type'] | undefined,
  selectedManifest: OverrideManifestTypes | null,
  featureFlagMap: Partial<Record<FeatureFlag, boolean>>
): ManifestStores[] => {
  const valuesManifestStores = OverrideManifestStoreMap[selectedManifest as OverrideManifestTypes]
  if (
    selectedDeploymentType === ServiceDeploymentType.TAS &&
    selectedManifest === OverrideManifests.TasManifest &&
    !featureFlagMap.CDS_ENABLE_TAS_ARTIFACT_AS_MANIFEST_SOURCE_NG
  ) {
    return valuesManifestStores?.filter(manifestStore => manifestStore !== OverrideManifestStores.ArtifactBundle)
  }
  return valuesManifestStores
}

export const ManifestLabels: Record<OverrideManifestTypes, StringKeys> = {
  Values: 'pipeline.manifestTypeLabels.ValuesYaml',
  OpenshiftParam: 'pipeline.manifestTypeLabels.OpenshiftParam',
  KustomizePatches: 'pipeline.manifestTypeLabels.KustomizePatches',
  TasManifest: 'pipeline.manifestTypeLabels.TASManifest',
  TasVars: 'pipeline.manifestTypeLabels.VarsYAML',
  TasAutoScaler: 'pipeline.manifestTypeLabels.Autoscaler',
  HelmRepoOverride: 'pipeline.manifestTypeLabels.HelmRepoOverride',
  EcsTaskDefinition: 'cd.pipelineSteps.serviceTab.manifest.taskDefinition',
  EcsServiceDefinition: 'cd.pipelineSteps.serviceTab.manifest.serviceDefinition',
  EcsScalableTargetDefinition: 'cd.pipelineSteps.serviceTab.manifest.scalableTarget',
  EcsScalingPolicyDefinition: 'pipeline.manifestTypeLabels.EcsScalingPolicyDefinition'
}
export const ManifestIcons: Record<OverrideManifestTypes, IconName> = {
  Values: 'functions',
  OpenshiftParam: 'openshift-params',
  KustomizePatches: 'kustomizeparam',
  TasManifest: 'tas-manifest',
  TasVars: 'list-vars',
  TasAutoScaler: 'autoScaler',
  HelmRepoOverride: 'helm-oci',
  EcsTaskDefinition: 'service-amazon-ecs',
  EcsServiceDefinition: 'service-amazon-ecs',
  EcsScalingPolicyDefinition: 'service-amazon-ecs',
  EcsScalableTargetDefinition: 'service-amazon-ecs'
}

export const TASOverrideManifests = [
  OverrideManifests.TasManifest,
  OverrideManifests.TasVars,
  OverrideManifests.TasAutoScaler
]

export const ECSOverrideManifests = [
  OverrideManifests.EcsTaskDefinition,
  OverrideManifests.EcsServiceDefinition,
  OverrideManifests.EcsScalableTargetDefinition,
  OverrideManifests.EcsScalingPolicyDefinition
]

export function getAllowedOverrideManifests({ NG_SVC_ENV_REDESIGN = false }): OverrideManifestTypes[] {
  let overrideManifests = [...AllowedManifestOverrideTypes, ...ECSOverrideManifests]

  if (NG_SVC_ENV_REDESIGN) {
    overrideManifests = overrideManifests.concat(TASOverrideManifests)
  }
  return overrideManifests
}
