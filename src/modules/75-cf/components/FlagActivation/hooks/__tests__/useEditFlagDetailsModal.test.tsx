/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Formik } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import mockFeature from '@cf/components/EditFlagTabs/__tests__/mockFeature'
import { Feature } from 'services/cf'
import { mockDisabledGitSync } from '@modules/75-cf/utils/testData/data/mockGitSync'
import useEditFlagDetailsModal, { UseEditFlagDetailsModalProps } from '../useEditFlagDetailsModal'

const mockAllTags = [
  {
    label: 'tag4',
    value: 'tag4Id'
  },
  {
    label: 'hello',
    value: 'helloId'
  },
  {
    label: 'tag3',
    value: 'tag3Id'
  },
  {
    label: 'tag2',
    value: 'tag2Id'
  },
  {
    label: 'tag1',
    value: 'tag1Id'
  }
]

const openEditFlagModalBtn = 'Open Edit Flag modal'

const WrapperComponent: FC<UseEditFlagDetailsModalProps> = ({
  featureFlag,
  gitSync,
  refetchFlag,
  submitPatch,
  setGovernanceMetadata,
  tagsData,
  tagsDisabled
}) => {
  const { openEditDetailsModal } = useEditFlagDetailsModal({
    featureFlag,
    gitSync,
    refetchFlag,
    submitPatch,
    setGovernanceMetadata,
    tagsData,
    tagsDisabled
  })

  return <button onClick={() => openEditDetailsModal()}>{openEditFlagModalBtn}</button>
}

const renderComponent = (props: Partial<UseEditFlagDetailsModalProps> = {}, isTaggingFFOn: boolean): RenderResult => {
  return render(
    <TestWrapper defaultFeatureFlagValues={{ FFM_8184_FEATURE_FLAG_TAGGING: isTaggingFFOn }}>
      <Formik initialValues={{}} onSubmit={jest.fn()} formName="test">
        <WrapperComponent
          featureFlag={mockFeature as Feature}
          gitSync={mockDisabledGitSync}
          refetchFlag={jest.fn()}
          submitPatch={jest.fn()}
          setGovernanceMetadata={jest.fn()}
          tagsData={mockAllTags}
          tagsDisabled={false}
          {...props}
        />
      </Formik>
    </TestWrapper>
  )
}

