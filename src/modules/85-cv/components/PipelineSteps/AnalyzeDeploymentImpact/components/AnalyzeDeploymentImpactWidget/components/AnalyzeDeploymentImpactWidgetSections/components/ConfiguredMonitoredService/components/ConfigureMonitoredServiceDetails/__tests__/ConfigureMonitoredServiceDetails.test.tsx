import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ConfigureMonitoredServiceDetails from '../ConfigureMonitoredServiceDetails'

jest.mock('framework/strings', () => ({
  useStrings: () => ({
    getString: (key: string) => key
  })
}))

describe('ConfigureMonitoredServiceDetails', () => {
  test('renders refresh button and calls refetchDetails on click', () => {
    const linkTo = '/details'
    const detailToConfigureText = 'Configure details'
    const refetchDetailsMock = jest.fn()

    const { getByText } = render(
      <ConfigureMonitoredServiceDetails
        linkTo={linkTo}
        detailToConfigureText={detailToConfigureText}
        refetchDetails={refetchDetailsMock}
      />,
      { wrapper: MemoryRouter }
    )

    const refreshButton = getByText('common.refresh')
    fireEvent.click(refreshButton)

    expect(refetchDetailsMock).toHaveBeenCalled()
  })

  test('renders link with correct text and opens in new tab', () => {
    const linkTo = '/details'
    const detailToConfigureText = 'Configure details'
    const { getByText } = render(
      <ConfigureMonitoredServiceDetails
        linkTo={linkTo}
        detailToConfigureText={detailToConfigureText}
        refetchDetails={jest.fn()}
      />,
      { wrapper: MemoryRouter }
    )

    const linkElement = getByText(detailToConfigureText)
    expect(linkElement).toBeInTheDocument()
    expect(linkElement.closest('a')).toHaveAttribute('href', linkTo)
    expect(linkElement.closest('a')).toHaveAttribute('target', '_blank')
  })
})
