import React, { FC } from 'react'
import { fireEvent, render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import mockFeature from '@cf/components/EditFlagTabs/__tests__/mockFeature'
import type { Feature } from 'services/cf'
import useArchiveFlagDialog, { ArchiveDialogProps } from '../useArchiveFlagDialog'

const queryParamsMock = {
  accountIdentifier: 'mockAccountIdentifier',
  orgIdentifier: 'mockOrgIdentifier',
  projectIdentifier: 'mockProjectIdentifier',
  forceDelete: false
}

const openArchiveDialogBtn = 'Open Archive dialog'

const WrapperComponent: FC<ArchiveDialogProps> = ({ flagData, archiveFlag, onArchive, queryParams }) => {
  const { openDialog } = useArchiveFlagDialog({ flagData, archiveFlag, onArchive, queryParams })

  return <button onClick={() => openDialog()}>{openArchiveDialogBtn}</button>
}

const renderComponent = (props: Partial<ArchiveDialogProps> = {}): RenderResult => {
  return render(
    <TestWrapper>
      <WrapperComponent
        flagData={mockFeature as Feature}
        archiveFlag={jest.fn()}
        onArchive={jest.fn()}
        queryParams={queryParamsMock}
        {...props}
      />
    </TestWrapper>
  )
}

describe('useArchiveDialog', () => {
  test('it should validate the flag identifier and prevent submission if the flag identifier does not match', async () => {
    const incorrectFlagIdentifier = 'foobar'
    const pastedText = 'hello world'

    renderComponent()

    await userEvent.click(screen.getByRole('button', { name: openArchiveDialogBtn }))

    await userEvent.type(screen.getByRole('textbox'), incorrectFlagIdentifier)

    const archiveFlagTextbox = screen.getByRole('textbox')

    expect(archiveFlagTextbox).toHaveValue(incorrectFlagIdentifier)
    expect(screen.getByText('cf.featureFlags.archiving.mismatchIdentifierError')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'archive' })).toBeDisabled()

    await userEvent.clear(archiveFlagTextbox)

    // checking user cannot paste into textbox so they have to manually type in the flag identifier
    fireEvent.paste(archiveFlagTextbox, pastedText)
    expect(archiveFlagTextbox).not.toHaveValue(pastedText)

    await userEvent.clear(archiveFlagTextbox)
    await userEvent.type(archiveFlagTextbox, mockFeature.identifier)

    expect(screen.queryByText('cf.featureFlags.archiving.mismatchIdentifierError')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'archive' })).toBeEnabled()
  })

  test('it should allow user to archive a flag', async () => {
    const archiveFeatureFlagMock = jest.fn()
    const onArchiveMock = jest.fn()

    renderComponent({ archiveFlag: archiveFeatureFlagMock, onArchive: onArchiveMock })
    await userEvent.click(screen.getByRole('button', { name: openArchiveDialogBtn }))
    await userEvent.type(screen.getByRole('textbox'), mockFeature.identifier)

    await userEvent.click(screen.getByRole('button', { name: 'archive' }))

    await waitFor(() => {
      expect(archiveFeatureFlagMock).toHaveBeenCalledWith(mockFeature.identifier, {
        queryParams: { ...queryParamsMock }
      })
      expect(onArchiveMock).toHaveBeenCalled()
    })
  })

  test('it should handle errors if it fails to archive a flag', async () => {
    const archiveFeatureFlagMock = jest.fn()
    const onArchiveMock = jest.fn()

    const error = 'FAIL TO ARCHIVE'

    archiveFeatureFlagMock.mockRejectedValue({ message: error })
    renderComponent({ archiveFlag: archiveFeatureFlagMock, onArchive: onArchiveMock })

    await userEvent.click(screen.getByRole('button', { name: openArchiveDialogBtn }))

    await userEvent.type(screen.getByRole('textbox'), mockFeature.identifier)

    await userEvent.click(screen.getByRole('button', { name: 'archive' }))

    await waitFor(() => {
      expect(screen.getByText(error)).toBeInTheDocument()
      expect(onArchiveMock).not.toHaveBeenCalled()
    })
  })
})