describe('useEditFlagDetailsModal', () => {
  beforeEach(() => jest.clearAllMocks())

  test('it should open the modal correctly', async () => {
    const isTaggingFFOn = false
    renderComponent(
      {
        featureFlag: mockFeature as Feature,
        tagsData: mockAllTags
      },
      isTaggingFFOn
    )

    await userEvent.click(screen.getByRole('button', { name: openEditFlagModalBtn }))

    expect(screen.getByRole('heading', { name: 'cf.editDetails.editDetailsHeading' })).toBeInTheDocument()

    expect(screen.getByRole('button', { name: 'save' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'cancel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
  })

  test('it should disable the Tags dropdown if there is a tags error or it is loading', async () => {
    const isTaggingFFOn = true

    renderComponent(
      {
        featureFlag: mockFeature as Feature,
        tagsData: [],
        tagsDisabled: true
      },
      isTaggingFFOn
    )
    await userEvent.click(screen.getByRole('button', { name: openEditFlagModalBtn }))
    expect(screen.getByText('tagsLabel').closest('div')).toHaveClass('bp3-form-group bp3-disabled')
  })

  test('it should allow user to create a new tag and assign existing tags to a flag correctly', async () => {
    const isTaggingFFOn = true
    const submitPatchMock = jest.fn(() => Promise.resolve({}))

    renderComponent(
      {
        featureFlag: mockFeature as Feature,
        tagsData: mockAllTags,
        tagsDisabled: false,
        submitPatch: submitPatchMock
      },
      isTaggingFFOn
    )

    await userEvent.click(screen.getByRole('button', { name: openEditFlagModalBtn }))

    expect(screen.getByText(mockFeature.tags[0].name)).toBeInTheDocument()

    const tagDropdown = document.querySelector('[class="bp3-input-ghost bp3-multi-select-tag-input-input"]')!

    const myNewTag = 'RBAC TEAM'

    await userEvent.type(tagDropdown, myNewTag)

    await waitFor(() => expect(tagDropdown).toHaveValue(myNewTag))

    await waitFor(() => userEvent.click(document.querySelector('[data-icon="plus"]')!))

    await userEvent.click(screen.getByText(mockAllTags[0].label))
    await userEvent.click(screen.getByText(mockAllTags[1].label))

    await waitFor(() => expect(submitPatchMock).not.toHaveBeenCalled())

    await userEvent.click(screen.getByRole('button', { name: 'save' }))

    await waitFor(() =>
      expect(submitPatchMock).toHaveBeenCalledWith({
        instructions: [
          { kind: 'addTag', parameters: { identifier: 'RBAC_TEAM', name: 'RBAC TEAM' } },
          { kind: 'addTag', parameters: { identifier: 'tag4Id', name: 'tag4' } },
          { kind: 'addTag', parameters: { identifier: 'helloId', name: 'hello' } }
        ]
      })
    )
  })

  test('it should validate if a tag is over 100 characters long', async () => {
    const isTaggingFFOn = true
    const submitPatchMock = jest.fn()

    renderComponent(
      {
        featureFlag: mockFeature as Feature,
        tagsData: mockAllTags,
        tagsDisabled: false,
        submitPatch: submitPatchMock
      },
      isTaggingFFOn
    )

    await userEvent.click(screen.getByRole('button', { name: openEditFlagModalBtn }))

    const tagDropdown = document.querySelector('[class="bp3-input-ghost bp3-multi-select-tag-input-input"]')!

    const reallyLongTagName =
      'erthyretyyttmbtepytisqfbhyecpkuiegaadwqrebspzrfswxskupfawwylzxjbpchjcfbawbyqosuqhiafvvuqncgsnxvvovnynuzfmfrghwzwvifz'

    await userEvent.type(tagDropdown, reallyLongTagName)

    await userEvent.click(screen.getByRole('button', { name: reallyLongTagName }))

    expect(await screen.findByText('cf.featureFlags.tagging.inputErrorMessage')).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'save' })).toBeDisabled()
    expect(submitPatchMock).not.toHaveBeenCalled()
  })

  test('it should validate if a tag contains a comma', async () => {
    const isTaggingFFOn = true
    const submitPatchMock = jest.fn()

    renderComponent(
      {
        featureFlag: mockFeature as Feature,
        tagsData: mockAllTags,
        tagsDisabled: false,
        submitPatch: submitPatchMock
      },
      isTaggingFFOn
    )

    await userEvent.click(screen.getByRole('button', { name: openEditFlagModalBtn }))

    const tagDropdown = document.querySelector('[class="bp3-input-ghost bp3-multi-select-tag-input-input"]')!

    const invalidTagName = 'tagwithacomma,'

    await userEvent.type(tagDropdown, invalidTagName)

    await userEvent.click(screen.getByRole('button', { name: invalidTagName }))

    expect(await screen.findByText('cf.featureFlags.tagging.inputErrorMessage')).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'save' })).toBeDisabled()
    expect(submitPatchMock).not.toHaveBeenCalled()
  })

  test('it should allow user to insert a space in the tag name but replace the space with an underscore', async () => {
    const isTaggingFFOn = true
    const submitPatchMock = jest.fn(() => Promise.resolve({}))

    renderComponent(
      {
        featureFlag: mockFeature as Feature,
        tagsData: mockAllTags,
        tagsDisabled: false,
        submitPatch: submitPatchMock
      },
      isTaggingFFOn
    )

    await userEvent.click(screen.getByRole('button', { name: openEditFlagModalBtn }))

    const tagDropdown = document.querySelector('[class="bp3-input-ghost bp3-multi-select-tag-input-input"]')!

    const tagName = 'tag name with spaces'

    await userEvent.type(tagDropdown, tagName)

    await userEvent.click(screen.getByRole('button', { name: tagName }))

    expect(screen.queryByText('cf.featureFlags.tagging.inputErrorMessage')).not.toBeInTheDocument()
    userEvent.click(await screen.findByRole('button', { name: 'save' }))

    await waitFor(() =>
      expect(submitPatchMock).toHaveBeenCalledWith({
        instructions: [{ kind: 'addTag', parameters: { identifier: 'tag_name_with_spaces', name: tagName } }]
      })
    )
  })
})
