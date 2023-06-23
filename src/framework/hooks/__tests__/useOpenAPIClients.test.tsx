/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import fetchMock from 'jest-fetch-mock'

import { HarnessReactAPIClient as AuditServiceClient } from '@harnessio/react-audit-service-client'
import { IDPServiceAPIClient } from '@harnessio/react-idp-service-client'
import { PipelineServiceAPIClient } from '@harnessio/react-pipeline-service-client'
import { NGManagerServiceAPIClient } from '@harnessio/react-ng-manager-client'

import useOpenApiClients, { getOpenAPIClientInitiator } from 'framework/hooks/useOpenAPIClients'
import SecureStorage from 'framework/utils/SecureStorage'
import { TestWrapper } from '@common/utils/testUtils'

jest.mock('@harnessio/react-audit-service-client')
jest.mock('@harnessio/react-idp-service-client')
jest.mock('@harnessio/react-pipeline-service-client')
jest.mock('@harnessio/react-ng-manager-client')
;(AuditServiceClient as jest.Mock).mockImplementation()
;(IDPServiceAPIClient as jest.Mock).mockImplementation()
;(PipelineServiceAPIClient as jest.Mock).mockImplementation()
;(NGManagerServiceAPIClient as jest.Mock).mockImplementation()
fetchMock.enableMocks() // needed to mock Request constructor

describe('useOpenAPIClients tests', () => {
  test('calls useOpenAPIClients hook', async () => {
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper>{children}</TestWrapper>
    )
    const { result } = renderHook(() => useOpenApiClients(jest.fn(), 'dummyAccountId'), { wrapper })
    expect(AuditServiceClient).toHaveBeenCalled()
    expect(IDPServiceAPIClient).toHaveBeenCalled()
    expect(PipelineServiceAPIClient).toHaveBeenCalled()
    expect(NGManagerServiceAPIClient).toHaveBeenCalled()
    expect(Object.keys(result.current).indexOf('auditServiceClientRef')).not.toBe(-1)
    expect(Object.keys(result.current).indexOf('idpServiceClientRef')).not.toBe(-1)
    expect(Object.keys(result.current).indexOf('pipelineServiceClientRef')).not.toBe(-1)
    expect(Object.keys(result.current).indexOf('ngManagerServiceClientRef')).not.toBe(-1)
  })

  test('builds initiator object', () => {
    const Response = jest.fn().mockImplementation(url => {
      return { clone: jest.fn(), url }
    })
    window.getApiBaseUrl = jest.fn().mockImplementationOnce(str => {
      return `prefix/${str}`
    })

    const globalResponseHandlerMock = jest.fn()
    const accountId = 'dummyAccountId'
    const url = 'https://example.com'
    SecureStorage.set('token', 'mockedToken')
    const openAPIClientInitiator = getOpenAPIClientInitiator(globalResponseHandlerMock, accountId)

    // Testing Response Interceptor
    const response = new Response()
    const authHeader = 'Bearer mockedToken'
    openAPIClientInitiator.responseInterceptor(response)
    expect(globalResponseHandlerMock).toHaveBeenCalled()

    // Testing URL Interceptor
    const newUrl = openAPIClientInitiator.urlInterceptor('dummyUrl')
    expect(newUrl).toBe('prefix/dummyUrl')

    // Testing Request Interceptor
    const oldRequest = new Request(url, {
      headers: {
        'content-type': 'application/json'
      }
    })
    window.noAuthHeader = false
    const expectedHeaders = new Headers()
    expectedHeaders.append('Harness-Account', accountId)
    expectedHeaders.append('Authorization', authHeader)
    expectedHeaders.append('content-type', 'application/json')
    const result = openAPIClientInitiator.requestInterceptor(oldRequest)
    expect(result.headers).toEqual(expectedHeaders)
    expect(result.headers.get('Authorization')).toEqual(authHeader)
    expect(result.headers.get('Harness-Account')).toEqual(accountId)
    expect(result.headers.get('content-type')).toEqual('application/json')
  })
})
