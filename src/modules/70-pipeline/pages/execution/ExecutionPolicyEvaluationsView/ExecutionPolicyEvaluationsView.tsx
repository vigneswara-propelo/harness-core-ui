/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Container, useToaster } from '@harness/uicore'
import type { ExecutionPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import { PolicyManagementEvaluationView } from '@governance/PolicyManagementEvaluationView'
import { FeatureFlag } from '@modules/10-common/featureFlags'
import { useFeatureFlag } from '@modules/10-common/hooks/useFeatureFlag'
import { Evaluation, useGetEvaluationList } from 'services/pm'
import { formatMetaData } from './utils'

export default function ExecutionPolicyEvaluationsView(): React.ReactElement | null {
  const { showError } = useToaster()
  const IACM_ENABLED = useFeatureFlag(FeatureFlag.IACM_ENABLED)
  const { accountId, orgIdentifier, projectIdentifier, executionIdentifier, module } =
    useParams<PipelineType<ExecutionPathProps>>()
  const context = useExecutionContext()
  const governanceMetadata = context?.pipelineExecutionDetail?.pipelineExecutionSummary?.governanceMetadata
  const queryParams = {
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    includeChildScopes: true,
    module: 'iacm',
    entity: `iacm-${executionIdentifier}`,
    lazy: !IACM_ENABLED
  }
  const { data, loading, error } = useGetEvaluationList({ queryParams })

  useEffect(() => {
    if (error) {
      showError(error)
    }
  }, [error])

  const metaData = useMemo(() => {
    if (!data && !governanceMetadata) {
      return null
    }
    return formatMetaData(loading, IACM_ENABLED, governanceMetadata, data as Evaluation[])
  }, [governanceMetadata, data, IACM_ENABLED, loading])

  if (!metaData) {
    return null
  }

  return (
    <Container width="100%" height="100%">
      <PolicyManagementEvaluationView metadata={metaData} accountId={accountId} module={module} />
    </Container>
  )
}
