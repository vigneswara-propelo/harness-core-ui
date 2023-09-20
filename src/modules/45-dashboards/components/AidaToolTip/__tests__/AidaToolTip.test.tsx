import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import AidaToolTip from '../AidaToolTip'

const renderComponent = (hideToolTip: () => void = jest.fn()): RenderResult =>
  render(
    <TestWrapper>
      <AidaToolTip hideToolTip={hideToolTip} />
    </TestWrapper>
  )

describe('AidaToolTip', () => {
  test('it should display introduction and help text', () => {
    renderComponent()
    expect(screen.getByText('common.csBot.introduction')).toBeInTheDocument()
    expect(screen.getByText('dashboards.aida.helpText')).toBeInTheDocument()
  })

  test('it can trigger hideToolTip callback when close button clicked', async () => {
    const onHideMock = jest.fn()
    renderComponent(onHideMock)
    const closeButton = screen.getByTestId('dismiss-tooltip-button')

    await userEvent.click(closeButton)
    expect(onHideMock).toHaveBeenCalled()
  })
})
