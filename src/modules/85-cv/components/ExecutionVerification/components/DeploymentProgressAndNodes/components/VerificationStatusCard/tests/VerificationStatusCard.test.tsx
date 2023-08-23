/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import VerificationStatusCard from '@cv/components/ExecutionVerification/components/DeploymentProgressAndNodes/components/VerificationStatusCard/VerificationStatusCard'

describe('VerificationStatusCard', () => {
  test('matches snapshot when status = IN_PROGRESS', () => {
    const { container } = render(
      <TestWrapper>
        <VerificationStatusCard status="IN_PROGRESS" />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('matches snapshot when status = ERROR', () => {
    const { container } = render(
      <TestWrapper>
        <VerificationStatusCard status="ERROR" />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('matches snapshot when status = VERIFICATION_FAILED', () => {
    const { container } = render(
      <TestWrapper>
        <VerificationStatusCard status="VERIFICATION_FAILED" />{' '}
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('matches snapshot when status = VERIFICATION_PASSED', () => {
    const { container } = render(
      <TestWrapper>
        <VerificationStatusCard status="VERIFICATION_PASSED" />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(' should show the correct text when status = NOT_STARTED', () => {
    const { getByText } = render(
      <TestWrapper>
        <VerificationStatusCard status="NOT_STARTED" />
      </TestWrapper>
    )
    expect(getByText('cv.dashboard.notStarted')).toBeInTheDocument()
  })
})
