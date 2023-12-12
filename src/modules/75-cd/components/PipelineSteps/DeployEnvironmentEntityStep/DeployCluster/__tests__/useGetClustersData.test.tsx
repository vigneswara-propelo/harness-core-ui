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
import * as mocks from '../../../DeployClusterEntityStep/__tests__/mocks'

const showError = jest.fn()

jest.mock('services/cd-ng', () => ({
  useGetClusterList: jest.fn().mockImplementation(() => {
    return { data: { data: { content: [...mocks.clusterArr] }, loading: false }, refetch: jest.fn() }
  })
}))

jest.mock('@common/exports', () => ({
  useToaster: () => ({
    showSuccess: jest.fn(),
    showError: showError
  })
}))

describe('tests useGetClustersData', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  test('useGetClustersData render data', async () => {
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper>{children}</TestWrapper>
    )

    const { result } = renderHook(
      () =>
        useGetClustersData({
          environmentIdentifier: 'Prod'
        }),
      { wrapper }
    )

    const { clustersList, loadingClustersList } = result.current
    expect(loadingClustersList).toBeFalsy()
    expect(clustersList?.length).toBeGreaterThan(9)
  })
})
