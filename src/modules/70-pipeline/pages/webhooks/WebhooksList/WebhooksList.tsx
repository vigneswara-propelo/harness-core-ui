/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import type { Column } from 'react-table'
import { Dialog, TableV2, useToaster, Container } from '@harness/uicore'
import { defaultTo } from 'lodash-es'
import cx from 'classnames'
import {
  GitXWebhookResponse,
  ListGitxWebhooksOkResponse,
  UpdateGitxWebhookOkResponse,
  UpdateGitxWebhookProps,
  deleteGitxWebhook
} from '@harnessio/react-ng-manager-client'
import { useModalHook } from '@harness/use-modal'
import { useHistory, useParams } from 'react-router-dom'
import { UseMutateFunction } from '@tanstack/react-query'
import { useStrings } from 'framework/strings'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import {
  Enabled,
  FolderPath,
  GitConnector,
  LastActivity,
  WebhookMenu,
  WebhookName,
  WebhookRepo,
  withWebhook
} from './WebhooksListColumns'
import NewWebhookModal from '../NewWebhookModal'
import { processFolderPaths } from '../utils'
import css from '../Webhooks.module.scss'

export default function WebhooksList({
  response,
  refetch,
  updateWebhook
}: {
  response: ListGitxWebhooksOkResponse | undefined
  refetch: () => void
  updateWebhook: UseMutateFunction<UpdateGitxWebhookOkResponse, unknown, UpdateGitxWebhookProps, unknown>
}): JSX.Element {
  const { getString } = useStrings()
  const { getRBACErrorMessage } = useRBACError()
  const { showError, showSuccess } = useToaster()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps & ModulePathParams>()
  const [rowData, setRowData] = React.useState<GitXWebhookResponse>()
  const [editable, setEditable] = React.useState(false)
  const history = useHistory()
  const [showCreateModal, hideCreateModal] = useModalHook(
    /* istanbul ignore next */ () => {
      const onClosehandler = (): void => {
        hideCreateModal()
        setEditable(false)
        refetch()
      }
      return (
        <Dialog
          isOpen={true}
          enforceFocus={false}
          canEscapeKeyClose
          canOutsideClickClose
          onClose={onClosehandler}
          isCloseButtonShown
          className={cx('padded-dialog', css.dialogStylesWebhook)}
        >
          <Container>
            <NewWebhookModal
              isEdit={editable}
              initialData={{
                name: defaultTo(rowData?.webhook_name, ''),
                identifier: defaultTo(rowData?.webhook_identifier, ''),
                connectorRef: defaultTo(rowData?.connector_ref, ''),
                repo: defaultTo(rowData?.repo_name, ''),
                folderPaths: defaultTo(processFolderPaths(defaultTo(rowData?.folder_paths, [])), [])
              }}
              closeModal={onClosehandler}
            />
          </Container>
        </Dialog>
      )
    },
    [orgIdentifier, projectIdentifier, rowData, editable]
  )

  const handleWebhookEdit = (id: string): void => {
    const dataRow = response?.content?.find(temp => {
      return temp?.webhook_identifier === id
    })
    setEditable(true)
    setRowData(dataRow)
    showCreateModal()
  }
  const handleWebhookDelete = async (name: string, identifier: string): Promise<void> => {
    try {
      await deleteGitxWebhook({
        'gitx-webhook': identifier
      })
      showSuccess(getString('pipeline.webhooks.deleted', { name: name }))
      refetch()
    } catch (e: any) {
      showError(getRBACErrorMessage(e))
    }
  }

  const handleWebhookEnableToggle = (id: string, enabled: boolean): void => {
    updateWebhook({
      'gitx-webhook': id,
      body: {
        is_enabled: enabled
      }
    })
  }

  type CustomColumn<T extends Record<string, any>> = Column<T>

  const envColumns: CustomColumn<GitXWebhookResponse>[] = useMemo(
    () => [
      {
        Header: getString('name').toUpperCase(),
        id: 'webhook_name',
        width: '16%',
        Cell: withWebhook(WebhookName)
      },
      {
        Header: getString('platform.connectors.title.gitConnector').toUpperCase(),
        id: 'connector_ref',
        width: '20%',
        Cell: withWebhook(GitConnector)
      },
      {
        Header: getString('pipeline.webhooks.gitRepo').toUpperCase(),
        id: 'repo_name',
        width: '16%',
        Cell: withWebhook(WebhookRepo)
      },
      {
        Header: getString('common.git.folderPath').toUpperCase(),
        id: 'folder_paths',
        width: '24%',
        Cell: withWebhook(FolderPath)
      },
      {
        Header: getString('lastActivity').toUpperCase(),
        id: 'lastUpdatedBy',
        width: '8%',
        Cell: withWebhook(LastActivity)
      },
      {
        Header: getString('enabledLabel').toUpperCase(),
        id: 'is_enabled',
        width: '8%',
        Cell: withWebhook(Enabled),
        actions: {
          onToggleEnable: handleWebhookEnableToggle
        }
      },
      {
        id: 'modifiedBy',
        width: '8%',
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
    <TableV2<GitXWebhookResponse>
      columns={envColumns}
      data={response?.content as GitXWebhookResponse[]}
      onRowClick={rowDetails => {
        history.push(
          routes.toWebhooksDetails({
            accountId,
            webhookIdentifier: defaultTo(rowDetails.webhook_identifier, '')
          })
        )
      }}
    />
  )
}
