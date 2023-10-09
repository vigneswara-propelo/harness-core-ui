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
import { ECSServiceSetupStep } from '../ECSServiceSetupStep'

factory.registerStep(new ECSServiceSetupStep())

const onUpdate = jest.fn()
const onChange = jest.fn()

describe('ECSServiceSetupStepInputSet tests', () => {
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
            sameAsAlreadyRunningInstances: false
          },
          type: StepType.EcsServiceSetup
        }}
        template={{
          identifier: 'Step_1',
          name: 'Step 1',
          timeout: RUNTIME_INPUT_VALUE,
          spec: {
            sameAsAlreadyRunningInstances: RUNTIME_INPUT_VALUE
          },
          type: StepType.EcsServiceSetup
        }}
        type={StepType.EcsServiceSetup}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdate}
      />
    )

    const submitBtn = getByText('Submit')
    const timeoutInput = queryByNameAttribute('timeout', container)
    expect(timeoutInput).toBeVisible()
    await userEvent.type(timeoutInput!, '20m')

    const sameAsAlreadyRunningInstancesCheckbox = queryByNameAttribute(
      'spec.sameAsAlreadyRunningInstances',
      container
    ) as HTMLInputElement
    await userEvent.click(sameAsAlreadyRunningInstancesCheckbox)

    await userEvent.click(submitBtn)
    await waitFor(() => expect(onUpdate).toHaveBeenCalled())
    expect(onUpdate).toHaveBeenCalledWith({
      identifier: 'Step_1',
      name: 'Step 1',
      timeout: '20m',
      type: StepType.EcsServiceSetup,
      spec: {
        sameAsAlreadyRunningInstances: true
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
            sameAsAlreadyRunningInstances: false
          },
          type: StepType.EcsServiceSetup
        }}
        type={StepType.EcsServiceSetup}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdate}
      />
    )

    const timeoutInput = queryByNameAttribute('timeout', container)
    expect(timeoutInput).not.toBeInTheDocument()

    const sameAsAlreadyRunningInstancesCheckbox = queryByNameAttribute(
      'spec.sameAsAlreadyRunningInstances',
      container
    ) as HTMLInputElement
    expect(sameAsAlreadyRunningInstancesCheckbox).not.toBeInTheDocument()
  })
})
