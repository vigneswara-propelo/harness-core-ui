/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import type { Column } from 'react-table'
import { TableV2 } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import {
  Enabled,
  FolderPath,
  GitConnector,
  LastActivity,
  WebhookMenu,
  WebhookName,
  withWebhook
} from './WebhooksListColumns'

export default function WebhooksList({
  response
}: // refetch,

{
  response: any
  refetch: () => void
}): JSX.Element {
  const { getString } = useStrings()
  const handleWebhookEdit = (): void => {
    // TODO Edit Webhook goes here (open the create modal with data and upsert call)
  }
  const handleWebhookDelete = async (): Promise<void> => {
    // TODO Delete Environment goes here
  }

  type CustomColumn<T extends Record<string, any>> = Column<T>

  const envColumns: CustomColumn<any>[] = useMemo(
    () => [
      {
        Header: getString('name').toUpperCase(),
        id: 'webhook_name',
        width: '20%',
        Cell: withWebhook(WebhookName)
      },
      {
        Header: getString('platform.connectors.title.gitConnector').toUpperCase(),
        id: 'connector_ref',
        width: '20%',
        Cell: withWebhook(GitConnector)
      },
      {
        Header: getString('common.git.folderPath').toUpperCase(),
        id: 'folder_paths',
        width: '20%',
        Cell: withWebhook(FolderPath)
      },
      {
        Header: getString('lastActivity').toUpperCase(),
        id: 'lastUpdatedBy',
        width: '20%',
        Cell: withWebhook(LastActivity)
      },
      {
        Header: getString('enabledLabel').toUpperCase(),
        id: 'is_enabled',
        width: '10%',
        Cell: withWebhook(Enabled)
      },
      {
        id: 'modifiedBy',
        width: '10%',
        Cell: withWebhook(WebhookMenu),
        actions: {
          onEdit: handleWebhookEdit,
          onDelete: handleWebhookDelete
        }
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getString]
  )
  return (
    <TableV2<any>
      columns={envColumns}
      data={response.content as any}
      onRowClick={() => {
        // TODO go to webhook details page goes here
      }}
    />
  )
}
