/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import * as cdNg from 'services/cd-ng'
import routes from '@common/RouteDefinitions'
import { TestWrapper } from '@common/utils/testUtils'
import { modulePathProps, projectPathProps, servicePathProps } from '@common/utils/routeUtils'
import { ModulePathParams, ProjectPathProps, ServicePathProps } from '@common/interfaces/RouteInterfaces'
import ServiceDetailsChartVersionTable from '../ServiceDetailsChartVersionTable'
import { activeInstanceGroupedByChartVersionResponse } from './ServiceDetailsMocks'

const fetchActiveInstanceGroupedByChartVersion = jest.fn().mockReturnValue(activeInstanceGroupedByChartVersionResponse)
jest.mock('services/cd-ng', () => ({
  useGetActiveInstanceGroupedByChartVersion: jest.fn().mockImplementation(() => {
    return {
      data: activeInstanceGroupedByChartVersionResponse,
      refetch: fetchActiveInstanceGroupedByChartVersion,
      loading: false,
      error: null
    }
  })
}))

const TEST_PATH = routes.toServiceStudio({ ...projectPathProps, ...modulePathProps, ...servicePathProps })

const TEST_PATH_PARAMS: ProjectPathProps & ServicePathProps & ModulePathParams = {
  accountId: 'testAcc',
  orgIdentifier: 'testOrg',
  projectIdentifier: 'testProject',
  module: 'cd',
  serviceId: 'testService'
}

const resetSearchMock = jest.fn()
const setRowClickFilterMock = jest.fn()

