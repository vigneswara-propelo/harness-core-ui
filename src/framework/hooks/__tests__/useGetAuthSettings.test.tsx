/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { TestWrapper } from '@common/utils/testUtils'
import * as cdNg from 'services/cd-ng'
import * as FeatureFlag from '@common/hooks/useFeatureFlag'
import { useGetAuthSettings } from '../useGetAuthSettings'

const mockAuthResponse = {
  resource: {
    publicAccessEnabled: true
  }
}
const mockAuthResponseV2 = {
  resource: {
    publicAccessEnabled: false
  }
}

jest.mock('services/cd-ng', () => ({
  useGetAuthenticationSettings: jest.fn().mockImplementation(() => {
    return { data: mockAuthResponse, loading: false, refetch: jest.fn().mockReturnValue(mockAuthResponse), error: null }
  }),
  useGetAuthenticationSettingsV2: jest.fn().mockImplementation(() => {
    return {
      data: mockAuthResponseV2,
      loading: false,
      refetch: jest.fn().mockReturnValue(mockAuthResponse),
      error: null
    }
  })
}))

describe('useGetAuthSettings hook', () => {
  const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
    <TestWrapper>{children}</TestWrapper>
  )
  test('should return the authentication settings for the given account identifier', async () => {
    const { result } = renderHook(() => useGetAuthSettings(), { wrapper })

    // Assert that the authentication settings are returned
    expect(result.current.authSettings).toBe(mockAuthResponse)
    expect(result.current.fetchingAuthSettings).toBe(false)
    expect(result.current.errorWhileFetchingAuthSettings).toBe(null)
  })

  test('should pass loading:true when initially called', async () => {
    jest.spyOn(cdNg, 'useGetAuthenticationSettingsV2').mockImplementation((): any => {
      return { data: {}, loading: true, refetch: () => Promise.resolve(mockAuthResponseV2), error: null }
    })
    jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
      PL_ENABLE_MULTIPLE_IDP_SUPPORT: true
    })
    const { result } = renderHook(() => useGetAuthSettings(), { wrapper })

    expect(result.current.fetchingAuthSettings).toBe(true)
  })
})
