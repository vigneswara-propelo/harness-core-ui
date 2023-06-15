import React from 'react'
import { render } from '@testing-library/react'
import ConfiguredLabel from '../ConfiguredLabel'

jest.mock('framework/strings', () => ({
  useStrings: () => ({
    getString: (key: string) => key
  })
}))

describe('ConfiguredLabel', () => {
  test('should render "not configured" label when count is 0', () => {
    const { getByText } = render(<ConfiguredLabel count={0} />)
    expect(getByText('CV.COMMONMONITOREDSERVICES.NOTCONFIGURED')).toBeInTheDocument()
  })

  test('should render "configured" label with count when count is not 0', () => {
    const { getByText } = render(<ConfiguredLabel count={5} />)
    expect(getByText('CV.COMMONMONITOREDSERVICES.CONFIGURED (5)')).toBeInTheDocument()
  })
})
