/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { FormInput, Layout, SelectOption, Toggle } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { defaultTo, isEmpty } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { useGetExpressionEvaluated, useGetListOfExecutionIdentifier } from 'services/pipeline-ng'
import { useMutateAsGet, useQueryParams } from '@common/hooks'
import { usePipelineVariables } from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import { GitQueryParams, PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { MetadataMapObject } from '@common/components/TextWithExpressions/TextWithExpression'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { iconMap } from '@pipeline/components/ExecutionStatusLabel/ExecutionStatusLabel'
import { ExecutionStatus } from '@pipeline/utils/statusHelpers'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@pipeline/utils/constants'
import css from './VariablesCompiledModeHeader.module.scss'

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
      parentEntityRepoName: storeMetadata?.repoName,
      page: DEFAULT_PAGE_INDEX,
      size: DEFAULT_PAGE_SIZE
    },
    requestOptions: { headers: { 'content-type': 'application/json' } }
  })

  const executionIdSelectOptions = defaultTo(
    data?.data?.content?.map(execId => {
      return {
        label: `${execId.runSequence}`,
        value: execId.planExecutionId as string,
        rightIcon: {
          ...iconMap[execId.status as ExecutionStatus],
          className: cx(css.status, css[(execId.status as ExecutionStatus).toLowerCase() as keyof typeof css], css.icon)
        }
      }
    }),
    []
  )

  React.useEffect(() => {
    const execId = data?.data?.content?.[0]
    if (execId) {
      setExecutionIdOption(executionIdSelectOptions[0])
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
          placeholder={getString('pipeline.selectExecutionID')}
          value={{
            label: executionIdOption?.label
              ? getString('pipeline.executionIdLabel', { execId: executionIdOption.label })
              : '',
            value: executionIdOption?.value as string
          }}
          className={css.compiledModeExecutionId}
          addClearButton
        />
      )}
    </Layout.Horizontal>
  )
}
