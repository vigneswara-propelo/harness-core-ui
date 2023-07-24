/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'

import { MultiTypeInputType, MultiTypeInputValue } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'

import { ArtifactSourceBaseFactory } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBaseFactory'
import type { ArtifactListConfig, ServiceSpec } from 'services/cd-ng'
import * as artifactSourceUtils from '../../artifactSourceUtils'
import { KubernetesPrimaryArtifacts } from '../../../KubernetesArtifacts/KubernetesPrimaryArtifacts/KubernetesPrimaryArtifacts'
import { KubernetesSidecarArtifacts } from '../../../KubernetesArtifacts/KubernetesSidecarArtifacts/KubernetesSidecarArtifacts'

import { template, artifacts } from './mocks'

jest.spyOn(artifactSourceUtils, 'fromPipelineInputTriggerTab')
jest.spyOn(artifactSourceUtils, 'isFieldfromTriggerTabDisabled')
jest.spyOn(artifactSourceUtils, 'resetTags').mockImplementation(() => jest.fn())

jest.mock('services/cd-ng', () => ({
  ...jest.requireActual('services/cd-ng'),
  useGetServiceV2: jest.fn().mockImplementation(() => ({ loading: false, data: {}, refetch: jest.fn() }))
}))

jest.mock('@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField', () => ({
  ...(jest.requireActual('@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField') as any),
  // eslint-disable-next-line react/display-name
  FormMultiTypeConnectorField: (props: any) => {
    return (
      <div className="form-multi-type-connector-field-mock">
        <button
          name={'changeFormMultiTypeConnectorField'}
          onClick={() => {
            props.onChange('value', MultiTypeInputValue.STRING, MultiTypeInputType.RUNTIME)
          }}
        >
          Form Multi Type Connector Field button
        </button>
      </div>
    )
  }
}))

describe('GCR Artifact Source tests', () => {
  test('snapshot test for Primary GCR artifact source', () => {
    const { container } = render(
      <TestWrapper>
        <KubernetesPrimaryArtifacts
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
    expect(container).toMatchSnapshot()
  })

  test('snapshot test for Sidecar GCR artifact source', async () => {
    const { container, findByText } = render(
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
    expect(container).toMatchSnapshot()
    expect(await waitFor(() => findByText('pipeline.imagePathLabel'))).toBeInTheDocument()
    expect(await waitFor(() => artifactSourceUtils.fromPipelineInputTriggerTab)).toBeCalled()
    expect(await waitFor(() => artifactSourceUtils.isFieldfromTriggerTabDisabled)).toBeCalled()

    const button = await waitFor(() => findByText('Form Multi Type Connector Field button'))
    act(() => {
      fireEvent.click(button)
    })

    expect(await waitFor(() => artifactSourceUtils.resetTags)).toBeCalled()
  })
})
