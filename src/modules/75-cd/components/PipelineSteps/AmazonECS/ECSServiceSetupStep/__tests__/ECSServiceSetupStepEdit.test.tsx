/*
 * Copyright 2023 Harness Inc. All rights reserved.
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
import type { ECSServiceSetupStepElementConfig } from '@pipeline/utils/types'
import { ECSServiceSetupStepEditRef } from '../ECSServiceSetupStepEdit'

const emptyInitialValues: ECSServiceSetupStepElementConfig = {
  identifier: '',
  name: '',
  timeout: '',
  type: StepType.EcsServiceSetup,
  spec: {}
}
const existingInitialValues: ECSServiceSetupStepElementConfig = {
  identifier: 'Existing_Name',
  name: 'Existing Name',
  timeout: '30m',
  type: StepType.EcsServiceSetup,
  spec: {
    resizeStrategy: 'RESIZE_NEW_FIRST',
    sameAsAlreadyRunningInstances: false
  }
}
const runtimeInitialValues: ECSServiceSetupStepElementConfig = {
  identifier: 'Existing_Name',
  name: 'Existing Name',
  timeout: RUNTIME_INPUT_VALUE,
  type: StepType.EcsServiceSetup,
  spec: {
    sameAsAlreadyRunningInstances: RUNTIME_INPUT_VALUE
  }
}

const onUpdate = jest.fn()
const onChange = jest.fn()
const formikRef = React.createRef<StepFormikRef<ECSServiceSetupStepElementConfig>>()

describe('ECSServiceSetupStepEdit tests', () => {
  beforeEach(() => {
    onUpdate.mockReset()
    onChange.mockReset()
  })

  test(`renders fine for empty values and values can be changed`, async () => {
    const { container, findByText } = render(
      <TestWrapper>
        <ECSServiceSetupStepEditRef
          initialValues={emptyInitialValues}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          readonly={false}
          stepViewType={StepViewType.Edit}
          onUpdate={onUpdate}
          onChange={onChange}
          ref={formikRef}
        />
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    const identifierEditIcon = queryByAttribute('data-icon', container, 'Edit')
    expect(identifierEditIcon).toBeInTheDocument()

    const nameInput = queryByNameAttribute('name') as HTMLInputElement
    expect(nameInput).toBeInTheDocument()
    expect(nameInput.value).toBe('')
    act((): void => {
      fireEvent.change(nameInput, { target: { value: 'Test Name' } })
    })
    expect(nameInput.value).toBe('Test Name')

    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith({
        identifier: 'Test_Name',
        name: 'Test Name',
        timeout: '',
        type: StepType.EcsServiceSetup,
        spec: {}
      })
    )

    const timeoutInput = queryByNameAttribute('timeout') as HTMLInputElement
    expect(timeoutInput).toBeInTheDocument()
    expect(timeoutInput.value).toBe('')
    act(() => {
      fireEvent.change(timeoutInput, { target: { value: '20m' } })
    })
    expect(timeoutInput.value).toBe('20m')

    const dropdownIcons = container.querySelectorAll('[data-icon="chevron-down"]')
    expect(dropdownIcons.length).toBe(1)
    const resizeStrategySelect = queryByNameAttribute('spec.resizeStrategy') as HTMLInputElement
    const resizeStrategyDropdownIcon = dropdownIcons[0].parentElement
    await userEvent.click(resizeStrategyDropdownIcon!)
    const resizeNewFirstOption = await findByText('cd.steps.ecsServiceSetupStep.resizeNewFirst')
    expect(resizeNewFirstOption).toBeInTheDocument()
    await userEvent.click(resizeNewFirstOption)
    await waitFor(() => expect(resizeStrategySelect.value).toBe('cd.steps.ecsServiceSetupStep.resizeNewFirst'))

    const sameAsAlreadyRunningInstancesCheckbox = queryByNameAttribute(
      'spec.sameAsAlreadyRunningInstances'
    ) as HTMLInputElement
    await userEvent.click(sameAsAlreadyRunningInstancesCheckbox)

    act(() => {
      formikRef.current?.submitForm()
    })
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'Test_Name',
        name: 'Test Name',
        timeout: '20m',
        spec: {
          sameAsAlreadyRunningInstances: true,
          resizeStrategy: 'ResizeNewFirst'
        },
        type: StepType.EcsServiceSetup
      })
    )
  })

  test(`renders fine for Runtime values`, async () => {
    const { container } = render(
      <TestWrapper>
        <ECSServiceSetupStepEditRef
          initialValues={runtimeInitialValues}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          readonly={false}
          stepViewType={StepViewType.Edit}
          onUpdate={onUpdate}
          onChange={onChange}
          ref={formikRef}
          isNewStep={false}
        />
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    const identifierEditIcon = queryByAttribute('data-icon', container, 'Edit')
    expect(identifierEditIcon).not.toBeInTheDocument()

    const nameInput = queryByNameAttribute('name') as HTMLInputElement
    expect(nameInput).toBeInTheDocument()
    expect(nameInput.value).toBe('Existing Name')

    const timeoutInput = queryByNameAttribute('timeout') as HTMLInputElement
    expect(timeoutInput).toBeInTheDocument()
    expect(timeoutInput.value).toBe(RUNTIME_INPUT_VALUE)

    act(() => {
      formikRef.current?.submitForm()
    })

    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'Existing_Name',
        name: 'Existing Name',
        timeout: RUNTIME_INPUT_VALUE,
        spec: {
          sameAsAlreadyRunningInstances: RUNTIME_INPUT_VALUE
        },
        type: StepType.EcsServiceSetup
      })
    )
  })

  test('identifier should not be editable when isNewStep is false', () => {
    const { container } = render(
      <TestWrapper>
        <ECSServiceSetupStepEditRef
          initialValues={emptyInitialValues}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          isNewStep={false}
          readonly={false}
          stepViewType={StepViewType.Edit}
          onUpdate={onUpdate}
          onChange={onChange}
          ref={formikRef}
        />
      </TestWrapper>
    )
    const identifierEditIcon = queryByAttribute('data-icon', container, 'Edit')
    expect(identifierEditIcon).not.toBeInTheDocument()
  })

  test('onUpdate should not be called if it is not passed as prop', async () => {
    render(
      <TestWrapper>
        <ECSServiceSetupStepEditRef
          initialValues={existingInitialValues}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          isNewStep={false}
          readonly={false}
          stepViewType={StepViewType.Edit}
          onChange={onChange}
          ref={formikRef}
        />
      </TestWrapper>
    )
    act(() => {
      formikRef.current?.submitForm()
    })
    await waitFor(() => expect(onUpdate).not.toHaveBeenCalled())
  })
})
