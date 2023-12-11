/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import TagFilter, { TagFilterProps } from '../TagFilter'
import mockTagsPayload from '../../__tests__/data/mockTagsPayload'

const renderComponent = (props: Partial<TagFilterProps>): RenderResult =>
  render(
    <TestWrapper>
      <TagFilter
        disabled={false}
        tagsData={mockTagsPayload.tags}
        onTagSearch={jest.fn()}
        onFilterChange={jest.fn()}
        tagFilter={[]}
        {...props}
      />
    </TestWrapper>
  )

describe('TagFilter', () => {
  test('it should display a list of tags', async () => {
    renderComponent({
      tagsData: mockTagsPayload.tags,
      disabled: false,
      tagFilter: [],
      onFilterChange: jest.fn()
    })

    await userEvent.click(screen.getByText('tagsLabel'))

    mockTagsPayload.tags.forEach(tag => {
      expect(screen.getByText(tag.name)).toBeInTheDocument()
    })
  })

  test('it should call the filter callback on tag selection', async () => {
    const onFilterChangeMock = jest.fn()

    renderComponent({
      tagsData: mockTagsPayload.tags,
      disabled: false,
      tagFilter: [],
      onFilterChange: onFilterChangeMock
    })

    await userEvent.click(screen.getByText('tagsLabel'))

    expect(onFilterChangeMock).not.toHaveBeenCalled()

    await userEvent.click(screen.getByText('tag5'))
    await waitFor(() => expect(onFilterChangeMock).toHaveBeenCalledWith([{ label: 'tag5', value: 'tag_5' }]))

    await userEvent.click(screen.getByText('tag1'))
    await waitFor(() => expect(onFilterChangeMock).toHaveBeenCalledWith([{ label: 'tag1', value: 'tag_1' }]))

    // deselecting a tag
    await userEvent.click(screen.getByText('tag1'))
    await waitFor(() => expect(onFilterChangeMock).toHaveBeenCalledWith([{ label: 'tag1', value: 'tag_1' }]))
  })

  test('it should not be clickable if tag dropdown is disabled', async () => {
    renderComponent({ tagsData: [], disabled: true, tagFilter: [] })

    expect(
      document.querySelector('[class="bp3-popover-wrapper MultiSelectDropDown--main MultiSelectDropDown--disabled"]')
    ).toBeInTheDocument()

    await userEvent.click(screen.getByText('tagsLabel'))

    mockTagsPayload.tags.forEach(tag => {
      expect(screen.queryByText(tag.name)).not.toBeInTheDocument()
    })
  })

  test('it should show correct empty state when there are no available tags', async () => {
    renderComponent({ tagsData: undefined, disabled: undefined, tagFilter: [] })

    await userEvent.click(screen.getByText('tagsLabel'))

    expect(screen.getByText('No matching results found')).toBeInTheDocument()
  })

  test('it should call the tagSearch callback with the correct value when user performs a search', async () => {
    const onTagSearchMock = jest.fn()
    const input = 'tag7'

    renderComponent({ tagsData: mockTagsPayload.tags, disabled: false, tagFilter: [], onTagSearch: onTagSearchMock })

    await userEvent.click(screen.getByText('tagsLabel'))

    expect(onTagSearchMock).not.toHaveBeenCalled()

    const tagsSearchbox = screen.getByRole('searchbox')

    await userEvent.type(tagsSearchbox, input)

    await waitFor(() => expect(onTagSearchMock).toHaveBeenCalledWith(input))

    expect(screen.getByRole('checkbox', { name: input })).toBeInTheDocument()

    for (let i = 0; i < mockTagsPayload.tags.length - 1; i++) {
      expect(screen.queryByText(mockTagsPayload.tags[i].name)).not.toBeInTheDocument()
    }

    await userEvent.clear(tagsSearchbox)

    await userEvent.type(tagsSearchbox, 'NONEXISTENT_TAG')

    await waitFor(() => expect(onTagSearchMock).toHaveBeenCalledWith('NONEXISTENT_TAG'))

    for (let i = 0; i <= mockTagsPayload.tags.length - 1; i++) {
      await waitFor(() => expect(screen.queryByText(mockTagsPayload.tags[i].name)).not.toBeInTheDocument())
    }
  })
})
