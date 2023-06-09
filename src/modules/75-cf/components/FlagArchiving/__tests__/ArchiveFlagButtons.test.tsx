import React from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import ArchiveFlagButtons, { ArchiveFlagButtonsProps } from '../ArchiveFlagButtons'

const renderComponent = (props: Partial<ArchiveFlagButtonsProps> = {}): RenderResult => {
  return render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <ArchiveFlagButtons identifierMatch={false} onArchive={jest.fn()} onClose={jest.fn()} {...props} />
    </TestWrapper>
  )
}

describe('ArchiveFlagButtons', () => {
  test('it should disable the Archive button if the user types in a mismatching flag Id', async () => {
    const onArchiveMock = jest.fn()

    renderComponent({ onArchive: onArchiveMock })

    expect(screen.getByRole('button', { name: 'archive' })).toBeDisabled()

    userEvent.click(screen.getByRole('button', { name: 'archive' }))

    expect(onArchiveMock).not.toHaveBeenCalled()
  })

  test('it should call onArchive callback if user types in matching flag Id', async () => {
    const onArchiveMock = jest.fn()

    renderComponent({ identifierMatch: true, onArchive: onArchiveMock })

    expect(screen.getByRole('button', { name: 'archive' })).toBeEnabled()

    userEvent.click(screen.getByRole('button', { name: 'archive' }))

    await waitFor(() => expect(onArchiveMock).toHaveBeenCalled())
  })

  test('it should call onCancel callback if user closes the Archive modal', async () => {
    const onCloseMock = jest.fn()

    renderComponent({ onClose: onCloseMock })

    userEvent.click(screen.getByRole('button', { name: 'cancel' }))

    await waitFor(() => expect(onCloseMock).toHaveBeenCalled())
  })
})
