/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container } from '@harness/uicore'
import { useParams, useHistory } from 'react-router-dom'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import ChildAppMounter from 'microfrontends/ChildAppMounter'
import type { ExecutionPathProps, ModulePathParams, PipelineType } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'

// eslint-disable-next-line import/no-unresolved
const ErrorTrackingApp = React.lazy(() => import('errortracking/App'))

export default function ExecutionErrorTrackingView(): React.ReactElement | null {
  const context = useExecutionContext()
  const params = useParams<PipelineType<ExecutionPathProps>>()
  const { module } = useParams<PipelineType<ModulePathParams>>()
  const history = useHistory()
  const pipelineExecutionDetail = context?.pipelineExecutionDetail
  const cdStageInfo = pipelineExecutionDetail?.pipelineExecutionSummary?.moduleInfo?.cd || {}
  const envIds = cdStageInfo.envIdentifiers
  const serviceIds = cdStageInfo.serviceIdentifiers

  const handleBackAction = (): void => {
    return history.push(routes.toExecutionErrorTrackingView(params) + '/executionViewEvents')
  }

  if (
    !pipelineExecutionDetail ||
    !pipelineExecutionDetail.pipelineExecutionSummary ||
    !pipelineExecutionDetail.pipelineExecutionSummary.runSequence ||
    !pipelineExecutionDetail.pipelineExecutionSummary.pipelineIdentifier ||
    !pipelineExecutionDetail.pipelineExecutionSummary.startTs
  ) {
    return null
  }

  return (
    <Container width="100%" height="100%">
      {module === 'ci' ? (
        <ChildAppMounter
          // props type is @cet/ErrorTrackingApp/EventListProps (can't be imported here)
          ChildApp={ErrorTrackingApp}
          orgId={params.orgIdentifier}
          accountId={params.accountId}
          projectId={params.projectIdentifier}
          serviceId={pipelineExecutionDetail.pipelineExecutionSummary.pipelineIdentifier}
          environmentId={'_INTERNAL_ET_CI'}
          versionId={pipelineExecutionDetail.pipelineExecutionSummary.runSequence.toString()}
          fromDateTime={Math.floor(pipelineExecutionDetail.pipelineExecutionSummary.startTs / 1000)}
          toDateTime={Math.floor(
            pipelineExecutionDetail.pipelineExecutionSummary.endTs
              ? pipelineExecutionDetail.pipelineExecutionSummary.endTs / 1000 + 60 * 30
              : Date.now() / 1000
          )}
          handleBackAction={history.location.pathname.endsWith('/arc') ? handleBackAction : undefined}
        />
      ) : (
        <ChildAppMounter
          ChildApp={ErrorTrackingApp}
          orgId={params.orgIdentifier}
          accountId={params.accountId}
          projectId={params.projectIdentifier}
          serviceId={serviceIds?.[0]}
          environmentId={envIds?.[0]}
          serviceIds={serviceIds}
          environmentIds={envIds}
          fromDateTime={Math.floor(pipelineExecutionDetail.pipelineExecutionSummary.startTs / 1000)}
          handleBackAction={history.location.pathname.endsWith('/arc') ? handleBackAction : undefined}
        />
      )}
    </Container>
  )
}
