/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Intent, Position, Toaster } from '@blueprintjs/core'
import { Icon, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { UseStringsReturn } from 'framework/strings'
import { ResponseDownloadLog } from 'services/logs'
import { State } from '../../LogsState/types'
import css from './DownloadLogs.module.scss'

export enum LogsScope {
  Pipeline = 'Pipeline',
  Step = 'Step',
  Stage = 'Stage'
}

export type DownloadLogsResponseStatus = Required<ResponseDownloadLog>['status']

export interface DownloadActionProps {
  logsScope: LogsScope
  uniqueKey: string // pipelineId in case of pipeline logs for others it can be nodeUuid.
  logsToken?: string
  logBaseKey?: string
  runSequence?: number
  state?: State
  planExecId?: string
  shouldUseSimplifiedKey?: boolean
}

export interface DownloadLogsProps {
  downloadLogsAction: (props: DownloadActionProps) => Promise<void>
}

export const DownloadLogsToaster = Toaster.create({
  className: css.toaster,
  position: Position.BOTTOM_RIGHT,
  usePortal: false
})

const statusToIntentMap: Record<DownloadLogsResponseStatus, Intent> = {
  success: Intent.SUCCESS,
  in_progress: Intent.PRIMARY,
  queued: Intent.PRIMARY,
  error: Intent.DANGER
}

export const handleDownload = async (url: string): Promise<void> => {
  const downloadLink = document.createElement('a')
  downloadLink.href = url
  downloadLink.click()
}

function DownloadInProgressMsg({ getString }: { getString: UseStringsReturn['getString'] }): JSX.Element {
  return (
    <Layout.Horizontal flex>
      <Text font={{ variation: FontVariation.BODY2 }} color={Color.GREY_900}>
        {getString('pipeline.downloadLogs.downloadInProgress')}
      </Text>
      <Icon name="loading" color={Color.PRIMARY_5} size={24} />
    </Layout.Horizontal>
  )
}

function DownloadErrorMsg({
  getString,
  errorMsg
}: {
  getString: UseStringsReturn['getString']
  errorMsg?: string
}): JSX.Element {
  return (
    <Layout.Vertical>
      <Text font={{ variation: FontVariation.BODY2 }} color={Color.GREY_900}>
        {getString('pipeline.downloadLogs.downloadFailed')}
      </Text>
      {errorMsg && (
        <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_700} lineClamp={4}>
          {errorMsg}
        </Text>
      )}
    </Layout.Vertical>
  )
}

function Message({
  intent,
  getString,
  errorMsg
}: {
  intent: Intent
  getString: UseStringsReturn['getString']
  errorMsg?: string
}): JSX.Element | null {
  return intent === Intent.SUCCESS ? (
    <Text font={{ variation: FontVariation.BODY2 }} color={Color.GREY_900}>
      {getString('pipeline.downloadLogs.downloadSuccessful')}
    </Text>
  ) : intent === Intent.PRIMARY ? (
    <DownloadInProgressMsg getString={getString} />
  ) : intent === Intent.DANGER ? (
    <DownloadErrorMsg errorMsg={errorMsg} getString={getString} />
  ) : null
}

function StatusIcon({ intent }: { intent: Intent }): JSX.Element {
  const iconName = intent === Intent.SUCCESS ? 'tick-circle' : intent === Intent.DANGER ? 'warning-sign' : 'import'
  const statusColor =
    intent === Intent.SUCCESS ? Color.GREEN_700 : intent === Intent.DANGER ? Color.RED_700 : Color.PRIMARY_7

  return <Icon name={iconName} size={18} color={statusColor} padding="medium" />
}

export const handleToasters = (
  key: string,
  dismiss: boolean,
  status: DownloadLogsResponseStatus,
  getString: UseStringsReturn['getString'],
  errorMsg?: string
): void => {
  DownloadLogsToaster.show(
    {
      message: <Message intent={statusToIntentMap[status]} errorMsg={errorMsg} getString={getString} />,
      icon: <StatusIcon intent={statusToIntentMap[status]} />,
      timeout: 300000,
      intent: statusToIntentMap[status]
    },
    key
  )

  const isError = statusToIntentMap[status] === Intent.DANGER

  if (dismiss) {
    setTimeout(
      () => {
        DownloadLogsToaster.dismiss(key)
      },
      isError ? 10000 : 5000
    )
  }
}

export const makePipelinePrefix = (
  accountId: string,
  uniqueKey: string,
  runSequence: number,
  planExecId: string,
  orgId: string,
  projectId: string,
  shouldUseSimplifiedKey: boolean
): string => {
  // Simplified LogKey accepted format - {accountId}/pipeline/{pipelineId}/{run-sequence}/-{planExecutionId}
  return shouldUseSimplifiedKey
    ? `${accountId}/pipeline/${uniqueKey}/${runSequence}/-${planExecId}`
    : `accountId:${accountId}/orgId:${orgId}/projectId:${projectId}/pipelineId:${uniqueKey}/runSequence:${runSequence}/level0:pipeline`
}

// this function trims out commandUnitPlaceholder from the end of the logKeys in case of multiSectionLogs --> baseLogKeys
export const getLogPrefix = (state?: State): string => {
  if (!state) {
    return ''
  }
  const isSingleSectionLogs = state.units.length === 1
  const logKeys = state.logKeys

  if (isSingleSectionLogs && logKeys.length) {
    return logKeys[0]
  }

  const commandUnitPlaceholder = '-commandUnit:'

  const logKeyPrefixes = logKeys.map(logKey => {
    const placeholderIndex = logKey.lastIndexOf(commandUnitPlaceholder)
    if (placeholderIndex !== -1) {
      return logKey.substring(0, placeholderIndex)
    }

    return logKey
  })

  if (logKeyPrefixes.length) {
    return logKeyPrefixes[0]
  }

  return ''
}
