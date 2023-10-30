/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo, pick } from 'lodash-es'
import { GetDataError } from 'restful-react'
import {
  getPipelineSummaryPromise,
  getPipelinePromise,
  GetPipelineQueryParams,
  ResponsePMSPipelineResponseDTO,
  ResponsePMSPipelineSummaryResponse,
  PipelineInfoConfig,
  EntityGitDetails,
  EntityValidityDetails,
  Failure,
  YamlSchemaErrorWrapperDTO,
  CacheResponseMetadata
} from 'services/pipeline-ng'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { parse } from '@common/utils/YamlHelperMethods'
import { StoreType } from '@common/constants/GitSyncTypes'
import type { Pipeline } from '@pipeline/utils/types'

export interface FetchError {
  templateError?: GetDataError<Failure | Error>
  remoteFetchError?: GetDataError<Failure | Error>
}

export interface PipelineInfoConfigWithGitDetails extends Partial<PipelineInfoConfig> {
  gitDetails?: EntityGitDetails
  entityValidityDetails?: EntityValidityDetails
  templateError?: GetDataError<Failure | Error> | null
  remoteFetchError?: GetDataError<Failure | Error> | null
  yamlSchemaErrorWrapper?: YamlSchemaErrorWrapperDTO
  cacheResponse?: CacheResponseMetadata
  validationUuid?: string
}

interface FetchPipelineYamlAndMetadataParams {
  queryParams: GetPipelineQueryParams & GitQueryParams
  forceFetch?: boolean
  forceUpdate?: boolean
  pipelineId: string
  signal?: AbortSignal
  repoIdentifier?: string
  branch?: string
  loadFromCache?: boolean
}

const getPipelineByIdentifier = (
  params: GetPipelineQueryParams & GitQueryParams,
  identifier: string,
  loadFromCache?: boolean,
  signal?: AbortSignal
): Promise<PipelineInfoConfigWithGitDetails | FetchError> => {
  return getPipelinePromise(
    {
      pipelineIdentifier: identifier,
      queryParams: {
        accountIdentifier: params.accountIdentifier,
        orgIdentifier: params.orgIdentifier,
        projectIdentifier: params.projectIdentifier,
        validateAsync: params.validateAsync,
        ...(params.branch ? { branch: params.branch } : {}),
        ...(params.repoIdentifier ? { repoIdentifier: params.repoIdentifier } : {}),
        parentEntityConnectorRef: params.connectorRef,
        parentEntityRepoName: params.repoName,
        ...(params?.storeType === StoreType.REMOTE && !params.branch ? { loadFromFallbackBranch: true } : {})
      },
      requestOptions: {
        headers: {
          'content-type': 'application/yaml',
          ...(loadFromCache ? { 'Load-From-Cache': 'true' } : {})
        }
      }
    },
    signal
  ).then((response: ResponsePMSPipelineResponseDTO & { message?: string }) => {
    let obj = {} as ResponsePMSPipelineResponseDTO
    if ((typeof response as unknown) === 'string') {
      obj = defaultTo(parse<{ data: { yamlPipeline: string } }>(response?.data?.yamlPipeline ?? ''), {})
    } else if (response.data?.yamlPipeline) {
      obj = response
    }
    if (obj.status === 'SUCCESS' && obj.data?.yamlPipeline) {
      let yamlPipelineDetails: Pipeline | null = null
      try {
        yamlPipelineDetails = parse<Pipeline>(obj.data?.yamlPipeline)
      } catch (e) {
        // caught YAMLSemanticError, YAMLReferenceError, YAMLSyntaxError, YAMLWarning
      }

      // TODO: should be yaml version condition
      const pipeline = !yamlPipelineDetails
        ? {}
        : yamlPipelineDetails?.pipeline
        ? yamlPipelineDetails.pipeline
        : yamlPipelineDetails

      return {
        ...pipeline,
        gitDetails: obj.data.gitDetails ?? {},
        entityValidityDetails: obj.data.entityValidityDetails ?? {},
        yamlSchemaErrorWrapper: obj.data.yamlSchemaErrorWrapper ?? {},
        modules: response.data?.modules,
        cacheResponse: obj.data?.cacheResponse,
        validationUuid: obj.data?.validationUuid,
        publicAccessResponse: pick(obj.data?.publicAccessResponse, ['public'])
      }
    } else if (response?.status === 'ERROR' && params?.storeType === StoreType.REMOTE) {
      return { remoteFetchError: response } as FetchError // handling remote pipeline not found
    } else {
      const message = defaultTo(response?.message, '')
      return {
        templateError: {
          message,
          data: {
            message
          },
          status: 500
        }
      }
    }
  })
}

const getPipelineMetadataByIdentifier = (
  params: GetPipelineQueryParams & GitQueryParams,
  identifier: string,
  signal?: AbortSignal
): Promise<ResponsePMSPipelineSummaryResponse | FetchError> => {
  return getPipelineSummaryPromise(
    {
      pipelineIdentifier: identifier,
      queryParams: {
        accountIdentifier: params.accountIdentifier,
        orgIdentifier: params.orgIdentifier,
        projectIdentifier: params.projectIdentifier,
        ...(params.branch ? { branch: params.branch } : {}),
        ...(params.repoIdentifier ? { repoIdentifier: params.repoIdentifier } : {}),
        parentEntityConnectorRef: params.connectorRef,
        parentEntityRepoName: params.repoName,
        getMetadataOnly: true
      },
      requestOptions: {
        headers: {
          'content-type': 'application/json'
        }
      }
    },
    signal
  ).then((response: ResponsePMSPipelineSummaryResponse) => {
    return response
  })
}

export async function fetchPipelineYamlAndMetadata({
  queryParams,
  pipelineId,
  signal,
  repoIdentifier,
  branch,
  loadFromCache
}: FetchPipelineYamlAndMetadataParams): Promise<{
  pipelineById: PipelineInfoConfigWithGitDetails | FetchError
  pipelineMetaDataById: ResponsePMSPipelineSummaryResponse
}> {
  const pipelineByIdPromise = getPipelineByIdentifier(
    {
      ...queryParams,
      validateAsync: true,
      ...(repoIdentifier ? { repoIdentifier } : {}),
      ...(branch ? { branch } : {})
    },
    pipelineId,
    loadFromCache,
    signal
  )

  const pipelineMetaDataPromise = getPipelineMetadataByIdentifier(
    { ...queryParams, ...(repoIdentifier ? { repoIdentifier } : {}), ...(branch ? { branch } : {}) },
    pipelineId,
    signal
  )

  const pipelineAPIResponses = await Promise.allSettled([pipelineByIdPromise, pipelineMetaDataPromise])

  const [pipelineById, pipelineMetaDataById] = pipelineAPIResponses.map(response => {
    if (response?.status === 'fulfilled') {
      return response?.value
    } else {
      return response?.reason
    }
  })

  return { pipelineById, pipelineMetaDataById }
}
