import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import ErrorCard, { ErrorCardSize } from '../ErrorCard/ErrorCard'

describe('error card tests', () => {
  test('render without passing size', () => {
    const { queryByText } = render(
      <TestWrapper>
        <ErrorCard />
      </TestWrapper>
    )

    expect(queryByText('warning-sign')).not.toBeNull()
    expect(queryByText('projectsOrgs.apiError')).not.toBeNull()
  })

  test('click on retry', () => {
    const retry = jest.fn()
    const { container } = render(
      <TestWrapper>
        <ErrorCard size={ErrorCardSize.MEDIUM} onRetry={retry} />
      </TestWrapper>
    )
    const button = container.querySelector('.bp3-button')
    fireEvent.click(button!)
    expect(retry).toBeCalled()
  })

  test('click on retry for small size', () => {
    const retry = jest.fn()
    const { container } = render(
      <TestWrapper>
        <ErrorCard size={ErrorCardSize.SMALL} onRetry={retry} />
      </TestWrapper>
    )
    const button = container.querySelector('.bp3-button')
    fireEvent.click(button!)
    expect(retry).toBeCalled()
  })
})
