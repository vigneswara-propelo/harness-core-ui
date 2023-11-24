/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, queryByAttribute, render, screen, waitFor } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'

import userEvent from '@testing-library/user-event'
import { StepViewType, StepFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { TasBGAppSetupStep } from '../TasBGAppSetup'
import { initialValues, runtimeValues, variableCustomStepProps } from './mocks'
import { InstancesType } from '../../TASBasicAppSetupStep/TASBasicAppSetupTypes'

const queryByNameAttribute = (container: HTMLElement, name: string): HTMLElement | null =>
  queryByAttribute('name', container, name)

factory.registerStep(new TasBGAppSetupStep())

const onUpdate = jest.fn()
const onChange = jest.fn()

describe('Test TAS Setup Steps', () => {
  beforeEach(() => {
    onUpdate.mockReset()
    onChange.mockReset()
  })

  test('should render edit view as new step - with initial snapshot', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} type={StepType.BGAppSetup} stepViewType={StepViewType.Edit} />
    )

    expect(container).toMatchSnapshot()
  })

  test('should render in edit view with initial values and toggle From Manifest to submit', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container } = render(
      <TestStepWidget
        initialValues={initialValues}
        type={StepType.BGAppSetup}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
      />
    )
    await act(async () => {
      fireEvent.change(queryByNameAttribute(container, 'name')!, { target: { value: 'Step1' } })
      fireEvent.change(queryByNameAttribute(container, 'timeout')!, { target: { value: '10m' } })

      fireEvent.input(queryByNameAttribute(container, 'spec.existingVersionToKeep')!, {
        target: { value: '4' }
      })
    })
    const instancesOption = container.querySelectorAll('input[type="radio"]')
    expect((instancesOption[0] as HTMLInputElement).value).toBe(InstancesType.FromManifest)
    expect((instancesOption[1] as HTMLInputElement).value).toBe(InstancesType.MatchRunningInstances)
    expect(instancesOption[0] as HTMLInputElement).toBeChecked()
    const currentRunningBtn = instancesOption[1] as HTMLInputElement
    currentRunningBtn.click()
    expect(instancesOption[1] as HTMLInputElement).toBeChecked()
    await act(() => ref.current?.submitForm()!)
    expect(onUpdate).toHaveBeenCalledWith({
      identifier: 'Step1',
      name: 'Step1',
      type: 'BGAppSetup',
      timeout: '10m',
      spec: {
        tasInstanceCountType: InstancesType.MatchRunningInstances,
        existingVersionToKeep: 4,
        tempRoutes: ['tempRoute'],
        additionalRoutes: ['addRoute1']
      }
    })
  })

  test('edit view validation test', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{
          ...initialValues,
          spec: { tasInstanceCountType: InstancesType.FromManifest, existingVersionToKeep: '', tempRoutes: [] }
        }}
        type={StepType.BGAppSetup}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
      />
    )
    // Clear input and update value
    const versionInput = queryByNameAttribute(container, 'spec.existingVersionToKeep')!
    await userEvent.clear(versionInput)

    await act(() => ref.current?.submitForm()!)
    await waitFor(() => {
      expect(container.querySelectorAll('.FormError--error').length).toEqual(1)
      expect(getByText('cd.ElastigroupStep.valueCannotBe')).toBeTruthy()
    })

    // validate negative value error
    fireEvent.input(versionInput!, {
      target: { value: '-1' }
    })

    await act(() => ref.current?.submitForm()!)
    await waitFor(() => {
      expect(getByText('cd.ElastigroupStep.valueCannotBeLessThan')).toBeInTheDocument()
    })
  })
})

describe('TAS BG Setup Step variable view ', () => {
  test('validate default inputVariables section', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.BGAppSetup}
        stepViewType={StepViewType.InputVariable}
        customStepProps={variableCustomStepProps}
      />
    )
    expect(container).toMatchSnapshot()
  })
})
describe('TAS BGAppSetupStep - runtime view and validation test', () => {
  beforeEach(() => {
    onUpdate.mockReset()
    onChange.mockReset()
  })
  test('should submit runtime values', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    render(
      <TestStepWidget
        initialValues={runtimeValues}
        type={StepType.BGAppSetup}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
      />
    )

    await act(() => ref.current?.submitForm()!)
    expect(onUpdate).toHaveBeenCalledWith({
      identifier: 'TASBGAppSetup',
      name: 'TASBGAppSetup',
      spec: {
        tasInstanceCountType: InstancesType.FromManifest,
        existingVersionToKeep: RUNTIME_INPUT_VALUE,
        additionalRoutes: RUNTIME_INPUT_VALUE,
        tempRoutes: RUNTIME_INPUT_VALUE
      },
      timeout: RUNTIME_INPUT_VALUE,
      type: 'BGAppSetup'
    })
  })

  test('should show errors for empty fields in runtime view', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()

    const { container } = render(
      <TestStepWidget
        ref={ref}
        type={StepType.BGAppSetup}
        stepViewType={StepViewType.DeploymentForm}
        onUpdate={onUpdate}
        initialValues={{
          name: 'TASBGAppSetup',
          identifier: 'TASBGAppSetup',
          timeout: '1s',
          type: 'BGAppSetup',
          spec: {
            tasInstanceCountType: InstancesType.FromManifest,
            existingVersionToKeep: '',
            additionalRoutes: '',
            tempRoutes: ''
          }
        }}
        template={{
          name: 'TASBGAppSetup',
          identifier: 'TASBGAppSetup',
          timeout: RUNTIME_INPUT_VALUE,
          type: 'BGAppSetup',
          spec: {
            tasInstanceCountType: InstancesType.FromManifest,
            existingVersionToKeep: RUNTIME_INPUT_VALUE,
            additionalRoutes: RUNTIME_INPUT_VALUE,
            tempRoutes: RUNTIME_INPUT_VALUE
          }
        }}
      />
    )

    // Check for all fields presence which are marked as runtime input
    const timeoutInput = queryByNameAttribute(container, 'timeout')
    expect(timeoutInput).toBeInTheDocument()
    const existingVersionToKeepInput = queryByNameAttribute(container, 'spec.existingVersionToKeep')
    expect(existingVersionToKeepInput).toBeInTheDocument()
    const additionalRoutesInputLabel = screen.getByText('cd.steps.tas.additionalRoutes')
    expect(additionalRoutesInputLabel).toBeInTheDocument()
    const tempRoutesInputLabel = screen.getByText('cd.steps.tas.tempRoutes')
    expect(tempRoutesInputLabel).toBeInTheDocument()

    // Submit and check for errors
    const submitBtn = screen.getByText('Submit')
    await userEvent.click(submitBtn)

    const timeoutErr = screen.queryByText('Value must be greater than or equal to "10s"')
    await waitFor(() => expect(timeoutErr).toBeInTheDocument())
    const existingVersionToKeepErr = screen.queryByText('cd.ElastigroupStep.valueCannotBeLessThan')
    await waitFor(() => expect(existingVersionToKeepErr).toBeInTheDocument())
  })
})
