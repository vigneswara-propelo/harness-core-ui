/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { renderHook, act } from '@testing-library/react-hooks'
import { waitFor } from '@testing-library/dom'
import useFunctionPolling from '../useFunctionPolling'

describe('useFunctionPolling', () => {
  test('should call the provided function', () => {
    const fn = jest.fn()
    renderHook(() => useFunctionPolling(fn, { maxTries: 1, interval: 1, startPolling: true }))

    // Wait for the polling interval to pass
    act(() => {
      jest.advanceTimersByTime(1)
    })

    expect(fn).toHaveBeenCalled()
  })

  test('should stop polling after reaching maxTries', () => {
    const fn = jest.fn()
    renderHook(() => useFunctionPolling(fn, { maxTries: 2, interval: 1, startPolling: true }))

    // Wait for the polling intervals to pass
    act(() => {
      jest.advanceTimersByTime(2)
    })

    expect(fn).toHaveBeenCalledTimes(2)
  })

  test('should call onCompletePolling after reaching maxTries', async () => {
    const fn = jest.fn()
    const onCompletePolling = jest.fn()
    renderHook(() => useFunctionPolling(fn, { maxTries: 2, interval: 1, startPolling: true, onCompletePolling }))

    // Wait for the polling intervals to pass
    act(() => {
      jest.advanceTimersByTime(2)
    })

    await waitFor(() => expect(onCompletePolling).toHaveBeenCalled())
  })

  test('should stop polling when startPolling is false', () => {
    const fn = jest.fn()
    const { rerender } = renderHook(
      ({ startPolling }) => useFunctionPolling(fn, { maxTries: 2, interval: 1, startPolling }),
      {
        initialProps: { startPolling: true }
      }
    )

    // Wait for the polling interval to pass
    act(() => {
      jest.advanceTimersByTime(1)
    })

    expect(fn).toHaveBeenCalledTimes(1)

    // Disable polling
    rerender({ startPolling: false })

    // Wait for another polling interval
    act(() => {
      jest.advanceTimersByTime(1)
    })

    // fn should not be called again
    expect(fn).toHaveBeenCalledTimes(1)
  })

  beforeAll(() => {
    jest.useFakeTimers()
  })

  afterAll(() => {
    jest.useRealTimers()
  })
})
