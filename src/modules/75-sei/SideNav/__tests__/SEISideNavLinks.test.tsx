import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom' // Use MemoryRouter to simulate routing
import { NAV_MODE } from '@modules/10-common/utils/routeUtils'
import { TestWrapper } from '@modules/10-common/utils/testUtils'
import SEISideNavLinks from '../SEISideNavLinks'

describe('SEISideNavLinks Component', () => {
  const props = {
    mode: NAV_MODE.MODULE
  } as any

  test('renders SEISideNavLinks component', () => {
    render(
      <MemoryRouter>
        <TestWrapper>
          <SEISideNavLinks {...props} />
        </TestWrapper>
      </MemoryRouter>
    )

    const dataSettingsLabel = screen.getByText('sei.accountSettings.dataSettings.label')
    const integrationsLabel = screen.getByText('sei.accountSettings.dataSettings.integrations')
    const contributorsLabel = screen.getByText('sei.accountSettings.dataSettings.contributors')

    expect(dataSettingsLabel).toBeInTheDocument()
    expect(integrationsLabel).toBeInTheDocument()
    expect(contributorsLabel).toBeInTheDocument()
  })
})
