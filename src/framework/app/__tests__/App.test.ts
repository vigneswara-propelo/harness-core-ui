/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { TextEncoder, TextDecoder } from 'util'
import { Response as ResponseFromNodeFetch, Headers } from 'node-fetch'
import { globalResponseHandler } from '../App'

// Needed for .json() method that is used inside globalResponseHandler
// Reference: https://stackoverflow.com/a/71009888
;(global as any).TextEncoder = TextEncoder
;(global as any).TextDecoder = TextDecoder

jest.useFakeTimers()

describe('GlobalResponseHandler Tests', () => {
  let username: string
  let accountId: string
  let showError: () => unknown
  let forceLogout: () => unknown

  const unauthorizedErrorMessage =
    'Account login is blocked as the account is being deleted. Please reach out to Harness Support if this is incorrect.'

  beforeEach(() => {
    username = 'dummy username'
    accountId = 'accountId'
    showError = jest.fn()
    forceLogout = jest.fn()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  test('that GlobalResponseHandler handles 200 use case', async () => {
    const headers = new Headers({ 'content-type': 'text' })
    const response = new ResponseFromNodeFetch('responseBody', { status: 200, headers })

    await globalResponseHandler(
      username,
      accountId,
      showError,
      forceLogout,
      sessionStorage,
      response as unknown as Response
    )
    expect(forceLogout).not.toHaveBeenCalled()
  })

  test('that GlobalResponseHandler handles non-json 401 use case', async () => {
    const response = new ResponseFromNodeFetch('non-json response', {
      status: 401,
      headers: { 'content-type': 'text' }
    })

    await globalResponseHandler(
      username,
      accountId,
      showError,
      forceLogout,
      sessionStorage,
      response as unknown as Response
    )
    expect(showError).not.toHaveBeenCalled()
    expect(forceLogout).toHaveBeenCalled()
  })

  test('that GlobalResponseHandler handles non-json non-401 (500) use case', async () => {
    const response = new ResponseFromNodeFetch('non-json response', {
      status: 500,
      headers: { 'content-type': 'text' }
    })

    await globalResponseHandler(
      username,
      accountId,
      showError,
      forceLogout,
      sessionStorage,
      response as unknown as Response
    )
    expect(forceLogout).not.toHaveBeenCalled()
  })

  test('that GlobalResponseHandler handles json 401 use case', async () => {
    const response = new ResponseFromNodeFetch(
      `{
        "validJsonKey": "validJsonValue"
      }`,
      {
        status: 401,
        headers: { 'content-type': 'application/json' }
      }
    )

    await globalResponseHandler(
      username,
      accountId,
      showError,
      forceLogout,
      sessionStorage,
      response as unknown as Response
    )

    jest.runAllTicks()

    expect(forceLogout).toHaveBeenCalled()
    expect(showError).not.toHaveBeenCalled()
  })

  test('that GlobalResponseHandler handles json 401 use case with Whitelisted error', async () => {
    const response = new ResponseFromNodeFetch(
      `{
        "validJsonKey": "validJsonValue",
        "responseMessages": [
          {
            "code": "NOT_WHITELISTED_IP",
            "message": "Your IP address 192.168.1.1 is not whitelisted"
          }
        ]
      }`,
      {
        status: 401,
        headers: { 'content-type': 'application/json' }
      }
    )

    await globalResponseHandler(
      username,
      accountId,
      showError,
      forceLogout,
      sessionStorage,
      response as unknown as Response
    )

    jest.runAllTicks()

    expect(forceLogout).toHaveBeenCalled()
    expect(showError).toHaveBeenCalled()
  })

  test('that GlobalResponseHandler handles json 400 use case with Whitelisted error', async () => {
    const response = new ResponseFromNodeFetch(
      `{
        "validJsonKey": "validJsonValue",
        "responseMessages": [
          {
            "code": "NOT_WHITELISTED_IP",
            "message": "Your IP address 192.168.1.1 is not whitelisted"
          }
        ]
      }`,
      {
        status: 400,
        headers: { 'content-type': 'application/json' }
      }
    )

    await globalResponseHandler(
      username,
      accountId,
      showError,
      forceLogout,
      sessionStorage,
      response as unknown as Response
    )

    jest.runAllTicks()

    expect(forceLogout).toHaveBeenCalled()
    expect(showError).toHaveBeenCalled()
  })

  test('that GlobalResponseHandler handles json 400 use case with Unauthorized error', async () => {
    const response = new ResponseFromNodeFetch(
      `{
        "responseMessages": [
          {
            "code": "UNAUTHORIZED",
            "message":"${unauthorizedErrorMessage}"
          }
        ]
      }`,

      {
        status: 400,
        headers: { 'content-type': 'application/json' }
      }
    )

    await globalResponseHandler(
      username,
      accountId,
      showError,
      forceLogout,
      sessionStorage,
      response as unknown as Response
    )

    jest.runAllTicks()

    expect(forceLogout).toHaveBeenCalled()
    expect(showError).toHaveBeenCalledWith(unauthorizedErrorMessage)
  })

  test('that GlobalResponseHandler handles json 401 use case with Unauthorized error', async () => {
    const response = new ResponseFromNodeFetch(
      `{
        "responseMessages": [
          {
            "code": "UNAUTHORIZED",
            "message":"${unauthorizedErrorMessage}"
          }
        ]
      }`,

      {
        status: 401,
        headers: { 'content-type': 'application/json' }
      }
    )

    await globalResponseHandler(
      username,
      accountId,
      showError,
      forceLogout,
      sessionStorage,
      response as unknown as Response
    )

    jest.runAllTicks()

    expect(forceLogout).toHaveBeenCalled()
    expect(showError).toHaveBeenCalledWith(unauthorizedErrorMessage)
  })
  test('that GlobalResponseHandler handles json 429 use case with Whitelisted error', async () => {
    const errorMessage429 = 'Too many requests received, please try again later'
    const response = new ResponseFromNodeFetch(
      `{
        "validJsonKey": "validJsonValue",
        "message": "${errorMessage429}"
      }`,
      {
        status: 429,
        headers: { 'content-type': 'application/json' }
      }
    )

    await globalResponseHandler(
      username,
      accountId,
      showError,
      forceLogout,
      sessionStorage,
      response as unknown as Response
    )

    jest.runAllTicks()

    expect(forceLogout).not.toHaveBeenCalled()
    expect(showError).toHaveBeenCalledWith(errorMessage429)
  })
})
