/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { getByText, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { RancherInfrastructureSpec } from '../RancherInfrastructureSpec'
import {
  ConnectorsResponse,
  ConnectorResponse,
  ClusterNamesResponse,
  initialValues,
  emptyInitialValues,
  runtimeInputsValues,
  params,
  yaml,
  invalidYaml
} from './mock'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@harnessio/react-ng-manager-client')

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn(() => ConnectorResponse),
  getConnectorListV2Promise: jest.fn(() => Promise.resolve(ConnectorsResponse.data))
}))

jest.mock('@harnessio/react-ng-manager-client', () => ({
  useListAccountScopedRancherClustersUsingConnectorRefQuery: jest.fn(() => ClusterNamesResponse),
  listAccountScopedRancherClustersUsingConnectorRef: jest.fn(() => Promise.resolve(ClusterNamesResponse.data)),
  useListAccountScopedRancherClustersUsingEnvAndInfraRefQuery: jest.fn(() => ClusterNamesResponse)
}))

const connectorRefPath = 'pipeline.stages.0.stage.spec.infrastructure.infrastructureDefinition.spec.connectorRef'
const clusterPath = 'pipeline.stages.0.stage.spec.infrastructure.infrastructureDefinition.spec.cluster'

describe('Test RancherInfrastructureSpec render', () => {
  beforeEach(() => {
    factory.registerStep(new RancherInfrastructureSpec())
  })

  test('should render edit view with empty initial values', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} type={StepType.KubernetesRancher} stepViewType={StepViewType.Edit} />
    )
    const clusterInput = container.querySelector('[placeholder="cd.steps.common.selectOrEnterClusterPlaceholder"]')
    userEvent.click(clusterInput!)
    expect(container).toBeDefined()
  })

  test('should render edit view with values ', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={initialValues}
        type={StepType.KubernetesRancher}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toBeDefined()
  })

  test('should render edit view with runtime values ', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={runtimeInputsValues}
        type={StepType.KubernetesRancher}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toBeDefined()
  })

  test('should render edit view for inputset view', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={initialValues}
        template={runtimeInputsValues}
        allValues={initialValues}
        type={StepType.KubernetesRancher}
        stepViewType={StepViewType.InputSet}
      />
    )
    expect(container).toBeDefined()
  })

  test('should render edit view for inputset ', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{}}
        template={runtimeInputsValues}
        allValues={{}}
        type={StepType.KubernetesRancher}
        stepViewType={StepViewType.InputSet}
      />
    )
    expect(container).toBeDefined()
  })
  test('should render edit view for inputset edit', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{ ...initialValues, cluster: '' }}
        template={runtimeInputsValues}
        allValues={{ ...initialValues, cluster: '' }}
        type={StepType.KubernetesRancher}
        stepViewType={StepViewType.TriggerForm}
      />
    )

    expect(container).toBeDefined()
  })

  test('should render variable view', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={initialValues}
        template={runtimeInputsValues}
        allValues={initialValues}
        type={StepType.KubernetesRancher}
        stepViewType={StepViewType.InputVariable}
      />
    )

    expect(container).toBeDefined()
  })
})

describe('Test RancherInfrastructureSpec behavior', () => {
  beforeEach(() => {
    factory.registerStep(new RancherInfrastructureSpec())
  })

  test('should call onUpdate if valid values entered - inputset', async () => {
    const onUpdateHandler = jest.fn()
    const { container } = render(
      <TestStepWidget
        initialValues={initialValues}
        template={runtimeInputsValues}
        allValues={initialValues}
        type={StepType.KubernetesRancher}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdateHandler}
      />
    )

    userEvent.click(getByText(container, 'Submit'))
    await waitFor(() => expect(onUpdateHandler).toHaveBeenCalledWith(initialValues))
  })

  test('should call onUpdate if valid values entered when connector ref is not present- inputset', async () => {
    const onUpdateHandler = jest.fn()
    const { container } = render(
      <TestStepWidget
        initialValues={{
          cluster: 'cluster',
          environmentRef: 'environmentRef',
          infrastructureRef: 'infrastructureRef'
        }}
        template={{
          cluster: RUNTIME_INPUT_VALUE
        }}
        allValues={{
          cluster: 'cluster',
          environmentRef: 'environmentRef',
          infrastructureRef: 'infrastructureRef'
        }}
        type={StepType.KubernetesRancher}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdateHandler}
      />
    )

    userEvent.click(getByText(container, 'Submit'))
    await waitFor(() =>
      expect(onUpdateHandler).toHaveBeenCalledWith({
        cluster: 'cluster',
        environmentRef: 'environmentRef',
        infrastructureRef: 'infrastructureRef'
      })
    )
  })

  test('should not call onUpdate if invalid values entered - inputset', async () => {
    const onUpdateHandler = jest.fn()
    const { container } = render(
      <TestStepWidget
        initialValues={emptyInitialValues}
        template={runtimeInputsValues}
        allValues={emptyInitialValues}
        type={StepType.Rancher}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdateHandler}
      />
    )

    userEvent.click(getByText(container, 'Submit'))

    await waitFor(() => expect(onUpdateHandler).toHaveBeenCalled())
  })
})

describe('Test RancherInfrastructureSpec autocomplete', () => {
  test('Validations Test', () => {
    const response = new RancherInfrastructureSpec().validateInputSet({
      data: {
        connectorRef: '',
        cluster: '',
        namespace: 'namespace',
        releaseName: 'releasename'
      },
      template: runtimeInputsValues,
      viewType: StepViewType.TriggerForm,
      getString: jest.fn()
    })
    expect(response).toEqual({})
  })
  test('Test connector autocomplete', async () => {
    const step = new RancherInfrastructureSpec() as any
    let list: CompletionItemInterface[]

    list = await step.getConnectorsListForYaml(connectorRefPath, yaml, params)
    expect(list).toHaveLength(1)

    list = await step.getConnectorsListForYaml('invalid path', yaml, params)
    expect(list).toHaveLength(0)

    list = await step.getConnectorsListForYaml(connectorRefPath, invalidYaml, params)
    expect(list).toHaveLength(0)
  })

  test('Test cluster names autocomplete', async () => {
    const step = new RancherInfrastructureSpec() as any
    let list: CompletionItemInterface[]

    list = await step.getClusterListForYaml(clusterPath, yaml, params)
    expect(list).toHaveLength(2)
    expect(list[0].insertText).toBe('us-west2/a1')

    list = await step.getClusterListForYaml('invalid path', yaml, params)
    expect(list).toHaveLength(0)

    list = await step.getClusterListForYaml(clusterPath, invalidYaml, params)
    expect(list).toHaveLength(0)
  })
})
