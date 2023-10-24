import React, { FC } from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Formik } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import mockFeature from '@cf/components/EditFlagTabs/__tests__/mockFeature'
import { Feature } from 'services/cf'
import mockGitSync from '@modules/75-cf/utils/testData/data/mockGitSync'
import useEditFlagDetailsModal, { UseEditFlagDetailsModalProps } from '../useEditFlagDetailsModal'

const mockAllTags = [
  {
    label: 'tag,4',
    value: 'tag4'
  },
  {
    label: 'hello',
    value: 'hello'
  },
  {
    label: 'tag3',
    value: 'tag3'
  },
  {
    label: 'tag2',
    value: 'tag2'
  },
  {
    label: 'tag1',
    value: 'tag1'
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
      <Formik initialValues={{ name: mockFeature }} onSubmit={jest.fn()} formName="test">
        <WrapperComponent
          featureFlag={mockFeature as Feature}
          gitSync={mockGitSync}
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
})
