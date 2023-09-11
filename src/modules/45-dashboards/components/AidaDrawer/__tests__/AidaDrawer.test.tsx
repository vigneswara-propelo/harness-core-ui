import React from 'react'
import { act, fireEvent, render, RenderResult, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import AidaDrawer, { AidaDrawerProps } from '..'

const renderComponent = (props: AidaDrawerProps): RenderResult =>
  render(
    <TestWrapper>
      <AidaDrawer {...props} />
    </TestWrapper>
  )

describe('AidaDrawer', () => {
  const testContentText = 'Test Content'
  const testComponent = <div>{testContentText}</div>

  test('it should not display content within drawer when closed', async () => {
    renderComponent({ children: testComponent, isOpen: false, setIsOpen: jest.fn() })

    expect(screen.queryByText('dashboards.aida.assist')).toBeNull()
    expect(screen.queryByText(testContentText)).toBeNull()
  })

  test('it should display content within drawer when opened', async () => {
    const props: AidaDrawerProps = { children: testComponent, isOpen: false, setIsOpen: jest.fn() }
    const { rerender } = renderComponent(props)

    expect(screen.queryByText('dashboards.aida.assist')).toBeNull()
    expect(screen.queryByText(testContentText)).toBeNull()

    rerender(
      <TestWrapper>
        <AidaDrawer {...props} isOpen />
      </TestWrapper>
    )

    expect(screen.getByText('dashboards.aida.assist')).toBeInTheDocument()
    expect(screen.getByText(testContentText)).toBeInTheDocument()
  })

  test('it triggers the drawerOpen callback when close is clicked', async () => {
    const mockDrawerToggle = jest.fn()
    const props: AidaDrawerProps = { children: testComponent, isOpen: true, setIsOpen: mockDrawerToggle }
    renderComponent(props)

    const closeButton = screen.getByTestId('close-drawer-button')
    expect(closeButton).toBeInTheDocument()

    act(() => {
      fireEvent.click(closeButton)
    })
    expect(mockDrawerToggle).toHaveBeenCalled()
  })
})
