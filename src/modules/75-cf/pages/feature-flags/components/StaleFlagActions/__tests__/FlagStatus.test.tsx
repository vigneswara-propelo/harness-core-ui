/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import {
  FeatureFlagStatus,
  FlagStatus,
  FlagStatusProps,
  StaleFlagStatusReason
} from '@cf/pages/feature-flags/FlagStatus'
import { TestWrapper } from '@common/utils/testUtils'

const renderComponent = (props: Partial<FlagStatusProps> = {}): RenderResult =>
  render(
    <TestWrapper defaultFeatureFlagValues={{ FFM_8344_FLAG_CLEANUP: true }}>
      <FlagStatus status={FeatureFlagStatus.NEVER_REQUESTED} lastAccess={-6795364578871} {...props} />
    </TestWrapper>
  )

describe('FlagStatus', () => {
  test('it should render the component', () => {
    renderComponent({ staleReason: StaleFlagStatusReason.POTENTIALLY_STALE })

    expect(screen.getByText(FeatureFlagStatus.NEVER_REQUESTED.toLocaleUpperCase())).toBeVisible()
    expect(screen.getByText('cf.featureFlags.makeSure')).toBeVisible()
  })

  test('it should display last access time when active status', () => {
    renderComponent({ staleReason: StaleFlagStatusReason.POTENTIALLY_STALE, status: FeatureFlagStatus.ACTIVE })

    expect(screen.getByText(FeatureFlagStatus.ACTIVE.toLocaleUpperCase())).toBeVisible()
    expect(screen.getByText('dummy date')).toBeVisible()
  })

  test('it should render waiting for cleanup status', () => {
    renderComponent({ isStale: true, staleReason: StaleFlagStatusReason.WAITING_FOR_CLEANUP })

    expect(screen.getByText('cf.staleFlagAction.waitingForCleanup'.toLocaleUpperCase())).toBeVisible()
  })
})
