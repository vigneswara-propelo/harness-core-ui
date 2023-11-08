/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik } from '@harness/uicore'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import TagFilter, { TagFilterProps } from '../TagFilter'
import mockTagsPayload from '../../__tests__/data/mockTagsPayload'

const renderComponent = (props: Partial<TagFilterProps>): RenderResult =>
  render(
    <Formik initialValues={{}} onSubmit={jest.fn()} formName="tag-filter">
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <TagFilter
          disabled={false}
          tagsData={mockTagsPayload.tags}
          onTagSearch={jest.fn()}
          onFilterChange={jest.fn()}
          tagFilter={[]}
          {...props}
        />
      </TestWrapper>
    </Formik>
  )

describe('TagFilter', () => {
  test('it should return the correct tag name when searched', async () => {
    renderComponent({ tagsData: mockTagsPayload.tags, disabled: false, tagFilter: [{ label: 't1', value: 't1' }] })

    const tagsDropdown = screen.getByRole('textbox')

    await userEvent.type(tagsDropdown, mockTagsPayload.tags[0].name)

    expect(tagsDropdown).toHaveValue(mockTagsPayload.tags[0].name)
  })

  test('it should display a list of tags', async () => {
    const onFilterChangeMock = jest.fn()
    renderComponent({
      tagsData: mockTagsPayload.tags,
      disabled: false,
      tagFilter: [],
      onFilterChange: onFilterChangeMock
    })

    const tagsDropdown = screen.getByRole('textbox')

    await userEvent.type(tagsDropdown, 'tag')

    mockTagsPayload.tags.forEach(tag => {
      expect(screen.getByText(tag.name)).toBeInTheDocument()
    })

    await userEvent.click(screen.getByText('tag5'))

    await waitFor(() => expect(onFilterChangeMock).toHaveBeenCalledWith([{ label: 'tag5', value: 'tag_5' }]))
  })

  test('it should not be clickable if tag dropdown is disabled', async () => {
    renderComponent({ tagsData: [], disabled: true, tagFilter: [] })

    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  test('it should show correct empty state when there are no available tags', async () => {
    renderComponent({ tagsData: undefined, disabled: undefined, tagFilter: undefined, onFilterChange: undefined })

    const tagsDropdown = screen.getByRole('textbox')

    await userEvent.click(tagsDropdown)

    await waitFor(() => expect(tagsDropdown).toHaveValue(''))
  })

  test('it should allow tags to be searched', async () => {
    const onTagSearchMock = jest.fn()

    renderComponent({ onTagSearch: onTagSearchMock })

    await waitFor(() => expect(onTagSearchMock).not.toHaveBeenCalled())

    await userEvent.type(screen.getByRole('textbox'), 'tag1')

    await waitFor(() => expect(onTagSearchMock).toHaveBeenCalled())
  })
})
