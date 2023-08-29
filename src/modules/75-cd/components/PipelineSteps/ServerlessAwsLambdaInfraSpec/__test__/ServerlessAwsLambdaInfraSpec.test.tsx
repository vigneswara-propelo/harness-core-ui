/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, waitFor } from '@testing-library/react'

import type { AwsLambdaInfrastructure } from 'services/cd-ng'
import routes from '@common/RouteDefinitions'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import type { ModulePathParams, PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { modulePathProps, pipelinePathProps, projectPathProps } from '@common/utils/routeUtils'
import { queryByNameAttribute } from '@common/utils/testUtils'
import { awsConnectorListResponse } from '@platform/connectors/components/ConnectorReferenceField/__tests__/mocks'
import { TestStepWidget, factory } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { awsRegions, getYaml, invalidYaml, testConnectorRefChange } from './helper'
import { ServerlessAwsLambdaInfraSpec } from '../ServerlessAwsLambdaInfraSpec'

const fetchConnector = jest.fn().mockReturnValue({ data: awsConnectorListResponse.data?.content?.[1] })

jest.mock('services/cd-ng', () => ({
  getConnectorListV2Promise: () => Promise.resolve(awsConnectorListResponse),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: { data: awsConnectorListResponse.data?.content?.[1] }, refetch: fetchConnector, loading: false }
  })
}))

jest.mock('services/portal', () => ({
  useListAwsRegions: jest.fn().mockImplementation(() => {
    return { data: awsRegions, loading: false }
  })
}))

const existingInitialValues = {
  infrastructureDefinition: {
    spec: {
      connectorRef: 'Aws_Connector_1',
      region: 'us-east-1',
      stage: 'dev'
    }
  }
}

const emptyInitialValues = {
  connectorRef: '',
  region: '',
  stage: ''
}

const TEST_PATH = routes.toPipelineStudio({ ...projectPathProps, ...modulePathProps, ...pipelinePathProps })

const TEST_PATH_PARAMS: ModulePathParams & PipelinePathProps = {
  accountId: 'testAccountId',
  orgIdentifier: 'testOrg',
  projectIdentifier: 'testProject',
  pipelineIdentifier: 'Pipeline_1',
  module: 'cd'
}

const onUpdate = jest.fn()
const onChange = jest.fn()
factory.registerStep(new ServerlessAwsLambdaInfraSpec())

