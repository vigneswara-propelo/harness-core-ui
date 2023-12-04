/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import { useFeatureFlagTelemetry } from '@cf/hooks/useFeatureFlagTelemetry'
import SideNav from '../SideNav'

jest.mock('@cf/hooks/useFeatureFlagTelemetry', () => ({
  useFeatureFlagTelemetry: jest.fn(() => ({
    visitedPage: jest.fn(),
    createFeatureFlagStart: jest.fn(),
    createFeatureFlagCompleted: jest.fn()
  }))
}))

jest.mock('@common/hooks/useTelemetry', () => ({
  useTelemetry: () => ({ identifyUser: jest.fn(), trackEvent: jest.fn() })
}))

const renderComponent = (
  path = '/account/:accountId/cf/dashboard/orgs/:orgIdentifier/projects/:projectIdentifier'
): RenderResult =>
  render(
    <TestWrapper path={path} pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}>
      <SideNav />
    </TestWrapper>
  )

describe('Sidenav', () => {
  test('it should render', async () => {
    const { container } = renderComponent()
    expect(container).toMatchSnapshot()
  })

  test('it should show the Git Experience links', async () => {
    renderComponent('/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/setup/access-control/users')

    expect(screen.getByText('cf.shared.gitSync')).toBeInTheDocument()
    expect(screen.getByText('common.secrets')).toBeInTheDocument()
  })

  test('it should fire telemetry event when Feature Flags menu item clicked', async () => {
    renderComponent()

    const featureFlagLink = screen.getByText('featureFlagsText')
    expect(featureFlagLink).toBeInTheDocument()

    await userEvent.click(featureFlagLink)

    expect(useFeatureFlagTelemetry).toHaveBeenCalled()
  })
})
