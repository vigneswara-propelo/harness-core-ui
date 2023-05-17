/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { renderHook } from '@testing-library/react-hooks'

import { HarnessReactAPIClient as AuditServiceClient } from '@harnessio/react-audit-service-client'
import { IDPServiceAPIClient } from '@harnessio/react-idp-service-client'
import { PipelineServiceAPIClient } from '@harnessio/react-pipeline-service-client'
import { NGManagerServiceAPIClient } from '@harnessio/react-ng-manager-client'

import useOpenApiClients, { getOpenAPIClientInitiator } from 'framework/hooks/useOpenAPIClients'
import { TestWrapper } from '@common/utils/testUtils'

jest.mock('@harnessio/react-audit-service-client')
jest.mock('@harnessio/react-idp-service-client')
jest.mock('@harnessio/react-pipeline-service-client')
jest.mock('@harnessio/react-ng-manager-client')
;(AuditServiceClient as jest.Mock).mockImplementation()
;(IDPServiceAPIClient as jest.Mock).mockImplementation()
;(PipelineServiceAPIClient as jest.Mock).mockImplementation()
;(NGManagerServiceAPIClient as jest.Mock).mockImplementation()

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
    const openAPIClientInitiator = getOpenAPIClientInitiator(globalResponseHandlerMock, accountId)
    const response = new Response()
    openAPIClientInitiator.responseInterceptor(response)
    expect(globalResponseHandlerMock).toHaveBeenCalled()

    const newUrl = openAPIClientInitiator.urlInterceptor('dummyUrl')
    expect(newUrl).toBe('prefix/dummyUrl')

    const requestHeaders = openAPIClientInitiator.getRequestHeaders()
    expect(requestHeaders).toStrictEqual({ 'Harness-Account': accountId, token: '' })
  })
})
