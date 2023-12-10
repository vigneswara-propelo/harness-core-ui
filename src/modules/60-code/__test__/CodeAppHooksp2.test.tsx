/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import { renderHook } from '@testing-library/react-hooks'
import { act } from '@testing-library/react'
import { useLogsContentHook } from '../hooks/useLogsContentHook'
import mocks from './permissionMocks.json'

// eslint-disable-next-line jest-no-mock
jest.mock('react-router-dom', () => ({
  useParams: jest.fn().mockReturnValue({ accountId: 'mockAccountId' })
}))
jest.mock('@modules/70-pipeline/context/ExecutionContext', () => ({
  useExecutionContext: jest.fn().mockReturnValue({
    logsToken: 'mockToken',
    setLogsToken: jest.fn()
  })
}))

jest.mock('services/logs', () => ({
  logBlobPromise: jest.fn().mockResolvedValue('mockBlobData'),
  useGetToken: jest.fn().mockReturnValue({
    data: 'mockTokenData'
  })
}))

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
  test('should mock useLOgsCOntentHook p2', () => {
    act(() => {
      renderHook(async () => {
        // Use the hook in a test renderer or custom test function
        // Check if your hook behaves as expected
        const hookData = await useLogsContentHook(['logKey1'], [true])
        expect(hookData).toBeDefined()
      })
    })
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
})
