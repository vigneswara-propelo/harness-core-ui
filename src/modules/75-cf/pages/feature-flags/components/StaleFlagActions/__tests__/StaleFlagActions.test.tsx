/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import mockFeatureFlags from '@cf/pages/feature-flags/__tests__/mockFeatureFlags'
import * as useGetSelectedStaleFlags from '../../../hooks/useGetSelectedStaleFlags'
import { StaleFlagActions, StaleFlagActionsProps } from '../StaleFlagActions'

const renderComponent = (props: Partial<StaleFlagActionsProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <StaleFlagActions onAction={jest.fn()} {...props} />
    </TestWrapper>
  )

describe('StaleFlagActions', () => {
  const useGetSelectedStaleFlagsMock = jest.spyOn(useGetSelectedStaleFlags, 'useGetSelectedStaleFlags')

  beforeEach(() => {
    jest.clearAllMocks()
    useGetSelectedStaleFlagsMock.mockReturnValue(['Test_CleanupFlag', 'Test_CleanupFlag2'])
  })

  test('it should render the component', () => {
    renderComponent({ flags: [mockFeatureFlags.features[17] as any] })

    expect(screen.getByRole('button', { name: 'cf.staleFlagAction.notStale' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'cf.staleFlagAction.readyForCleanup' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'cf.staleFlagAction.learnMore' })).toBeVisible()
  })

  test('it should not render the component when there are no flags selected', async () => {
    useGetSelectedStaleFlagsMock.mockReturnValue([])
    renderComponent()

    expect(screen.queryByRole('button', { name: 'cf.staleFlagAction.notStale' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'cf.staleFlagAction.readyForCleanup' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'cf.staleFlagAction.learnMore' })).not.toBeInTheDocument()
  })

  test('it should not render the cleanup button if flag is already marked for cleanup', async () => {
    useGetSelectedStaleFlagsMock.mockReturnValue(['Test_CleanupFlag2'])
    renderComponent({ flags: [mockFeatureFlags.features[18] as any] })

    expect(screen.getByRole('button', { name: 'cf.staleFlagAction.notStale' })).toBeVisible()
    expect(screen.queryByRole('button', { name: 'cf.staleFlagAction.readyForCleanup' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'cf.staleFlagAction.learnMore' })).toBeVisible()
  })

  test('it should render the cleanup button if at least one flag is not already marked for cleanup', async () => {
    renderComponent({ flags: [mockFeatureFlags.features[17], mockFeatureFlags.features[18] as any] })

    expect(screen.getByRole('button', { name: 'cf.staleFlagAction.notStale' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'cf.staleFlagAction.readyForCleanup' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'cf.staleFlagAction.learnMore' })).toBeVisible()
  })

  test('it should show a learn more link to the docs', async () => {
    renderComponent()

    expect(screen.getByRole('link', { name: 'cf.staleFlagAction.learnMore' })).toHaveAttribute(
      'href',
      'https://developer.harness.io/docs/feature-flags/ff-creating-flag/manage-stale-flags/'
    )
  })

  test('it should show mark as not stale dialog when button is clicked', async () => {
    renderComponent()

    userEvent.click(screen.getByRole('button', { name: 'cf.staleFlagAction.notStale' }))

    const cancelBtn = await screen.findByRole('button', { name: 'cancel' })

    await waitFor(() => {
      expect(screen.getByTestId('modaldialog-header')).toBeVisible()
      expect(screen.getByTestId('modaldialog-body')).toBeVisible()
      expect(cancelBtn).toBeVisible()
    })

    userEvent.click(cancelBtn)

    await waitFor(() => {
      expect(cancelBtn).not.toBeInTheDocument()
    })
  })

  test('it should show ready for cleanup dialog when button is clicked', async () => {
    useGetSelectedStaleFlagsMock.mockReturnValue(['Test_CleanupFlag'])
    renderComponent({ flags: [mockFeatureFlags.features[17] as any] })

    userEvent.click(screen.getByRole('button', { name: 'cf.staleFlagAction.readyForCleanup' }))

    const cancelBtn = await screen.findByRole('button', { name: 'cancel' })

    await waitFor(() => {
      expect(screen.getByTestId('modaldialog-header')).toBeVisible()
      expect(screen.getByTestId('modaldialog-body')).toBeVisible()
      expect(cancelBtn).toBeVisible()
    })

    userEvent.click(cancelBtn)

    await waitFor(() => {
      expect(cancelBtn).not.toBeInTheDocument()
    })
  })
})
