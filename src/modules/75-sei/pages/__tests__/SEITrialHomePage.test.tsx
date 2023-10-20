import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@modules/10-common/utils/testUtils'
import SEITrialHomePage from '../SEITrialPage/SEITrialPage'

test('renders SEITrialHomePage component', () => {
  const { getByText } = render(
    <TestWrapper>
      <SEITrialHomePage />
    </TestWrapper>
  )
  const element = getByText('common.purpose.sei.fullName')
  expect(element).toBeInTheDocument()
})
