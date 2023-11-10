/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { renderHook } from '@testing-library/react-hooks'
import { TestWrapper } from '@common/utils/testUtils'
import { Scope } from 'framework/types/types'
import * as routUtils from '@common/utils/routeUtils'
import * as commonHooks from '@common/hooks'
import mockImport from 'framework/utils/mockImport'
import { useGetSelectedScope } from '../SideNavV2.utils'

mockImport('framework/AppStore/AppStoreContext', {
  useAppStore: jest.fn().mockImplementation(() => ({
    selectedProject: { orgIdentifier: 'orgIdentifier', identifier: 'identifier' }
  }))
})

describe('SideNavV2 Utils', () => {
  test('account scope', async () => {
    jest.spyOn(routUtils, 'getRouteParams').mockReturnValue({ module: 'cd', accountId: 'accountId' })
    const { result } = renderHook(() => useGetSelectedScope(), {
      wrapper: TestWrapper
    })
    expect(result.current).toEqual({
      scope: Scope.ACCOUNT,
      params: { accountId: 'accountId' }
    })
  })
  test('project scope', () => {
    jest.spyOn(routUtils, 'getRouteParams').mockReturnValue({
      module: 'cd',
      accountId: 'accountId',
      orgIdentifier: 'orgIdentifier',
      projectIdentifier: 'projectIdentifier'
    })
    const { result } = renderHook(() => useGetSelectedScope(), {
      wrapper: TestWrapper
    })
    expect(result.current).toEqual({
      scope: Scope.PROJECT,
      params: {
        accountId: 'accountId',
        orgIdentifier: 'orgIdentifier',
        projectIdentifier: 'projectIdentifier'
      }
    })
  })
  test('organization scope', () => {
    jest.spyOn(routUtils, 'getRouteParams').mockReturnValue({
      module: 'cd',
      accountId: 'accountId',
      orgIdentifier: 'orgIdentifier'
    })
    const { result } = renderHook(() => useGetSelectedScope(), {
      wrapper: TestWrapper
    })
    expect(result.current).toEqual({
      scope: Scope.ORGANIZATION,
      params: {
        accountId: 'accountId',
        orgIdentifier: 'orgIdentifier'
      }
    })
  })
  test('project scope when identifier in appstore', () => {
    jest.spyOn(routUtils, 'getRouteParams').mockReturnValue({ accountId: 'accountId' })
    jest.spyOn(commonHooks, 'useQueryParams').mockImplementation(() => ({ noscope: true }))
    const { result } = renderHook(() => useGetSelectedScope(), {
      wrapper: TestWrapper
    })
    expect(result.current).toEqual({
      scope: Scope.PROJECT,
      params: {
        accountId: 'accountId',
        orgIdentifier: 'orgIdentifier',
        projectIdentifier: 'identifier'
      }
    })
  })
})
