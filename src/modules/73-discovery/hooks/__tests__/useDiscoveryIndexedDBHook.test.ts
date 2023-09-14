/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { renderHook, act } from '@testing-library/react-hooks'
import { waitFor } from '@testing-library/react'
import * as idb from 'idb'
import * as log from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import { TestWrapper } from '@common/utils/testUtils'
import { DiscoveryObjectStoreNames, useDiscoveryIndexedDBHook } from '../useDiscoveryIndexedDBHook'

// Mock the necessary dependencies
const mockClose = jest.fn()
const mockClear = jest.fn()
const mockCreateObjectStore = jest.fn()
const mockCreateIndex = jest.fn()
const mockDbInstance = {
  createObjectStore: mockCreateObjectStore,
  createIndex: mockCreateIndex,
  close: mockClose,
  clear: mockClear
}
jest.mock('idb', () => ({
  openDB: jest
    .fn()
    .mockImplementation(
      async (
        _name: string,
        version?: number | undefined,
        fns?: { blocked: jest.Mock; upgrade: jest.Mock; blocking: jest.Mock } | undefined
      ) => {
        await fns?.upgrade(mockDbInstance, version)
        return Promise.resolve(mockDbInstance)
      }
    )
}))

jest.mock('framework/utils/SessionToken', () => ({
  getLastTokenSetTime: jest.fn()
}))

const mockShowWarning = jest.fn()
jest.mock('@common/exports', () => ({
  useToaster: () => ({
    showWarning: mockShowWarning
  })
}))

describe('useDiscoveryIndexedDBHook', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should initialize the discovery database and return the db instance', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useDiscoveryIndexedDBHook(), {
      wrapper: TestWrapper
    })

    expect(result.current.isInitializingDB).toBe(true)
    expect(result.current.dbInstance).toBeUndefined()

    await waitForNextUpdate()

    expect(result.current.isInitializingDB).toBe(false)
    expect(result.current.dbInstance).toBeDefined()
  })

  test('should clear the specified object stores when the hook is unmounted', async () => {
    const { unmount, waitForNextUpdate } = renderHook(
      () =>
        useDiscoveryIndexedDBHook({
          clearStoreList: [DiscoveryObjectStoreNames.NETWORK_MAP]
        }),
      {
        wrapper: TestWrapper
      }
    )
    await waitForNextUpdate()
    act(() => {
      unmount()
    })

    expect(mockClear).toHaveBeenCalledTimes(1)
    expect(mockClear).toHaveBeenCalledWith(DiscoveryObjectStoreNames.NETWORK_MAP)
  })

  test('should show a warning if clearing the object store fails', async () => {
    const error = new Error('Clearing failed')
    mockClear.mockRejectedValue(error)

    const { unmount, waitForNextUpdate } = renderHook(
      () =>
        useDiscoveryIndexedDBHook({
          clearStoreList: [DiscoveryObjectStoreNames.NETWORK_MAP]
        }),
      {
        wrapper: TestWrapper
      }
    )
    await waitForNextUpdate()
    act(() => {
      unmount()
    })

    waitFor(() => expect(mockShowWarning).toHaveBeenCalledWith(error))
  })

  test('should log error if openDB fails', async () => {
    const mockErrorLogger = jest.fn()
    const spyMockErrorLogger = jest
      .spyOn(log, 'loggerFor')
      .mockImplementation((_module: ModuleName, _subModule?: string | undefined) => ({
        error: mockErrorLogger,
        info: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn()
      }))

    const error = new Error('Unable to open idb')
    jest.spyOn(idb, 'openDB').mockRejectedValue(error)

    renderHook(() => useDiscoveryIndexedDBHook(), {
      wrapper: TestWrapper
    })

    waitFor(() => expect(spyMockErrorLogger).toHaveBeenCalledWith(error))
  })

  test('should log error if creating object store fails', async () => {
    const mockErrorLogger = jest.fn()
    const spyMockErrorLogger = jest
      .spyOn(log, 'loggerFor')
      .mockImplementation((_module: ModuleName, _subModule?: string | undefined) => ({
        error: mockErrorLogger,
        info: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn()
      }))

    const error = new Error('Unable to create object store')
    mockCreateObjectStore.mockRejectedValue(error)

    const { result } = renderHook(() => useDiscoveryIndexedDBHook(), {
      wrapper: TestWrapper
    })

    waitFor(() => {
      expect(result.current.dbInstance).toBeUndefined()
      expect(spyMockErrorLogger).toHaveBeenCalledWith(error)
    })
  })

  test('should clear dbInstance when blocking is called', async () => {
    jest.spyOn(idb, 'openDB').mockImplementation((_name, version, fns): any => {
      fns?.blocking?.(version ?? 2, 1, {} as any)
      return Promise.resolve(mockDbInstance)
    })

    const { result } = renderHook(() => useDiscoveryIndexedDBHook(), {
      wrapper: TestWrapper
    })

    waitFor(() => {
      expect(mockClose).toHaveBeenCalledTimes(1)
      expect(result.current.isInitializingDB).toBe(false)
      expect(result.current.dbInstance).toBeUndefined()
    })
  })

  test('should clear dbInstance when blocked is called', async () => {
    jest.spyOn(idb, 'openDB').mockImplementation((_name, version, fns): any => {
      fns?.blocked?.(version ?? 2, 1, {} as any)
      return Promise.resolve(mockDbInstance)
    })

    const { result } = renderHook(() => useDiscoveryIndexedDBHook(), {
      wrapper: TestWrapper
    })

    waitFor(() => {
      expect(mockClose).toHaveBeenCalledTimes(1)
      expect(result.current.isInitializingDB).toBe(false)
      expect(result.current.dbInstance).toBeUndefined()
    })
  })
})
