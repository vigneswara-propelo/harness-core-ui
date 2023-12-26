/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  GetTemplateListQueryParams,
  GetTemplateQueryParams,
  TemplateMetadataSummaryResponse,
  TemplateResponse,
  TemplateSummaryResponse,
  getTemplateListPromise,
  getTemplateMetadataListPromise,
  getTemplatePromise
} from 'services/template-ng'

export const getTemplateYaml = (
  queryParams: GetTemplateQueryParams,
  templateIdentifier: string,
  isGitCacheEnabled: boolean,
  loadFromCache: boolean,
  signal?: AbortSignal
): Promise<TemplateResponse> => {
  return getTemplatePromise(
    {
      queryParams,
      templateIdentifier,
      requestOptions: { headers: { ...(isGitCacheEnabled && loadFromCache ? { 'Load-From-Cache': 'true' } : {}) } }
    },
    signal
  )
    .then(response => {
      if (response.status === 'SUCCESS' && response.data) {
        return response.data
      }
      throw response
    })
    .catch(error => {
      throw error
    })
}

export const getTemplateMetadata = (
  queryParams: GetTemplateListQueryParams,
  identifier: string,
  signal?: AbortSignal
): Promise<TemplateMetadataSummaryResponse[]> => {
  return getTemplateMetadataListPromise(
    {
      queryParams,
      body: {
        filterType: 'Template',
        templateIdentifiers: [identifier]
      }
    },
    signal
  )
    .then(response => {
      if (response.status === 'SUCCESS' && response.data?.content) {
        return response.data?.content
      }
      throw new Error()
    })
    .catch(error => {
      throw new Error(error)
    })
}

export const getTemplatesByIdentifier = (
  queryParams: GetTemplateListQueryParams,
  identifier: string,
  signal?: AbortSignal
): Promise<TemplateSummaryResponse[]> => {
  return getTemplateListPromise(
    {
      queryParams,
      body: {
        filterType: 'Template',
        templateIdentifiers: [identifier]
      }
    },
    signal
  )
    .then(response => {
      if (response.status === 'SUCCESS' && response.data?.content) {
        return response.data?.content
      }
      throw new Error()
    })
    .catch(error => {
      throw new Error(error)
    })
}
