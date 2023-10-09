/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'

import { queryByNameAttribute } from '@common/utils/testUtils'
import { TestStepWidget, factory } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { ECSUpgradeContainerStep } from '../ECSUpgradeContainerStep'

factory.registerStep(new ECSUpgradeContainerStep())

const onUpdate = jest.fn()
const onChange = jest.fn()

describe('ECSUpgradeContainerStepInputSet tests', () => {
  beforeEach(() => {
    onUpdate.mockReset()
    onChange.mockReset()
  })

  test('it should render InputSet view with expected number of fields', async () => {
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{
          identifier: 'Step_1',
          name: 'Step 1',
          timeout: '',
          spec: {
            newServiceInstanceCount: 60,
            downsizeOldServiceInstanceCount: 50
          },
          type: StepType.EcsUpgradeContainer
        }}
        template={{
          identifier: 'Step_1',
          name: 'Step 1',
          timeout: RUNTIME_INPUT_VALUE,
          spec: {
            newServiceInstanceCount: RUNTIME_INPUT_VALUE,
            downsizeOldServiceInstanceCount: RUNTIME_INPUT_VALUE
          },
          type: StepType.EcsUpgradeContainer
        }}
        type={StepType.EcsUpgradeContainer}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdate}
      />
    )

    const submitBtn = getByText('Submit')
    const timeoutInput = queryByNameAttribute('timeout', container)
    expect(timeoutInput).toBeVisible()
    await userEvent.type(timeoutInput!, '20m')

    const newServiceInstanceCountInput = queryByNameAttribute(
      'spec.newServiceInstanceCount',
      container
    ) as HTMLInputElement
    expect(newServiceInstanceCountInput).toBeInTheDocument()
    expect(newServiceInstanceCountInput.value).toBe('60')
    userEvent.clear(newServiceInstanceCountInput)
    await userEvent.type(newServiceInstanceCountInput!, '70')
    expect(newServiceInstanceCountInput.value).toBe('70')

    const downsizeOldServiceInstanceCountInput = queryByNameAttribute(
      'spec.downsizeOldServiceInstanceCount',
      container
    ) as HTMLInputElement
    expect(downsizeOldServiceInstanceCountInput).toBeInTheDocument()
    expect(downsizeOldServiceInstanceCountInput.value).toBe('50')
    userEvent.clear(downsizeOldServiceInstanceCountInput)
    await userEvent.type(downsizeOldServiceInstanceCountInput!, '30')
    expect(downsizeOldServiceInstanceCountInput.value).toBe('30')

    await userEvent.click(submitBtn)
    await waitFor(() => expect(onUpdate).toHaveBeenCalled())
    expect(onUpdate).toHaveBeenCalledWith({
      identifier: 'Step_1',
      name: 'Step 1',
      timeout: '20m',
      type: StepType.EcsUpgradeContainer,
      spec: {
        newServiceInstanceCount: 70,
        downsizeOldServiceInstanceCount: 30
      }
    })
  })

  test('it should not render any fields when template is not passed as prop', async () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          identifier: 'Step_1',
          name: 'Step 1',
          timeout: '',
          spec: {
            newServiceInstanceCount: 60,
            downsizeOldServiceInstanceCount: 40
          },
          type: StepType.EcsUpgradeContainer
        }}
        type={StepType.EcsUpgradeContainer}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdate}
      />
    )

    const timeoutInput = queryByNameAttribute('timeout', container)
    expect(timeoutInput).not.toBeInTheDocument()

    const newServiceInstanceCountInput = queryByNameAttribute(
      'spec.newServiceInstanceCount',
      container
    ) as HTMLInputElement
    expect(newServiceInstanceCountInput).not.toBeInTheDocument()

    const downsizeOldServiceInstanceCountInput = queryByNameAttribute(
      'spec.downsizeOldServiceInstanceCount',
      container
    ) as HTMLInputElement
    expect(downsizeOldServiceInstanceCountInput).not.toBeInTheDocument()
  })
})
