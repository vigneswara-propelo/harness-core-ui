/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { SummaryOfDeployedNodes } from '../SummaryOfDeployedNodes'

// eslint-disable-next-line no-var
var mockedUseQueryParam = jest.fn().mockImplementation(() => ({ returnUrl: '/testing' }))
jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useQueryParams: mockedUseQueryParam
}))

describe('Unit tests for SummaryOfDeployedNodes', () => {
  test('Ensure content is rendered correctly based on input', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <SummaryOfDeployedNodes
          metricsInViolation={3}
          totalMetrics={20}
          logClustersInViolation={5}
          totalLogClusters={5}
          errorClustersInViolation={7}
          totalErrorClusters={11}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('pipeline.verification.metricsInViolation')).not.toBeNull())
    expect(container).toMatchSnapshot()
    fireEvent.click(container.querySelector('[class*="viewDetails"]')!)
  })

  test('should render only metrics data the analysisType is SIMPLE', async () => {
    render(
      <TestWrapper>
        <SummaryOfDeployedNodes
          metricsInViolation={3}
          totalMetrics={20}
          logClustersInViolation={5}
          totalLogClusters={5}
          errorClustersInViolation={7}
          totalErrorClusters={11}
          analysisType="SIMPLE"
        />
      </TestWrapper>
    )

    expect(screen.getByText(/pipeline.verification.metricsInViolation/)).toBeInTheDocument()

    expect(screen.queryByText(/pipeline.verification.logClustersInViolation/)).not.toBeInTheDocument()

    expect(screen.queryByText(/pipeline.verification.errorClustersInViolation/)).not.toBeInTheDocument()
  })
})
