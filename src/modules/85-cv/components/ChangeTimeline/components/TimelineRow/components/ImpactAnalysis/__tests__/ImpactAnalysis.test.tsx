/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import * as cvservice from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
import { ImpactAnalysis } from '../ImpactAnalysis'
import { ImpactAnalysisProps, mockAPI } from './ImpactAnalysis.mock'

jest.mock('services/cv', () => ({
  useGetMSSecondaryEventsDetails: jest.fn().mockImplementation(() => {
    return { data: { ...mockAPI } }
  })
}))

describe('ImpactAnalysis', () => {
  test('should render ImpactAnalysis', async () => {
    const { getByText, getByTestId } = render(
      <TestWrapper>
        <ImpactAnalysis {...ImpactAnalysisProps} />
      </TestWrapper>
    )
    expect(getByTestId('dataCollectionFailureIcon')).toBeInTheDocument()
    await act(() => {
      fireEvent.click(getByTestId('dataCollectionFailureIcon'))
    })
    expect(getByText('RUNNING')).toBeInTheDocument()
    expect(getByText('cv.oneDay')).toBeInTheDocument()
    expect(getByText('28th Aug 06:30 AM')).toBeInTheDocument()
    expect(getByText('29th Aug 07:16 AM')).toBeInTheDocument()
  })

  test('should render ImpactAnalysis only content', () => {
    const { getByText } = render(
      <TestWrapper>
        <ImpactAnalysis {...ImpactAnalysisProps} onlyContent />
      </TestWrapper>
    )
    expect(getByText('RUNNING')).toBeInTheDocument()
    expect(getByText('cv.oneDay')).toBeInTheDocument()
    expect(getByText('28th Aug 06:30 AM')).toBeInTheDocument()
    expect(getByText('29th Aug 07:16 AM')).toBeInTheDocument()
  })

  test('should render ImpactAnalysis with error', () => {
    jest.spyOn(cvservice, 'useGetMSSecondaryEventsDetails').mockReturnValue({
      data: null,
      error: { data: { message: 'API Failure' } }
    } as any)

    const { getByText } = render(
      <TestWrapper>
        <ImpactAnalysis {...ImpactAnalysisProps} onlyContent />
      </TestWrapper>
    )
    expect(getByText('API Failure')).toBeInTheDocument()
  })

  test('should render ImpactAnalysis with no data', () => {
    jest.spyOn(cvservice, 'useGetMSSecondaryEventsDetails').mockReturnValue({
      data: {},
      error: null
    } as any)

    const { getByText } = render(
      <TestWrapper>
        <ImpactAnalysis {...ImpactAnalysisProps} onlyContent />
      </TestWrapper>
    )
    expect(getByText('noDetails')).toBeInTheDocument()
  })
})
