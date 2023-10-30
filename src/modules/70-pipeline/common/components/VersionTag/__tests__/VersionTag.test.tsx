import React from 'react'
import { render, screen } from '@testing-library/react'
import { VersionTag } from '../VersionTag'

test('should render version', () => {
  render(<VersionTag version="v1" />)

  expect(screen.getByText('v1')).toBeInTheDocument()
})
