/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo, get } from 'lodash-es'
import {
  ExecutionPathProps,
  GitQueryParams,
  PipelinePathProps,
  PipelineType
} from '@modules/10-common/interfaces/RouteInterfaces'
import { PMSPipelineSummaryResponse, PipelineStageInfo, PipelineExecutionSummary } from 'services/pipeline-ng'
import routes from '@common/RouteDefinitions'
import { stageTypeToIconMap } from '@modules/70-pipeline/utils/constants'
import { PipelineListPagePathParams } from '../../pipeline-list/types'
import { FailedStagesInfoProps } from './FailureInfoPopover/FailureInfoPopover'

export const getExecutionPipelineViewLink = (
  pipelineExecutionSummary: PipelineExecutionSummary,
  pathParams: PipelineType<PipelinePathProps>,
  queryParams: GitQueryParams
): string => {
  const { planExecutionId, pipelineIdentifier: rowDataPipelineIdentifier } = pipelineExecutionSummary
  const { orgIdentifier, projectIdentifier, accountId, pipelineIdentifier, module } = pathParams
  const { branch, repoIdentifier, repoName, connectorRef, storeType } = queryParams
  const source: ExecutionPathProps['source'] = pipelineIdentifier ? 'executions' : 'deployments'

  return routes.toExecutionPipelineView({
    orgIdentifier,
    projectIdentifier,
    pipelineIdentifier: pipelineIdentifier || rowDataPipelineIdentifier || '-1',
    accountId,
    module,
    executionIdentifier: planExecutionId || '-1',
    source,
    connectorRef: pipelineExecutionSummary.connectorRef ?? connectorRef,
    repoName: defaultTo(
      pipelineExecutionSummary.gitDetails?.repoName ?? repoName,
      pipelineExecutionSummary.gitDetails?.repoIdentifier ?? repoIdentifier
    ),
    branch: pipelineExecutionSummary.gitDetails?.branch ?? branch,
    storeType: pipelineExecutionSummary.storeType ?? storeType
  })
}

export function getChildExecutionPipelineViewLink<T>(
  data: T,
  pathParams: PipelineType<PipelinePathProps | PipelineListPagePathParams>,
  queryParams: GitQueryParams
): string {
  const {
    executionid,
    identifier: pipelineIdentifier,
    orgid,
    projectid,
    stagenodeid
  } = get(
    data,
    'parentStageInfo',
    get(
      (data as unknown as PMSPipelineSummaryResponse)?.recentExecutionsInfo,
      [0, 'parentStageInfo'],
      {} as PipelineStageInfo
    )
  )
  const { accountId, module } = pathParams
  const { branch, repoIdentifier, repoName, connectorRef, storeType } = queryParams
  const source: ExecutionPathProps['source'] = pipelineIdentifier ? 'executions' : 'deployments'

  return routes.toExecutionPipelineView({
    accountId: accountId,
    orgIdentifier: orgid,
    projectIdentifier: projectid,
    pipelineIdentifier: pipelineIdentifier || '-1',
    executionIdentifier: executionid || '-1',
    module,
    source,
    stage: stagenodeid,
    connectorRef: get(data, 'connectorRef', connectorRef),
    repoName: defaultTo(
      get(data, ['gitDetails', 'repoName'], repoName),
      get(data, ['gitDetails', 'repoIdentifier'], repoIdentifier)
    ),
    branch: get(data, ['gitDetails', 'branch'], branch),
    storeType: get(data, 'storeType', storeType)
  })
}

export const parserForFailedStatus = (rowData: PipelineExecutionSummary): FailedStagesInfoProps[] => {
  const rowDataParsed = Object.values(rowData.layoutNodeMap ?? {})
    .map(nodeData => {
      if (nodeData?.status === 'Failed') {
        const { nodeIdentifier, failureInfo, name, nodeType, nodeGroup } = nodeData
        return {
          nodeIdentifier: defaultTo(nodeIdentifier, ''),
          name: defaultTo(name, ''),
          failureInfo: defaultTo(failureInfo, { message: '' }),
          nodeIcon: stageTypeToIconMap?.[defaultTo(nodeType, '')],
          nodeGroup: defaultTo(nodeGroup, '')
        }
      }
    })
    .filter(Boolean)

  return rowDataParsed as FailedStagesInfoProps[]
}
