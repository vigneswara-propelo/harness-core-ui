/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, waitFor, RenderResult } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import TagsList, { TagsListProps } from '../TagsList'

const renderComponent = (props: Partial<TagsListProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <TagsList tags={[]} {...props} />
    </TestWrapper>
  )

describe('TagsList', () => {
  test('it should display tags', async () => {
    const mockTags = [
      { name: 'tag1', identifier: 'tag_1' },
      { name: 'tag2', identifier: 'tag_2' },
      { name: 'tag3', identifier: 'tag_3' },
      { name: 'tag4', identifier: 'tag_4' },
      { name: 'tag5', identifier: 'tag_5' },
      { name: 'tag6', identifier: 'tag_6' },
      { name: 'tag7', identifier: 'tag_7' },
      { name: 'tag8', identifier: 'tag_8' },
      { name: 'tag9', identifier: 'tag_9' },
      { name: 'tag10', identifier: 'tag_10' },
      { name: 'tag11', identifier: 'tag_11' },
      { name: 'tag12', identifier: 'tag_12' },
      { name: 'tag13', identifier: 'tag_13' },
      { name: 'tag14', identifier: 'tag_14' },
      { name: 'tag15', identifier: 'tag_15' }
    ]

    renderComponent({ tags: mockTags })

    expect(screen.getByRole('heading', { name: 'tagsLabel' })).toBeInTheDocument()

    await waitFor(() => {
      mockTags.forEach(tag => {
        expect(screen.getByText(tag.name)).toBeInTheDocument()
      })
    })

    expect(screen.queryByText('cf.featureFlags.tagging.emptyState')).not.toBeInTheDocument()
  })

  test('it should display the empty state when tags is undefined', async () => {
    renderComponent({ tags: undefined })

    expect(screen.getByText('cf.featureFlags.tagging.emptyState')).toBeInTheDocument()
  })

  test('it should display the empty state when tags is empty', async () => {
    renderComponent({ tags: [] })

    expect(screen.getByText('cf.featureFlags.tagging.emptyState')).toBeInTheDocument()
  })
})
