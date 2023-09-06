import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import mockFeatureFlags from '@cf/pages/feature-flags/__tests__/mockFeatureFlags'
import * as cfServiceMock from 'services/cf'
import { StaleFlagActionDialog, StaleFlagActionDialogProps } from '../StaleFlagActionDialog'

const renderComponent = (props: Partial<StaleFlagActionDialogProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <StaleFlagActionDialog markAsNotStale selectedFlags={[]} onAction={jest.fn()} {...props} onClose={jest.fn()} />
    </TestWrapper>
  )

describe('StaleFlagActionDialog', () => {
  const patchMutateMock = jest.fn()

  jest.spyOn(cfServiceMock, 'usePatchFeatures').mockReturnValue({
    loading: false,
    mutate: patchMutateMock
  } as any)

  afterEach(() => {
    jest.clearAllMocks()
  })
  test('it should render the mark as not stale dialog', () => {
    renderComponent({ selectedFlags: [mockFeatureFlags.features[17] as any] })

    expect(screen.getByRole('heading', { name: 'cf.staleFlagAction.notStale' })).toBeVisible()
    expect(screen.getByText('cf.staleFlagAction.notStaleDesc')).toBeVisible()
    expect(screen.getByRole('button', { name: 'cf.staleFlagAction.notStale' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'cancel' })).toBeVisible()
  })

  test('it should render the ready for cleanup dialog', () => {
    renderComponent({ selectedFlags: [mockFeatureFlags.features[17] as any], markAsNotStale: false })

    expect(screen.getByRole('heading', { name: 'cf.staleFlagAction.readyForCleanup' })).toBeVisible()
    expect(screen.getByText('cf.staleFlagAction.readyForCleanupDesc')).toBeVisible()
    expect(screen.getByRole('button', { name: 'cf.staleFlagAction.readyForCleanup' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'cancel' })).toBeVisible()
  })

  test('it should patch the flag as marked as not stale when that button is clicked', async () => {
    renderComponent({ selectedFlags: [mockFeatureFlags.features[17].identifier as any] })

    await userEvent.click(screen.getByRole('button', { name: 'cf.staleFlagAction.notStale' }))

    expect(patchMutateMock).toHaveBeenCalledWith({
      flags: [
        {
          identifier: 'Test_CleanupFlag',
          instructions: [{ kind: 'markAsNotStale', parameters: {} }]
        }
      ]
    })
  })

  test('it should patch the flag as marked as stale when that button is clicked', async () => {
    renderComponent({ selectedFlags: [mockFeatureFlags.features[17].identifier as any], markAsNotStale: false })

    await userEvent.click(screen.getByRole('button', { name: 'cf.staleFlagAction.readyForCleanup' }))

    expect(patchMutateMock).toHaveBeenCalledWith({
      flags: [
        {
          identifier: 'Test_CleanupFlag',
          instructions: [{ kind: 'markAsStale', parameters: {} }]
        }
      ]
    })
  })
})
