/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, queryByAttribute, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'

import { TestWrapper } from '@common/utils/testUtils'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { AsgBlueGreenDeployStepEditRef } from '../AsgBlueGreenDeployStepEdit'
import type { AsgBlueGreenDeployCustomStepProps, AsgBlueGreenDeployStepInitialValues } from '../AsgBlueGreenDeployStep'
import { elasticLoadBalancersResponse, listenerRulesList, listenersResponse } from './helpers/mocks'

const fetchListeners = jest.fn().mockReturnValue(listenersResponse)
jest.mock('services/cd-ng', () => ({
  useElasticLoadBalancers: jest.fn().mockImplementation(() => {
    return { data: elasticLoadBalancersResponse, error: null, loading: false }
  }),
  useListeners: jest.fn().mockImplementation(() => {
    return { data: listenersResponse, refetch: fetchListeners, error: null, loading: false }
  }),
  listenerRulesPromise: jest.fn().mockImplementation(() => {
    return new Promise(resolve => {
      resolve({ data: listenerRulesList, error: null, loading: false })
    })
  })
}))

const emptyInitialValues: AsgBlueGreenDeployStepInitialValues = {
  identifier: '',
  name: '',
  timeout: '',
  type: StepType.AsgBlueGreenDeploy,
  spec: {
    useAlreadyRunningInstances: false,
    loadBalancer: '',
    prodListener: '',
    prodListenerRuleArn: '',
    stageListener: '',
    stageListenerRuleArn: '',
    loadBalancers: [
      {
        loadBalancer: '',
        prodListener: '',
        prodListenerRuleArn: '',
        stageListener: '',
        stageListenerRuleArn: ''
      }
    ]
  }
}

const existingInitialValues: AsgBlueGreenDeployStepInitialValues = {
  identifier: 'Existing_Name',
  name: 'Existing Name',
  timeout: '30m',
  type: StepType.AsgBlueGreenDeploy,
  spec: {
    useAlreadyRunningInstances: false,
    loadBalancer: 'Load_Balancer_3',
    prodListener: 'abc-ghi-def',
    prodListenerRuleArn: 'Listener_Rule_2',
    stageListener: 'abc-def-ghi',
    stageListenerRuleArn: 'Listener_Rule_3',
    loadBalancers: [
      {
        loadBalancer: 'Load_Balancer_3',
        prodListener: 'abc-ghi-def',
        prodListenerRuleArn: 'Listener_Rule_2',
        stageListener: 'abc-def-ghi',
        stageListenerRuleArn: 'Listener_Rule_3'
      }
    ]
  }
}
const customStepProps: AsgBlueGreenDeployCustomStepProps = {
  stageIdentifier: 'Stage_1',
  selectedStage: {
    stage: {
      identifier: 'Stage_1',
      name: 'Stage 1',
      spec: {
        infrastructure: {
          environmentRef: 'Env_1',
          infrastructureDefinition: {
            type: 'Asg',
            spec: {
              connectorRef: 'testConnRef',
              region: 'region1'
            }
          }
        },
        execution: {
          steps: []
        }
      }
    }
  },
  variablesData: existingInitialValues,
  metadataMap: {
    'Step 1': {
      yamlProperties: {
        fqn: 'pipeline.stages.Stage_1.execution.steps.AsgBlueGreenDeploy.name',
        localName: 'step.AsgBlueGreenDeploy.name'
      }
    },
    '20m': {
      yamlProperties: {
        fqn: 'pipeline.stages.Stage_1.execution.steps.AsgBlueGreenDeploy.timeout',
        localName: 'step.AsgBlueGreenDeploy.timeout'
      }
    }
  }
}
const onUpdate = jest.fn()
const onChange = jest.fn()
const formikRef = React.createRef<StepFormikRef<AsgBlueGreenDeployStepInitialValues>>()

