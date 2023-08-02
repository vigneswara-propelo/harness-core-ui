/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, queryByAttribute, render } from '@testing-library/react'

import { TestWrapper, queryByNameAttribute } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { modulePathProps, pipelinePathProps, projectPathProps } from '@common/utils/routeUtils'
import { ModulePathParams, PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { kubernetesConnectorListResponse } from '@connectors/components/ConnectorReferenceField/__tests__/mocks'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import {
  ServerlessAwsLambdaPackageV2StepEditRef,
  ServerlessAwsLambdaPackageV2StepFormikValues
} from '../ServerlessAwsLambdaPackageV2StepEdit'

const fetchConnector = jest.fn().mockReturnValue({ data: kubernetesConnectorListResponse?.data?.content?.[0] })
jest.mock('services/cd-ng', () => ({
  getConnectorListV2Promise: jest.fn().mockImplementation(() => Promise.resolve(kubernetesConnectorListResponse)),
  useGetConnector: jest.fn().mockImplementation(() => {
    return {
      data: { data: kubernetesConnectorListResponse?.data?.content?.[0] },
      refetch: fetchConnector,
      loading: false
    }
  })
}))

const onUpdate = jest.fn()
const onChange = jest.fn()

const TEST_PATH = routes.toPipelineStudio({ ...projectPathProps, ...modulePathProps, ...pipelinePathProps })

const TEST_PATH_PARAMS: ModulePathParams & PipelinePathProps = {
  accountId: 'testAccountId',
  orgIdentifier: 'testOrg',
  projectIdentifier: 'testProject',
  pipelineIdentifier: 'Pipeline_1',
  module: 'cd'
}

describe('ServerlessAwsLambdaPackageV2StepEdit tests', () => {
  beforeEach(() => {
    onUpdate.mockReset()
    onChange.mockReset()
  })

  test('it should work as create/new step if isNewStep props is not passed', async () => {
    const ref = React.createRef<StepFormikRef<ServerlessAwsLambdaPackageV2StepFormikValues>>()
    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <ServerlessAwsLambdaPackageV2StepEditRef
          initialValues={{
            identifier: '',
            name: '',
            timeout: '10m',
            type: StepType.ServerlessAwsLambdaPackageV2,
            spec: {
              connectorRef: ''
            }
          }}
          allowableTypes={[]}
          onChange={onChange}
          onUpdate={onUpdate}
          stepViewType={StepViewType.Edit}
          ref={ref}
        ></ServerlessAwsLambdaPackageV2StepEditRef>
      </TestWrapper>
    )

    const identifierEditIcon = queryByAttribute('data-icon', container, 'Edit')
    expect(identifierEditIcon).toBeInTheDocument()

    const nameInput = queryByNameAttribute('name', container) as HTMLInputElement
    expect(nameInput).toBeInTheDocument()
    expect(nameInput.value).toBe('')
    fireEvent.change(nameInput, { target: { value: 'Serverless Package Step' } })
    expect(nameInput.value).toBe('Serverless Package Step')
  })
})
