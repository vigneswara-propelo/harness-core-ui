/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { SRMAnalysisStepDetails } from 'services/cv'
import { ImpactAnalysisDetails } from '../ImpactAnalysisDetails'

const analysisDetails = {
  analysisStartTime: 1692869195894,
  analysisEndTime: 1693128395894,
  analysisDuration: 259200.0,
  analysisStatus: 'RUNNING',
  monitoredServiceIdentifier: 'datadoglogs_version1',
  executionDetailIdentifier: 'EfjjX29_QLqp1VcpTLX8mA',
  stepName: 'AnalyzeDeploymentImpact_1'
} as SRMAnalysisStepDetails

describe('ImpactAnalysisDetails', () => {
  test('should render with no data', () => {
    const { queryAllByTestId } = render(
      <TestWrapper>
        <ImpactAnalysisDetails data={[]} />
      </TestWrapper>
    )
    expect(queryAllByTestId('ImpactAnalysisDetailsSection').length).toEqual(0)
  })

  test('should render with data', () => {
    const { getByText, queryAllByTestId } = render(
      <TestWrapper>
        <ImpactAnalysisDetails data={[{ ...analysisDetails }]} />
      </TestWrapper>
    )
    expect(queryAllByTestId('ImpactAnalysisDetailsSection').length).toEqual(1)
    expect(getByText('AnalyzeDeploymentImpact_1')).toBeInTheDocument()
    expect(getByText('RUNNING')).toBeInTheDocument()
    expect(getByText('August 24th 2023, 9:26 am to August 27th 2023, 9:26 am')).toBeInTheDocument()
    expect(getByText('cv.analyzeDeploymentImpact.cdCard.viewReport')).toBeInTheDocument()
  })

  test('should render with no analysisStatus', async () => {
    const { getByText, queryAllByTestId, queryByText } = render(
      <TestWrapper>
        <ImpactAnalysisDetails data={[{ ...analysisDetails, analysisStatus: undefined }]} />
      </TestWrapper>
    )
    expect(queryAllByTestId('ImpactAnalysisDetailsSection').length).toEqual(1)
    expect(getByText('AnalyzeDeploymentImpact_1')).toBeInTheDocument()
    expect(queryByText('RUNNING')).not.toBeInTheDocument()
    expect(getByText('August 24th 2023, 9:26 am to August 27th 2023, 9:26 am')).toBeInTheDocument()
    expect(getByText('cv.analyzeDeploymentImpact.cdCard.viewReport')).toBeInTheDocument()
    await act(() => {
      fireEvent.click(getByText('cv.analyzeDeploymentImpact.cdCard.viewReport'))
    })
  })

  test('should render with multiple data', () => {
    const { getByText, queryAllByTestId } = render(
      <TestWrapper>
        <ImpactAnalysisDetails
          data={[{ ...analysisDetails }, { ...analysisDetails, stepName: 'AnalyzeDeploymentImpact_2' }]}
        />
      </TestWrapper>
    )
    expect(queryAllByTestId('ImpactAnalysisDetailsSection').length).toEqual(2)
    expect(getByText('AnalyzeDeploymentImpact_1')).toBeInTheDocument()
    expect(getByText('AnalyzeDeploymentImpact_2')).toBeInTheDocument()
  })
})
