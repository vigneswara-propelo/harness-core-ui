/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { UseGetReturn } from 'restful-react'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvService from 'services/cv'
import * as pipelineNgService from 'services/pipeline-ng'
import ReportDrawer from '../ReportDrawer'
import { ReportDrawerProp, ReportSummary, changeDetailsMock, sloDetailMock } from './ReportDrawer.mock'
import { mockedExecutionSummary } from '../../../HealthScoreChart/__tests__/HealthScoreChart.mock'

describe('Reports Drawer', () => {
  test('should render', async () => {
    jest.spyOn(pipelineNgService, 'useGetExecutionDetailV2').mockReturnValue({
      data: mockedExecutionSummary,
      loading: false,
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any, any>)

    jest.spyOn(cvService, 'useGetSRMAnalysisSummary').mockReturnValue({
      data: ReportSummary,
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any, any>)

    jest.spyOn(cvService, 'useGetMonitoredServiceChangeDetails').mockReturnValue({
      data: changeDetailsMock,
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any, any>)

    jest.spyOn(cvService, 'useGetMonitoredServiceOverAllHealthScore').mockReturnValue({
      data: {},
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any, any>)

    jest.spyOn(cvService, 'useGetSLODetails').mockReturnValue({
      data: sloDetailMock,
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any, any>)

    const { getByText } = render(
      <TestWrapper>
        <ReportDrawer {...ReportDrawerProp} />
      </TestWrapper>
    )

    expect(getByText('env1')).toBeInTheDocument()
    expect(getByText('datadoglogs')).toBeInTheDocument()
    expect(getByText('datadoglogs_version1')).toBeInTheDocument()
    expect(getByText('August 22nd 2023, 10:31 am')).toBeInTheDocument()
    expect(getByText('August 25th 2023, 10:31 am')).toBeInTheDocument()
  })

  test('should render in error state', () => {
    jest.spyOn(cvService, 'useGetSRMAnalysisSummary').mockReturnValue({
      data: null,
      error: { data: { message: 'API Failure' } },
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any, any>)

    const { getByText } = render(
      <TestWrapper>
        <ReportDrawer {...ReportDrawerProp} />
      </TestWrapper>
    )

    expect(getByText('API Failure')).toBeInTheDocument()
  })

  test('should render in loading state', () => {
    jest.spyOn(cvService, 'useGetSRMAnalysisSummary').mockReturnValue({
      data: null,
      loading: true,
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any, any>)

    jest.spyOn(pipelineNgService, 'useGetExecutionDetailV2').mockReturnValue({
      data: mockedExecutionSummary,
      loading: true,
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any, any>)

    jest.spyOn(cvService, 'useGetMonitoredServiceChangeDetails').mockReturnValue({
      data: changeDetailsMock,
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any, any>)

    jest.spyOn(cvService, 'useGetMonitoredServiceOverAllHealthScore').mockReturnValue({
      data: {},
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any, any>)

    jest.spyOn(cvService, 'useGetSLODetails').mockReturnValue({
      data: sloDetailMock,
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any, any>)

    const { container } = render(
      <TestWrapper>
        <ReportDrawer {...ReportDrawerProp} />
      </TestWrapper>
    )

    expect(container.querySelectorAll('.bp3-skeleton').length).toEqual(7)
  })
})
