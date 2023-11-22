/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, queryByAttribute } from '@testing-library/react'
import { AllowedTypesWithRunTime, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'

import { TestWrapper } from '@common/utils/testUtils'
import { StepViewType } from '@modules/70-pipeline/components/AbstractSteps/Step'
import { ManifestDataType, ManifestStoreMap } from '@modules/70-pipeline/components/ManifestSelection/Manifesthelper'
import { ManifestSourceBaseFactory } from '@modules/75-cd/factory/ManifestSourceFactory/ManifestSourceBaseFactory'
import { ArtifactBundleStoreRuntimeFields } from '../ArtifactBundleStoreRuntimeFields'

const props = {
  template: {
    manifests: [
      {
        manifest: {
          identifier: 'TasManifestWithArtifactBundle',
          type: ManifestDataType.TasManifest,
          spec: {
            store: {
              type: ManifestStoreMap.ArtifactBundle,
              spec: {
                deployableUnitPath: RUNTIME_INPUT_VALUE,
                manifestPath: RUNTIME_INPUT_VALUE
              }
            }
          }
        }
      }
    ]
  },
  path: '',
  manifestPath: 'manifests[0].manifest',
  manifest: {
    identifier: '',
    type: ManifestDataType.TasManifest,
    spec: {}
  },
  fromTrigger: false,
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ] as AllowedTypesWithRunTime[],
  readonly: false,
  stepViewType: StepViewType.DeploymentForm,
  stageIdentifier: 'STG1',
  isManifestsRuntime: true,
  projectIdentifier: 'testProject',
  orgIdentifier: 'testOrg',
  accountId: 'testAccount',
  pipelineIdentifier: 'testPipeline',
  manifestSourceBaseFactory: new ManifestSourceBaseFactory(),
  initialValues: {}
}

describe('ArtifactBundleStoreRuntimeFields tests', () => {
  test('should render ArtifactBundle store specific fields when they are Runtime input in template', async () => {
    const { container } = render(
      <TestWrapper>
        <ArtifactBundleStoreRuntimeFields {...props} />
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    const deployableUnitPathInput = queryByNameAttribute('manifests[0].manifest.spec.store.spec.deployableUnitPath')
    expect(deployableUnitPathInput).toBeInTheDocument()

    const manifestPathInput = queryByNameAttribute('manifests[0].manifest.spec.store.spec.manifestPath')
    expect(manifestPathInput).toBeInTheDocument()
  })

  test('should render ArtifactBundle store specific fields with expected name when path is passed', async () => {
    props.path = 'serviceDefinition.spec'
    const { container } = render(
      <TestWrapper>
        <ArtifactBundleStoreRuntimeFields {...props} />
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    const deployableUnitPathInput = queryByNameAttribute(
      'serviceDefinition.spec.manifests[0].manifest.spec.store.spec.deployableUnitPath'
    )
    expect(deployableUnitPathInput).toBeInTheDocument()

    const manifestPathInput = queryByNameAttribute(
      'serviceDefinition.spec.manifests[0].manifest.spec.store.spec.manifestPath'
    )
    expect(manifestPathInput).toBeInTheDocument()
  })

  test('fields should be disabled when readonly is true', async () => {
    props.path = ''
    props.readonly = true

    const { container } = render(
      <TestWrapper>
        <ArtifactBundleStoreRuntimeFields {...props} />
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    const deployableUnitPathInput = queryByNameAttribute('manifests[0].manifest.spec.store.spec.deployableUnitPath')
    expect(deployableUnitPathInput).toBeInTheDocument()
    expect(deployableUnitPathInput).toBeDisabled()

    const manifestPathInput = queryByNameAttribute('manifests[0].manifest.spec.store.spec.manifestPath')
    expect(manifestPathInput).toBeInTheDocument()
    expect(manifestPathInput).toBeDisabled()
  })

  test('should NOT render ArtifactBundle store specific fields when they are NOT Runtime input in template', async () => {
    props.template.manifests[0].manifest.spec.store.spec = { deployableUnitPath: '', manifestPath: '' }

    const { container } = render(
      <TestWrapper>
        <ArtifactBundleStoreRuntimeFields {...props} />
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    const deployableUnitPathInput = queryByNameAttribute('manifests[0].manifest.spec.store.spec.deployableUnitPath')
    expect(deployableUnitPathInput).not.toBeInTheDocument()

    const manifestPathInput = queryByNameAttribute('manifests[0].manifest.spec.store.spec.manifestPath')
    expect(manifestPathInput).not.toBeInTheDocument()
  })
})
