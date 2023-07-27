import { fireEvent, render, RenderResult, screen, waitFor } from '@testing-library/react'
import React, { FC } from 'react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as cfServices from 'services/cf'
import mockFeature from '@cf/components/EditFlagTabs/__tests__/mockFeature'
import type { Feature } from 'services/cf'
import useArchiveFlagDialog, { ArchiveDialogProps } from '../useArchiveFlagDialog'
import { dependentFlagsResponse, noDependentFlagsResponse } from './__data__/dependentFlagsMock'

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
  openedArchivedDialog
}) => {
  const { openDialog } = useArchiveFlagDialog({ flagData, archiveFlag, onArchive, queryParams, openedArchivedDialog })

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
        openedArchivedDialog={false}
        {...props}
      />
    </TestWrapper>
  )
}

describe('useArchiveDialog', () => {
  const useGetDependentFeaturesMock = jest.spyOn(cfServices, 'useGetDependentFeatures')

  beforeEach(() => {
    useGetDependentFeaturesMock.mockReturnValue({
      data: noDependentFlagsResponse,
      error: null,
      refetch: jest.fn()
    } as any)

    jest.clearAllMocks()
  })

  test('it should display CannotArchiveWarning component if there are dependent flags associated with selected flag', async () => {
    useGetDependentFeaturesMock.mockReturnValue({
      data: dependentFlagsResponse,
      error: null,
      refetch: jest.fn()
    } as any)

    renderComponent()

    await userEvent.click(screen.getByRole('button', { name: openArchiveDialogBtn }))

    expect(screen.getByText('cf.featureFlags.archiving.cannotArchive')).toBeInTheDocument()
    expect(screen.getByText('cf.featureFlags.archiving.removeFlag')).toBeInTheDocument()

    expect(screen.getAllByRole('link')).toHaveLength(dependentFlagsResponse.features.length)

    const flagId = screen.getAllByTestId('flagIdentifierLabel')

    expect(flagId[0]).toHaveTextContent(dependentFlagsResponse.features[0].identifier)
    expect(flagId[1]).toHaveTextContent(dependentFlagsResponse.features[1].identifier)

    expect(screen.queryByRole('button', { name: 'archive' })).not.toBeInTheDocument()
    expect(screen.queryByText('cf.featureFlags.archiving.warningDescription')).not.toBeInTheDocument()
  })

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

  test('it should close the dialog correctly', async () => {
    renderComponent()
    await userEvent.click(screen.getByRole('button', { name: openArchiveDialogBtn }))

    expect(screen.getByText('cf.featureFlags.archiving.archiveFlag')).toBeInTheDocument()

    await userEvent.click(document.querySelector('[data-icon="main-close"]') as HTMLInputElement)

    expect(screen.queryByText('cf.featureFlags.archiving.archiveFlag')).not.toBeInTheDocument()
  })

  test('it should display a loading spinner when component is loading dependent flags', async () => {
    useGetDependentFeaturesMock.mockReturnValue({
      data: null,
      error: null,
      refetch: jest.fn(),
      loading: true
    } as any)

    renderComponent()

    await userEvent.click(screen.getByRole('button', { name: openArchiveDialogBtn }))
    expect(screen.getByTestId('page-spinner')).toBeInTheDocument()
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
