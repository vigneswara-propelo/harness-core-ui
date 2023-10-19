import React from 'react'
import { render } from '@testing-library/react'
import SEITrialHomePage from '../SEITrialHomePage'

test('renders SEITrialHomePage component', () => {
  const { getByText } = render(<SEITrialHomePage />)
  const element = getByText('SEITrialHomePage')
  expect(element).toBeInTheDocument()
})
