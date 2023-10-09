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

import { TestWrapper, doConfigureOptionsTesting } from '@common/utils/testUtils'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { ECSUpgradeContainerStepElementConfig, InstanceUnit } from '@pipeline/utils/types'
import { ECSUpgradeContainerStepEditRef } from '../ECSUpgradeContainerStepEdit'

const emptyInitialValues: ECSUpgradeContainerStepElementConfig = {
  identifier: '',
  name: '',
  timeout: '',
  type: StepType.EcsUpgradeContainer,
  spec: {
    newServiceInstanceCount: 100,
    newServiceInstanceUnit: InstanceUnit.Percentage
  }
}
const existingInitialValues: ECSUpgradeContainerStepElementConfig = {
  identifier: 'Existing_Name',
  name: 'Existing Name',
  timeout: '30m',
  type: StepType.EcsUpgradeContainer,
  spec: {
    newServiceInstanceCount: 50,
    newServiceInstanceUnit: InstanceUnit.Count,
    downsizeOldServiceInstanceCount: 50,
    downsizeOldServiceInstanceUnit: InstanceUnit.Percentage
  }
}
const runtimeInitialValues: ECSUpgradeContainerStepElementConfig = {
  identifier: 'Existing_Name',
  name: 'Existing Name',
  timeout: RUNTIME_INPUT_VALUE,
  type: StepType.EcsUpgradeContainer,
  spec: {
    newServiceInstanceCount: RUNTIME_INPUT_VALUE,
    newServiceInstanceUnit: InstanceUnit.Count,
    downsizeOldServiceInstanceCount: RUNTIME_INPUT_VALUE,
    downsizeOldServiceInstanceUnit: InstanceUnit.Percentage
  }
}

const onUpdate = jest.fn()
const onChange = jest.fn()
const formikRef = React.createRef<StepFormikRef<ECSUpgradeContainerStepElementConfig>>()

