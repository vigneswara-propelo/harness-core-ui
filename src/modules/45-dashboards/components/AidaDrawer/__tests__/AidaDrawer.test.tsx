import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import AidaDrawer, { AidaDrawerProps } from '../AidaDrawer'

const testContentText = 'Test Content'
const testComponent = <div>{testContentText}</div>

const renderComponent = (props: Partial<AidaDrawerProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <AidaDrawer isOpen onClose={jest.fn()} {...props}>
        {testComponent}
      </AidaDrawer>
    </TestWrapper>
  )

describe('AidaDrawer', () => {
  test('it should not display content within drawer when closed', async () => {
    renderComponent({ isOpen: false })

    expect(screen.queryByText('dashboards.aida.assist')).not.toBeInTheDocument()
    expect(screen.queryByText(testContentText)).not.toBeInTheDocument()
  })

  test('it should display content within drawer when opened', async () => {
    const { rerender } = renderComponent({ isOpen: false })

    expect(screen.queryByText('dashboards.aida.assist')).not.toBeInTheDocument()
    expect(screen.queryByText(testContentText)).not.toBeInTheDocument()

    rerender(
      <TestWrapper>
        <AidaDrawer isOpen onClose={jest.fn()}>
          {testComponent}
        </AidaDrawer>
      </TestWrapper>
    )

    expect(screen.getByText('dashboards.aida.assist')).toBeInTheDocument()
    expect(screen.getByText(testContentText)).toBeInTheDocument()
  })

  test('it triggers the drawerOpen callback when close is clicked', async () => {
    const mockDrawerToggle = jest.fn()
    const props: AidaDrawerProps = { children: testComponent, isOpen: true, onClose: mockDrawerToggle }
    renderComponent(props)

    const closeButton = screen.getByTestId('close-drawer-button')
    expect(closeButton).toBeInTheDocument()

    await userEvent.click(closeButton)
    expect(mockDrawerToggle).toHaveBeenCalled()
  })
})
