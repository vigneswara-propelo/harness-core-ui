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
import { FlagTypeVariations } from '@cf/components/CreateFlagDialog/FlagDialogUtils'
import FlagWizard, { FlagWizardProps } from '../FlagWizard'

const trackEventMock = jest.fn()
jest.mock('@common/hooks/useTelemetry', () => ({
  useTelemetry: () => ({ identifyUser: jest.fn(), trackEvent: trackEventMock })
}))

const renderComponent = (isTaggingFlagOn = false, props: Partial<FlagWizardProps> = {}): RenderResult => {
  return render(
    <TestWrapper
      path="/account/:accountId/cf/dashboard/orgs/:orgIdentifier/projects/:projectIdentifier"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      defaultFeatureFlagValues={{ FFM_8184_FEATURE_FLAG_TAGGING: isTaggingFlagOn }}
    >
      <FlagWizard
        flagTypeView={FlagTypeVariations.booleanFlag}
        environmentIdentifier="nonProduction"
        toggleFlagType={jest.fn()}
        hideModal={jest.fn()}
        goBackToTypeSelections={jest.fn()}
        tags={[]}
        tagsError={null}
        {...props}
      />
    </TestWrapper>
  )
}

describe('FlagWizard', () => {
  const createFlagMutateMock = jest.fn()
  const useCreateFeatureFlagMock = jest.spyOn(cfServiceMock, 'useCreateFeatureFlag')

  beforeEach(() => {
    jest
      .spyOn(cfServiceMock, 'useGetAllTags')
      .mockReturnValue({ loading: false, data: [], refetch: jest.fn(), error: null } as any)

    useCreateFeatureFlagMock.mockReturnValue({
      mutate: createFlagMutateMock,
      loading: false,
      error: null
    } as any)
  })

  test('it should fire telementary event when completed created flag', async () => {
    jest.spyOn(cfServiceMock, 'useGetGitRepo').mockReturnValue({ loading: false, data: { repoSet: true } } as any)

    renderComponent()

    userEvent.type(screen.getByPlaceholderText('cf.creationModal.aboutFlag.ffNamePlaceholder'), 'TEST_FLAG')
    userEvent.click(screen.getByText('next'))

    await waitFor(() => {
      expect(trackEventMock).toHaveBeenCalled()
    })
  })

  test('it should create a flag with the correct payload', async () => {
    const isTaggingFlagOn = true
    const newTag = 'my new tag'
    const newFlag = 'my new flag'

    renderComponent(isTaggingFlagOn)

    const flagsInput = screen.getByPlaceholderText('cf.creationModal.aboutFlag.ffNamePlaceholder')
    const tagsDropdownInput = screen.getByPlaceholderText('- tagsLabel -')

    await userEvent.type(flagsInput, newFlag)
    await waitFor(() => expect(flagsInput).toHaveValue(newFlag))

    await userEvent.type(tagsDropdownInput, newTag)
    await waitFor(() => expect(tagsDropdownInput).toHaveValue(newTag))

    await userEvent.click(screen.getByRole('button', { name: 'next' }))

    await userEvent.click(screen.getByRole('button', { name: 'cf.creationModal.saveAndClose' }))

    await waitFor(() => {
      expect(useCreateFeatureFlagMock).toHaveBeenCalledWith({
        queryParams: {
          accountIdentifier: 'dummy',
          environmentIdentifier: 'nonProduction',
          orgIdentifier: 'dummy'
        }
      })
    })

    // redirects to flag details page of the newly created flag
    expect(await screen.findByTestId('location')).toHaveTextContent(
      '/account/dummy/cf/orgs/dummy/projects/dummy/feature-flags/my_new_flag?activeEnvironment=nonProduction'
    )
  })
})
