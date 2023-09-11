import React from 'react'
import { act, fireEvent, render, RenderResult, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import AidaToolTip from '..'

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

  test('it can trigger hideToolTip callback when close button clicked', () => {
    const onHideMock = jest.fn()
    renderComponent(onHideMock)
    const closeButton = screen.getByTestId('dismiss-tooltip-button')
    act(() => {
      fireEvent.click(closeButton)
    })
    expect(onHideMock).toHaveBeenCalled()
  })
})