describe('ECSUpgradeContainerStepEdit tests', () => {
  beforeEach(() => {
    onUpdate.mockReset()
    onChange.mockReset()
  })

  test(`renders fine for empty values and values can be changed`, async () => {
    const { container, findByText } = render(
      <TestWrapper>
        <ECSUpgradeContainerStepEditRef
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
        type: StepType.EcsUpgradeContainer,
        spec: {
          newServiceInstanceCount: 100,
          newServiceInstanceUnit: InstanceUnit.Percentage
        }
      })
    )

    const timeoutInput = queryByNameAttribute('timeout') as HTMLInputElement
    expect(timeoutInput).toBeInTheDocument()
    expect(timeoutInput.value).toBe('')
    act(() => {
      fireEvent.change(timeoutInput, { target: { value: '20m' } })
    })
    expect(timeoutInput.value).toBe('20m')

    const newServiceInstanceCountInput = queryByNameAttribute('spec.newServiceInstanceCount') as HTMLInputElement
    expect(newServiceInstanceCountInput).toBeInTheDocument()
    expect(newServiceInstanceCountInput.value).toBe('100')
    userEvent.clear(newServiceInstanceCountInput)
    await userEvent.type(newServiceInstanceCountInput!, '60')
    expect(newServiceInstanceCountInput.value).toBe('60')

    const dropdownIcons = container.querySelectorAll('[data-icon="chevron-down"]')
    expect(dropdownIcons.length).toBe(2)
    const newServiceInstanceUnitSelect = queryByNameAttribute('spec.newServiceInstanceUnit') as HTMLInputElement
    expect(newServiceInstanceUnitSelect).toBeInTheDocument()
    expect(newServiceInstanceUnitSelect.value).toBe('instanceFieldOptions.percentage')
    const newServiceInstanceUnitDropdownIcon = dropdownIcons[0].parentElement
    await userEvent.click(newServiceInstanceUnitDropdownIcon!)
    const newServiceInstanceUnitSecondOption = await findByText('instanceFieldOptions.instanceHolder')
    expect(newServiceInstanceUnitSecondOption).toBeInTheDocument()
    await userEvent.click(newServiceInstanceUnitSecondOption)
    await waitFor(() => expect(newServiceInstanceUnitSelect.value).toBe('instanceFieldOptions.instanceHolder'))

    const downsizeOldServiceInstanceCountInput = queryByNameAttribute(
      'spec.downsizeOldServiceInstanceCount'
    ) as HTMLInputElement
    expect(downsizeOldServiceInstanceCountInput).toBeInTheDocument()
    expect(downsizeOldServiceInstanceCountInput.value).toBe('')
    userEvent.clear(downsizeOldServiceInstanceCountInput)
    await userEvent.type(downsizeOldServiceInstanceCountInput!, '50')
    expect(downsizeOldServiceInstanceCountInput.value).toBe('50')

    const downsizeOldServiceInstanceUnitSelect = queryByNameAttribute(
      'spec.downsizeOldServiceInstanceUnit'
    ) as HTMLInputElement
    expect(downsizeOldServiceInstanceUnitSelect).toBeInTheDocument()
    expect(downsizeOldServiceInstanceUnitSelect.value).toBe('')
    const resizeStrategyDropdownIcon = dropdownIcons[1].parentElement
    await userEvent.click(resizeStrategyDropdownIcon!)
    const downsizeOldServiceInstanceUnitFirstOption = await findByText('instanceFieldOptions.percentage')
    expect(downsizeOldServiceInstanceUnitFirstOption).toBeInTheDocument()
    await userEvent.click(downsizeOldServiceInstanceUnitFirstOption)
    await waitFor(() => expect(downsizeOldServiceInstanceUnitSelect.value).toBe('instanceFieldOptions.percentage'))

    act(() => {
      formikRef.current?.submitForm()
    })

    await waitFor(() => expect(onUpdate).toHaveBeenCalled())
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'Test_Name',
        name: 'Test Name',
        timeout: '20m',
        spec: {
          newServiceInstanceCount: 60,
          newServiceInstanceUnit: InstanceUnit.Count,
          downsizeOldServiceInstanceCount: 50,
          downsizeOldServiceInstanceUnit: InstanceUnit.Percentage
        },
        type: StepType.EcsUpgradeContainer
      })
    )
  })

  test(`renders fine for Runtime values`, async () => {
    const { container } = render(
      <TestWrapper>
        <ECSUpgradeContainerStepEditRef
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

    const modals = document.getElementsByClassName('bp3-dialog')
    expect(modals.length).toBe(0)

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    const identifierEditIcon = queryByAttribute('data-icon', container, 'Edit')
    expect(identifierEditIcon).not.toBeInTheDocument()

    const nameInput = queryByNameAttribute('name') as HTMLInputElement
    expect(nameInput).toBeInTheDocument()
    expect(nameInput.value).toBe('Existing Name')

    const timeoutInput = queryByNameAttribute('timeout') as HTMLInputElement
    expect(timeoutInput).toBeInTheDocument()
    expect(timeoutInput.value).toBe(RUNTIME_INPUT_VALUE)

    const newServiceInstanceCountInput = queryByNameAttribute('spec.newServiceInstanceCount') as HTMLInputElement
    expect(newServiceInstanceCountInput).toBeInTheDocument()
    expect(newServiceInstanceCountInput.value).toBe(RUNTIME_INPUT_VALUE)
    const cogNewServiceInstanceCount = document.getElementById('configureOptions_spec.newServiceInstanceCount')
    await userEvent.click(cogNewServiceInstanceCount!)
    await waitFor(() => expect(modals.length).toBe(1))
    const newServiceInstanceCountCOGModal = modals[0] as HTMLElement
    await doConfigureOptionsTesting(newServiceInstanceCountCOGModal, newServiceInstanceCountInput)

    const downsizeOldServiceInstanceCountInput = queryByNameAttribute(
      'spec.downsizeOldServiceInstanceCount'
    ) as HTMLInputElement
    expect(downsizeOldServiceInstanceCountInput).toBeInTheDocument()
    expect(downsizeOldServiceInstanceCountInput.value).toBe(RUNTIME_INPUT_VALUE)
    const cogDownsizeOldServiceInstanceCount = document.getElementById(
      'configureOptions_spec.downsizeOldServiceInstanceCount'
    )
    await userEvent.click(cogDownsizeOldServiceInstanceCount!)
    await waitFor(() => expect(modals.length).toBe(2))
    const downsizeOldServiceInstanceCountCOGModal = modals[1] as HTMLElement
    await doConfigureOptionsTesting(downsizeOldServiceInstanceCountCOGModal, downsizeOldServiceInstanceCountInput)

    act(() => {
      formikRef.current?.submitForm()
    })

    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'Existing_Name',
        name: 'Existing Name',
        timeout: RUNTIME_INPUT_VALUE,
        spec: {
          newServiceInstanceCount: '<+input>.regex(<+input>.includes(/test/))',
          newServiceInstanceUnit: InstanceUnit.Count,
          downsizeOldServiceInstanceCount: '<+input>.regex(<+input>.includes(/test/))',
          downsizeOldServiceInstanceUnit: InstanceUnit.Percentage
        },
        type: StepType.EcsUpgradeContainer
      })
    )
  })

  test('identifier should not be editable when isNewStep is false', () => {
    const { container } = render(
      <TestWrapper>
        <ECSUpgradeContainerStepEditRef
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
        <ECSUpgradeContainerStepEditRef
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
