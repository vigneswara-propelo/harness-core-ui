import React, { useState } from 'react'

import { defaultTo } from 'lodash-es'
import { useLocation } from 'react-router-dom'
import { EntityGitDetails, GetPipelineQueryParams, ResponsePMSPipelineSummaryResponse } from 'services/pipeline-ng'
import { getId, getRepoIdentifierName } from '@pipeline/components/PipelineStudio/PipelineContext/utils'
import { DefaultNewPipelineId } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import { PipelineMetadataForRouter } from '@pipeline/components/CreatePipelineButton/useCreatePipelineModalY1'
import { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { PipelinePayload } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineAsyncActions'
import { useIDBContext } from '@modules/10-common/components/IDBContext/IDBContext'
import { PipelineInfoConfigWithGitDetails } from '@modules/70-pipeline/v1/components/PipelineStudioV1/PipelineContextV1/PipelineContextV1'
import { FetchError, fetchPipelineYamlAndMetadata } from './helpers'

type YamlVersion = '0' | '1' | undefined

export interface FetchPipelineParams {
  newPipelineId?: string
  signal?: AbortSignal
  repoIdentifier?: string
  branch?: string
  loadFromCache?: boolean
}

interface PipelineLoaderContextInterface {
  yamlVersion?: YamlVersion
  apiData?: {
    pipeline?: PipelineInfoConfigWithGitDetails | FetchError | null
    pipelineMetadata?: ResponsePMSPipelineSummaryResponse | null
  }
  pipelineFromDB?: unknown | null
  fetchingPipeline: boolean
}

interface PipelineLoaderProviderProps {
  queryParams: GetPipelineQueryParams & GitQueryParams
  pipelineIdentifier: string
  children: React.ReactNode
}

export const PipelineLoaderContext = React.createContext<PipelineLoaderContextInterface>({
  apiData: {
    pipeline: null,
    pipelineMetadata: null
  },
  pipelineFromDB: null,
  fetchingPipeline: false
})

export function PipelineLoaderProvider({
  children,
  queryParams,
  pipelineIdentifier
}: PipelineLoaderProviderProps): React.ReactElement {
  const {
    idb,
    initializationFailed: idbInitializationFailed,
    initialized: idbInitialized
  } = useIDBContext<PipelinePayload>()

  const [state, setState] = useState<Pick<PipelineLoaderContextInterface, 'apiData' | 'pipelineFromDB'>>({})
  const [fetchingPipeline, setFetchingPipeline] = useState<boolean>(true)
  const [yamlVersion, setYamlVersion] = useState<YamlVersion>()

  const gitDetails: EntityGitDetails = {
    repoIdentifier: queryParams.repoIdentifier,
    repoName: queryParams.repoName,
    branch: queryParams.branch
  }

  const { state: routerState } = useLocation<Optional<PipelineMetadataForRouter>>()

  const loadPipelineFromIDB = async (): Promise<void> => {
    setFetchingPipeline(true)

    const id = getId(
      queryParams.accountIdentifier,
      defaultTo(queryParams.orgIdentifier, ''),
      defaultTo(queryParams.projectIdentifier, ''),
      pipelineIdentifier,
      getRepoIdentifierName(gitDetails),
      defaultTo(gitDetails.branch, '')
    )
    const data = await idb.get(id)

    setYamlVersion(data?.yamlVersion ?? routerState?.yamlSyntax ?? '0')
    setState({ ...state, pipelineFromDB: data ?? {} })

    setFetchingPipeline(false)
  }

  const loadPipelineFromAPI = async ({ signal }: { signal: AbortSignal }): Promise<void> => {
    setFetchingPipeline(true)

    const { pipelineById, pipelineMetaDataById } = await fetchPipelineYamlAndMetadata({
      queryParams,
      signal,
      repoIdentifier: gitDetails.repoIdentifier,
      branch: gitDetails.branch,
      loadFromCache: true,
      pipelineId: pipelineIdentifier
    })

    setYamlVersion(
      ((pipelineMetaDataById as ResponsePMSPipelineSummaryResponse)?.data?.yamlVersion ?? '0') as YamlVersion
    )
    setState({
      apiData: { pipeline: pipelineById, pipelineMetadata: pipelineMetaDataById }
    })

    setFetchingPipeline(false)
  }

  // when creating new pipeline user sets the version explicity
  React.useEffect(() => {
    if (typeof routerState?.yamlSyntax !== 'undefined') {
      setYamlVersion(routerState?.yamlSyntax)
    }
  }, [routerState?.yamlSyntax])

  const abortControllerRef = React.useRef<AbortController | null>(null)
  React.useEffect(() => {
    if (idbInitialized || idbInitializationFailed) {
      if (pipelineIdentifier === DefaultNewPipelineId) {
        loadPipelineFromIDB()
      } else {
        abortControllerRef.current = new AbortController()
        loadPipelineFromAPI({ signal: abortControllerRef.current?.signal })
      }
    }

    return () => {
      abortControllerRef.current?.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idbInitialized, idbInitializationFailed])

  return (
    <PipelineLoaderContext.Provider
      value={{
        ...state,
        fetchingPipeline,
        yamlVersion
      }}
    >
      {children}
    </PipelineLoaderContext.Provider>
  )
}

export function usePipelineLoaderContext(): PipelineLoaderContextInterface {
  // eslint-disable-next-line no-restricted-syntax
  return React.useContext(PipelineLoaderContext)
}