describe('ServiceDetailsChartVersionTable tests', () => {
  beforeEach(() => {
    jest.spyOn(cdNg, 'useGetActiveInstanceGroupedByChartVersion').mockImplementation((): any => {
      return {
        data: activeInstanceGroupedByChartVersionResponse,
        refetch: fetchActiveInstanceGroupedByChartVersion,
        loading: false,
        error: null
      }
    })
    fetchActiveInstanceGroupedByChartVersion.mockReset()
  })

  test('it should display empty state when empty data is returned', async () => {
    jest.spyOn(cdNg, 'useGetActiveInstanceGroupedByChartVersion').mockImplementation(() => {
      return {
        data: null,
        refetch: jest.fn(),
        loading: false,
        error: null
      } as any
    })

    render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <ServiceDetailsChartVersionTable
          searchTerm=""
          resetSearch={resetSearchMock}
          setRowClickFilter={setRowClickFilterMock}
        />
      </TestWrapper>
    )

    const noChartVersionDataMsg = screen.queryByText('cd.environmentDetailPage.noServiceChartVersionMsg')
    await waitFor(() => expect(noChartVersionDataMsg).toBeInTheDocument())
  })

  test('it should display loading state when API call is in progress', async () => {
    jest.spyOn(cdNg, 'useGetActiveInstanceGroupedByChartVersion').mockImplementation(() => {
      return {
        data: null,
        refetch: jest.fn(),
        loading: true,
        error: null
      } as any
    })

    render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <ServiceDetailsChartVersionTable
          searchTerm=""
          resetSearch={resetSearchMock}
          setRowClickFilter={setRowClickFilterMock}
        />
      </TestWrapper>
    )

    const chartVersionTableLoadingSpinnerContainer = screen.queryByTestId('chartVersionTableLoading')
    await waitFor(() => expect(chartVersionTableLoadingSpinnerContainer).toBeInTheDocument())
  })

  test('it should display error state when API call returns error', async () => {
    jest.spyOn(cdNg, 'useGetActiveInstanceGroupedByChartVersion').mockImplementation(() => {
      return {
        data: null,
        refetch: fetchActiveInstanceGroupedByChartVersion,
        loading: false,
        error: {}
      } as any
    })

    render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <ServiceDetailsChartVersionTable
          searchTerm=""
          resetSearch={resetSearchMock}
          setRowClickFilter={setRowClickFilterMock}
        />
      </TestWrapper>
    )

    const chartVersionTableErrorContainer = await screen.findByTestId('chartVersionTableError')
    expect(chartVersionTableErrorContainer).toBeInTheDocument()
    const retryBtn = screen.getByText('Retry')
    expect(retryBtn).toBeInTheDocument()
    userEvent.click(retryBtn)
    await waitFor(() => expect(fetchActiveInstanceGroupedByChartVersion).toHaveBeenCalledTimes(1))
  })

  test('it should display expected chart version table with three rows', async () => {
    render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <ServiceDetailsChartVersionTable
          searchTerm=""
          resetSearch={resetSearchMock}
          setRowClickFilter={setRowClickFilterMock}
        />
      </TestWrapper>
    )

    // Left Side
    // Check for all column headers
    const chartVersionColumnHeader = screen.queryByText('pipeline.manifestType.http.chartVersion')
    await waitFor(() => expect(chartVersionColumnHeader).toBeInTheDocument())
    const artifactColumnHeader = screen.queryByText('cd.serviceDashboard.artifact')
    expect(artifactColumnHeader).toBeInTheDocument()
    const envColumnHeader = screen.queryByText('environment')
    expect(envColumnHeader).toBeInTheDocument()
    const envTypeColumnHeader = screen.queryByText('typeLabel')
    expect(envTypeColumnHeader).toBeInTheDocument()
    const infraColumnHeader = screen.queryByText('cd.infra')
    expect(infraColumnHeader).toBeInTheDocument()
    const instancesColumnHeader = screen.queryByText('cd.serviceDashboard.headers.instances')
    expect(instancesColumnHeader).toBeInTheDocument()

    const allRows = screen.getAllByRole('row')
    expect(allRows).toHaveLength(4)
    const allChartVersions = screen.getAllByText('0.0.4')
    expect(allChartVersions).toHaveLength(1)
    // First row
    const row1 = allRows[1]
    const chartVersion = within(row1).getByText('0.0.4')
    expect(chartVersion).toBeInTheDocument()
    const artifactRow1 = within(row1).getByText('library/nginx:mainline-bullseye')
    expect(artifactRow1).toBeInTheDocument()
    const envRow1 = within(row1).getByText('test')
    expect(envRow1).toBeInTheDocument()
    const envTypeRow1 = within(row1).getByText('cd.serviceDashboard.prod')
    expect(envTypeRow1).toBeInTheDocument()
    const infraRow1 = within(row1).getByText('k8s')
    expect(infraRow1).toBeInTheDocument()
    const instRow1 = within(row1).getByText('1')
    expect(instRow1).toBeInTheDocument()
    // Second row
    const row2 = allRows[2]
    const envRow2 = within(row2).getByText('prod1')
    expect(envRow2).toBeInTheDocument()
    const envTypeRow2 = within(row2).getByText('cd.serviceDashboard.prod')
    expect(envTypeRow2).toBeInTheDocument()
    const infraRow2 = within(row2).getByText('Prod Infra 1')
    expect(infraRow2).toBeInTheDocument()
    const instRow2 = within(row2).getByText('1')
    expect(instRow2).toBeInTheDocument()
    // Third row
    const row3 = allRows[3]
    const artifactRow3 = within(row3).getByText('library/nginx:stable-bullseye-perl')
    expect(artifactRow3).toBeInTheDocument()
    const envRow3 = within(row3).getByText('testPre-prod')
    expect(envRow3).toBeInTheDocument()
    const envTypeRow3 = within(row3).getByText('cd.preProductionType')
    expect(envTypeRow3).toBeInTheDocument()
    const infraRow3 = within(row3).getByText('K8s Infra For PreProd Env')
    expect(infraRow3).toBeInTheDocument()
    const instRow3 = within(row3).getByText('1')
    expect(instRow3).toBeInTheDocument()

    expect(setRowClickFilterMock).toHaveBeenCalledWith({
      artifact: 'library/nginx:mainline-bullseye',
      chartVersion: '0.0.4',
      envId: 'test',
      environmentType: 'Production',
      envName: 'test',
      infraIdentifier: 'k8s',
      infraName: 'k8s',
      isEnvView: false
    })

    userEvent.click(row3)

    await waitFor(() =>
      expect(setRowClickFilterMock).toBeCalledWith({
        artifact: 'library/nginx:stable-bullseye-perl',
        chartVersion: '0.0.4',
        envId: 'testPreprod',
        envName: 'testPre-prod',
        environmentType: 'PreProduction',
        infraIdentifier: 'K8s_Infra_For_PreProd_Env',
        infraName: 'K8s Infra For PreProd Env',
        isEnvView: false
      })
    )
  })

  test('it should filter chart version table based on passed envFilter prop', async () => {
    render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <ServiceDetailsChartVersionTable
          searchTerm=""
          envFilter={{ isEnvGroup: false, envId: 'test' }}
          resetSearch={resetSearchMock}
          setRowClickFilter={setRowClickFilterMock}
        />
      </TestWrapper>
    )

    // Left Side
    // Check for all column headers
    const chartVersionColumnHeader = screen.queryByText('pipeline.manifestType.http.chartVersion')
    await waitFor(() => expect(chartVersionColumnHeader).toBeInTheDocument())
    const artifactColumnHeader = screen.queryByText('cd.serviceDashboard.artifact')
    expect(artifactColumnHeader).toBeInTheDocument()
    const envColumnHeader = screen.queryByText('environment')
    expect(envColumnHeader).toBeInTheDocument()
    const envTypeColumnHeader = screen.queryByText('typeLabel')
    expect(envTypeColumnHeader).toBeInTheDocument()
    const infraColumnHeader = screen.queryByText('cd.infra')
    expect(infraColumnHeader).toBeInTheDocument()
    const instancesColumnHeader = screen.queryByText('cd.serviceDashboard.headers.instances')
    expect(instancesColumnHeader).toBeInTheDocument()

    const allRows = screen.getAllByRole('row')
    expect(allRows).toHaveLength(2)
  })

  test('it should display empty state when searchTerm is passed which is not matching with any data', async () => {
    render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <ServiceDetailsChartVersionTable
          searchTerm="abc"
          resetSearch={resetSearchMock}
          setRowClickFilter={setRowClickFilterMock}
        />
      </TestWrapper>
    )

    const noResultsFound = screen.queryByText('common.filters.noResultsFound')
    await waitFor(() => expect(noResultsFound).toBeInTheDocument())
    const clearFilters = screen.getByText('common.filters.clearFilters')
    expect(clearFilters).toBeInTheDocument()
  })
})
