/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useEffect, useRef } from 'react'

interface FunctionPollingConfig {
  maxTries?: number
  interval?: number
  startPolling?: boolean
  onCompletePolling?: () => void
}

const useFunctionPolling = (
  callback: () => Promise<void> | undefined,
  { maxTries = 20, interval = 5000, startPolling = true, onCompletePolling }: FunctionPollingConfig
): void => {
  const tries = useRef(0)
  const intervalId = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const handlePolling = (): void => {
      if (tries.current < maxTries && startPolling) {
        callback()
        tries.current++
      } else {
        intervalId.current && clearInterval(intervalId.current)
        if (onCompletePolling && tries.current >= maxTries) {
          onCompletePolling()
        }
      }
    }

    if (startPolling) {
      intervalId.current = setInterval(handlePolling, interval)
    }

    return () => {
      clearInterval(intervalId.current as NodeJS.Timeout)
    }
  }, [callback, maxTries, interval, startPolling, onCompletePolling])

  useEffect(() => {
    if (!startPolling) {
      tries.current = 0
      if (intervalId.current) {
        clearInterval(intervalId.current)
        onCompletePolling?.()
      }
    }
  }, [startPolling])
}

export default useFunctionPolling
