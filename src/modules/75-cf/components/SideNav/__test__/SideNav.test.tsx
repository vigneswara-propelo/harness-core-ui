/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import { useFeatureFlagTelemetry } from '@cf/hooks/useFeatureFlagTelemetry'
import SideNav from '../SideNav'

jest.mock('@cf/hooks/useFeatureFlagTelemetry', () => ({
  useFeatureFlagTelemetry: jest.fn(() => ({
    visitedPage: jest.fn(),
    createFeatureFlagStart: jest.fn(),
    createFeatureFlagCompleted: jest.fn()
  }))
}))

jest.mock('@common/hooks/useQueryParams', () => ({
  useQueryParams: () => jest.fn(),
  queryParamDecodeAll: jest.fn()
}))

jest.mock('@common/hooks/useTelemetry', () => ({
  useTelemetry: () => ({ identifyUser: jest.fn(), trackEvent: jest.fn() })
}))

jest.mock('@cf/pages/pipeline-studio/views/FeatureFlagStage', () => ({
  registerFeatureFlagPipelineStage: jest.fn()
}))

jest.mock('@cf/components/PipelineSteps', () => ({
  registerFlagConfigurationPipelineStep: jest.fn()
}))

describe('Sidenav', () => {
  const Subject: React.FC<{ path?: string; defaultAppStoreValues?: TestWrapperProps['defaultAppStoreValues'] }> = ({
    path = '/account/:accountId/cf/dashboard/orgs/:orgIdentifier/projects/:projectIdentifier',
    defaultAppStoreValues
  }) => (
    <TestWrapper
      path={path}
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      defaultAppStoreValues={defaultAppStoreValues}
    >
      <SideNav />
    </TestWrapper>
  )

  test('it should render', () => {
    const { container } = render(<Subject />)
    expect(container).toMatchSnapshot()
  })

  test('it should hide the Git Experience links when isGitSimplificationEnabled FALSE', async () => {
    render(
      <Subject
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/setup/access-control/users"
        defaultAppStoreValues={{ isGitSimplificationEnabled: false }}
      />
    )

    expect(screen.queryByText('cf.shared.gitSync')).not.toBeInTheDocument()
    expect(screen.queryByText('common.secrets')).not.toBeInTheDocument()
  })

  test('it should show the Git Experience links when isGitSimplificationEnabled is TRUE', async () => {
    render(
      <Subject
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/setup/access-control/users"
        defaultAppStoreValues={{ isGitSimplificationEnabled: true }}
      />
    )

    expect(screen.getByText('cf.shared.gitSync')).toBeInTheDocument()
    expect(screen.getByText('common.secrets')).toBeInTheDocument()
  })

  test('it should fire telemetry event when Feature Flags menu item clicked', () => {
    render(<Subject />)

    const featureFlagLink = screen.getByText('featureFlagsText')
    expect(featureFlagLink).toBeInTheDocument()

    fireEvent.click(featureFlagLink)

    expect(useFeatureFlagTelemetry).toHaveBeenCalled()
  })
})
