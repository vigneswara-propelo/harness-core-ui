/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  IndividualSchemaResponseBody,
  useGetIndividualStaticSchemaQuery
} from '@harnessio/react-pipeline-service-client'
import { JsonNode, ResponseJsonNode } from 'services/pipeline-ng'
import pipelineSchemaV1 from './schema/pipeline-schema-v1.json'

export interface PipelineSchemaData {
  pipelineSchema: ResponseJsonNode | null
  loopingStrategySchema: IndividualSchemaResponseBody | null
}

const PipelineSchemaContext = React.createContext<PipelineSchemaData>({
  pipelineSchema: null,
  loopingStrategySchema: null
})

export function usePipelineSchemaV1(): PipelineSchemaData {
  return React.useContext(PipelineSchemaContext)
}

export function PipelineSchemaContextProviderV1(props: React.PropsWithChildren<unknown>): React.ReactElement {
  const { data: loopingStrategyStaticSchema } = useGetIndividualStaticSchemaQuery({
    queryParams: {
      node_group: 'strategy',
      node_type: 'strategy'
    }
  })

  const loopingStrategySchema = {
    data: { schema: loopingStrategyStaticSchema?.content.data }
  }
  return (
    <PipelineSchemaContext.Provider
      value={{
        pipelineSchema: { data: pipelineSchemaV1 as JsonNode } as ResponseJsonNode,
        loopingStrategySchema: loopingStrategySchema as IndividualSchemaResponseBody
      }}
    >
      {props.children}
    </PipelineSchemaContext.Provider>
  )
}
