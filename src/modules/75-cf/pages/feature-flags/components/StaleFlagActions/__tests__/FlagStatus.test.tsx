import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import { FeatureFlagStatus, FlagStatus, FlagStatusProps } from '@cf/pages/feature-flags/FlagStatus'
import { TestWrapper } from '@common/utils/testUtils'

const renderComponent = (props: Partial<FlagStatusProps> = {}): RenderResult =>
  render(
    <TestWrapper defaultFeatureFlagValues={{ FFM_8344_FLAG_CLEANUP: true }}>
      <FlagStatus status={FeatureFlagStatus.NEVER_REQUESTED} lastAccess={-6795364578871} {...props} />
    </TestWrapper>
  )

describe('FlagStatus', () => {
  test('it should render the component', () => {
    renderComponent({ stale: false })

    expect(screen.getByText(FeatureFlagStatus.NEVER_REQUESTED.toLocaleUpperCase())).toBeVisible()
    expect(screen.getByText('cf.featureFlags.makeSure')).toBeVisible()
  })

  test('it should display last access time when active status', () => {
    renderComponent({ stale: false, status: FeatureFlagStatus.ACTIVE })

    expect(screen.getByText(FeatureFlagStatus.ACTIVE.toLocaleUpperCase())).toBeVisible()
    expect(screen.getByText('dummy date')).toBeVisible()
  })

  test('it should render waiting for cleanup status', () => {
    renderComponent({ stale: true })

    expect(screen.getByText('cf.staleFlagAction.waitingForCleanup'.toLocaleUpperCase())).toBeVisible()
  })
})
