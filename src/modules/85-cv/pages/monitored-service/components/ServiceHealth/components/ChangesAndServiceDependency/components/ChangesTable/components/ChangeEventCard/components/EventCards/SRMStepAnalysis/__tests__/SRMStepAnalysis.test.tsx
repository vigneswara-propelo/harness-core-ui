/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { UseGetReturn } from 'restful-react'
import * as cvService from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
import * as pipelineNgService from 'services/pipeline-ng'
import { ChangeEventDTO } from 'services/cv'
import { mockedExecutionSummary } from '@cv/pages/monitored-service/components/ServiceHealth/components/HealthScoreChart/__tests__/HealthScoreChart.mock'
import SRMStepAnalysis from '../SRMStepAnalysis'
import { ImpactAnalysis, changeDetailsMock, sloDetailMock } from './SRMStepAnalysis.mock'

describe('SRMStepAnalysis', () => {
  test('should render SRMStepAnalysis', async () => {
    jest.spyOn(pipelineNgService, 'useGetExecutionDetailV2').mockReturnValue({
      data: mockedExecutionSummary,
      loading: false,
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

    const { getByText, getByTestId, container } = render(
      <TestWrapper>
        <SRMStepAnalysis data={ImpactAnalysis.resource as ChangeEventDTO} />
      </TestWrapper>
    )

    await waitFor(() =>
      expect(getByText(mockedExecutionSummary.data.pipelineExecutionSummary.runSequence.toString())).toBeInTheDocument()
    )
    await waitFor(() =>
      expect(getByText(mockedExecutionSummary.data.pipelineExecutionSummary.name)).toBeInTheDocument()
    )
    await waitFor(() => expect(getByText(ImpactAnalysis.resource.metadata.analysisStatus)).toBeInTheDocument())

    expect(getByText('cv.changeSource.DeploymentImpactAnalysis')).toBeInTheDocument()
    expect(getByTestId('analysisDuration')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="analysisDuration"]')?.textContent).toEqual(
      'timeJuly 13th 2023, 9:41 am to July 15th 2023, 9:41 am'
    )
    expect(getByText('cv.changeSource.changeSourceCard.viewDeployment')).toBeInTheDocument()
  })

  test('should render SRMStepAnalysis with no exection data', async () => {
    jest.spyOn(pipelineNgService, 'useGetExecutionDetailV2').mockReturnValue({
      data: {},
      loading: false,
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any, any>)

    jest.spyOn(cvService, 'useGetMonitoredServiceChangeDetails').mockReturnValue({
      data: {},
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any, any>)

    jest.spyOn(cvService, 'useGetMonitoredServiceOverAllHealthScore').mockReturnValue({
      data: {},
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any, any>)

    const { getByText, container } = render(
      <TestWrapper>
        <SRMStepAnalysis data={ImpactAnalysis.resource as ChangeEventDTO} />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText(ImpactAnalysis.resource.id)).toBeInTheDocument())
    await waitFor(() => expect(getByText(ImpactAnalysis.resource.name)).toBeInTheDocument())
    await waitFor(() => expect(getByText(ImpactAnalysis.resource.metadata.analysisStatus)).toBeInTheDocument())

    expect(getByText('cv.changeSource.DeploymentImpactAnalysis')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="analysisDuration"]')?.textContent).toEqual(
      'timeJuly 13th 2023, 9:41 am to July 15th 2023, 9:41 am'
    )
    expect(getByText('cv.changeSource.changeSourceCard.viewDeployment')).toBeInTheDocument()
  })
})