describe('ServerlessAwsLambdaInfraSpec tests', () => {
  test('check infra tab for empty initial values', async () => {
    const ref = React.createRef<StepFormikRef<AwsLambdaInfrastructure>>()

    const { getByTestId, container } = render(
      <TestStepWidget
        testWrapperProps={{
          path: TEST_PATH,
          pathParams: TEST_PATH_PARAMS as unknown as Record<string, string>
        }}
        initialValues={emptyInitialValues}
        allValues={emptyInitialValues}
        readonly={false}
        onUpdate={onUpdate}
        type={StepType.ServerlessAwsLambdaInfra}
        stepViewType={StepViewType.Edit}
        ref={ref}
      />
    )

    // Choose connectorRef
    const connnectorRefInput = getByTestId(/connectorRef/)
    expect(connnectorRefInput).toBeTruthy()
    await userEvent.click(connnectorRefInput!)
    await testConnectorRefChange()

    // Region
    const regionInput = queryByNameAttribute('region', container) as HTMLInputElement
    expect(regionInput).toBeInTheDocument()
    expect(regionInput).toHaveValue('')
    fireEvent.change(regionInput, { target: { value: 'us-east-1' } })

    // Stage
    const stageInput = queryByNameAttribute('stage', container) as HTMLInputElement
    expect(stageInput).toBeInTheDocument()
    expect(stageInput).toHaveValue('')
    fireEvent.change(stageInput, { target: { value: 'dev' } })

    // check Allow simultaneous deployments on the same infrastructure checkbox
    const allowSimultaneousDeploymentsCheckbox = queryByNameAttribute('allowSimultaneousDeployments', container)
    await userEvent.click(allowSimultaneousDeploymentsCheckbox!)
    expect(allowSimultaneousDeploymentsCheckbox).toBeChecked()
    // submit form and verify
    ref.current?.submitForm()
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        connectorRef: 'Aws_Connector_1',
        region: 'us-east-1',
        stage: 'dev',
        allowSimultaneousDeployments: true,
        provisioner: undefined
      })
    )
  })

  test('Variables view renders fine', async () => {
    const { getByText } = render(
      <TestStepWidget
        initialValues={existingInitialValues}
        type={StepType.ServerlessAwsLambdaInfra}
        onUpdate={onUpdate}
        onChange={onChange}
        stepViewType={StepViewType.InputVariable}
        isNewStep={true}
        customStepProps={{
          stageIdentifier: 'qaStage',
          variablesData: existingInitialValues,
          metadataMap: {
            Aws_Connector_1: {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.infrastructure.infrastructureDefinition.spec.ServerlessAwsLambdaInfra.connectorRef',
                localName: 'spec.ServerlessAwsLambdaInfra.connectorRef'
              }
            },
            'us-east-1': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.infrastructure.infrastructureDefinition.spec.ServerlessAwsLambdaInfra.region',
                localName: 'spec.ServerlessAwsLambdaInfra.region'
              }
            },
            dev: {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.infrastructure.infrastructureDefinition.spec.ServerlessAwsLambdaInfra.stage',
                localName: 'spec.ServerlessAwsLambdaInfra.stage'
              }
            }
          }
        }}
      />
    )

    expect(getByText('connectorRef')).toBeVisible()
    expect(getByText('Aws_Connector_1')).toBeVisible()
    expect(getByText('region')).toBeVisible()
    expect(getByText('us-east-1')).toBeVisible()
    expect(getByText('stage')).toBeVisible()
    expect(getByText('dev')).toBeVisible()
  })

  test('Variables view should not render fine if variablesData is not sent properly', async () => {
    const wrongInitialValues = {
      connectorRef: 'Aws_Connector_1',
      region: 'US East (N. Virginia)',
      cluster: 'aws-cluster-1'
    }
    const { queryByText } = render(
      <TestStepWidget
        initialValues={wrongInitialValues}
        type={StepType.ServerlessAwsLambdaInfra}
        onUpdate={onUpdate}
        onChange={onChange}
        stepViewType={StepViewType.InputVariable}
        isNewStep={true}
        customStepProps={{
          stageIdentifier: 'qaStage',
          variablesData: wrongInitialValues,
          metadataMap: {
            Aws_Connector_1: {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.infrastructure.infrastructureDefinition.spec.AwsLambdaInfra.connectorRef',
                localName: 'spec.AwsLambdaInfra.connectorRef'
              }
            },
            'US East (N. Virginia)': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.infrastructure.infrastructureDefinition.spec.AwsLambdaInfra.region',
                localName: 'spec.AwsLambdaInfra.region'
              }
            }
          }
        }}
      />
    )

    expect(queryByText('connectorRef')).toBeNull()
    expect(queryByText('Aws_Connector_1')).toBeNull()
    expect(queryByText('region')).toBeNull()
    expect(queryByText('US East (N. Virginia)')).toBeNull()
  })
})

const connectorRefPath = 'pipeline.stages.0.stage.spec.infrastructure.infrastructureDefinition.spec.connectorRef'

const params = (): PipelinePathProps & ModulePathParams => ({
  accountId: 'accountId',
  module: 'cd',
  orgIdentifier: 'default',
  pipelineIdentifier: '-1',
  projectIdentifier: 'projectIdentifier'
})

describe('getConnectorsListForYaml test', () => {
  test('when connectorRefPath and yaml both are valid', async () => {
    const step = new ServerlessAwsLambdaInfraSpec() as any
    const list: CompletionItemInterface[] = await step.getConnectorsListForYaml(connectorRefPath, getYaml(), params)
    expect(list).toHaveLength(2)
    expect(list[1].insertText).toBe('Aws_Connector_2')
  })

  test('when connectorRefPath is invalid and yaml is valid valid', async () => {
    const step = new ServerlessAwsLambdaInfraSpec() as any
    const list: CompletionItemInterface[] = await step.getConnectorsListForYaml('invalid path', getYaml(), params)
    expect(list).toHaveLength(0)
  })

  test('when connectorRefPath is valid and yaml is invalid valid', async () => {
    const step = new ServerlessAwsLambdaInfraSpec() as any
    const list: CompletionItemInterface[] = await step.getConnectorsListForYaml('invalid path', invalidYaml(), params)
    expect(list).toHaveLength(0)
  })
})
