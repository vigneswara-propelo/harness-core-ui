/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import { cloneDeep } from 'lodash-es'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as cfServices from 'services/cf'
import { CF_DEFAULT_PAGE_SIZE } from '@cf/utils/CFUtils'
import mockTagsPayload, { generateTags } from '@modules/75-cf/pages/feature-flags/__tests__/data/mockTagsPayload'
import TagsAttributeModalBody, { TagsAttributeModalBodyProps } from '../TagsAttributeModalBody'

const renderComponent = (props: Partial<TagsAttributeModalBodyProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <TagsAttributeModalBody onSelectChange={jest.fn()} selectedData={[]} {...props} />
    </TestWrapper>
  )

describe('TagsAttributeModalBody', () => {
  const useGetAllTagsMock = jest.spyOn(cfServices, 'useGetAllTags')
  beforeEach(() => {
    useGetAllTagsMock.mockReturnValue({
      data: null,
      loading: false,
      error: null,
      refetch: jest.fn()
    } as any)
  })

  test('it should display empty state correctly', async () => {
    useGetAllTagsMock.mockReturnValue({
      data: {
        itemCount: 0,
        pageCount: 0,
        pageIndex: 0,
        pageSize: 15,
        tags: []
      },
      error: null,
      loading: false,
      refetch: jest.fn()
    } as any)

    renderComponent()

    expect(screen.getByText('noData')).toBeInTheDocument()
  })

  test('it should handle error state correctly', async () => {
    const mockRefetchTags = jest.fn()
    const TAGS_ERROR = 'FAIL TO FETCH TAGS'

    useGetAllTagsMock.mockReturnValue({
      data: null,
      error: { message: TAGS_ERROR },
      loading: false,
      refetch: mockRefetchTags
    } as any)

    renderComponent()

    expect(screen.getByText(TAGS_ERROR)).toBeInTheDocument()

    await waitFor(() => expect(mockRefetchTags).not.toHaveBeenCalled())

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))

    await waitFor(() => expect(mockRefetchTags).toHaveBeenCalled())
  })

  test('it should display spinner in its loading state', async () => {
    useGetAllTagsMock.mockReturnValue({
      data: null,
      error: null,
      loading: true,
      refetch: jest.fn()
    } as any)

    renderComponent()

    expect(document.querySelector('.bp3-spinner')).toBeInTheDocument()
  })

  test('it should display pagination component when tags number exceed 15', async () => {
    const mockRefetchTags = jest.fn()

    const lotsOfTags = cloneDeep(mockTagsPayload)

    lotsOfTags.itemCount = generateTags(17).length
    lotsOfTags.pageCount = Math.ceil(generateTags(17).length / CF_DEFAULT_PAGE_SIZE)
    lotsOfTags.pageIndex = 0
    lotsOfTags.pageSize = CF_DEFAULT_PAGE_SIZE
    lotsOfTags.tags = generateTags(17)

    useGetAllTagsMock.mockReturnValue({
      data: lotsOfTags,
      error: null,
      loading: false,
      refetch: mockRefetchTags
    } as any)

    renderComponent()

    expect(await screen.findByRole('button', { name: 'Prev' })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Next' })).toBeInTheDocument()
  })
})
