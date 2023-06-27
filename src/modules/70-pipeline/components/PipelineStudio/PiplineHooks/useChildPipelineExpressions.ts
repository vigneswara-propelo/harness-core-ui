/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useEffect, useState } from 'react'
import { isEmpty } from 'lodash-es'
import { useChildPipelineVariables } from '@pipeline/components/ChildPipelineVariablesContext/ChildPipelineVariablesContext'
import { getAllExpressionsFromMetadataMap } from './utils'

/**
 * Hook to integrate and get expression for child pipeline
 */
export function useChildPipelineExpressions(): { expressions: string[] } {
  const { childMetadataMap, serviceExpressionPropertiesList, initLoading } = useChildPipelineVariables()
  const [expressions, setExpressions] = useState<string[]>([])

  useEffect(() => {
    if (!initLoading && !isEmpty(childMetadataMap)) {
      const { expressionsList, outputExpressions, extraExpressions, extraOutputExpressions } =
        getAllExpressionsFromMetadataMap({ metadataMap: childMetadataMap, localStageKeys: [] })
      const otherExpressions = serviceExpressionPropertiesList.map(row => row.expression).filter(p => p) as string[]

      setExpressions([
        ...otherExpressions,
        ...expressionsList,
        ...extraExpressions,
        ...outputExpressions,
        ...extraOutputExpressions
      ])
    }
  }, [initLoading, childMetadataMap, serviceExpressionPropertiesList])

  return { expressions }
}
