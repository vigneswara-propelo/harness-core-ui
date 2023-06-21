import React from 'react'
import { render } from '@testing-library/react'
import { Button } from '@harness/uicore'
import StageControls from '../StageControls'
import { StageControlButton } from '../StageControlButton'

describe('StageControls tests', () => {
  test('should render 3 buttons and 2 separators', () => {
    const { container, getByText } = render(
      <StageControls>
        <StageControlButton title="button1" />
        <StageControlButton title="button2" />
        <StageControlButton title="button3" />
      </StageControls>
    )

    expect(getByText('button1')).toBeDefined()
    expect(getByText('button2')).toBeDefined()
    expect(getByText('button3')).toBeDefined()
    const separators = container.getElementsByClassName('separator')
    expect(separators.length).toBe(2)
  })

  test('should render custom content', () => {
    const { getByRole } = render(
      <StageControls>
        <Button />
      </StageControls>
    )

    expect(getByRole('button')).toBeDefined()
  })
})
