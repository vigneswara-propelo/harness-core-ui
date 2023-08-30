/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { RenderResult, getByTestId, getByText, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { cloneDeep } from 'lodash-es'
import * as ffServices from 'services/cf'
import { TestWrapper } from '@common/utils/testUtils'
import mockFeature from '@cf/utils/testData/data/mockFeature'
import mockFeatureFlags from '@cf/pages/feature-flags/__tests__/mockFeatureFlags'
import mockGitSync from '@cf/utils/testData/data/mockGitSync'
import { FlagPrerequisites, FlagPrerequisitesProps } from '../FlagPrerequisites'

const mockFeatures = {
  ...mockFeatureFlags,
  features: [...mockFeatureFlags.features.slice(-5)]
}

const renderComponent = (props: Partial<FlagPrerequisitesProps> = {}): RenderResult => {
  return render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{
        accountId: 'dummy',
        orgIdentifier: 'dummy',
        projectIdentifier: 'dummy',
        environmentIdentifier: 'Mock_Environment'
      }}
    >
      <FlagPrerequisites
        gitSync={mockGitSync}
        featureFlag={mockFeature}
        refetchFlag={jest.fn()}
        setGovernanceMetadata={jest.fn()}
        {...props}
      />
    </TestWrapper>
  )
}

describe('FlagPrerequisites', () => {
  beforeEach(() => {
    jest.spyOn(ffServices, 'useGetAllFeatures').mockReturnValue({
      data: mockFeatures,
      loading: false,
      error: null,
      refetch: jest.fn()
    } as any)

    jest.clearAllMocks()
  })

  test('it should render correctly', async () => {
    renderComponent()
    await waitFor(() => {
      expect(screen.getByText('cf.shared.prerequisites')).toBeVisible()
      expect(screen.getByText('cf.featureFlags.prerequisitesDesc')).toBeVisible()
      expect(screen.getByText('cf.featureFlags.newPrerequisite')).toBeVisible()
    })

    await userEvent.click(screen.getByRole('button', { name: 'cf.featureFlags.newPrerequisite' }))

    const modal = screen.getByTestId('flag-prerequisite-modal')
    await waitFor(() => {
      expect(modal).toBeVisible()
      expect(getByText(modal, 'cf.addPrerequisites.addPrerequisitesHeading')).toBeVisible()
    })
    expect(screen.getByTestId('flag-prerequisite-modal')).toMatchSnapshot()
  })

  test('it should not allow the modal to be opened if the flag is archived', async () => {
    const archivedMockFeature = cloneDeep(mockFeature)
    archivedMockFeature.archived = true

    renderComponent({ featureFlag: archivedMockFeature })

    expect(screen.getByRole('button', { name: 'cf.featureFlags.newPrerequisite' })).toBeDisabled()
  })

  test('it should render a form when adding prerequisite', async () => {
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('cf.featureFlags.newPrerequisite')).toBeVisible()
    })

    await userEvent.click(screen.getByRole('button', { name: 'cf.featureFlags.newPrerequisite' }))

    await waitFor(() => expect(screen.getByTestId('flag-prerequisite-modal')).toBeVisible())

    await userEvent.click(screen.getByRole('button', { name: 'cf.shared.prerequisites' }))

    await waitFor(() => expect(screen.getByTestId('prerequisites-form')).toBeVisible())
  })

  test('it should render feature flags in dropdown', async () => {
    renderComponent()
    await waitFor(() => {
      expect(screen.getByText('cf.featureFlags.newPrerequisite')).toBeVisible()
    })

    await userEvent.click(screen.getByRole('button', { name: 'cf.featureFlags.newPrerequisite' }))

    await waitFor(() => expect(screen.getByTestId('flag-prerequisite-modal')).toBeVisible())
    await userEvent.click(screen.getByRole('button', { name: 'cf.shared.prerequisites' }))

    await waitFor(() => expect(screen.getByTestId('prerequisites-form')).toBeVisible())

    expect(screen.getByTestId('prerequisites-variations-dropdown-0')).toBeVisible()
    await userEvent.click(screen.getByTestId('prerequisites-dropdown-0'))
    mockFeature.prerequisites?.forEach(prerequisite => {
      expect(screen.getByText(prerequisite.feature)).toBeVisible()
    })
  })

  test('It should render the modal & form when Edit prerequisites is clicked', async () => {
    renderComponent()

    const rows = screen.getAllByTestId('prerequisiteItem')
    expect(rows).toHaveLength(3)

    // click first row menu button
    const btn = getByTestId(rows[0], 'prerequisiteMenuBtn')
    await userEvent.click(btn)

    // wait for popover menu & elements to be visible (not just in document)
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /edit/ })).toBeVisible()
      expect(screen.getByRole('link', { name: /delete/ })).toBeVisible()
    })

    // click 'Edit'
    await userEvent.click(screen.getByRole('link', { name: /edit/ }))

    // check modal, form & add prereq button is visible, and title is correct
    const modal = screen.getByTestId('flag-prerequisite-modal')
    expect(modal).toBeVisible()
    expect(getByText(modal, 'cf.addPrerequisites.editPrerequisitesHeading')).toBeVisible()
    expect(getByTestId(modal, 'prerequisites-form')).toBeVisible()
    expect(screen.getByRole('button', { name: 'cf.shared.prerequisites' })).toBeVisible()
  })

  test('It should populate the form inputs with the correct values', async () => {
    renderComponent()

    const rows = screen.getAllByTestId('prerequisiteItem')
    const btn = getByTestId(rows[0], 'prerequisiteMenuBtn')

    expect(rows[0].querySelectorAll('p')[0]).toHaveTextContent('Test_Paging_Flag')

    // click first row menu button, then click Edit
    await userEvent.click(btn)
    await userEvent.click(screen.getByRole('link', { name: /edit/ }))

    await waitFor(() => {
      // check modal is visible & title correct
      const modal = screen.getByTestId('flag-prerequisite-modal')
      expect(modal).toBeVisible()
      expect(getByText(modal, 'cf.addPrerequisites.editPrerequisitesHeading')).toBeVisible()
      expect(getByTestId(modal, 'prerequisites-form')).toBeVisible()

      // first row
      expect(getByTestId(modal, 'prerequisites-dropdown-0').querySelector('input')).toHaveValue('Test Paging Flag')
      expect(getByTestId(modal, 'prerequisites-variations-dropdown-0').querySelector('input')).toHaveValue('False')

      // second row
      expect(getByTestId(modal, 'prerequisites-dropdown-1').querySelector('input')).toHaveValue('X Flag 11')
      expect(getByTestId(modal, 'prerequisites-variations-dropdown-1').querySelector('input')).toHaveValue('False')

      // third row
      expect(getByTestId(modal, 'prerequisites-dropdown-2').querySelector('input')).toHaveValue('X Flag 10')
      expect(getByTestId(modal, 'prerequisites-variations-dropdown-2').querySelector('input')).toHaveValue('True')
    })
  })
})
