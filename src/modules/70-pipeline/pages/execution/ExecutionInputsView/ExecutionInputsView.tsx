/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import type { ExecutionPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import type { StoreType } from '@common/constants/GitSyncTypes'
import { RunPipelineFormWithInputSetData } from '@pipeline/components/RunPipelineModal/RunPipelineForm'
import type { ResponseJsonNode } from 'services/cd-ng'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import css from './ExecutionInputsView.module.scss'

interface ExecutionInputsViewInterface {
  mockData?: ResponseJsonNode
}

export default function ExecutionInputsView(props: ExecutionInputsViewInterface): React.ReactElement {
  const { projectIdentifier, orgIdentifier, pipelineIdentifier, accountId, module, executionIdentifier, source } =
    useParams<PipelineType<ExecutionPathProps>>()

  const { isGitSyncEnabled: isGitSyncEnabledForProject, gitSyncEnabledOnlyForFF } = useAppStore()
  const isGitSyncEnabled = isGitSyncEnabledForProject && !gitSyncEnabledOnlyForFF

  const { pipelineExecutionDetail } = useExecutionContext()
  const storeMetadata = {
    connectorRef: pipelineExecutionDetail?.pipelineExecutionSummary?.connectorRef,
    branch: pipelineExecutionDetail?.pipelineExecutionSummary?.gitDetails?.branch,
    repoName: pipelineExecutionDetail?.pipelineExecutionSummary?.gitDetails?.repoName
  }

  return (
    <div className={css.main}>
      <RunPipelineFormWithInputSetData
        pipelineIdentifier={pipelineIdentifier}
        orgIdentifier={orgIdentifier}
        projectIdentifier={projectIdentifier}
        accountId={accountId}
        module={module}
        source={source}
        executionIdentifier={executionIdentifier}
        executionView
        branch={pipelineExecutionDetail?.pipelineExecutionSummary?.gitDetails?.branch}
        repoIdentifier={
          isGitSyncEnabled
            ? pipelineExecutionDetail?.pipelineExecutionSummary?.gitDetails?.repoIdentifier
            : pipelineExecutionDetail?.pipelineExecutionSummary?.gitDetails?.repoName
        }
        connectorRef={pipelineExecutionDetail?.pipelineExecutionSummary?.connectorRef}
        mockData={props.mockData}
        storeType={pipelineExecutionDetail?.pipelineExecutionSummary?.storeType as StoreType}
        storeMetadata={storeMetadata}
      />
    </div>
  )
}
