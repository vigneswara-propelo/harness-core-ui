/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { cloneDeep } from 'lodash-es'
import type { Feature, GitRepo } from 'services/cf'
import * as cfServices from 'services/cf'
import { TestWrapper } from '@common/utils/testUtils'
import { FFGitSyncProvider } from '@cf/contexts/ff-git-sync-context/FFGitSyncContext'
import mockFeature from '@cf/components/EditFlagTabs/__tests__/mockFeature'
import mockGitSync from '@cf/utils/testData/data/mockGitSync'
import useRestoreFlagDialog, { RestoreFlagDialogProps } from '../useRestoreFlagDialog'

const openRestoreDialogBtn = 'Open Restore dialog'

const WrapperComponent: FC<RestoreFlagDialogProps> = ({ flagData, gitSync, queryParams, onRestore }) => {
  const openRestoreDialog = useRestoreFlagDialog({ flagData, gitSync, queryParams, onRestore })

  return <button onClick={() => openRestoreDialog()}>{openRestoreDialogBtn}</button>
}

const archivedMockFeature = cloneDeep(mockFeature)
archivedMockFeature.archived = true

const renderComponent = (props: Partial<RestoreFlagDialogProps> = {}): RenderResult => {
  return render(
    <TestWrapper>
      <FFGitSyncProvider>
        <WrapperComponent
          flagData={archivedMockFeature as Feature}
          gitSync={mockGitSync}
          onRestore={jest.fn()}
          queryParams={{
            accountIdentifier: 'mockAccountIdentifier',
            orgIdentifier: 'mockOrgIdentifier',
            projectIdentifier: 'mockProjectIdentifier'
          }}
          {...props}
        />
      </FFGitSyncProvider>
    </TestWrapper>
  )
}

const setUseGitRepoMock = (repoDetails: Partial<GitRepo> = {}, repoSet = true): void => {
  jest.spyOn(cfServices, 'useGetGitRepo').mockReturnValue({
    loading: false,
    refetch: jest.fn(),
    data: {
      repoDetails: {
        autoCommit: repoDetails.autoCommit || false,
        branch: repoDetails.branch || 'main',
        enabled: repoDetails.enabled ?? true,
        filePath: repoDetails.filePath || '/flags.yaml',
        repoIdentifier: repoDetails.repoIdentifier || 'harnesstest',
        rootFolder: repoDetails.rootFolder || '/.harness/',
        yamlError: repoDetails.yamlError || ''
      },
      repoSet: repoSet
    }
  } as any)
}

describe('useRestoreFlagDialog GitSync', () => {
  test('it should open Git Modal if project is integrated with Git', async () => {
    const onRestoreMock = jest.fn()
    const restoreFlagMutate = jest.fn()

    jest.spyOn(cfServices, 'useRestoreFeatureFlag').mockReturnValue({
      loading: false,
      error: null,
      mutate: restoreFlagMutate,
      cancel: jest.fn()
    })

    const customCommitMessage = 'MY COMMIT MESSAGE'

    setUseGitRepoMock({ autoCommit: false })

    renderComponent({ onRestore: onRestoreMock })

    await userEvent.click(screen.getByRole('button', { name: openRestoreDialogBtn }))

    await userEvent.click(screen.getByRole('button', { name: 'cf.featureFlags.archiving.restore' }))

    await waitFor(() => expect(screen.getByTestId('save-flag-to-git-modal-body')).toBeInTheDocument())

    const commitMessageTextbox = screen.getByPlaceholderText('common.git.commitMessage')

    await userEvent.clear(commitMessageTextbox)
    await userEvent.type(commitMessageTextbox, customCommitMessage)

    expect(commitMessageTextbox).toHaveValue(customCommitMessage)

    // click confirm save to git button
    await userEvent.click(screen.getByRole('button', { name: 'save' }))

    await waitFor(() => expect(restoreFlagMutate).toHaveBeenCalled())
  })
})
