/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { renderHook, RenderHookResult } from '@testing-library/react-hooks'
import React, { FC, PropsWithChildren } from 'react'
import { TestWrapper } from '@common/utils/testUtils'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import * as rbacHooksMock from '@rbac/hooks/usePermission'
import useFeatureEnabled, { UseFeatureEnabledReturn } from '../useFeatureEnabled'

const renderHookUnderTest = (
  tags?: string[],
  permissions: Map<string, boolean> = new Map()
): RenderHookResult<undefined, UseFeatureEnabledReturn> => {
  const wrapper: FC<PropsWithChildren<unknown>> = ({ children }) => {
    return (
      <TestWrapper
        queryParams={{ activeEnvironment: 'my_active_env' }}
        defaultPermissionValues={{
          permissions,
          checkPermission: ({ permission }) =>
            permissions.has(permission as string) ? (permissions.get(permission as string) as boolean) : true
        }}
      >
        {children}
      </TestWrapper>
    )
  }

  return renderHook(() => useFeatureEnabled(tags), { wrapper })
}

describe('useFeatureEnabled', () => {
  beforeEach(() => jest.resetAllMocks())

  test('it should call the rbac checks with the correct parameters when tags are populated', async () => {
    const tagsToCheck = ['tag1', 'tag2', 'tag3']

    const mockRBACPermissionsMap = new Map()
    mockRBACPermissionsMap.set(PermissionIdentifier.TOGGLE_FF_FEATUREFLAG, false)
    mockRBACPermissionsMap.set(PermissionIdentifier.EDIT_FF_FEATUREFLAG, false)

    const rbacPermissionCheck = jest.spyOn(rbacHooksMock, 'usePermission')

    renderHookUnderTest(tagsToCheck, mockRBACPermissionsMap)

    expect(rbacPermissionCheck).toHaveBeenNthCalledWith(1, {
      attributeFilter: { attributeName: 'tag', attributeValues: tagsToCheck },
      permissions: ['ff_featureflag_toggle'],
      resource: { resourceType: 'FEATUREFLAG' }
    })

    expect(rbacPermissionCheck).toHaveBeenNthCalledWith(
      2,
      {
        permissions: ['ff_featureflag_edit', 'ff_featureflag_toggle'],
        resource: { resourceIdentifier: 'my_active_env', resourceType: 'ENVIRONMENT' }
      },
      ['my_active_env']
    )
  })

  test('it should call the rbac checks with the correct parameters when tags are undefined', async () => {
    const mockRBACPermissionsMap = new Map()
    mockRBACPermissionsMap.set(PermissionIdentifier.EDIT_FF_FEATUREFLAG, false)
    mockRBACPermissionsMap.set(PermissionIdentifier.TOGGLE_FF_FEATUREFLAG, false)

    const rbacPermissionCheck = jest.spyOn(rbacHooksMock, 'usePermission')

    renderHookUnderTest([], mockRBACPermissionsMap)

    // the check for tags would still fire but without params
    expect(rbacPermissionCheck).toHaveBeenNthCalledWith(1, undefined)

    expect(rbacPermissionCheck).toHaveBeenNthCalledWith(
      2,
      {
        permissions: ['ff_featureflag_edit', 'ff_featureflag_toggle'],
        resource: { resourceIdentifier: 'my_active_env', resourceType: 'ENVIRONMENT' }
      },
      ['my_active_env']
    )
  })

  test('it should return the correct values when edit flag permission fails, toggle flag permission pass', async () => {
    const mockRBACPermissionsMap = new Map()
    mockRBACPermissionsMap.set(PermissionIdentifier.EDIT_FF_FEATUREFLAG, false)
    mockRBACPermissionsMap.set(PermissionIdentifier.TOGGLE_FF_FEATUREFLAG, true)

    const rbacPermissionCheck = jest.spyOn(rbacHooksMock, 'usePermission')

    const { result } = renderHookUnderTest(['tag1'], mockRBACPermissionsMap)

    expect(rbacPermissionCheck).toHaveNthReturnedWith(1, [true])
    expect(rbacPermissionCheck).toHaveNthReturnedWith(2, [false, true])

    expect(result.current.canEdit).toBeFalsy()
    expect(result.current.canToggle).toBeTruthy()

    expect(result.current.enabledByPermission).toBeTruthy()
    expect(result.current.featureEnabled).toBeTruthy()
    expect(result.current.enabledByPlanEnforcement).toBeTruthy()
  })

  test('it should return the correct values when edit flag permission fails, toggle flag permission fail', async () => {
    const mockRBACPermissionsMap = new Map()
    mockRBACPermissionsMap.set(PermissionIdentifier.EDIT_FF_FEATUREFLAG, false)
    mockRBACPermissionsMap.set(PermissionIdentifier.TOGGLE_FF_FEATUREFLAG, false)

    const rbacPermissionCheck = jest.spyOn(rbacHooksMock, 'usePermission')

    const { result } = renderHookUnderTest(['tag1'], mockRBACPermissionsMap)

    expect(rbacPermissionCheck).toHaveNthReturnedWith(1, [false])
    expect(rbacPermissionCheck).toHaveNthReturnedWith(2, [false, false])

    expect(result.current.canEdit).toBeFalsy()
    expect(result.current.canToggle).toBeFalsy()
    expect(result.current.enabledByPermission).toBeFalsy()
    expect(result.current.featureEnabled).toBeFalsy()

    expect(result.current.enabledByPlanEnforcement).toBeTruthy()
  })

  test('it should return the correct values when edit flag permission pass, toggle flag permissions pass', async () => {
    const mockRBACPermissionsMap = new Map()
    mockRBACPermissionsMap.set(PermissionIdentifier.EDIT_FF_FEATUREFLAG, true)
    mockRBACPermissionsMap.set(PermissionIdentifier.TOGGLE_FF_FEATUREFLAG, true)

    const rbacPermissionCheck = jest.spyOn(rbacHooksMock, 'usePermission')

    const { result } = renderHookUnderTest(['tag1'], mockRBACPermissionsMap)

    expect(rbacPermissionCheck).toHaveNthReturnedWith(1, [true])
    expect(rbacPermissionCheck).toHaveNthReturnedWith(2, [true, true])

    expect(result.current.canEdit).toBeTruthy()
    expect(result.current.canToggle).toBeTruthy()
    expect(result.current.enabledByPermission).toBeTruthy()
    expect(result.current.featureEnabled).toBeTruthy()

    expect(result.current.enabledByPlanEnforcement).toBeTruthy()
  })

  test('it should return the correct values when edit flag permission pass, toggle flag permissions fail', async () => {
    const mockRBACPermissionsMap = new Map()
    mockRBACPermissionsMap.set(PermissionIdentifier.EDIT_FF_FEATUREFLAG, true)
    mockRBACPermissionsMap.set(PermissionIdentifier.TOGGLE_FF_FEATUREFLAG, false)

    const rbacPermissionCheck = jest.spyOn(rbacHooksMock, 'usePermission')

    const { result } = renderHookUnderTest(['tag1'], mockRBACPermissionsMap)

    expect(rbacPermissionCheck).toHaveNthReturnedWith(1, [false])
    expect(rbacPermissionCheck).toHaveNthReturnedWith(2, [true, false])

    expect(result.current.canEdit).toBeTruthy()
    expect(result.current.canToggle).toBeFalsy()
    expect(result.current.enabledByPermission).toBeTruthy()
    expect(result.current.featureEnabled).toBeTruthy()

    expect(result.current.enabledByPlanEnforcement).toBeTruthy()
  })
})
