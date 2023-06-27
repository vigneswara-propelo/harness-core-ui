/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo, isEmpty, omit } from 'lodash-es'
import { useDeepCompareEffect, useMutateAsGet, useQueryParams } from '@common/hooks'
import type { GitQueryParams, PipelinePathProps, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { yamlParse, yamlStringify } from '@common/utils/YamlHelperMethods'
import type { UseMutateAsGetReturn } from '@common/hooks/useMutateAsGet'
import {
  Failure,
  PipelineConfig,
  PipelineInfoConfig,
  ServiceExpressionProperties,
  useCreateVariablesV2,
  VariableMergeServiceResponse
} from 'services/pipeline-ng'
import type { StoreMetadata } from '@common/constants/GitSyncTypes'
import { LexicalContext } from '../PipelineVariablesContext/PipelineVariablesContext'

interface ChildVariablesState {
  variablesChildPipeline: PipelineInfoConfig
  childMetadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  serviceExpressionPropertiesList: ServiceExpressionProperties[]
}

interface ChildPipelineVariablesData {
  variablesChildPipeline: PipelineInfoConfig
  originalChildPipeline: PipelineInfoConfig
  childMetadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  serviceExpressionPropertiesList: ServiceExpressionProperties[]
  setChildPipeline: (pipeline: PipelineInfoConfig) => void
  error?: UseMutateAsGetReturn<Failure | Error>['error'] | null
  initLoading: boolean
  loading: boolean
  refetchChildPipelineVariable?: (props?: any) => Promise<void> | undefined
}

const ChildPipelineVariablesContext = React.createContext<ChildPipelineVariablesData>({
  variablesChildPipeline: {} as PipelineInfoConfig,
  originalChildPipeline: {} as PipelineInfoConfig,
  childMetadataMap: {},
  serviceExpressionPropertiesList: [],
  setChildPipeline: () => void 0,
  error: null,
  initLoading: true,
  loading: false,
  refetchChildPipelineVariable: () => Promise.resolve()
})

export function useChildPipelineVariables(): ChildPipelineVariablesData {
  return React.useContext(ChildPipelineVariablesContext)
}

export function ChildPipelineVariablesContextProvider(
  props: React.PropsWithChildren<{
    childPipeline?: PipelineInfoConfig
    storeMetadata?: StoreMetadata
    lexicalContext?: LexicalContext
    childPipelineMetadata?: ProjectPathProps
  }>
): React.ReactElement {
  const { childPipeline: childPipelineFromProps, storeMetadata = {}, lexicalContext, childPipelineMetadata } = props
  const { accountId } = useParams<PipelinePathProps>()
  const [originalChildPipeline, setOriginalChildPipeline] = React.useState<PipelineInfoConfig>(
    defaultTo(childPipelineFromProps, {} as PipelineInfoConfig)
  )
  const { orgIdentifier, projectIdentifier } = defaultTo(childPipelineMetadata, {} as ProjectPathProps)
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [{ variablesChildPipeline, childMetadataMap, serviceExpressionPropertiesList }, setChildPipelineVariablesData] =
    React.useState<ChildVariablesState>({
      variablesChildPipeline: { name: '', identifier: '', stages: [] },
      childMetadataMap: {},
      serviceExpressionPropertiesList: []
    })

  const {
    data,
    error,
    initLoading,
    loading,
    refetch: refetchChildPipelineVariable
  } = useMutateAsGet(useCreateVariablesV2, {
    body: yamlStringify({ pipeline: originalChildPipeline }) as unknown as void,
    requestOptions: {
      headers: {
        'content-type': 'application/yaml',
        'Load-From-Cache': 'true'
      }
    },
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch,
      parentEntityConnectorRef: storeMetadata.connectorRef,
      parentEntityRepoName: storeMetadata.repoName
    },
    debounce: 1300,
    ...(lexicalContext === LexicalContext.RunPipelineForm && { lazy: isEmpty(originalChildPipeline) })
  })

  React.useEffect(() => {
    setChildPipelineVariablesData({
      childMetadataMap: defaultTo(data?.data?.metadataMap, {}),
      variablesChildPipeline: defaultTo(
        yamlParse<PipelineConfig>(defaultTo(data?.data?.yaml, ''))?.pipeline,
        {} as PipelineInfoConfig
      ),
      serviceExpressionPropertiesList: defaultTo(data?.data?.serviceExpressionPropertiesList, [])
    })
  }, [data?.data])

  useDeepCompareEffect(() => {
    if (childPipelineFromProps) {
      setOriginalChildPipeline({
        name: childPipelineFromProps.name,
        identifier: childPipelineFromProps.identifier,
        ...omit(childPipelineFromProps, ['name', 'identifier'])
      })
    }
  }, [childPipelineFromProps])

  return (
    <ChildPipelineVariablesContext.Provider
      value={{
        variablesChildPipeline,
        originalChildPipeline,
        childMetadataMap,
        serviceExpressionPropertiesList,
        setChildPipeline: setOriginalChildPipeline,
        error,
        initLoading,
        loading,
        refetchChildPipelineVariable
      }}
    >
      {props.children}
    </ChildPipelineVariablesContext.Provider>
  )
}
