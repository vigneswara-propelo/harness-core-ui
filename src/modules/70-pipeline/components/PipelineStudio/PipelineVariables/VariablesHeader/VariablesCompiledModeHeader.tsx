/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { FormInput, Layout, SelectOption, Toggle } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { useGetExpressionEvaluated, useGetListOfExecutionIdentifier } from 'services/pipeline-ng'
import { useMutateAsGet, useQueryParams } from '@common/hooks'
import { usePipelineVariables } from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import { GitQueryParams, PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { MetadataMapObject } from '@common/components/TextWithExpressions/TextWithExpression'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import css from '../PipelineVariables.module.scss'

interface VariablesCompiledModeHeaderProps {
  handleCompiledModeChange?: (checked: boolean) => void
  isCompiledMode?: boolean
}

export function VariablesCompiledModeHeader(props: VariablesCompiledModeHeaderProps): JSX.Element {
  const { handleCompiledModeChange, isCompiledMode } = props
  const [executionId, setExecutionId] = useState<string>()
  const params = useParams<PipelinePathProps>()
  const { accountId, orgIdentifier, projectIdentifier } = params
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const { storeMetadata, originalPipeline, setCompiledModeMetadataMap } = usePipelineVariables()
  const { getString } = useStrings()

  const { data } = useMutateAsGet(useGetListOfExecutionIdentifier, {
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier: originalPipeline.identifier,
      repoIdentifier,
      branch,
      parentEntityConnectorRef: storeMetadata?.connectorRef,
      parentEntityRepoName: storeMetadata?.repoName
    },
    requestOptions: { headers: { 'content-type': 'application/json' } }
  })

  const executionIdSelectOptions = defaultTo(
    data?.data?.content?.map(execId => {
      return {
        label: execId.planExecutionId as string,
        value: execId.planExecutionId as string
      }
    }),
    []
  )

  const handleExecutionIdChange = (execId: SelectOption): void => {
    setExecutionId(execId.value as string)
  }

  const { data: expressionEvaluatedResponse } = useMutateAsGet(useGetExpressionEvaluated, {
    planExecutionId: executionId as string,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier: originalPipeline.identifier
    },
    pathParams: {
      planExecutionId: executionId as string
    },
    body: yamlStringify({ pipeline: originalPipeline }),
    requestOptions: { headers: { 'content-type': 'application/json' } }
  })

  React.useEffect(() => {
    setCompiledModeMetadataMap?.(expressionEvaluatedResponse?.data?.mapExpression as MetadataMapObject)
  }, [expressionEvaluatedResponse, setCompiledModeMetadataMap])

  return (
    <Layout.Horizontal className={css.compiledModeHeader}>
      <Toggle
        label={getString('pipeline.viewInCompiledMode')}
        onToggle={handleCompiledModeChange}
        checked={isCompiledMode}
      />
      {isCompiledMode && (
        <FormInput.Select
          items={executionIdSelectOptions}
          onChange={handleExecutionIdChange}
          name="executionId"
          placeholder="ExecutionID"
          value={{ label: executionId as string, value: executionId as string }}
          className={css.compiledModeExecutionId}
        />
      )}
    </Layout.Horizontal>
  )
}
