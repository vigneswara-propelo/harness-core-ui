/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'

import { queryByNameAttribute } from '@common/utils/testUtils'
import { TestStepWidget, factory } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { AsgBlueGreenDeployStep } from '../AsgBlueGreenDeployStep'
import { elasticLoadBalancersResponse, listenerRulesList, listenersResponse } from './helpers/mocks'

const fetchListeners = jest.fn().mockReturnValue(listenersResponse)
const fetchLoadBalancers = jest.fn(_arg => Promise.resolve(elasticLoadBalancersResponse))
jest.mock('services/cd-ng', () => ({
  useElasticLoadBalancers: jest.fn().mockImplementation(arg => {
    return {
      data: elasticLoadBalancersResponse,
      error: null,
      loading: false,
      refetch: () => fetchLoadBalancers(arg)
    }
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

factory.registerStep(new AsgBlueGreenDeployStep())

const onUpdate = jest.fn()
const onChange = jest.fn()

describe('AsgBlueGreenDeploy tests', () => {
  beforeEach(() => {
    onUpdate.mockReset()
    onChange.mockReset()
    fetchLoadBalancers.mockReset()
  })
  test('Edit view - validation errors should appear for required fields', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container, getByText, getAllByText, findByTestId, findAllByText } = render(
      <TestStepWidget
        testWrapperProps={{ defaultFeatureFlagValues: { NG_SVC_ENV_REDESIGN: true } }}
        initialValues={{}}
        type={StepType.AsgBlueGreenDeploy}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
        stepViewType={StepViewType.Edit}
        isNewStep={true}
        customStepProps={{
          selectedStage: {
            stage: {
              spec: {
                environment: {
                  environmentRef: 'Env_1',
                  infrastructureDefinitions: [
                    {
                      identifier: 'Infra_Def_1'
                    }
                  ]
                }
              }
            }
          }
        }}
      />
    )

    const nameInput = queryByNameAttribute('name', container)
    expect(nameInput).toBeInTheDocument()
    const timeoutInput = queryByNameAttribute('timeout', container)
    expect(timeoutInput).toBeInTheDocument()
    const addBalancerBtn = await findByTestId('add-aws-loadbalance')
    expect(addBalancerBtn).toBeInTheDocument()
    userEvent.click(addBalancerBtn)
    const asgLabel = await findAllByText('cd.asgLoadBalancer')
    expect(asgLabel[0]).toBeInTheDocument()

    act(() => {
      ref.current?.submitForm()
    })
    await waitFor(() => expect(onUpdate).not.toHaveBeenCalled())
    const loadBalancerSelectFirst = queryByNameAttribute(
      'spec.loadBalancers[0].loadBalancer',
      container
    ) as HTMLInputElement
    expect(loadBalancerSelectFirst).toBeInTheDocument()
    const loadBalancerSelectSecond = queryByNameAttribute(
      'spec.loadBalancers[1].loadBalancer',
      container
    ) as HTMLInputElement
    expect(loadBalancerSelectSecond).toBeInTheDocument()
    const prodListenerSelectFirst = queryByNameAttribute(
      'spec.loadBalancers[0].prodListener',
      container
    ) as HTMLInputElement
    expect(prodListenerSelectFirst).toBeInTheDocument()
    const prodListenerRuleSelectFirst = queryByNameAttribute(
      'spec.loadBalancers[0].prodListenerRuleArn',
      container
    ) as HTMLInputElement
    expect(prodListenerRuleSelectFirst).toBeInTheDocument()
    const stageListenerSelectFirst = queryByNameAttribute(
      'spec.loadBalancers[0].stageListener',
      container
    ) as HTMLInputElement
    expect(stageListenerSelectFirst).toBeInTheDocument()
    const stageListenerRuleSelectFirst = queryByNameAttribute(
      'spec.loadBalancers[0].stageListenerRuleArn',
      container
    ) as HTMLInputElement
    expect(stageListenerRuleSelectFirst).toBeInTheDocument()
    const prodListenerSelectSecond = queryByNameAttribute(
      'spec.loadBalancers[1].prodListener',
      container
    ) as HTMLInputElement
    expect(prodListenerSelectSecond).toBeInTheDocument()
    const prodListenerRuleSelectSecond = queryByNameAttribute(
      'spec.loadBalancers[1].prodListenerRuleArn',
      container
    ) as HTMLInputElement
    expect(prodListenerRuleSelectSecond).toBeInTheDocument()
    const stageListenerSelectSecond = queryByNameAttribute(
      'spec.loadBalancers[1].stageListener',
      container
    ) as HTMLInputElement
    expect(stageListenerSelectSecond).toBeInTheDocument()
    const stageListenerRuleSelectSecond = queryByNameAttribute(
      'spec.loadBalancers[1].stageListenerRuleArn',
      container
    ) as HTMLInputElement
    expect(stageListenerRuleSelectSecond).toBeInTheDocument()

    expect(getByText('pipelineSteps.stepNameRequired')).toBeInTheDocument()
    expect(getAllByText('common.validation.fieldIsRequired')).toHaveLength(10)
  })

  test('DeploymentForm view renders fine when Service / Env V2 FF is OFF', async () => {
    const { container, getByText, findByText, debug, findAllByText } = render(
      <TestStepWidget
        testWrapperProps={{ defaultFeatureFlagValues: { NG_SVC_ENV_REDESIGN: false } }}
        initialValues={{
          identifier: 'Step_1',
          name: 'Step 1',
          timeout: '',
          spec: {
            loadBalancers: [
              {
                loadBalancer: '',
                prodListener: '',
                prodListenerRuleArn: '',
                stageListener: '',
                stageListenerRuleArn: ''
              }
            ]
          },
          type: StepType.AsgBlueGreenDeploy
        }}
        template={{
          identifier: 'Step_1',
          name: 'Step 1',
          timeout: RUNTIME_INPUT_VALUE,
          spec: {
            loadBalancers: RUNTIME_INPUT_VALUE
          },
          type: StepType.AsgBlueGreenDeploy
        }}
        type={StepType.AsgBlueGreenDeploy}
        stepViewType={StepViewType.DeploymentForm}
        onUpdate={onUpdate}
        customStepProps={{
          selectedStage: {
            stage: {
              spec: {
                environment: {
                  infrastructureDefinitions: [{ identifier: 'id1' }],
                  environmentRef: 'ide1'
                },
                infrastructure: {
                  environmentRef: 'Env_1',
                  infrastructureDefinition: {
                    spec: {
                      connectorRef: 'testConnRef',
                      region: 'region1'
                    }
                  }
                }
              }
            }
          }
        }}
      />
    )

    const submitBtn = getByText('Submit')
    const timeoutInput = queryByNameAttribute('timeout', container)
    expect(timeoutInput).toBeVisible()

    await userEvent.click(submitBtn)
    await waitFor(() => expect(getByText('validation.timeout10SecMinimum')).toBeInTheDocument())
    expect(onUpdate).not.toHaveBeenCalled()
    await userEvent.type(timeoutInput!, '20m')
    const asgLabel = await findAllByText('cd.asgLoadBalancer')
    expect(asgLabel[0]).toBeInTheDocument()
    await userEvent.click(asgLabel[0])

    const dropdownIcons = container.querySelectorAll('[data-icon="chevron-down"]')
    expect(dropdownIcons.length).toBe(5)
    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)

    const loadBalancerSelect = queryByNameAttribute('spec.loadBalancers[0].loadBalancer', container) as HTMLInputElement
    expect(loadBalancerSelect).toBeInTheDocument()
    const loadBalancerDropdownIcon = dropdownIcons[0].parentElement
    await userEvent.click(loadBalancerDropdownIcon!)
    await waitFor(() => expect(portalDivs.length).toBe(1))
    const loadBalancerOption1 = await findAllByText('Load_Balancer_1')
    expect(loadBalancerOption1[0]).toBeInTheDocument()

    await userEvent.click(loadBalancerOption1[0])

    const prodListenerSelect = queryByNameAttribute('spec.loadBalancers[0].prodListener', container) as HTMLInputElement

    expect(prodListenerSelect).toBeInTheDocument()
    const prodListenerRuleSelect = queryByNameAttribute(
      'spec.loadBalancers[0].prodListenerRuleArn',
      container
    ) as HTMLInputElement
    await userEvent.click(prodListenerSelect)

    await waitFor(() => expect(portalDivs.length).toBe(1))
    const listenerOption1 = await findByText('HTTP 80')
    expect(listenerOption1).toBeInTheDocument()
    await userEvent.click(listenerOption1)

    await userEvent.click(prodListenerRuleSelect!)
    const listenerRuleOption1 = await findAllByText('Listener_Rule_2')
    expect(listenerRuleOption1[0]).toBeInTheDocument()
    await userEvent.click(listenerRuleOption1[0])

    const stageListenerSelect = queryByNameAttribute(
      'spec.loadBalancers[0].stageListener',
      container
    ) as HTMLInputElement
    const stageListenerRuleSelect = queryByNameAttribute(
      'spec.loadBalancers[0].stageListenerRuleArn',
      container
    ) as HTMLInputElement
    await userEvent.click(stageListenerSelect!)
    const listenerOption2 = await findByText('HTTP 81')
    expect(listenerOption2).toBeInTheDocument()
    await userEvent.click(listenerOption2)
    await waitFor(() => expect(stageListenerRuleSelect.value).toBe(''))
    await userEvent.click(stageListenerRuleSelect!)
    await waitFor(() => expect(portalDivs.length).toBe(4))
    const listenerRuleOption2 = await findByText('Listener_Rule_2')
    expect(listenerRuleOption2).toBeInTheDocument()
    await userEvent.click(listenerRuleOption2)
    debug(stageListenerRuleSelect)

    await userEvent.click(submitBtn)
    await waitFor(() => expect(onUpdate).toHaveBeenCalled())
    expect(onUpdate).toHaveBeenCalledWith({
      identifier: 'Step_1',
      name: 'Step 1',
      timeout: '20m',
      spec: {
        loadBalancers: [
          {
            loadBalancer: 'Load_Balancer_1',
            prodListener: 'abc-def-ghi',
            prodListenerRuleArn: 'Listener_Rule_2',
            stageListener: 'abc-ghi-def',
            stageListenerRuleArn: 'Listener_Rule_2'
          }
        ]
      },
      type: StepType.AsgBlueGreenDeploy
    })
  })

  test('errors are set properly when stepViewType is DeploymentForm and Service / Env V2 FF is OFF', async () => {
    const { container, getByText, getAllByText } = render(
      <TestStepWidget
        testWrapperProps={{ defaultFeatureFlagValues: { NG_SVC_ENV_REDESIGN: false } }}
        initialValues={{
          identifier: 'Step_1',
          name: 'Step 1',
          timeout: '',
          spec: {
            instances: {
              type: 'Fixed',
              spec: {
                desired: 1,
                max: 1,
                min: 1
              }
            },
            loadBalancers: [
              {
                loadBalancer: '',
                prodListener: '',
                prodListenerRuleArn: '',
                stageListener: '',
                stageListenerRuleArn: ''
              }
            ]
          },
          type: StepType.AsgBlueGreenDeploy
        }}
        template={{
          identifier: 'Step_1',
          name: 'Step 1',
          timeout: RUNTIME_INPUT_VALUE,
          spec: {
            loadBalancers: RUNTIME_INPUT_VALUE
          },
          type: StepType.AsgBlueGreenDeploy
        }}
        type={StepType.AsgBlueGreenDeploy}
        stepViewType={StepViewType.DeploymentForm}
        onUpdate={onUpdate}
        customStepProps={{
          selectedStage: {
            stage: {
              spec: {
                infrastructure: {
                  environmentRef: 'Env_1',
                  infrastructureDefinition: {
                    spec: {
                      connectorRef: 'testConnRef',
                      region: 'region1'
                    }
                  }
                }
              }
            }
          }
        }}
      />
    )

    const submitBtn = getByText('Submit')
    const timeoutInput = queryByNameAttribute('timeout', container)
    expect(timeoutInput).toBeVisible()

    await userEvent.click(submitBtn)
    expect(onUpdate).not.toHaveBeenCalled()

    await waitFor(() => expect(getByText('validation.timeout10SecMinimum')).toBeInTheDocument())
    expect(getAllByText('common.validation.fieldIsRequired')).toHaveLength(5)

    await userEvent.type(timeoutInput!, '20m')
  })

  test('InputSet view renders fine when Service / Env V2 FF is ON', async () => {
    const { container, getByText, findByText } = render(
      <TestStepWidget
        testWrapperProps={{ defaultFeatureFlagValues: { NG_SVC_ENV_REDESIGN: true } }}
        initialValues={{
          identifier: 'Step_1',
          name: 'Step 1',
          timeout: '',
          spec: {
            loadBalancers: [
              {
                loadBalancer: 'Load_Balancer_2',
                prodListener: 'abc-ghi-def',
                prodListenerRuleArn: '',
                stageListener: 'abc-def-ghi',
                stageListenerRuleArn: ''
              }
            ],
            instances: {
              type: 'Fixed',
              spec: {
                desired: 1,
                max: 1,
                min: 1
              }
            }
          },
          type: StepType.AsgBlueGreenDeploy
        }}
        template={{
          identifier: 'Step_1',
          name: 'Step 1',
          timeout: RUNTIME_INPUT_VALUE,
          spec: {
            loadBalancers: RUNTIME_INPUT_VALUE
          },
          type: StepType.AsgBlueGreenDeploy
        }}
        type={StepType.AsgBlueGreenDeploy}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdate}
        customStepProps={{
          selectedStage: {
            stage: {
              spec: {
                environment: {
                  environmentRef: 'Env_1',
                  infrastructureDefinitions: [
                    {
                      identifier: 'Infra_Def_1'
                    }
                  ]
                }
              }
            }
          }
        }}
      />
    )

    const submitBtn = getByText('Submit')
    const timeoutInput = queryByNameAttribute('timeout', container)
    expect(timeoutInput).toBeVisible()
    await userEvent.type(timeoutInput!, '20m')

    const dropdownIcons = container.querySelectorAll('[data-icon="chevron-down"]')
    expect(dropdownIcons.length).toBe(5)
    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)

    const loadBalancerSelect = queryByNameAttribute('spec.loadBalancers[0].loadBalancer', container) as HTMLInputElement
    await userEvent.click(loadBalancerSelect!)

    await waitFor(() => expect(fetchLoadBalancers).toHaveBeenCalledTimes(1))
    expect(fetchLoadBalancers).toHaveBeenCalledWith({
      lazy: false,
      queryParams: {
        accountIdentifier: undefined,
        envId: 'Env_1',
        infraDefinitionId: 'Infra_Def_1',
        orgIdentifier: undefined,
        projectIdentifier: undefined
      }
    })

    await waitFor(() => expect(portalDivs.length).toBe(1))
    const loadBalancerOption1 = await findByText('Load_Balancer_1')
    expect(loadBalancerOption1).toBeInTheDocument()
    await userEvent.click(loadBalancerOption1)

    const prodListenerSelect = queryByNameAttribute('spec.loadBalancers[0].prodListener', container) as HTMLInputElement
    const prodListenerRuleSelect = queryByNameAttribute(
      'spec.loadBalancers[0].prodListenerRuleArn',
      container
    ) as HTMLInputElement
    await userEvent.click(prodListenerSelect!)
    await waitFor(() => expect(portalDivs.length).toBe(1))
    const listenerOption1 = await findByText('HTTP 80')
    expect(listenerOption1).toBeInTheDocument()
    await userEvent.click(listenerOption1)
    await waitFor(() => expect(prodListenerRuleSelect.value).toBe(''))

    await userEvent.click(prodListenerRuleSelect!)
    await waitFor(() => expect(portalDivs.length).toBe(2))
    const listenerRuleOption1 = await findByText('Listener_Rule_1')
    expect(listenerRuleOption1).toBeInTheDocument()
    await userEvent.click(listenerRuleOption1)

    const stageListenerSelect = queryByNameAttribute(
      'spec.loadBalancers[0].stageListener',
      container
    ) as HTMLInputElement
    const stageListenerRuleSelect = queryByNameAttribute(
      'spec.loadBalancers[0].stageListenerRuleArn',
      container
    ) as HTMLInputElement
    await userEvent.click(stageListenerSelect!)
    await waitFor(() => expect(portalDivs.length).toBe(3))
    const listenerOption2 = await findByText('HTTP 81')
    expect(listenerOption2).toBeInTheDocument()
    await userEvent.click(listenerOption2)
    await waitFor(() => expect(stageListenerRuleSelect.value).toBe(''))

    await userEvent.click(stageListenerRuleSelect!)
    await waitFor(() => expect(portalDivs.length).toBe(4))
    const listenerRuleOption2 = await findByText('Listener_Rule_2')
    expect(listenerRuleOption2).toBeInTheDocument()
    await userEvent.click(listenerRuleOption2)

    await userEvent.click(submitBtn)
    await waitFor(() => expect(onUpdate).toHaveBeenCalled())
    expect(onUpdate).toHaveBeenCalledWith({
      identifier: 'Step_1',
      name: 'Step 1',
      timeout: '20m',
      spec: {
        loadBalancers: [
          {
            loadBalancer: 'Load_Balancer_1',
            prodListener: 'abc-def-ghi',
            prodListenerRuleArn: 'Listener_Rule_1',
            stageListener: 'abc-ghi-def',
            stageListenerRuleArn: 'Listener_Rule_2'
          }
        ],
        instances: {
          type: 'Fixed',
          spec: {
            desired: 1,
            max: 1,
            min: 1
          }
        }
      },
      type: StepType.AsgBlueGreenDeploy
    })
  })

  test('InputSet view - validation errors should appear for required fields', async () => {
    const { container, getByText, getAllByText } = render(
      <TestStepWidget
        testWrapperProps={{ defaultFeatureFlagValues: { NG_SVC_ENV_REDESIGN: true } }}
        initialValues={{
          identifier: 'Step_1',
          name: 'Step 1',
          timeout: '',
          spec: {
            loadBalancers: [
              {
                loadBalancer: '',
                prodListener: '',
                prodListenerRuleArn: '',
                stageListener: '',
                stageListenerRuleArn: ''
              }
            ]
          },
          type: StepType.AsgBlueGreenDeploy
        }}
        template={{
          identifier: 'Step_1',
          name: 'Step 1',
          timeout: RUNTIME_INPUT_VALUE,
          spec: {
            loadBalancers: RUNTIME_INPUT_VALUE
          },
          type: StepType.AsgBlueGreenDeploy
        }}
        type={StepType.AsgBlueGreenDeploy}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdate}
        customStepProps={{
          selectedStage: {
            stage: {
              spec: {
                environment: {
                  environmentRef: 'Env_1',
                  infrastructureDefinitions: [
                    {
                      identifier: 'Infra_Def_1'
                    }
                  ]
                }
              }
            }
          }
        }}
      />
    )

    const timeoutInput = queryByNameAttribute('timeout', container)
    expect(timeoutInput).toBeInTheDocument()
    const loadBalancerSelect = queryByNameAttribute('spec.loadBalancers[0].loadBalancer', container) as HTMLInputElement
    expect(loadBalancerSelect).toBeInTheDocument()
    const prodListenerSelect = queryByNameAttribute('spec.loadBalancers[0].prodListener', container) as HTMLInputElement
    expect(prodListenerSelect).toBeInTheDocument()
    const prodListenerRuleSelect = queryByNameAttribute(
      'spec.loadBalancers[0].prodListenerRuleArn',
      container
    ) as HTMLInputElement
    expect(prodListenerRuleSelect).toBeInTheDocument()
    const stageListenerSelect = queryByNameAttribute(
      'spec.loadBalancers[0].stageListener',
      container
    ) as HTMLInputElement
    expect(stageListenerSelect).toBeInTheDocument()
    const stageListenerRuleSelect = queryByNameAttribute(
      'spec.loadBalancers[0].stageListenerRuleArn',
      container
    ) as HTMLInputElement
    expect(stageListenerRuleSelect).toBeInTheDocument()

    const submitBtn = getByText('Submit')
    await userEvent.click(submitBtn)
    await waitFor(() => expect(onUpdate).not.toHaveBeenCalled())
    await waitFor(() => expect(getByText('validation.timeout10SecMinimum')).toBeInTheDocument())
    expect(getAllByText('common.validation.fieldIsRequired')).toHaveLength(5)
  })

  test('it should make load balancers API call in runtime view when Env and Infra are marked as Runtime inputs in pipeline', async () => {
    const initialValues = {
      stages: [
        {
          stage: {
            identifier: 'Stage_1',
            name: 'Stage',
            spec: {
              service: {
                serviceRef: 'Service_1'
              },
              environment: {
                environmentRef: 'Asg_Env_1',
                infrastructureDefinitions: [{ identifier: 'Asg_Infra_1' }]
              },
              execution: {
                steps: [
                  {
                    step: {
                      identifier: 'Step_1',
                      name: 'Step 1',
                      timeout: '10m',
                      spec: {
                        useAlreadyRunningInstances: false,

                        loadBalancers: [
                          {
                            loadBalancer: 'Load_Balancer_2',
                            prodListener: 'abc-ghi-def',
                            prodListenerRuleArn: '',
                            stageListener: 'abc-def-ghi',
                            stageListenerRuleArn: ''
                          }
                        ]
                      },
                      type: StepType.AsgBlueGreenDeploy
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    }
    const { container, findByText } = render(
      <TestStepWidget
        testWrapperProps={{ defaultFeatureFlagValues: { NG_SVC_ENV_REDESIGN: true } }}
        initialValues={initialValues}
        template={{
          identifier: 'Step_1',
          name: 'Step 1',
          timeout: '10m',
          spec: {
            useAlreadyRunningInstances: RUNTIME_INPUT_VALUE,

            loadBalancers: RUNTIME_INPUT_VALUE
          },
          type: StepType.AsgBlueGreenDeploy
        }}
        type={StepType.AsgBlueGreenDeploy}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdate}
        customStepProps={{
          stageIdentifier: 'Stage_1',
          selectedStage: {
            stage: {
              spec: {
                environment: {
                  environmentRef: RUNTIME_INPUT_VALUE,
                  infrastructureDefinitions: [
                    {
                      identifier: RUNTIME_INPUT_VALUE
                    }
                  ]
                }
              }
            }
          }
        }}
      />
    )

    const dropdownIcons = container.querySelectorAll('[data-icon="chevron-down"]')
    expect(dropdownIcons.length).toBe(5)
    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)

    const loadBalancerSelect = queryByNameAttribute('spec.loadBalancers[0].loadBalancer', container) as HTMLInputElement
    await userEvent.click(loadBalancerSelect!)

    await waitFor(() => expect(fetchLoadBalancers).toHaveBeenCalledTimes(1))
    expect(fetchLoadBalancers).toHaveBeenCalledWith({
      lazy: false,
      queryParams: {
        accountIdentifier: undefined,
        envId: 'Asg_Env_1',
        infraDefinitionId: 'Asg_Infra_1',
        orgIdentifier: undefined,
        projectIdentifier: undefined
      }
    })

    await waitFor(() => expect(portalDivs.length).toBe(1))
    const loadBalancerOption1 = await findByText('Load_Balancer_1')
    expect(loadBalancerOption1).toBeInTheDocument()
  })
})
