/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import type { ExecutionNode } from 'services/pipeline-ng'
import ExecutionVerificationStepShortView from '../ExecutionVerificationStepShortView'
import { executionMetadata, stepDetails, stepDetailsWithoutPolicy } from './ExecutionVerificationStepShortView.mock'

jest.mock('../../ExecutionVerificationSummary/ExecutionVerificationSummary', () => {
  return { ExecutionVerificationSummary: () => <div data-testid="ExecutionVerificationSummary" /> }
})

describe('ExecutionVerificationStepShortView', () => {
  test('ExecutionVerificationStepShortView should render the right policy details', async () => {
    const { container } = render(
      <TestWrapper>
        <ExecutionVerificationStepShortView
          step={stepDetails as unknown as ExecutionNode}
          executionMetadata={executionMetadata}
        />
      </TestWrapper>
    )

    const policyTab = screen.getByRole('tab', {
      name: 'pipeline.policyEnforcement.title'
    })

    expect(screen.getByTestId(/ExecutionVerificationSummary/)).toBeInTheDocument()
    expect(policyTab).toBeInTheDocument()

    await userEvent.click(policyTab)

    expect(screen.queryByTestId(/ExecutionVerificationSummary/)).not.toBeInTheDocument()
    expect(screen.getByText(/pipeline.policyEvaluations.policySetName/)).toBeInTheDocument()
    expect(screen.getByText(/pipeline.executionStatus.Success/)).toBeInTheDocument()
    expect(container.querySelector('[data-icon="tick-circle"]')).toBeInTheDocument()
  })

  test('ExecutionVerificationStepShortView should not render policy enforcement if there is no policy data available', () => {
    render(
      <TestWrapper>
        <ExecutionVerificationStepShortView
          step={stepDetailsWithoutPolicy as unknown as ExecutionNode}
          executionMetadata={executionMetadata}
        />
      </TestWrapper>
    )

    expect(screen.getByTestId(/ExecutionVerificationSummary/)).toBeInTheDocument()

    expect(
      screen.queryByRole('tab', {
        name: 'pipeline.policyEnforcement.title'
      })
    ).not.toBeInTheDocument()
  })
})
