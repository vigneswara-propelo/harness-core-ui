/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { useGetIndividualStaticSchemaQuery } from '@harnessio/react-pipeline-service-client'
import { defaultTo } from 'lodash-es'
import { JsonNode, ResponseJsonNode, ResponseYamlSchemaResponse, useGetStepYamlSchema } from 'services/pipeline-ng'
import type { AccountPathProps, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import pipelineSchemaV1 from './schema/pipeline-schema-v1.json'

export interface PipelineSchemaData {
  pipelineSchema: ResponseJsonNode | null
  loopingStrategySchema: ResponseYamlSchemaResponse | null
}

const PipelineSchemaContext = React.createContext<PipelineSchemaData>({
  pipelineSchema: null,
  loopingStrategySchema: null
})

export function usePipelineSchemaV1(): PipelineSchemaData {
  return React.useContext(PipelineSchemaContext)
}

export function PipelineSchemaContextProviderV1(props: React.PropsWithChildren<unknown>): React.ReactElement {
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps>>()
  const { PIE_STATIC_YAML_SCHEMA } = useFeatureFlags()
  const { data: loopingStrategyDynamicSchema } = useGetStepYamlSchema({
    queryParams: {
      entityType: 'StrategyNode',
      projectIdentifier: projectIdentifier,
      orgIdentifier: orgIdentifier,
      accountIdentifier: accountId,
      scope: getScopeFromDTO({ accountIdentifier: accountId, orgIdentifier, projectIdentifier }),
      yamlGroup: 'STEP'
    },
    lazy: PIE_STATIC_YAML_SCHEMA
  })
  const { data: loopingStrategyStaticSchema } = useGetIndividualStaticSchemaQuery(
    {
      queryParams: {
        node_group: 'strategy',
        node_type: 'strategy'
      }
    },
    {
      enabled: PIE_STATIC_YAML_SCHEMA
    }
  )

  const loopingStrategySchema = defaultTo(loopingStrategyDynamicSchema, {
    data: { schema: loopingStrategyStaticSchema?.content.data }
  })
  return (
    <PipelineSchemaContext.Provider
      value={{
        pipelineSchema: { data: pipelineSchemaV1 as JsonNode } as ResponseJsonNode,
        loopingStrategySchema: loopingStrategySchema as ResponseYamlSchemaResponse
      }}
    >
      {props.children}
    </PipelineSchemaContext.Provider>
  )
}
