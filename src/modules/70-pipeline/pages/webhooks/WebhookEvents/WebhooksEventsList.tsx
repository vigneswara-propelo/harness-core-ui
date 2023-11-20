/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import type { Column } from 'react-table'
import { TableV2 } from '@harness/uicore'

import { isUndefined } from 'lodash-es'
import {
  GitXWebhookEventResponse,
  ListGitXWebhookEventResponseResponse,
  ResponseWithPagination
} from '@harnessio/react-ng-manager-client'
import { useStrings } from 'framework/strings'
import {
  ColumnTimeStamp,
  ColumnUser,
  EventId,
  EventStatus,
  WebhookIdentifier,
  WebhooksPayloadDetails,
  withWebhookEvents
} from './WebhooksEventsListColumns'
import PayloadDetails from './PayloadDetails'

export interface PayloadDetails {
  payloadJSON: string
  timestamp: number
  eventId: string
}

export type CustomColumn<T extends Record<string, any>> = Column<T>

export default function WebhooksEventsList({
  response
}: {
  response: ResponseWithPagination<ListGitXWebhookEventResponseResponse> | undefined
}): JSX.Element {
  const [showPayloadDetails, setShowPayloadDetails] = React.useState<boolean>(false)
  const [payloadDetails, setPayloadDetails] = React.useState<PayloadDetails>()

  const { getString } = useStrings()

  function handlePayloadDetailsClick({ payloadJSON, timestamp, eventId }: PayloadDetails): void {
    setShowPayloadDetails(true)
    setPayloadDetails({ payloadJSON, timestamp, eventId })
  }

  const envColumns: CustomColumn<GitXWebhookEventResponse>[] = useMemo(
    () => [
      {
        Header: getString('pipeline.webhookEvents.dateTime').toUpperCase(),
        id: 'datetime',
        width: '16%',
        Cell: withWebhookEvents(ColumnTimeStamp)
      },
      {
        Header: getString('pipeline.webhookEvents.author').toUpperCase(),
        id: 'pusher',
        width: '16%',
        Cell: withWebhookEvents(ColumnUser)
      },
      {
        Header: getString('pipeline.webhookEvents.eventId').toUpperCase(),
        id: 'eventId',
        width: '20%',
        Cell: withWebhookEvents(EventId)
      },
      {
        Header: getString('execution.triggerType.WEBHOOK').toUpperCase(),
        id: 'webhookIdentifier',
        width: '16%',
        Cell: withWebhookEvents(WebhookIdentifier)
      },
      {
        Header: getString('status').toUpperCase(),
        id: 'webhookStatus',
        width: '16%',
        Cell: withWebhookEvents(EventStatus)
      },
      {
        Header: '',
        id: 'payloadDetails',
        width: '16%',
        Cell: withWebhookEvents(WebhooksPayloadDetails),
        actions: {
          onClick: handlePayloadDetailsClick
        }
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getString]
  )
  return (
    <>
      <TableV2<GitXWebhookEventResponse> columns={envColumns} data={response?.content as GitXWebhookEventResponse[]} />
      {showPayloadDetails && !isUndefined(payloadDetails) && (
        <PayloadDetails onClose={() => setShowPayloadDetails(false)} payloadDetails={payloadDetails} />
      )}
    </>
  )
}
