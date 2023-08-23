import React from 'react'
import { render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import MetricsAccordionPanelSummary from '../MetricsAccordionPanelSummary'
import { analysisRowMock } from './mocks'
import { DeploymentMetricsAnalysisRowProps } from '../../DeploymentMetricsAnalysisRow/DeploymentMetricsAnalysisRow'

describe('MetricsAccordionPanelSummary', () => {
  test('should show correct risk type text', () => {
    render(
      <TestWrapper>
        <MetricsAccordionPanelSummary analysisRow={analysisRowMock as DeploymentMetricsAnalysisRowProps} />
      </TestWrapper>
    )

    expect(screen.getByTestId(/riskDisplayText/)).toHaveTextContent('CV.NOANALYSIS')
  })
})
