/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Text, Avatar, Button, Icon } from '@harness/uicore'
import cx from 'classnames'
import { Color } from '@harness/design-system'
import { GitXWebhookEventResponse } from '@harnessio/react-ng-manager-client'
import { getReadableDateTime } from '@common/utils/dateUtils'
import { useStrings } from 'framework/strings'
import { WebhookEventStatus, iconMap, stringsMap } from '../utils'
import css from './WebhooksEvents.module.scss'

interface WebhookRowColumn {
  row: { original: GitXWebhookEventResponse }
  column: {
    actions: {
      onEdit: (identifier: string) => void
      onDelete: (identifier: string) => void
    }
  }
}

export function withWebhookEvents(Component: any) {
  // eslint-disable-next-line react/display-name
  return (props: WebhookRowColumn) => {
    return <Component {...props.row.original} {...props.column.actions} />
  }
}

export function ColumnTimeStamp({ event_trigger_time: lastEventTime }: { event_trigger_time: number }): JSX.Element {
  const time = getReadableDateTime(lastEventTime, 'hh:mm a')
  const date = getReadableDateTime(lastEventTime, 'MMM DD, YYYY')
  return (
    <>
      <Text margin={{ bottom: 'small' }}>{time}</Text>
      <Text>{date}</Text>
    </>
  )
}

export function ColumnUser({ author_name }: { author_name: 'string' }): JSX.Element {
  return (
    <Layout.Horizontal padding={{ right: 'xlarge' }} flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
      <Avatar className={css.avatar} name={author_name} hoverCard={false} />
      <Text lineClamp={1}>{author_name}</Text>
    </Layout.Horizontal>
  )
}

export function EventId({ event_identifier: eventIdentifier }: { event_identifier: string }): JSX.Element {
  return (
    <Text color={Color.BLACK} lineClamp={1}>
      {eventIdentifier}
    </Text>
  )
}

export function WebhookIdentifier({
  webhook_identifier: webhookIdentifier
}: {
  webhook_identifier: string
}): JSX.Element {
  return (
    <Text color={Color.BLACK} lineClamp={1}>
      {webhookIdentifier}
    </Text>
  )
}

export function EventStatus({ event_status: eventStatus }: { event_status: string }): JSX.Element {
  const { getString } = useStrings()
  return (
    <div className={cx(css.status, css[eventStatus.toLowerCase() as keyof typeof css])}>
      {iconMap[eventStatus as WebhookEventStatus] ? (
        <Icon {...iconMap[eventStatus as WebhookEventStatus]} className={css.icon} />
      ) : null}
      <Text className={css.text} lineClamp={1}>
        {getString(stringsMap[eventStatus as WebhookEventStatus] || 'pipeline.executionStatus.Unknown')}
      </Text>
    </div>
  )
}

export function WebhooksPayloadDetails({
  payload,
  event_identifier,
  event_trigger_time,
  onClick
}: {
  payload: string
  event_identifier: string
  event_trigger_time: number
  onClick: ({ payloadJSON, timestamp, eventId }: { payloadJSON: string; timestamp: number; eventId: string }) => void
}): JSX.Element {
  const { getString } = useStrings()
  return (
    <Button
      minimal
      rightIcon="main-chevron-right"
      className={css.payloadBtn}
      onClick={() => {
        onClick({ payloadJSON: payload, timestamp: event_trigger_time, eventId: event_identifier })
      }}
    >
      {getString('pipeline.webhookEvents.payloadDetails')}
    </Button>
  )
}
