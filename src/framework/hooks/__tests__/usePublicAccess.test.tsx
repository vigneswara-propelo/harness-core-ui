/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { AccessType, useIsPublicAccess, useIsPrivateAccess, useGetAccessType } from 'framework/hooks/usePublicAccess'
import { TestWrapper } from '@common/utils/testUtils'

describe('usePublicAccess hooks Tests', () => {
  const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
    <TestWrapper defaultAppStoreValues={{ publicAccessEnabled: true }}>{children}</TestWrapper>
  )

  const wrapperPrivateAccess = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
    <TestWrapper defaultAppStoreValues={{ publicAccessEnabled: false }}>{children}</TestWrapper>
  )

  test('useIsPublicAccess should return true in public access mode', () => {
    const { result } = renderHook(() => useIsPublicAccess(), { wrapper })
    expect(result.current).toBe(true)
  })

  test('useIsPrivateAccess should return false in public access mode', () => {
    const { result } = renderHook(() => useIsPrivateAccess(), { wrapper })
    expect(result.current).toBe(false)
  })

  test('useGetAccessType should return correct AccessType corresponding to public or private mode', () => {
    const { result } = renderHook(() => useGetAccessType(), { wrapper })
    expect(result.current).toBe(AccessType.PUBLIC)
    const { result: resultPrivate } = renderHook(() => useGetAccessType(), { wrapper: wrapperPrivateAccess })
    expect(resultPrivate.current).toBe(AccessType.PRIVATE)
  })
})
