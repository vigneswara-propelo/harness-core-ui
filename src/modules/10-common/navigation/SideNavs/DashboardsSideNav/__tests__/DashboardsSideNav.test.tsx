import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import DashboardsSideNav from '../DashboardsSideNav'

const renderComponent = (isMfeEnabled: boolean): RenderResult =>
  render(
    <TestWrapper defaultFeatureFlagValues={{ CDB_MFE_ENABLED: isMfeEnabled }}>
      <DashboardsSideNav />
    </TestWrapper>
  )

describe('DashboardsSideNav', () => {
  test('it should nav when MFE enabled', () => {
    renderComponent(true)
    expect(screen.getByText('overview')).toBeInTheDocument()
  })

  test('it should nav when MFE not enabled', () => {
    renderComponent(false)
    expect(screen.getByText('common.dashboards')).toBeInTheDocument()
    expect(screen.getByText('common.folders')).toBeInTheDocument()
  })
})
