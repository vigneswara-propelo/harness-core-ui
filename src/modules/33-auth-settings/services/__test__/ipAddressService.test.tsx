/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import fetchMock from 'jest-fetch-mock'
import { fetchCurrentIp, getBugsnagCallback } from '../ipAddressService'
import { fetchCurrentIpMock } from '../mocks/ipAddressService.mock'
fetchMock.enableMocks()

describe('fetchCurrentIp', () => {
  beforeEach(() => {
    fetchMock.resetMocks()
    window.getApiBaseUrl = jest.fn().mockImplementationOnce(str => {
      return `/prefix/${str}`
    })
  })

  test('should return the current IP address', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(fetchCurrentIpMock))

    const username = 'testUser'
    const accountId = '123'

    const currentIp = await fetchCurrentIp(username, accountId)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith('http://localhost/prefix/v1/current-ip', { headers: {} })

    expect(currentIp).toBe('192.168.0.1')
  })

  test('should handle error and return undefined without bugsnag client', async () => {
    const mockError = new Error('Failed to fetch IP')
    fetchMock.mockRejectOnce(mockError)

    const username = 'testUser'
    const accountId = '123'

    const currentIp = await fetchCurrentIp(username, accountId)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith('http://localhost/prefix/v1/current-ip', { headers: {} })

    expect(currentIp).toBeUndefined()
  })

  test('should handle error and return undefined with bugsnag client', async () => {
    let notifiedCalled = false
    const bugsnagClient = {
      notify: (_e: any) => {
        notifiedCalled = true
      }
    }
    window['bugsnagClient'] = bugsnagClient

    const mockError = new Error('Failed to fetch IP')
    fetchMock.mockRejectOnce(mockError)

    const username = 'testUser'
    const accountId = '123'

    const currentIp = await fetchCurrentIp(username, accountId)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith('http://localhost/prefix/v1/current-ip', { headers: {} })

    expect(currentIp).toBeUndefined()
    expect(notifiedCalled).toBeTruthy()
    window['bugsnagClient'] = undefined
  })
})

describe('getBugsnagCallback', () => {
  test('should return a function with the correct event settings', () => {
    const username = 'testUser'
    const url = 'http://localhost/prefix/v1/current-ip'
    const response = { status: 500 }
    const accountId = '123'

    const bugsnagCallback = getBugsnagCallback(username, url, response as any, accountId)

    const event: any = {
      severity: '',
      setUser: jest.fn(),
      addMetadata: jest.fn()
    }

    bugsnagCallback(event)

    expect(event.severity).toBe('error')
    expect(event.setUser).toHaveBeenCalledWith(username)
    expect(event.addMetadata).toHaveBeenCalledWith('IP Address fetch failed', {
      url: url,
      status: response.status,
      accountId: accountId
    })
  })
})
