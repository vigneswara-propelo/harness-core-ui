import React, { FC } from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { cloneDeep } from 'lodash-es'
import { TestWrapper } from '@common/utils/testUtils'
import type { Feature } from 'services/cf'
import mockFeature from '@cf/components/EditFlagTabs/__tests__/mockFeature'
import { mockDisabledGitSync } from '@cf/utils/testData/data/mockGitSync'
import * as cfServices from 'services/cf'
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
      <WrapperComponent
        flagData={archivedMockFeature as Feature}
        gitSync={mockDisabledGitSync}
        onRestore={jest.fn()}
        queryParams={{
          accountIdentifier: 'mockAccountIdentifier',
          orgIdentifier: 'mockOrgIdentifier',
          projectIdentifier: 'mockProjectIdentifier'
        }}
        {...props}
      />
    </TestWrapper>
  )
}

describe('useRestoreFlagDialog', () => {
  const useRestoreFeatureFlagMock = jest.spyOn(cfServices, 'useRestoreFeatureFlag')
  const restoreFlagMutate = jest.fn()

  beforeEach(() => {
    useRestoreFeatureFlagMock.mockReturnValue({
      loading: false,
      error: null,
      mutate: restoreFlagMutate,
      cancel: jest.fn()
    })

    jest.clearAllMocks()
  })

  test('it should restore a flag', async () => {
    const onRestoreMock = jest.fn()

    renderComponent({ onRestore: onRestoreMock })

    await userEvent.click(screen.getByRole('button', { name: openRestoreDialogBtn }))

    const restoreBtn = screen.getByRole('button', { name: 'cf.featureFlags.archiving.restore' })

    expect(screen.getByText('cf.featureFlags.archiving.restoreDescription')).toBeInTheDocument()
    expect(restoreBtn).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'cancel' })).toBeInTheDocument()

    userEvent.click(restoreBtn)

    await waitFor(() => {
      expect(restoreFlagMutate).toHaveBeenCalled()
      expect(screen.getByText('cf.featureFlags.archiving.restoreSuccess')).toBeInTheDocument()
      expect(onRestoreMock).toHaveBeenCalled()
    })
  })

  test('it should handle errors if it fails to restore a flag', async () => {
    const error = 'FAIL TO RESTORE'
    const onRestoreMock = jest.fn()

    restoreFlagMutate.mockRejectedValue({ message: error })

    renderComponent({ onRestore: onRestoreMock })

    await userEvent.click(screen.getByRole('button', { name: openRestoreDialogBtn }))
    userEvent.click(screen.getByRole('button', { name: 'cf.featureFlags.archiving.restore' }))

    await waitFor(() => {
      expect(screen.getByText(error)).toBeInTheDocument()
      expect(onRestoreMock).not.toHaveBeenCalled()
    })
  })
})
