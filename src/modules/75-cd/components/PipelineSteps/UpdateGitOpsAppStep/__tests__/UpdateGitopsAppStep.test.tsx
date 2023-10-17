/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, render, waitFor, getByText as getByTextGlobal } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { queryByNameAttribute } from '@common/utils/testUtils'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { TestStepWidget, factory } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { mockApplicationResponse } from './data'
import { UpdateGitOpsApp } from '../UpdateGitOpsAppStep'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('services/gitops', () => ({
  useApplicationServiceListApps: jest.fn().mockImplementation(() => ({
    mutate: jest.fn(() => mockApplicationResponse),
    cancel: jest.fn()
  })),
  useAgentRepositoryServiceListRefs: jest.fn(() => ({
    data: [],
    loading: false,
    refetch: jest.fn()
  })),
  useAgentRepositoryServiceGetHelmCharts: jest.fn(() => ({
    data: [],
    loading: false,
    refetch: jest.fn()
  })),
  useAgentRepositoryServiceGetAppDetails: jest
    .fn()
    .mockImplementation(() => ({ loading: false, refetch: jest.fn(), data: undefined, cancel: jest.fn() }))
}))

describe('UpdateGitOpsAppStep tests', () => {
  beforeEach(() => {
    factory.registerStep(new UpdateGitOpsApp())
  })

  test('Edit view renders fine', async () => {
    const onUpdate = jest.fn()
    const onChange = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()

    const { container, getByText, getAllByText } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.UpdateGitOpsApp}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
        isNewStep={true}
      />
    )
    const nameInput = queryByNameAttribute('name', container)
    await userEvent.type(nameInput!, 'Step 1')
    await waitFor(() => expect(nameInput).toHaveDisplayValue('Step 1'))
    expect(getByText('Step_1')).toBeInTheDocument()

    const timeoutInput = queryByNameAttribute('timeout', container)
    await userEvent.clear(timeoutInput!)
    await userEvent.type(timeoutInput!, '30m')
    await waitFor(() => expect(timeoutInput).toHaveDisplayValue('30m'))

    const appNameOption = queryByNameAttribute('spec.applicationNameOption', container) as HTMLInputElement

    expect(appNameOption).toBeInTheDocument()
    expect(appNameOption.value).toBe('')
    await userEvent.click(appNameOption)
    await userEvent.click(getByTextGlobal(document.body, 'helmapp1 (agent1)'))
    expect(appNameOption.value).toBe('helmapp1 (agent1)')

    const targetRevisionField = queryByNameAttribute('spec.targetRevision', container) as HTMLInputElement

    expect(targetRevisionField).toBeInTheDocument()
    expect(targetRevisionField.value).toBe('sales-demo')

    const valuesFileField = queryByNameAttribute('spec.helm.valueFiles', container) as HTMLInputElement
    expect(valuesFileField).toBeInTheDocument()
    expect(valuesFileField.value).toBe('')

    const addParameterNodes = getAllByText('platform.connectors.addParameter')
    await userEvent.click(addParameterNodes[0])
    await userEvent.type(queryByNameAttribute('spec.helm.parameters[0].name', container)!, 'p1')
    await userEvent.type(queryByNameAttribute('spec.helm.parameters[0].value', container)!, 'v1')

    await userEvent.click(addParameterNodes[1])
    await userEvent.type(queryByNameAttribute('spec.helm.fileParameters[0].name', container)!, 'p2')
    await userEvent.type(queryByNameAttribute('spec.helm.fileParameters[0].value', container)!, 'v2')

    act(() => {
      ref.current?.submitForm()
    })
    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'Step_1',
        name: 'Step 1',
        timeout: '30m',
        type: StepType.UpdateGitOpsApp,
        spec: {
          agentId: 'agent1',
          applicationName: 'helmapp1',
          targetRevision: 'sales-demo',
          helm: {
            parameters: [
              {
                name: 'p1',
                value: 'v1'
              }
            ],
            fileParameters: [
              {
                name: 'p2',
                path: 'v2'
              }
            ],
            valueFiles: []
          }
        }
      })
    })
  })

  test('Edit view renders with initial values', async () => {
    const onUpdate = jest.fn()
    const onChange = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()

    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{
          identifier: 'Step_1',
          name: 'Step 1',
          timeout: '30m',
          type: StepType.UpdateGitOpsApp,
          spec: {
            agentId: 'agent1',
            applicationName: 'helmapp1',
            targetRevision: 'sales-demo',
            helm: {
              parameters: [
                {
                  name: 'p1',
                  value: 'v1'
                }
              ],
              fileParameters: [
                {
                  name: 'p2',
                  path: 'v2'
                }
              ],
              valueFiles: []
            }
          }
        }}
        type={StepType.UpdateGitOpsApp}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
        isNewStep={true}
      />
    )

    const nameInput = queryByNameAttribute('name', container)
    await waitFor(() => expect(nameInput).toHaveDisplayValue('Step 1'))
    expect(getByText('Step_1')).toBeInTheDocument()

    const timeoutInput = queryByNameAttribute('timeout', container)
    await waitFor(() => expect(timeoutInput).toHaveDisplayValue('30m'))

    const appNameOption = queryByNameAttribute('spec.applicationNameOption', container) as HTMLInputElement

    expect(appNameOption).toBeInTheDocument()
    expect(appNameOption.value).toBe('helmapp1 (agent1)')

    const targetRevisionField = queryByNameAttribute('spec.targetRevision', container) as HTMLInputElement
    expect(targetRevisionField).toBeInTheDocument()
    expect(targetRevisionField.value).toBe('sales-demo')

    const valuesFileField = queryByNameAttribute('spec.helm.valueFiles', container) as HTMLInputElement
    expect(valuesFileField).toBeInTheDocument()

    await waitFor(() =>
      expect(queryByNameAttribute('spec.helm.parameters[0].name', container)).toHaveDisplayValue('p1')
    )
    await waitFor(() =>
      expect(queryByNameAttribute('spec.helm.parameters[0].value', container)).toHaveDisplayValue('v1')
    )
    await waitFor(() =>
      expect(queryByNameAttribute('spec.helm.fileParameters[0].name', container)).toHaveDisplayValue('p2')
    )
    await waitFor(() =>
      expect(queryByNameAttribute('spec.helm.fileParameters[0].value', container)).toHaveDisplayValue('v2')
    )
  })

  test('Input Set render fine', async () => {
    const onUpdate = jest.fn()
    const onChange = jest.fn()

    const { container, getByText, getAllByText } = render(
      <TestStepWidget
        initialValues={{
          identifier: 'Step_1',
          name: 'Step 1',
          timeout: '',
          type: StepType.UpdateGitOpsApp,
          spec: {}
        }}
        type={StepType.UpdateGitOpsApp}
        template={{
          identifier: 'Step_1',
          name: 'Step 1',
          timeout: RUNTIME_INPUT_VALUE,
          spec: {
            applicationName: RUNTIME_INPUT_VALUE,
            agentId: RUNTIME_INPUT_VALUE
          },
          type: StepType.UpdateGitOpsApp
        }}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdate}
        onChange={onChange}
      />
    )

    const submitBtn = getByText('Submit')
    const timeoutInput = queryByNameAttribute('timeout', container)
    expect(timeoutInput).toBeVisible()
    await userEvent.type(timeoutInput!, '20m')

    const appNameOption = queryByNameAttribute('spec.applicationNameOption', container) as HTMLInputElement

    expect(appNameOption).toBeInTheDocument()
    expect(appNameOption.value).toBe('')
    await userEvent.click(appNameOption)
    await userEvent.click(getByTextGlobal(document.body, 'helmapp1 (agent1)'))
    expect(appNameOption.value).toBe('helmapp1 (agent1)')

    const targetRevisionField = queryByNameAttribute('spec.targetRevision', container) as HTMLInputElement
    expect(targetRevisionField).toBeInTheDocument()
    expect(targetRevisionField.value).toBe('')
    await userEvent.type(targetRevisionField!, 'main-revision')
    expect(targetRevisionField.value).toBe('main-revision')

    const addParameterNodes = getAllByText('platform.connectors.addParameter')
    await userEvent.click(addParameterNodes[0])
    await userEvent.type(queryByNameAttribute('spec.helm.parameters[0].name', container)!, 'p1')
    await userEvent.type(queryByNameAttribute('spec.helm.parameters[0].value', container)!, 'v1')

    await userEvent.click(addParameterNodes[1])
    await userEvent.type(queryByNameAttribute('spec.helm.fileParameters[0].name', container)!, 'p2')
    await userEvent.type(queryByNameAttribute('spec.helm.fileParameters[0].value', container)!, 'v2')
    await userEvent.click(submitBtn)

    await userEvent.click(submitBtn)
    await waitFor(() => expect(onUpdate).toHaveBeenCalled())
  })

  test('Variable View', async () => {
    const onUpdate = jest.fn()
    const onChange = jest.fn()

    const { getByText } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.UpdateGitOpsApp}
        stepViewType={StepViewType.InputVariable}
        onUpdate={onUpdate}
        onChange={onChange}
        isNewStep={true}
      />
    )
    expect(getByText('StepViewType.InputVariable')).toBeInTheDocument()
  })
})
