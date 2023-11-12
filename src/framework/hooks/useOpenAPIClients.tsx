/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React, { useRef } from 'react'

import { HarnessReactAPIClient as AuditServiceClient } from '@harnessio/react-audit-service-client'
import { IDPServiceAPIClient } from '@harnessio/react-idp-service-client'
import { PipelineServiceAPIClient } from '@harnessio/react-pipeline-service-client'
import { NGManagerServiceAPIClient } from '@harnessio/react-ng-manager-client'
import { SSCAManagerAPIClient } from '@harnessio/react-ssca-manager-client'
import { SRMServiceAPIClient } from '@harnessio/react-srm-service-client'
import { TemplateServiceAPIClient } from '@harnessio/react-template-service-client'

import SessionToken from 'framework/utils/SessionToken'

type UseOpenApiClientsReturn = {
  auditServiceClientRef: React.MutableRefObject<AuditServiceClient>
  idpServiceClientRef: React.MutableRefObject<IDPServiceAPIClient>
  pipelineServiceClientRef: React.MutableRefObject<PipelineServiceAPIClient>
  ngManagerServiceClientRef: React.MutableRefObject<NGManagerServiceAPIClient>
  sscaManagerClientRef: React.MutableRefObject<SSCAManagerAPIClient>
  srmManagerClientRef: React.MutableRefObject<SRMServiceAPIClient>
  templateServiceClientRef: React.MutableRefObject<TemplateServiceAPIClient>
}

export const getOpenAPIClientInitiator = (
  globalResponseHandler: (response: Response) => void,
  accountId: string
): any => {
  const responseInterceptor = (response: Response): Response => {
    globalResponseHandler(response.clone())
    return response
  }
  const urlInterceptor = (url: string): string => {
    return window.getApiBaseUrl(url)
  }
  const requestInterceptor = (request: Request): Request => {
    const oldRequest = request.clone()
    const headers = new Headers()
    for (const key of oldRequest.headers.keys()) {
      const value = oldRequest.headers.get(key) as string
      if (key.toLowerCase() !== 'authorization') {
        headers.append(key, value)
      }
    }
    if (!window.noAuthHeader) {
      headers.append('Authorization', `Bearer ${SessionToken.getToken()}`)
    }
    headers.append('Harness-Account', accountId)
    const newRequest = new Request(oldRequest, { headers })
    return newRequest
  }
  return { responseInterceptor, urlInterceptor, requestInterceptor }
}

const useOpenApiClients = (
  globalResponseHandler: (response: Response) => void,
  accountId: string
): UseOpenApiClientsReturn => {
  const openAPIClientInitiator = getOpenAPIClientInitiator(globalResponseHandler, accountId)

  const auditServiceClientRef = useRef(new AuditServiceClient(openAPIClientInitiator))
  const idpServiceClientRef = useRef(new IDPServiceAPIClient(openAPIClientInitiator))
  const pipelineServiceClientRef = useRef(new PipelineServiceAPIClient(openAPIClientInitiator))
  const sscaManagerClientRef = useRef(new SSCAManagerAPIClient(openAPIClientInitiator))
  const srmManagerClientRef = useRef(new SRMServiceAPIClient(openAPIClientInitiator))
  const ngManagerServiceClientRef = useRef(new NGManagerServiceAPIClient(openAPIClientInitiator))
  const templateServiceClientRef = useRef(new TemplateServiceAPIClient(openAPIClientInitiator))

  return {
    auditServiceClientRef,
    idpServiceClientRef,
    pipelineServiceClientRef,
    ngManagerServiceClientRef,
    sscaManagerClientRef,
    srmManagerClientRef,
    templateServiceClientRef
  }
}

export default useOpenApiClients
