/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo } from 'lodash-es'
import React from 'react'
import { useParams } from 'react-router-dom'
import { Layout, Text, Icon } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { Divider } from '@blueprintjs/core'
import type { PipelineType, ExecutionPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetExecutionDetailV2 } from 'services/pipeline-ng'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { TimeAgo, UserLabel } from '@common/exports'
import css from './ExecutedBy.module.scss'

export const ExecutedBy = ({
  planExecutionId,
  stageNodeId
}: {
  planExecutionId: string
  stageNodeId: string
}): JSX.Element => {
  const { orgIdentifier, projectIdentifier, accountId } = useParams<PipelineType<ExecutionPathProps>>()
  const {
    data: executionDetails,
    loading: executionLoading,
    error: executionError
  } = useGetExecutionDetailV2({
    planExecutionId: defaultTo(planExecutionId, ''),
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      stageNodeId
    }
  })

  const { pipelineExecutionSummary } = defaultTo(executionDetails?.data, {})
  const { triggeredBy, triggerType } = defaultTo(pipelineExecutionSummary?.executionTriggerInfo, {})
  const { identifier, extraInfo } = defaultTo(triggeredBy, {})
  const { email } = defaultTo(extraInfo, {})

  let content = <></>

  if (executionLoading) {
    content = <Icon name="spinner" />
  } else if (executionError) {
    content = (
      <Text font={{ size: 'small' }} margin={{ left: 'small', right: 'small' }} color={Color.ERROR}>
        {getErrorMessage(executionError)}
      </Text>
    )
  } else {
    content = (
      <>
        <UserLabel
          name={identifier || email}
          email={email}
          iconProps={{ size: 16 }}
          textProps={{ font: { size: 'small' }, color: Color.BLACK_100 }}
        />
        <Divider className={css.verticalDivider} />
        <Text font={{ size: 'small' }} margin={{ left: 'small', right: 'small' }} color={Color.BLACK_100}>
          {triggerType}
        </Text>
        <Icon name={'calendar'} size={12} color={Color.PRIMARY_7} />
        <TimeAgo
          inline
          icon={undefined}
          color={Color.GREY_800}
          font={{ size: 'small' }}
          time={defaultTo(pipelineExecutionSummary?.startTs, 0)}
        />
      </>
    )
  }

  return (
    <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'center' }} spacing="small">
      {content}
    </Layout.Horizontal>
  )
}
