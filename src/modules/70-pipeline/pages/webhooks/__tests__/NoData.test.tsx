/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@modules/10-common/utils/testUtils'
import NoData from '../NoData'

describe('NoData component tests', () => {
  test('render component with search term', () => {
    const { getByText } = render(
      <TestWrapper>
        <NoData hasFilters={false} searchTerm={'webhook-test'} emptyContent={<></>} />
      </TestWrapper>
    )
    expect(getByText('common.noSearchResultsFound')).toBeInTheDocument()
    expect(getByText('common.searchOther')).toBeInTheDocument()
  })
  test('render component with filters', async () => {
    const clearFilters = jest.fn()
    const { getByText, getByTestId } = render(
      <TestWrapper>
        <NoData hasFilters={true} emptyContent={<></>} clearFilters={clearFilters} />
      </TestWrapper>
    )
    expect(getByText('common.filters.noMatchingFilterData')).toBeInTheDocument()
    expect(getByText('common.filters.clearFilters')).toBeInTheDocument()
    const clearFilterBtn = getByTestId('clear-filters')
    await userEvent.click(clearFilterBtn)
    expect(clearFilters).toHaveBeenCalled()
  })
  test('render component with empty content', () => {
    const { getByText } = render(
      <TestWrapper>
        <NoData hasFilters={false} emptyContent={<>Empty Content</>} />
      </TestWrapper>
    )
    expect(getByText('Empty Content')).toBeInTheDocument()
  })
})
