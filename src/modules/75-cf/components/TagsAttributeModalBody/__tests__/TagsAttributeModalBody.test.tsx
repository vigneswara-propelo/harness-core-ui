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

    jest.clearAllMocks()
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

  test('it should call the tags api for searched tags', async () => {
    useGetAllTagsMock.mockReturnValue({
      data: mockTagsPayload,
      error: null,
      loading: false,
      refetch: jest.fn()
    } as any)

    renderComponent()

    const searchBar = screen.getByRole('searchbox')

    await userEvent.type(searchBar, mockTagsPayload.tags[2].identifier)

    expect(searchBar).toHaveValue(mockTagsPayload.tags[2].identifier)

    const searchedTagsPayload = cloneDeep(mockTagsPayload)
    searchedTagsPayload.itemCount = 1
    searchedTagsPayload.tags = [{ identifier: 'tag_3', name: 'tag3' }]

    useGetAllTagsMock.mockReturnValue({
      data: searchedTagsPayload,
      error: null,
      loading: false
    } as any)

    await waitFor(() => {
      expect(useGetAllTagsMock).toHaveBeenCalledWith(
        expect.objectContaining({
          queryParams: expect.objectContaining({ tagIdentifierFilter: mockTagsPayload.tags[2].identifier })
        })
      )
    })

    expect(await screen.findByText(mockTagsPayload.tags[2].name)).toBeInTheDocument()

    expect(screen.queryByText(mockTagsPayload.tags[0].name)).not.toBeInTheDocument()
    expect(screen.queryByText(mockTagsPayload.tags[1].name)).not.toBeInTheDocument()

    for (let i = 3; i < mockTagsPayload.tags.length; i++) {
      expect(screen.queryByText(mockTagsPayload.tags[i].name)).not.toBeInTheDocument()
    }
  })

  test('it should return no searched results if the searched tag does not exist', async () => {
    const nonExistentTag = 'FOOBAR'

    const noTagsPayload = cloneDeep(mockTagsPayload)
    noTagsPayload.itemCount = 0
    noTagsPayload.tags = []

    useGetAllTagsMock.mockReturnValue({
      data: mockTagsPayload,
      error: null,
      loading: false,
      refetch: jest.fn()
    } as any)

    renderComponent()

    const searchBar = screen.getByRole('searchbox')

    await userEvent.type(searchBar, nonExistentTag)

    expect(searchBar).toHaveValue(nonExistentTag)

    await userEvent.clear(searchBar)

    expect(searchBar).not.toHaveValue()

    await userEvent.type(searchBar, nonExistentTag)

    useGetAllTagsMock.mockReturnValue({
      data: noTagsPayload,
      error: null,
      loading: false,
      refetch: jest.fn()
    } as any)

    await waitFor(() => {
      expect(useGetAllTagsMock).toHaveBeenCalledWith(
        expect.objectContaining({
          queryParams: expect.objectContaining({
            tagIdentifierFilter: nonExistentTag
          })
        })
      )
    })

    expect(await screen.findByText('noData')).toBeInTheDocument()
  })

  test('it should disable the search bar if the tags api fails to fetch', async () => {
    useGetAllTagsMock.mockReturnValue({
      data: null,
      error: 'ERROR FETCHING TAGS',
      loading: false,
      refetch: jest.fn()
    } as any)

    renderComponent()

    expect(screen.getByRole('searchbox')).toBeDisabled()
  })
})
