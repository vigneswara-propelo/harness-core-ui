import React, { createRef } from 'react'
import { render, act, screen } from '@testing-library/react'

import { StepViewType, StepFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { TestWrapper } from '@common/utils/testUtils'
import StepMode from '../StepMode'

describe('IACMApprovalStep', () => {
  test('renders correctly', () => {
    const { getByText } = screen
    render(
      <TestWrapper>
        <StepMode
          stepViewType={StepViewType.Edit}
          initialValues={{ timeout: '10s', name: '', identifier: '' }}
          allowableTypes={[]}
        />
      </TestWrapper>
    )

    expect(getByText('Name')).toBeInTheDocument()
    expect(getByText('pipelineSteps.timeoutLabel')).toBeInTheDocument()
  })

  test('submits valid form', async () => {
    const ref = createRef<StepFormikRef<unknown>>()
    const onUpdate = jest.fn()

    render(
      <TestWrapper>
        <StepMode
          stepViewType={StepViewType.Edit}
          initialValues={{ timeout: '10s', name: 'IACMApproval', identifier: 'IACMApproval' }}
          allowableTypes={[]}
          ref={ref}
          onUpdate={onUpdate}
        />
      </TestWrapper>
    )

    await act(() => ref.current?.submitForm()!)

    expect(onUpdate).toHaveBeenCalled()
  })
})
