/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo } from 'lodash-es'
import { RepositoryFormatTypes } from '@pipeline/utils/stageHelpers'
import { ArtifactType, ArtifactTriggerSpec } from './ArtifactInterface'

export const getArtifactLocation = (artifact: ArtifactTriggerSpec, artifactType: ArtifactType): string | undefined => {
  switch (artifactType) {
    case 'Gcr':
    case 'Ecr':
    case 'DockerRegistry':
    case 'GoogleArtifactRegistry': {
      return artifact?.imagePath
    }
    case 'Nexus2Registry': {
      return artifact?.artifactId
    }
    case 'Nexus3Registry':
    case 'Jenkins': {
      return artifact?.artifactPath
    }
    case 'ArtifactoryRegistry': {
      return artifact?.repositoryFormat === RepositoryFormatTypes.Generic
        ? artifact?.repository
        : artifact?.artifactPath
    }
    case 'Acr': {
      return artifact?.repository
    }
    case 'AmazonS3': {
      return `${artifact?.bucketName}/${artifact?.filePathRegex}`
    }
    case 'GithubPackageRegistry':
    case 'AzureArtifacts': {
      return artifact?.packageName
    }
    case 'GoogleCloudStorage': {
      return artifact?.bucket
    }
    case 'AmazonMachineImage': {
      return artifact?.region
    }
    case 'CustomArtifact': {
      return defaultTo(artifact?.artifactsArrayPath, artifact?.versionPath)
    }
    case 'Bamboo': {
      return artifact?.artifactPaths
        .map((artifactPath: string) => (artifact?.planKey ? `${artifact?.planKey}/${artifactPath}` : artifactPath))
        ?.join(', ')
    }
  }
}
