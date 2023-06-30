import React from 'react'
import { render, screen } from '@testing-library/react'

import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'

import { IACMApprovalStep } from '..'

describe('IACMApprovalStepTemplatized Interaction', () => {
  beforeEach(() => {
    factory.registerStep(new IACMApprovalStep())
  })

  test('renders timeout input when set to RunTime', () => {
    const { getByText } = screen
    const initialValues = {
      type: StepType.IACMApproval,
      name: 'IACMApproval',
      identifier: 'IACMApproval',
      timeout: '10m'
    }

    render(
      <TestStepWidget
        initialValues={initialValues}
        type={StepType.IACMApproval}
        stepViewType={StepViewType.DeploymentForm}
        template={{
          name: 'IACMApprovalValidation',
          identifier: 'IACMApprovalValidation',
          timeout: '<+input>'
        }}
        path="a.long.path"
      />
    )

    expect(getByText('pipelineSteps.timeoutLabel')).toBeInTheDocument()
  })

  test('renders nothing when set to Fixed', () => {
    const { queryByText } = screen
    const initialValues = {
      type: StepType.IACMApproval,
      name: 'IACMApproval',
      identifier: 'IACMApproval',
      timeout: '10m'
    }

    render(
      <TestStepWidget
        initialValues={initialValues}
        type={StepType.IACMApproval}
        stepViewType={StepViewType.DeploymentForm}
        template={{
          name: 'IACMApprovalValidation',
          identifier: 'IACMApprovalValidation',
          timeout: '10m'
        }}
      />
    )

    expect(queryByText('pipelineSteps.timeoutLabel')).not.toBeInTheDocument()
  })
})
