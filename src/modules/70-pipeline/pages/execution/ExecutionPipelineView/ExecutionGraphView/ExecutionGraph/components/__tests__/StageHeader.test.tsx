/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import StageHeader from '../StageHeader'
import stageHeaderProp from './stage-mock.json'

jest.mock('@pipeline/context/ExecutionContext', () => ({
  useExecutionContext: () => ({
    retriedHistoryInfo: {
      retriedStages: ['testLabelsCases'],
      retriedExecutionUuids: ['NcaQAMIWTwKrpVFbRPXpKQ', 'UvaZgkk-Rv6cgCGH6eA84w']
    }
  })
}))

describe('StageHeader component', () => {
  test('Stage header assertions', () => {
    const { container, getByText } = render(
      <TestWrapper>
        <StageHeader {...stageHeaderProp} />
      </TestWrapper>
    )
    // Stage name
    expect(getByText('testLabelsCases')).toBeInTheDocument()
    // Retried stage icon
    expect(container.querySelector('[data-icon="re-executed"]')).toBeInTheDocument()
    // Execution status
    expect(getByText('pipeline.executionStatus.Failed')).toBeInTheDocument()

    // Matrix axis information
    expect(container.querySelector('.matrixLabelWrapper')).toBeInTheDocument()
    expect(getByText(/sample_service_1675875039143/i)).toBeInTheDocument()
    expect(getByText(/devcluster_1667983075245/i)).toBeInTheDocument()
    expect(getByText(/dev_1667983075245/i)).toBeInTheDocument()
    // Stage time and duration
    expect(getByText(/pipeline.startTime/i)).toBeInTheDocument()
    expect(getByText(/pipeline.duration/i)).toBeInTheDocument()
    expect(screen.getByTestId('failure-info')).toBeInTheDocument()
  })
})
