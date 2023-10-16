/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { isJsonResponse } from 'framework/utils/APIUtils'

describe('API Utils tests', () => {
  test('that isJsonResponse returns correctly with correct headers', () => {
    const Response = jest.fn().mockImplementation((body, options) => {
      const headers = {
        get: jest.fn().mockImplementation(key => {
          return options?.headers?.[key]
        })
      }
      return { clone: jest.fn(), body, headers }
    })

    const response = new Response('responseBody', { headers: { 'content-type': 'text' } })
    expect(isJsonResponse(response)).toBe(false)
    const response2 = new Response('responseBody')
    expect(isJsonResponse(response2)).toBe(false)
    const response3 = new Response('responseBody', { headers: { 'content-type': 'application/json' } })
    expect(isJsonResponse(response3)).toBe(true)
  })
})
