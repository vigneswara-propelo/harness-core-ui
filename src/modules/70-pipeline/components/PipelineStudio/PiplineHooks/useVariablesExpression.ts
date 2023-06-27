/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useEffect, useState } from 'react'
import { isEmpty } from 'lodash-es'
import { useTemplateVariables } from '../../TemplateVariablesContext/TemplateVariablesContext'
import { usePipelineVariables } from '../../PipelineVariablesContext/PipelineVariablesContext'
import { usePipelineContext, PipelineContextType } from '../PipelineContext/PipelineContext'
import { getAllExpressionsFromMetadataMap, traverseStageObject } from './utils'

/**
 * Hook to integrate and get expression for local stage and other stage
 */
export function useVariablesExpression(): { expressions: string[] } {
  const { variablesPipeline, metadataMap, serviceExpressionPropertiesList, initLoading } = usePipelineVariables()
  const {
    originalTemplate,
    variablesTemplate,
    serviceExpressionPropertiesList: templateServiceExpressionPropertiesList,
    metadataMap: templateMetadataMap,
    initLoading: templateInitLoading
  } = useTemplateVariables()
  const [expressions, setExpressions] = useState<string[]>([])
  const [localStageKeys, setLocalStageKeys] = useState<string[]>([])
  const {
    state: { selectionState: { selectedStageId } = { selectedStageId: '' } },
    getStageFromPipeline,
    contextType
  } = usePipelineContext()

  useEffect(() => {
    const loading = !initLoading || !templateInitLoading
    if (loading && selectedStageId && !isEmpty(selectedStageId)) {
      const stage = getStageFromPipeline(selectedStageId, variablesPipeline).stage

      if (contextType === PipelineContextType.StageTemplate) {
        const stageTemplateKeys = traverseStageObject({ stage: { ...variablesTemplate } }, templateMetadataMap)
        setLocalStageKeys(stageTemplateKeys)
      }
      if (stage) {
        const keys = traverseStageObject(stage, metadataMap)
        setLocalStageKeys(keys)
      }
    }
  }, [
    variablesPipeline,
    initLoading,
    selectedStageId,
    metadataMap,
    getStageFromPipeline,
    templateInitLoading,
    variablesTemplate,
    templateMetadataMap,
    contextType
  ])

  useEffect(() => {
    if (!templateInitLoading && originalTemplate.type === 'Pipeline' && selectedStageId && !isEmpty(selectedStageId)) {
      const stage = getStageFromPipeline(selectedStageId, variablesTemplate).stage
      if (stage) {
        const keys = traverseStageObject(stage, templateMetadataMap)
        setLocalStageKeys(keys)
      }
    }
  }, [variablesTemplate, templateInitLoading, selectedStageId, templateMetadataMap, getStageFromPipeline])

  useEffect(() => {
    if (!initLoading && !isEmpty(metadataMap)) {
      const { expressionsList, outputExpressions, extraExpressions, extraOutputExpressions } =
        getAllExpressionsFromMetadataMap({ metadataMap, localStageKeys })
      const otherExpressions = serviceExpressionPropertiesList.map(row => row.expression).filter(p => p) as string[]

      setExpressions([
        ...otherExpressions,
        ...expressionsList,
        ...extraExpressions,
        ...outputExpressions,
        ...extraOutputExpressions
      ])
    }
  }, [initLoading, metadataMap, localStageKeys, serviceExpressionPropertiesList])

  useEffect(() => {
    if (!templateInitLoading) {
      const { expressionsList, outputExpressions, extraExpressions, extraOutputExpressions } =
        getAllExpressionsFromMetadataMap({ metadataMap: templateMetadataMap, localStageKeys })
      const otherExpressions = templateServiceExpressionPropertiesList
        .map(row => row.expression)
        .filter(p => p) as string[]

      setExpressions([
        ...otherExpressions,
        ...expressionsList,
        ...outputExpressions,
        ...extraExpressions,
        ...extraOutputExpressions
      ])
    }
  }, [templateInitLoading, templateMetadataMap, localStageKeys, templateServiceExpressionPropertiesList])

  return { expressions }
}
