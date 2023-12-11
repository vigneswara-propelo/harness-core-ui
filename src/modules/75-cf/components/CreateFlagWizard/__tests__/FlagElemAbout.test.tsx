/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { RenderResult, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as cfServiceMock from 'services/cf'
import FlagElemAbout, { FlagElemAboutProps } from '../FlagElemAbout'

const trackEventMock = jest.fn()
jest.mock('@common/hooks/useTelemetry', () => ({
  useTelemetry: () => ({ identifyUser: jest.fn(), trackEvent: trackEventMock })
}))

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

const renderComponent = (isTaggingFlagOn = false, props: Partial<FlagElemAboutProps> = {}): RenderResult => {
  return render(
    <TestWrapper
      path="/account/:accountId/cf/dashboard/orgs/:orgIdentifier/projects/:projectIdentifier"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      defaultFeatureFlagValues={{ FFM_8184_FEATURE_FLAG_TAGGING: isTaggingFlagOn }}
    >
      <FlagElemAbout goBackToTypeSelections={jest.fn()} tags={[]} tagsError={null} {...props} />
    </TestWrapper>
  )
}

describe('FlagElemAbout', () => {
  const useGetAllTagsMock = jest.spyOn(cfServiceMock, 'useGetAllTags')

  beforeEach(() => {
    useGetAllTagsMock.mockReturnValue({ loading: false, data: [], refetch: jest.fn(), error: null } as any)
  })

  test('it should render component', async () => {
    const isTaggingFlagOn = false

    renderComponent(isTaggingFlagOn)

    expect(screen.getByRole('heading', { name: 'cf.creationModal.aboutFlag.aboutFlagHeading' })).toBeInTheDocument()

    // Name and Description input
    expect(screen.getAllByRole('textbox')).toHaveLength(2)

    expect(screen.getByRole('checkbox', { name: 'cf.creationModal.aboutFlag.permaFlag' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'next' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'back' })).toBeInTheDocument()
  })

  test('it should render a Tags dropdown if FFM_8184_FEATURE_FLAG_TAGGING is toggled ON', async () => {
    const isTaggingFlagOn = true
    const newTag = 'my new tag'

    renderComponent(isTaggingFlagOn, { tags: mockTags })

    expect(screen.getByText('tagsLabel')).toBeInTheDocument()

    // Name, Description and Tags input
    expect(screen.getAllByRole('textbox')).toHaveLength(3)

    const tagsDropdownInput = screen.getByPlaceholderText('- tagsLabel -')

    await userEvent.type(tagsDropdownInput, newTag)

    expect(tagsDropdownInput).toHaveValue(newTag)

    await userEvent.click(screen.getByText(newTag))

    await waitFor(() => {
      mockTags.forEach(tag => {
        expect(screen.getByText(tag.name)).toBeInTheDocument()
      })
    })
  })

  test('it should disable tags input if there api fails to fetch tags', async () => {
    const isTaggingFlagOn = true

    renderComponent(isTaggingFlagOn, { tagsError: 'TAGS ERROR' })

    expect(screen.getByPlaceholderText('- tagsLabel -')).toBeDisabled()
  })

  test('it should validate flag name and flag tags', async () => {
    const isTaggingFlagOn = true
    const newTag = 'my new tag'

    renderComponent(isTaggingFlagOn, { tags: mockTags })

    const tagsDropdownInput = screen.getByPlaceholderText('- tagsLabel -')

    await userEvent.type(tagsDropdownInput, newTag)

    expect(tagsDropdownInput).toHaveValue(newTag)

    await userEvent.click(screen.getByText(newTag))

    // searching and assigning 11 tags to a flag
    for (let tagNumber = 1; tagNumber <= 11; tagNumber++) {
      await userEvent.type(tagsDropdownInput, `tag${tagNumber}`)
      await userEvent.click(screen.getByText(`tag${tagNumber}`))
    }

    await userEvent.click(screen.getByRole('button', { name: 'next' }))

    expect(screen.getByText('cf.featureFlags.tagging.inputErrorMessage')).toBeInTheDocument()
    expect(screen.getByText('cf.creationModal.aboutFlag.nameRequired')).toBeInTheDocument()
  })

  test('it should validate if tag name contains over 100 characters', async () => {
    const isTaggingFlagOn = true
    const reallyLongTagName =
      'wziauacethgbagnmrqzmwcbegijpjdibeknxcjlxdzmtfkiwcpcfpdpqtuhysgrgbtccuuvmaibwqduiojrnfjxnkjuxeidrpjjtb'

    renderComponent(isTaggingFlagOn, { tags: mockTags })

    await userEvent.type(screen.getAllByRole('textbox')[0], 'my_flag_name')

    const tagsDropdownInput = screen.getByPlaceholderText('- tagsLabel -')

    await userEvent.type(tagsDropdownInput, reallyLongTagName)

    expect(tagsDropdownInput).toHaveValue(reallyLongTagName)

    await userEvent.click(screen.getByText(reallyLongTagName))

    await userEvent.click(screen.getByRole('button', { name: 'next' }))

    expect(screen.getByText('cf.featureFlags.tagging.inputErrorMessage')).toBeInTheDocument()
  })

  test('it should allow user to insert a space in the tag name', async () => {
    const isTaggingFlagOn = true
    const tagName = 'tag name with spaces'

    renderComponent(isTaggingFlagOn, { tags: mockTags })

    await userEvent.type(screen.getAllByRole('textbox')[0], 'my_flag_name')

    const tagsDropdownInput = screen.getByPlaceholderText('- tagsLabel -')

    await userEvent.type(tagsDropdownInput, tagName)

    await userEvent.click(screen.getByRole('button', { name: 'next' }))

    expect(screen.queryByText('cf.featureFlags.tagging.inputErrorMessage')).not.toBeInTheDocument()
  })

  test('it should validate if a tag contains a comma', async () => {
    const isTaggingFlagOn = true

    renderComponent(isTaggingFlagOn, { tags: mockTags })

    const tagDropdown = document.querySelector('[class="bp3-input-ghost bp3-multi-select-tag-input-input"]')!

    const invalidTagName = 'tagwithacomma,'

    await userEvent.type(tagDropdown, invalidTagName)

    await userEvent.click(screen.getByRole('button', { name: invalidTagName }))

    await userEvent.click(screen.getByRole('button', { name: 'next' }))

    expect(await screen.findByText('cf.featureFlags.tagging.inputErrorMessage')).toBeInTheDocument()
  })
})
