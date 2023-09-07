/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { modulePathProps, projectPathProps, servicePathProps } from '@common/utils/routeUtils'
import { ModulePathParams, ProjectPathProps, ServicePathProps } from '@common/interfaces/RouteInterfaces'
import { ChartVersionCard } from '../ServiceDetailChartVersionCardView'
import { selectedChartVersionPreProd, selectedChartVersionProd } from './mock'

const TEST_PATH = routes.toServiceStudio({ ...projectPathProps, ...modulePathProps, ...servicePathProps })

const TEST_PATH_PARAMS: ProjectPathProps & ServicePathProps & ModulePathParams = {
  accountId: 'testAcc',
  orgIdentifier: 'testOrg',
  projectIdentifier: 'testProject',
  module: 'cd',
  serviceId: 'testService'
}

const setChartVersionName = jest.fn()
const setSelectedChartVersion = jest.fn()
const setIsDetailsDialogOpen = jest.fn()
const setEnvFilter = jest.fn()
const setChartVersionFilter = jest.fn()
const setChartVersionFilterApplied = jest.fn()

describe('ServiceDetailChartVersionCardView tests', () => {
  test('it should not render anything if environmentGroupInstanceDetails is empty under chartVersion prop', () => {
    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <ChartVersionCard
          setChartVersionName={setChartVersionName}
          setSelectedChartVersion={setSelectedChartVersion}
          setIsDetailsDialogOpen={setIsDetailsDialogOpen}
          setEnvFilter={setEnvFilter}
          setChartVersionFilter={setChartVersionFilter}
          chartVersion={{
            environmentGroupInstanceDetails: {
              environmentGroupInstanceDetails: []
            }
          }}
          selectedChartVersion={''}
          setChartVersionFilterApplied={setChartVersionFilterApplied}
        />
      </TestWrapper>
    )

    const chartVersionCardTitle = screen.queryByText('0.0.1')
    expect(chartVersionCardTitle).not.toBeInTheDocument()
    const dashChartVersionCardTitle = screen.queryByText('-')
    expect(dashChartVersionCardTitle).not.toBeInTheDocument()
    expect(container).toMatchInlineSnapshot('<div />')
  })

  test('it should render card with --(dash) as title when chartVersion under chartVersion props is not defined', () => {
    render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <ChartVersionCard
          setChartVersionName={setChartVersionName}
          setSelectedChartVersion={setSelectedChartVersion}
          setIsDetailsDialogOpen={setIsDetailsDialogOpen}
          setEnvFilter={setEnvFilter}
          setChartVersionFilter={setChartVersionFilter}
          chartVersion={selectedChartVersionPreProd}
          selectedChartVersion={''}
          setChartVersionFilterApplied={setChartVersionFilterApplied}
        />
      </TestWrapper>
    )

    const dashChartVersionEnvName = screen.queryAllByText('--')
    expect(dashChartVersionEnvName).toHaveLength(2)
    const preProdType = screen.queryByText('cd.preProductionType')
    expect(preProdType).toBeInTheDocument()
  })

  test('it should show title that is same as chartVersion which is under chartVersion prop', async () => {
    selectedChartVersionProd.chartVersion = '0.0.1'
    render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <ChartVersionCard
          setChartVersionName={setChartVersionName}
          setSelectedChartVersion={setSelectedChartVersion}
          setIsDetailsDialogOpen={setIsDetailsDialogOpen}
          setEnvFilter={setEnvFilter}
          setChartVersionFilter={setChartVersionFilter}
          chartVersion={selectedChartVersionProd}
          selectedChartVersion={''}
          setChartVersionFilterApplied={setChartVersionFilterApplied}
        />
      </TestWrapper>
    )

    const chartVersionCardTitle = screen.queryByText('0.0.1')
    expect(chartVersionCardTitle).toBeInTheDocument()
    const envName = screen.queryByText('Prod Envs')
    expect(envName).toBeInTheDocument()
    const prodType = screen.queryByText('cd.serviceDashboard.prod')
    expect(prodType).toBeInTheDocument()
    const groupLabelText = screen.queryByText('pipeline.verification.tableHeaders.group')
    expect(groupLabelText).toBeInTheDocument()

    userEvent.click(chartVersionCardTitle!)
    await waitFor(() => expect(setChartVersionFilter).toHaveBeenCalledWith('0.0.1'))
    expect(setEnvFilter).toHaveBeenCalledWith({ envId: undefined, isEnvGroup: false })
    expect(setChartVersionFilterApplied).toHaveBeenCalledWith(true)
    expect(setIsDetailsDialogOpen).toHaveBeenCalledWith(true)

    userEvent.click(envName!)
    await waitFor(() => expect(setEnvFilter).toHaveBeenLastCalledWith({ envId: 'prod_envs', isEnvGroup: true }))
    expect(setChartVersionFilter).toHaveBeenCalledWith('0.0.1')
    expect(setChartVersionFilterApplied).toHaveBeenCalledWith(true)
    expect(setIsDetailsDialogOpen).toHaveBeenCalledWith(true)

    const cards = document.getElementsByClassName('artifactCards')
    expect(cards).toHaveLength(1)
    userEvent.click(cards[0])
    await waitFor(() => expect(setSelectedChartVersion).toHaveBeenCalledWith('0.0.1'))
    expect(setChartVersionName).toHaveBeenCalledWith('0.0.1')
  })

  test('it should call callback functions with expected arguments when chart version card is already selected', async () => {
    selectedChartVersionProd.chartVersion = '0.0.1'
    render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <ChartVersionCard
          setChartVersionName={setChartVersionName}
          setSelectedChartVersion={setSelectedChartVersion}
          setIsDetailsDialogOpen={setIsDetailsDialogOpen}
          setEnvFilter={setEnvFilter}
          setChartVersionFilter={setChartVersionFilter}
          chartVersion={selectedChartVersionProd}
          selectedChartVersion={'0.0.1'}
          setChartVersionFilterApplied={setChartVersionFilterApplied}
        />
      </TestWrapper>
    )

    const cards = document.getElementsByClassName('artifactCards')
    expect(cards).toHaveLength(1)
    userEvent.click(cards[0])
    await waitFor(() => expect(setSelectedChartVersion).toHaveBeenCalledWith(undefined))
    expect(setChartVersionName).toHaveBeenCalledWith(undefined)
  })

  test('it should show warning icon when isDrift is true', async () => {
    selectedChartVersionProd.chartVersion = '0.0.1'
    selectedChartVersionProd.environmentGroupInstanceDetails.environmentGroupInstanceDetails[0].isDrift = true
    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <ChartVersionCard
          setChartVersionName={setChartVersionName}
          setSelectedChartVersion={setSelectedChartVersion}
          setIsDetailsDialogOpen={setIsDetailsDialogOpen}
          setEnvFilter={setEnvFilter}
          setChartVersionFilter={setChartVersionFilter}
          chartVersion={selectedChartVersionProd}
          selectedChartVersion={''}
          setChartVersionFilterApplied={setChartVersionFilterApplied}
        />
      </TestWrapper>
    )

    const driftIcon = container.querySelector('span[data-icon="execution-warning"]')
    expect(driftIcon).toBeInTheDocument()
  })
})
