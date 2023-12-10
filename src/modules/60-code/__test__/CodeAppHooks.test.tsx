/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import routes from '@common/RouteDefinitions'
import { PermissionsProvider } from 'framework/rbac/PermissionsContext'
import { TestWrapper } from '@common/utils/testUtils'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import * as pipelineNg from 'services/pipeline-ng'
import { usePermissionTranslate, useGenerateToken, useExecutionDataHook } from '../CodeApp'
import mocks from './permissionMocks.json'
import { useLogsContentHook } from '../hooks/useLogsContentHook'

// eslint-disable-next-line jest-no-mock
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn()
  }),
  useRouteMatch: () => ({ params: { accountId: '1234', orgIdentifier: 'abc', projectIdentifier: 'xyz' } })
}))

jest.mock(
  'react',
  () => ({
    ...jest.requireActual('react'),
    Suspense: ({ children }: { children: JSX.Element }) => <div>{children}</div>
  }),
  { virtual: true }
)

jest.mock(
  'code/App',
  () => ({
    default: ({ children }: { children: JSX.Element }) => {
      return <div>code/App {children}</div>
    }
  }),
  { virtual: true }
)

jest.mock(
  'code/Repositories',
  () => ({
    default: () => <div>code/Repositories</div>
  }),
  { virtual: true }
)

jest.mock(
  'code/Repository',
  () => ({
    default: () => <div>code/Repository</div>
  }),
  { virtual: true }
)

jest.mock(
  'code/FileEdit',
  () => ({
    default: () => <div>code/FileEdit</div>
  }),
  { virtual: true }
)
jest.mock(
  'code/Commit',
  () => ({
    default: () => <div>code/Commits</div>
  }),
  { virtual: true }
)

jest.mock(
  'code/Commits',
  () => ({
    default: () => <div>code/Commits</div>
  }),
  { virtual: true }
)

jest.mock(
  'code/Branches',
  () => ({
    default: () => <div>code/Branches</div>
  }),
  { virtual: true }
)

jest.mock(
  'code/Tags',
  () => ({
    default: () => <div>code/Tags</div>
  }),
  { virtual: true }
)

jest.mock(
  'code/PullRequests',
  () => ({
    default: () => <div>code/PullRequests</div>
  }),
  { virtual: true }
)

jest.mock(
  'code/Compare',
  () => ({
    default: () => <div>code/Compare</div>
  }),
  { virtual: true }
)

jest.mock(
  'code/PullRequest',
  () => ({
    default: () => <div>code/PullRequest</div>
  }),
  { virtual: true }
)

jest.mock(
  'code/Settings',
  () => ({
    default: () => <div>code/Settings</div>
  }),
  { virtual: true }
)

jest.mock(
  'code/Webhooks',
  () => ({
    default: () => <div>code/Webhooks</div>
  }),
  { virtual: true }
)

jest.mock(
  'code/WebhookNew',
  () => ({
    default: () => <div>code/WebhookNew</div>
  }),
  { virtual: true }
)

jest.mock(
  'code/WebhookDetails',
  () => ({
    default: () => <div>code/WebhookDetails</div>
  }),
  { virtual: true }
)

const getPermissions = jest.fn(() => mocks.one)

jest.mock('services/rbac', () => {
  return {
    useGetAccessControlList: jest.fn(() => {
      return {
        mutate: getPermissions
      }
    })
  }
})
jest.mock('services/cd-ng', () => {
  return {
    useCreateToken: jest.fn(() => {
      return {
        mutate: jest.fn()
      }
    })
  }
})

describe('CodeApp hooks', () => {
  test('should mock usePermissionTranslate', () => {
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper
        path={routes.toCODE({
          accountId: ':accountId'
        })}
        pathParams={{ accountId: 'account123', orgIdentifier: 'org123', projectIdentifier: 'project123' }}
      >
        <PermissionsProvider debounceWait={0}>{children}</PermissionsProvider>
      </TestWrapper>
    )
    renderHook(
      () => {
        return usePermissionTranslate({
          resource: {
            resourceType: ResourceType.CODE_REPOSITORY
          },
          permissions: [PermissionIdentifier.CODE_REPO_PUSH]
        })
      },
      { wrapper }
    )
    expect(getPermissions).toHaveBeenCalledTimes(1)
    expect(getPermissions).toHaveBeenCalledWith({
      permissions: [
        {
          permission: 'code_repo_push',
          resourceScope: {
            accountIdentifier: 'account123'
          },
          resourceType: 'CODE_REPOSITORY'
        }
      ]
    })
  })

  test('should mock usegeneratetoken', () => {
    renderHook(() => {
      const data = useGenerateToken('hash', 'user', true as any)
      expect(data).toBe(undefined)
    }, {})
  })
  test('should mock useExecutionDatahook', () => {
    jest.spyOn(pipelineNg, 'useGetExecutionDetailV2').mockReturnValue({
      loading: false,
      error: {},
      data: { pipelineExecutionSummary: { pipelineIdentifier: 'golint' } },
      refetch: jest.fn()
    } as any)
    renderHook(() => {
      const hookData = useExecutionDataHook('id123', 'id1234')
      expect(hookData?.data).toBe({ pipelineExecutionSummary: { pipelineIdentifier: 'golint' } })
    }, {})
  })
  test('should mock useLogDataHook', () => {
    renderHook(() => {
      const data = useLogsContentHook(['id12234'], [])
      expect(data).toBe(undefined)
    }, {})
  })

  afterEach(() => {
    jest.clearAllMocks()
  })
})
