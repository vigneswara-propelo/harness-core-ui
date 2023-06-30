import React, { createRef } from 'react'
import { render, act, screen } from '@testing-library/react'

import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'

import { IACMApprovalStep } from '..'

describe('IACMApprovalStep Interaction', () => {
  beforeEach(() => {
    factory.registerStep(new IACMApprovalStep())
  })

  test('renders form', () => {
    const { getByText } = screen
    const initialValues = {
      type: StepType.IACMApproval,
      name: 'IACMApproval',
      identifier: 'IACMApproval',
      timeout: '10m'
    }

    render(
      <TestStepWidget initialValues={initialValues} type={StepType.IACMApproval} stepViewType={StepViewType.Edit} />
    )

    expect(getByText('Name')).toBeInTheDocument()
    expect(getByText('pipelineSteps.timeoutLabel')).toBeInTheDocument()
  })

  test('submits valid form', async () => {
    const ref = createRef<StepFormikRef<unknown>>()
    const onUpdate = jest.fn()
    const initialValues = {
      type: StepType.IACMApproval,
      name: 'IACMApproval',
      timeout: '1h',
      identifier: 'IACMApproval'
    }

    render(
      <TestStepWidget
        initialValues={initialValues}
        type={StepType.IACMApproval}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        ref={ref}
      />
    )

    await act(() => ref.current?.submitForm()!)

    expect(onUpdate).toHaveBeenCalled()
  })

  test('errors when submitting invalid form', async () => {
    const ref = createRef<StepFormikRef<unknown>>()
    const onUpdate = jest.fn()
    const { getByText } = screen
    const initialValues = {
      type: StepType.IACMApproval,
      name: 'IACMApproval',
      timeout: '10h',
      identifier: 'IACMApproval'
    }

    render(
      <TestStepWidget
        initialValues={initialValues}
        type={StepType.IACMApproval}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        ref={ref}
      />
    )

    await act(() => ref.current?.submitForm()!)

    expect(getByText('iacm.betaMaxTimeoutMessage')).toBeInTheDocument()
    expect(onUpdate).not.toHaveBeenCalled()
  })
})

describe('IACMApprovalStep Validation', () => {
  test('shows error when timeout value <10s', () => {
    const response = new IACMApprovalStep().validateInputSet({
      data: { name: 'IACMApprovalValidation', identifier: 'IACMApprovalValidation', timeout: '1s' },
      viewType: StepViewType.TriggerForm,
      template: {
        name: 'IACMApprovalValidation',
        identifier: 'IACMApprovalValidation',
        timeout: '<+input>'
      }
    })

    expect(response.timeout).toBe('Value must be greater than or equal to "10s"')
  })

  test('shows error when timeout value >1h', () => {
    const response = new IACMApprovalStep().validateInputSet({
      data: { name: 'IACMApprovalValidation', identifier: 'IACMApprovalValidation', timeout: '10h' },
      viewType: StepViewType.TriggerForm,
      template: {
        name: 'IACMApprovalValidation',
        identifier: 'IACMApprovalValidation',
        timeout: '<+input>'
      }
    })

    expect(response.timeout).toBe('During IACM Beta, timeout value must be less than or equal to 1h')
  })

  test('shows correct error when getString is available', () => {
    const response = new IACMApprovalStep().validateInputSet({
      data: { name: 'IACMApprovalValidation', identifier: 'IACMApprovalValidation', timeout: '10h' },
      viewType: StepViewType.TriggerForm,
      template: {
        name: 'IACMApprovalValidation',
        identifier: 'IACMApprovalValidation',
        timeout: '<+input>'
      },
      getString: () => 'During IACM Beta, timeout value must be less than or equal to 1h'
    })

    expect(response.timeout).toBe('During IACM Beta, timeout value must be less than or equal to 1h')
  })

  test('shows correct error when getString is unavailable', () => {
    const response = new IACMApprovalStep().validateInputSet({
      data: { name: 'IACMApprovalValidation', identifier: 'IACMApprovalValidation', timeout: '10h' },
      viewType: StepViewType.TriggerForm,
      template: {
        name: 'IACMApprovalValidation',
        identifier: 'IACMApprovalValidation',
        timeout: '<+input>'
      }
    })

    expect(response.timeout).toBe('During IACM Beta, timeout value must be less than or equal to 1h')
  })
})
