/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { ArtifactType } from '../ArtifactInterface'
import { getArtifactLocation } from '../ArtifactUtils'

describe('Test artifactUtils', () => {
  const imagePathLocation: ArtifactType[][] = [['Gcr'], ['Ecr'], ['DockerRegistry'], ['GoogleArtifactRegistry']]
  const artifactPathLocation: ArtifactType[][] = [['Nexus3Registry'], ['Jenkins']]
  const packageNameLocation: ArtifactType[][] = [['GithubPackageRegistry'], ['AzureArtifacts']]
  test.each(imagePathLocation)('%s Artifact', artifactType => {
    const imagePath = 'test-image-path'
    expect(
      getArtifactLocation(
        {
          imagePath
        },
        artifactType
      )
    ).toBe(imagePath)
  })

  test.each(artifactPathLocation)('%s Artifact', artifactType => {
    const artifactPath = 'test-artifact-path'
    expect(
      getArtifactLocation(
        {
          artifactPath
        },
        artifactType
      )
    ).toBe(artifactPath)
  })

  test.each(packageNameLocation)('%s Artifact', artifactType => {
    const packageName = 'test-package-name'
    expect(
      getArtifactLocation(
        {
          packageName
        },
        artifactType
      )
    ).toBe(packageName)
  })

  test('Nexus2Registry Artifact', () => {
    const artifactId = 'test-artifact-Id'
    expect(
      getArtifactLocation(
        {
          artifactId
        },
        'Nexus2Registry'
      )
    ).toBe(artifactId)
  })

  test('ArtifactoryRegistry Artifact', () => {
    const repository = 'test-repository'
    const artifactPath = 'test-artifact-path'
    expect(
      getArtifactLocation(
        {
          repository,
          repositoryFormat: 'generic'
        },
        'ArtifactoryRegistry'
      )
    ).toBe(repository)
    expect(
      getArtifactLocation(
        {
          artifactPath
        },
        'ArtifactoryRegistry'
      )
    ).toBe(artifactPath)
  })

  test('Acr Artifact', () => {
    const repository = 'test-repository'
    expect(
      getArtifactLocation(
        {
          repository
        },
        'Acr'
      )
    ).toBe(repository)
  })

  test('AmazonS3 Artifact', () => {
    const bucketName = 's3-manifest-trigger'
    const filePathRegex = '*'
    expect(
      getArtifactLocation(
        {
          bucketName,
          filePathRegex
        },
        'AmazonS3'
      )
    ).toBe('s3-manifest-trigger/*')
  })

  test('GoogleCloudStorage Artifact', () => {
    const bucket = 'test-bucket'
    expect(
      getArtifactLocation(
        {
          bucket
        },
        'GoogleCloudStorage'
      )
    ).toBe(bucket)
  })

  test('AmazonMachineImage Artifact', () => {
    const region = 'test-region'
    expect(
      getArtifactLocation(
        {
          region
        },
        'AmazonMachineImage'
      )
    ).toBe(region)
  })

  test('CustomArtifact Artifact', () => {
    const artifactsArrayPath = 'test-artifacts-ArrayPath'
    expect(
      getArtifactLocation(
        {
          artifactsArrayPath
        },
        'CustomArtifact'
      )
    ).toBe(artifactsArrayPath)
  })

  test('Bamboo Artifact', () => {
    const planKey = 'PFP-PT'
    const artifactPaths = ['test-path-1', 'test-path-2']
    expect(
      getArtifactLocation(
        {
          planKey,
          artifactPaths
        },
        'Bamboo'
      )
    ).toBe('PFP-PT/test-path-1, PFP-PT/test-path-2')
  })
})
