import React from 'react'
import { render, screen, RenderResult } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TestWrapper } from '@common/utils/testUtils'

import { LocationValue } from '../LocationValue'

const defaultProps = {
  locations: ['account:/a1', 'a2'],
  isTooltip: false,
  isHarnessStore: true,
  onClick: jest.fn()
}

function WrapperComponent(props: any): RenderResult {
  const commonProps = {
    ...defaultProps,
    ...props
  }
  return render(
    <TestWrapper>
      <LocationValue {...commonProps} />
    </TestWrapper>
  )
}

describe('Define Location value', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  test('should render locations value', async () => {
    WrapperComponent({})
    const item1 = screen.getByTestId('account:/a10')
    await userEvent.click(item1!)
    expect(item1).toBeInTheDocument()
  })

  test('should render manifest locations value with direct path', async () => {
    WrapperComponent({
      isManifest: true,
      directPath: '/test'
    })
    const locationValueItem = screen.getByTestId('/test')
    expect(locationValueItem).toBeInTheDocument()
    await userEvent.click(locationValueItem!)
  })
  test('should render tooltip', async () => {
    WrapperComponent({
      isTooltip: true
    })
    const locationValueItem = screen.getByText('account:/a1')
    await userEvent.click(locationValueItem!)
    expect(locationValueItem).toBeInTheDocument()
  })
})
