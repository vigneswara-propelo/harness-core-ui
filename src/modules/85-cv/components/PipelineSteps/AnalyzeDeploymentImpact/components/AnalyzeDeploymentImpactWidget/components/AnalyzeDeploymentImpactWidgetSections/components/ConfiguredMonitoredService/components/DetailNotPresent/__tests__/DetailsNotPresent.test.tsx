import React from 'react'
import { render } from '@testing-library/react'
import DetailNotPresent from '../DetailNotPresent'

describe('DetailNotPresent', () => {
  test('renders detail not present message correctly', () => {
    const detailNotPresentMessage = 'No details found.'
    const { getByText } = render(<DetailNotPresent detailNotPresentMessage={detailNotPresentMessage} />)

    const messageElement = getByText(detailNotPresentMessage)
    expect(messageElement).toBeInTheDocument()
  })
})
