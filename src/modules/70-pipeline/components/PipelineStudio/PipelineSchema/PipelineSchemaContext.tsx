/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'
import {
  IndividualSchemaResponseBody,
  useGetIndividualStaticSchemaQuery
} from '@harnessio/react-pipeline-service-client'
import { GetSchemaYamlQueryParams, ResponseJsonNode, useGetSchemaYaml } from 'services/pipeline-ng'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import type { AccountPathProps, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import { useToaster } from '@common/exports'

export interface PipelineSchemaData {
  pipelineSchema: ResponseJsonNode | null
  loopingStrategySchema: IndividualSchemaResponseBody | null
}

const PipelineSchemaContext = React.createContext<PipelineSchemaData>({
  pipelineSchema: null,
  loopingStrategySchema: null
})

export function usePipelineSchema(): PipelineSchemaData {
  return React.useContext(PipelineSchemaContext)
}

interface PipelineSchemaContextProps {
  isYAMLV1?: boolean
}

export function PipelineSchemaContextProvider(
  props: React.PropsWithChildren<PipelineSchemaContextProps>
): React.ReactElement {
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps>>()
  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const { isYAMLV1 } = props

  const commonQueryParams = {
    entityType: 'Pipelines',
    projectIdentifier: projectIdentifier,
    orgIdentifier: orgIdentifier,
    accountIdentifier: accountId,
    scope: getScopeFromDTO({ accountIdentifier: accountId, orgIdentifier, projectIdentifier })
  }

  const { data: pipelineSchemaV1, error: schemaError } = useGetSchemaYaml({
    queryParams: {
      ...commonQueryParams
    } as GetSchemaYamlQueryParams,
    lazy: !__DEV__
  })

  const { data: pipelineStaticSchema, error: staticSchemaError } = useGetIndividualStaticSchemaQuery(
    {
      queryParams: {
        node_group: 'pipeline',
        version: isYAMLV1 ? 'v1' : 'v0'
      }
    },
    {
      enabled: !__DEV__
    }
  )

  const error = defaultTo(schemaError, staticSchemaError)

  const { data: loopingStrategyStaticSchema } = useGetIndividualStaticSchemaQuery(
    {
      queryParams: {
        node_group: 'strategy',
        node_type: 'strategy'
      }
    },
    {
      enabled: !__DEV__
    }
  )

  const loopingStrategySchema = {
    data: { schema: loopingStrategyStaticSchema?.content.data }
  }

  const pipelineSchema = defaultTo(pipelineSchemaV1, pipelineStaticSchema?.content as ResponseJsonNode)

  if ((error as any)?.message) {
    showError(getRBACErrorMessage(error as any), undefined, 'pipeline.get.yaml.error')
  }
  return (
    <PipelineSchemaContext.Provider
      value={{
        pipelineSchema: pipelineSchema,
        loopingStrategySchema: loopingStrategySchema as IndividualSchemaResponseBody
      }}
    >
      {props.children}
    </PipelineSchemaContext.Provider>
  )
}