describe('GenericExecutionStepEdit tests', () => {
  beforeEach(() => {
    onUpdate.mockReset()
    onChange.mockReset()
  })

  test(`making load balancer Runtime input should make all the dependent field options list empty`, async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <AsgBlueGreenDeployStepEditRef
          initialValues={emptyInitialValues}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          readonly={false}
          stepViewType={StepViewType.Edit}
          onUpdate={onUpdate}
          onChange={onChange}
          ref={formikRef}
          customStepProps={customStepProps}
        />
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string) => queryByAttribute('name', container, name)

    const identifierEditIcon = queryByAttribute('data-icon', container, 'Edit')
    expect(identifierEditIcon).toBeInTheDocument()

    const nameInput = queryByNameAttribute('name') as HTMLInputElement
    expect(nameInput).toBeInTheDocument()
    expect(nameInput.value).toBe('')
    act((): void => {
      fireEvent.change(nameInput, { target: { value: 'Test Name' } })
    })
    expect(nameInput.value).toBe('Test Name')

    const timeoutInput = queryByNameAttribute('timeout') as HTMLInputElement
    expect(timeoutInput).toBeInTheDocument()
    expect(timeoutInput.value).toBe('')
    act(() => {
      fireEvent.change(timeoutInput, { target: { value: '20m' } })
    })
    expect(timeoutInput.value).toBe('20m')

    const dropdownIcons = container.querySelectorAll('[data-icon="chevron-down"]')
    expect(dropdownIcons.length).toBe(5)
    const fixedInputIcons = container.querySelectorAll('span[data-icon="fixed-input"]')
    expect(fixedInputIcons.length).toBe(10)
    let runtimeInputIcons = container.querySelectorAll('span[data-icon="runtime-input"]')
    expect(runtimeInputIcons.length).toBe(0)
    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)

    const loadBalancer = queryByNameAttribute('spec.loadBalancers[0].loadBalancer') as HTMLInputElement
    await waitFor(() => expect(loadBalancer).toBeInTheDocument())

    const loadBalancerProdListener = queryByNameAttribute('spec.loadBalancers[0].prodListener') as HTMLInputElement
    expect(loadBalancerProdListener).toBeInTheDocument()
    const loadBalancerProdListenerRuleArn = queryByNameAttribute(
      'spec.loadBalancers[0].prodListenerRuleArn'
    ) as HTMLInputElement
    expect(loadBalancerProdListenerRuleArn).toBeInTheDocument()

    const loadBalancerStageListener = queryByNameAttribute('spec.loadBalancers[0].stageListener') as HTMLInputElement
    expect(loadBalancerStageListener).toBeInTheDocument()

    const loadBalancerStageListenerRuleArn = queryByNameAttribute(
      'spec.loadBalancers[0].stageListenerRuleArn'
    ) as HTMLInputElement
    expect(loadBalancerStageListenerRuleArn).toBeInTheDocument()

    const loadBalancerFixedInputIcon = fixedInputIcons[4]
    userEvent.click(loadBalancerFixedInputIcon)
    await waitFor(() => expect(getByText('Runtime input')).toBeInTheDocument())
    await userEvent.click(getByText('Runtime input'))
    runtimeInputIcons = container.querySelectorAll('span[data-icon="runtime-input"]')
    await waitFor(() => expect(runtimeInputIcons.length).toBe(1))

    const loadBalancers = queryByNameAttribute('spec.loadBalancers') as HTMLInputElement
    await waitFor(() => expect(loadBalancers).toBeInTheDocument())

    await waitFor(() => expect(loadBalancers.value).toBe(RUNTIME_INPUT_VALUE))

    expect(loadBalancerProdListener).not.toBeInTheDocument()
    expect(loadBalancerProdListenerRuleArn).not.toBeInTheDocument()
    expect(loadBalancerStageListener).not.toBeInTheDocument()
    expect(loadBalancerStageListenerRuleArn).not.toBeInTheDocument()
  })

  test('identifier should not be editable when isNewStep is false', () => {
    const { container } = render(
      <TestWrapper>
        <AsgBlueGreenDeployStepEditRef
          initialValues={emptyInitialValues}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          isNewStep={false}
          readonly={false}
          stepViewType={StepViewType.Edit}
          onUpdate={onUpdate}
          onChange={onChange}
          ref={formikRef}
          customStepProps={customStepProps}
        />
      </TestWrapper>
    )
    const identifierEditIcon = queryByAttribute('data-icon', container, 'Edit')
    expect(identifierEditIcon).not.toBeInTheDocument()
  })

  test('onUpdate should not be called if it is not passed as prop', async () => {
    render(
      <TestWrapper>
        <AsgBlueGreenDeployStepEditRef
          initialValues={existingInitialValues}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          isNewStep={false}
          readonly={false}
          stepViewType={StepViewType.Edit}
          onChange={onChange}
          ref={formikRef}
          customStepProps={customStepProps}
        />
      </TestWrapper>
    )
    act(() => {
      formikRef.current?.submitForm()
    })
    await waitFor(() => expect(onUpdate).not.toHaveBeenCalled())
  })
})
