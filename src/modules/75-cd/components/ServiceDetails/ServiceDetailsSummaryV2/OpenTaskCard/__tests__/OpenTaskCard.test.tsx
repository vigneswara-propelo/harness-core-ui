/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { modulePathProps, projectPathProps, servicePathProps } from '@common/utils/routeUtils'
import type { ModulePathParams, ProjectPathProps, ServicePathProps } from '@common/interfaces/RouteInterfaces'
import { OpenTaskCard } from '../OpenTaskCard'

const TEST_PATH = routes.toServiceStudio({ ...projectPathProps, ...modulePathProps, ...servicePathProps })

const TEST_PATH_PARAMS: ProjectPathProps & ServicePathProps & ModulePathParams = {
  accountId: 'testAcc',
  orgIdentifier: 'testOrg',
  projectIdentifier: 'testProject',
  module: 'cd',
  serviceId: 'testService'
}

describe('OpenTaskCard tests', () => {
  test('open task card renders WITHOUT See more button when failureDetails is NOT present', () => {
    const openTask = {
      name: 'k8sserivceinstance deployment failed'
    }
    render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <OpenTaskCard openTask={openTask} />
      </TestWrapper>
    )

    const cardMainDetail = screen.getByText('k8sserivceinstance deployment failed')
    expect(cardMainDetail).toBeInTheDocument()

    const seeMoreButton = screen.queryByText('common.seeMore')
    expect(seeMoreButton).not.toBeInTheDocument()
  })

  test('open task card renders WITH See more button when failureDetails IS present', () => {
    const openTask = {
      name: 'k8sserivceinstance deployment failed',
      failureDetail: 'Kubernetes deployment failed with error: Unauthorised'
    }
    render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <OpenTaskCard openTask={openTask} />
      </TestWrapper>
    )

    const cardMainDetail = screen.getByText('k8sserivceinstance deployment failed')
    expect(cardMainDetail).toBeInTheDocument()

    const seeMoreButton = screen.getByText('common.seeMore')
    expect(seeMoreButton).toBeInTheDocument()
  })

  test('clicking on See more button should display failureDetails', async () => {
    const openTask = {
      name: 'k8sserivceinstance deployment failed',
      failureDetail: 'Kubernetes deployment failed with error: Unauthorised'
    }
    render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <OpenTaskCard openTask={openTask} />
      </TestWrapper>
    )

    const cardMainDetail = screen.getByText('k8sserivceinstance deployment failed')
    expect(cardMainDetail).toBeInTheDocument()

    // Clicking on See more button should display failure details
    const seeMoreButton = screen.getByText('common.seeMore')
    expect(seeMoreButton).toBeInTheDocument()
    fireEvent.click(seeMoreButton)
    const failureDetail = await screen.findByText('Kubernetes deployment failed with error: Unauthorised')
    expect(failureDetail).toBeInTheDocument()

    // Clicking on See less button should hide failure details
    const seeLessButton = screen.getByText('common.seeLess')
    expect(seeLessButton).toBeInTheDocument()
    fireEvent.click(seeLessButton)
    const failureDetail1 = screen.queryByText('Kubernetes deployment failed with error: Unauthorised')
    expect(failureDetail1).not.toBeInTheDocument()
  })
})
