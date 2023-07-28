/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Feature, GitRepo } from 'services/cf'
import * as cfServices from 'services/cf'
import { TestWrapper } from '@common/utils/testUtils'
import { FFGitSyncProvider } from '@cf/contexts/ff-git-sync-context/FFGitSyncContext'
import mockFeature from '@cf/components/EditFlagTabs/__tests__/mockFeature'
import mockGitSync from '@cf/utils/testData/data/mockGitSync'
import useArchiveFlagDialog, { ArchiveDialogProps } from '../useArchiveFlagDialog'

const queryParamsMock = {
  accountIdentifier: 'mockAccountIdentifier',
  orgIdentifier: 'mockOrgIdentifier',
  projectIdentifier: 'mockProjectIdentifier',
  forceDelete: false
}

const openArchiveDialogBtn = 'Open Archive dialog'

const WrapperComponent: FC<ArchiveDialogProps> = ({
  flagData,
  archiveFlag,
  onArchive,
  queryParams,
  gitSync,
  openedArchivedDialog
}) => {
  const { openDialog } = useArchiveFlagDialog({
    flagData,
    archiveFlag,
    onArchive,
    queryParams,
    gitSync,
    openedArchivedDialog
  })

  return <button onClick={() => openDialog()}>{openArchiveDialogBtn}</button>
}

const renderComponent = (props: Partial<ArchiveDialogProps> = {}): RenderResult => {
  return render(
    <TestWrapper>
      <FFGitSyncProvider>
        <WrapperComponent
          archiveFlag={jest.fn()}
          flagData={mockFeature as Feature}
          gitSync={mockGitSync}
          onArchive={jest.fn()}
          queryParams={queryParamsMock}
          openedArchivedDialog={false}
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

describe('useArchiveFlagDialog GitSync', () => {
  test('it should open Git Modal if project is integrated with Git', async () => {
    setUseGitRepoMock()

    const customCommitMessage = 'MY COMMIT MESSAGE'
    const archiveFlagMock = jest.fn()

    setUseGitRepoMock({ autoCommit: false })

    renderComponent({ archiveFlag: archiveFlagMock })

    await userEvent.click(screen.getByRole('button', { name: openArchiveDialogBtn }))

    await userEvent.type(screen.getByRole('textbox'), mockFeature.identifier)

    await userEvent.click(screen.getByRole('button', { name: 'archive' }))

    await waitFor(() => expect(screen.getByTestId('save-flag-to-git-modal-body')).toBeInTheDocument())

    const commitMessageTextbox = screen.getByPlaceholderText('common.git.commitMessage')

    await userEvent.clear(commitMessageTextbox)
    await userEvent.type(commitMessageTextbox, customCommitMessage)

    expect(commitMessageTextbox).toHaveValue(customCommitMessage)

    // click confirm save to git button
    await userEvent.click(screen.getByRole('button', { name: 'save' }))

    await waitFor(() => {
      expect(archiveFlagMock).toHaveBeenCalledWith('Test_Bool_Flag', {
        queryParams: {
          accountIdentifier: 'mockAccountIdentifier',
          commitMsg: customCommitMessage,
          forceDelete: false,
          orgIdentifier: 'mockOrgIdentifier',
          projectIdentifier: 'mockProjectIdentifier'
        }
      })
    })
  })
})
