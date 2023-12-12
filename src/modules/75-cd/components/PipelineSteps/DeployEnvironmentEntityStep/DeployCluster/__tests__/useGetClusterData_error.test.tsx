/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { renderHook } from '@testing-library/react-hooks'
import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'

import { useGetClustersData } from '../useGetClustersData'

const showError = jest.fn()
jest.mock('services/cd-ng', () => ({
  useGetClusterList: jest.fn().mockReturnValue({
    error: {
      message: 'error fetcing'
    },
    refetch: jest.fn()
  } as any)
}))

jest.mock('@harness/uicore', () => ({
  ...jest.requireActual('@harness/uicore'),
  useToaster: jest.fn(() => ({
    showSuccess: jest.fn(),
    showError
  }))
}))
describe('useGetClustersData for success case', () => {
  test('when returns error ', () => {
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper>{children}</TestWrapper>
    )

    renderHook(
      () =>
        useGetClustersData({
          environmentIdentifier: 'Prod'
        }),
      { wrapper }
    )

    expect(showError).toHaveBeenCalled()
  })
})
