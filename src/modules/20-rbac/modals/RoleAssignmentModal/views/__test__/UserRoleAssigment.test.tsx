/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor, screen } from '@testing-library/react'
import type { ResponseBoolean, UserMetadataDTO } from 'services/cd-ng'
import { projectPathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'
import UserRoleAssignment from '@rbac/modals/RoleAssignmentModal/views/UserRoleAssigment'
import { rolesMockList } from '@rbac/pages/Roles/__tests__/RolesMock'
import { activeUserMock, mockResponse, usersMockData } from '@rbac/pages/Users/__tests__/mock'
import { TestWrapper } from '@common/utils/testUtils'
import { resourceGroupListResponse } from '@rbac/pages/ResourceGroups/_tests_/mock'

jest.useFakeTimers()

const createRoleMock = jest.fn().mockImplementation(() => mockResponse)

const deleteRoleAssignmentsMock = jest.fn().mockImplementation(() => Promise.resolve(true))

jest.mock('services/rbac', () => ({
  useGetRoleList: jest.fn().mockImplementation(() => {
    return { data: rolesMockList, refetch: jest.fn(), error: null }
  }),
  usePostRoleAssignments: jest.fn().mockImplementation(() => ({ mutate: createRoleMock })),
  useBulkDeleteRoleAssignment: jest
    .fn()
    .mockImplementation(() => ({ mutate: deleteRoleAssignmentsMock, loading: false }))
}))

jest.mock('services/resourcegroups', () => ({
  useGetResourceGroupListV2: jest.fn().mockImplementation(() => {
    return { data: resourceGroupListResponse, refetch: jest.fn(), error: null }
  })
}))

const deleteActiveUser = jest.fn()
const unlockActiveUser = jest.fn()
const deleteActiveUserMock = (): ResponseBoolean => {
  deleteActiveUser()
  return mockResponse
}
const unlockActiveUserMock = (): ResponseBoolean => {
  unlockActiveUser()
  return mockResponse
}

const createUser = jest.fn()
const createUserMock = (): ResponseBoolean => {
  createUser()
  return mockResponse
}

jest.mock('services/cd-ng', () => ({
  checkIfLastAdminPromise: jest.fn().mockImplementation(() => ({ data: true })),
  useRemoveUser: jest.fn().mockImplementation(() => ({ mutate: deleteActiveUserMock })),
  useUnlockUser: jest.fn().mockImplementation(() => ({ mutate: unlockActiveUserMock })),
  useAddUsers: jest.fn().mockImplementation(() => ({ mutate: createUserMock })),
  useGetAggregatedUsers: jest.fn(() => ({
    cancel: jest.fn(),
    loading: false,
    mutate: jest.fn().mockImplementation(() => activeUserMock)
  })),
  useGetUsers: jest.fn(() => ({
    cancel: jest.fn(),
    loading: false,
    mutate: jest.fn().mockImplementation(() => usersMockData)
  }))
}))

const principalInfoForUserTypeMock = {
  name: 'UserFirstname UserLastname',
  email: 'abc@harness.io',
  uuid: 'uuid_1',
  locked: false,
  disabled: false,
  externallyManaged: false,
  twoFactorAuthenticationEnabled: false
}

const roleAssignmentMetadataMock = [
  {
    identifier: 'role_assignment_1',
    roleIdentifier: '_account_viewer',
    roleName: 'Account Viewer',
    resourceGroupIdentifier: '_all_account_level_resources',
    resourceGroupName: 'All Account Level Resources',
    managedRole: true,
    managedRoleAssignment: false
  },
  {
    identifier: 'role_assignment_2',
    roleIdentifier: '_account_admin',
    roleName: 'Account Admin',
    resourceGroupIdentifier: '_all_resources_including_child_scopes',
    resourceGroupName: 'All Resources Including Child Scopes',
    managedRole: true,
    managedRoleAssignment: false
  }
]

describe('Role Assignment Form', () => {
  test('Delete role assignment', async () => {
    const { container, getByRole } = render(
      <TestWrapper
        path={routes.toUserGroups({ ...projectPathProps })}
        pathParams={{ accountId: 'testAcc', orgIdentifier: 'testOrg', projectIdentifier: 'testProject', module: 'cd' }}
      >
        <UserRoleAssignment
          roleBindings={roleAssignmentMetadataMock}
          user={principalInfoForUserTypeMock as UserMetadataDTO}
          isInvite={false}
          onSubmit={jest.fn()}
          onUserAdded={jest.fn()}
          onSuccess={jest.fn()}
          onCancel={jest.fn()}
        />
      </TestWrapper>
    )
    const roleAssignment2RoleName = roleAssignmentMetadataMock[1].roleName
    const roleDropdowns = screen.getAllByPlaceholderText('rbac.usersPage.selectRole')
    await waitFor(() => {
      expect(roleDropdowns[1].getAttribute('value')).toBe(roleAssignment2RoleName)
    })

    // find and click on Delete icon
    const deleteIcons = container.querySelectorAll('[data-icon="main-trash"]')
    fireEvent.click(deleteIcons[1]!)
    const deletedRoleAssignmentIdentifier = roleAssignmentMetadataMock[1].identifier

    await waitFor(() => {
      // waiting to making sure that delete action is completed
      expect(container.querySelectorAll('[data-icon="main-trash"]').length).toBe(1)
      expect(screen.getAllByPlaceholderText('rbac.usersPage.selectRole').length).toBe(1)
    })

    const applyBtn = getByRole('button', { name: 'common.apply' })
    fireEvent.click(applyBtn!)
    await waitFor(() => {
      expect(deleteRoleAssignmentsMock).toHaveBeenCalled()
      expect(deleteRoleAssignmentsMock).toHaveBeenCalledWith([deletedRoleAssignmentIdentifier], {
        headers: { 'content-type': 'application/json' }
      })
    })
  })
})
