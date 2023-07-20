/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { FormInput, Layout, SelectOption, Toggle } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { defaultTo, isEmpty } from 'lodash-es'
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
  const [executionIdOption, setExecutionIdOption] = useState<SelectOption>()
  const params = useParams<PipelinePathProps>()
  const { accountId, orgIdentifier, projectIdentifier } = params
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { getString } = useStrings()

  const noExecution = { label: getString('pipeline.noExecution'), value: '' }

  const { storeMetadata, originalPipeline, setCompiledModeMetadataMap } = usePipelineVariables()

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
        label: `${execId.runSequence} : ${execId.status}`,
        value: execId.planExecutionId as string
      }
    }),
    []
  )

  executionIdSelectOptions.push(noExecution)

  React.useEffect(() => {
    const execId = data?.data?.content?.[0]
    if (execId) {
      setExecutionIdOption({
        label: `${execId?.runSequence} : ${execId?.status}`,
        value: execId?.planExecutionId as string
      })
    } else {
      setExecutionIdOption(noExecution)
    }
  }, [data])

  const handleExecutionIdChange = (execId: SelectOption): void => {
    setExecutionIdOption(execId)
  }

  const { data: expressionEvaluatedResponse } = useMutateAsGet(useGetExpressionEvaluated, {
    planExecutionId: !isEmpty(executionIdOption?.value) && (executionIdOption?.value as string),
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier: originalPipeline.identifier
    },
    pathParams: {
      planExecutionId: !isEmpty(executionIdOption?.value) && (executionIdOption?.value as string)
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
          value={executionIdOption}
          className={css.compiledModeExecutionId}
        />
      )}
    </Layout.Horizontal>
  )
}
