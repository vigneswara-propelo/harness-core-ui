import React from 'react'
import { render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import DataInfoSelector from '../DataInfoSelector'

jest.mock('services/cv', () => ({
  useGetAllAwsRegions: jest.fn().mockImplementation(() => {
    return { data: null, loading: true } as any
  }),
  useGetPrometheusWorkspaces: jest.fn().mockImplementation(() => {
    return { data: null, loading: true } as any
  })
}))

describe('DataInfoSelector', () => {
  test('should test whether loading placeholder is being shown in dropdowns during API call in progress', () => {
    render(
      <TestWrapper>
        <DataInfoSelector />
      </TestWrapper>
    )

    expect(screen.getAllByPlaceholderText(/- loading -/)).toHaveLength(2)
  })
})
