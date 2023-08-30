/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'

import { MultiTypeInputType } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import connector from '@connectors/pages/connectors/__tests__/mocks/get-connector-mock.json'

import { ArtifactSourceBaseFactory } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBaseFactory'
import type { ArtifactListConfig, ServiceSpec } from 'services/cd-ng'
import * as artifactSourceUtils from '../../artifactSourceUtils'
import { KubernetesSidecarArtifacts } from '../../../KubernetesArtifacts/KubernetesSidecarArtifacts/KubernetesSidecarArtifacts'

import { template, artifacts, projectsMockResponse, feedsMockResponse, packagesMockResponse } from './mocks'

const refetchFeedsMock = jest.fn()
const refetchProjectsMock = jest.fn()

jest.mock('@common/hooks/useMutateAsGet', () => ({
  useMutateAsGet: jest.fn().mockImplementation(fn => {
    return fn()
  })
}))

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: connector, refetch: jest.fn(), error: null, loading: false }
  }),
  useListProjectsForAzureArtifactsWithServiceV2: jest.fn().mockImplementation(() => ({
    loading: false,
    refetch: refetchProjectsMock,
    data: projectsMockResponse,
    error: null
  })),
  useListFeedsForAzureArtifactsWithServiceV2: jest.fn().mockImplementation(() => ({
    loading: false,
    data: feedsMockResponse,
    refetch: refetchFeedsMock,
    error: null
  })),
  useListPackagesForAzureArtifactsWithServiceV2: jest.fn().mockImplementation(() => ({
    loading: false,
    data: packagesMockResponse,
    refetch: jest.fn(),
    error: null
  })),
  useListVersionsFromPackageWithServiceV2: jest.fn().mockImplementation(() => ({
    loading: false,
    data: {},
    refetch: jest.fn(),
    error: null
  }))
}))

jest.spyOn(artifactSourceUtils, 'fromPipelineInputTriggerTab')
jest.spyOn(artifactSourceUtils, 'isFieldfromTriggerTabDisabled')
jest.spyOn(artifactSourceUtils, 'resetTags').mockImplementation(() => jest.fn())

describe('Azure Artifacts Source tests', () => {
  test('Tests if fields get rendered properly as per the template for Azure artifact source', async () => {
    const { findByText, rerender, getByPlaceholderText } = render(
      <TestWrapper>
        <KubernetesSidecarArtifacts
          // eslint-disable-next-line
          // @ts-ignore
          initialValues={undefined}
          template={template as ServiceSpec}
          artifacts={artifacts as ArtifactListConfig}
          readonly={false}
          stageIdentifier="stage-0"
          artifactSourceBaseFactory={new ArtifactSourceBaseFactory()}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          stepViewType={StepViewType.DeploymentForm}
        />
      </TestWrapper>
    )

    rerender(
      <TestWrapper>
        <KubernetesSidecarArtifacts
          initialValues={{ artifacts: artifacts as ArtifactListConfig }}
          template={template as ServiceSpec}
          artifacts={artifacts as ArtifactListConfig}
          readonly={false}
          stageIdentifier="stage-0"
          artifactSourceBaseFactory={new ArtifactSourceBaseFactory()}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          stepViewType={StepViewType.DeploymentForm}
        />
      </TestWrapper>
    )

    const feedInput = getByPlaceholderText('pipeline.artifactsSelection.feedPlaceholder') as HTMLElement
    expect(feedInput).toBeInTheDocument()

    const projectInput = getByPlaceholderText('pipeline.artifactsSelection.projectPlaceholder') as HTMLElement
    expect(projectInput).toBeInTheDocument()

    expect(await waitFor(() => findByText('pipeline.artifactsSelection.packageName'))).toBeInTheDocument()
  })
})
