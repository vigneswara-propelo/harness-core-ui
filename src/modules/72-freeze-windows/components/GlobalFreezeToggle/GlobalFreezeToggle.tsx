/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { Classes, Intent, Switch } from '@blueprintjs/core'
import { defaultTo, noop } from 'lodash-es'
import { Dialog, OverlaySpinner, useConfirmationDialog, useToaster } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { ScheduleFreezeForm } from '../ScheduleFreezeForm/SccheduleFreezeForm'
import css from './GlobalFreezeToggle.module.scss'

interface GlobalFreezeToggleProps {
  refetch: () => void
}

export const GlobalFreezeToggle: FC<GlobalFreezeToggleProps> = ({ refetch }) => {
  const { getString } = useStrings()
  const { showSuccess, showWarning } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const scope = getScopeFromDTO({ projectIdentifier, orgIdentifier, accountId })

  // TODO: integrate global toggle handling here
  const isGlobalFreezeActive = false
  const disableGlobalFreeze = noop
  const enableGlobalFreeze = noop
  const loading = false

  const { openDialog: openDisableFreezeDialog } = useConfirmationDialog({
    titleText: `${getString('freezeWindows.globalFreeze.disableFreeze', { scope })} ?`,
    contentText: getString('freezeWindows.globalFreeze.disableFreezeText'),
    confirmButtonText: getString('confirm'),
    cancelButtonText: getString('cancel'),
    intent: Intent.WARNING,
    onCloseDialog: isConfirmed => {
      if (isConfirmed) {
        handleDisableGlobalFreeze()
      }
    }
  })

  const handleDisableGlobalFreeze = async (): Promise<void> => {
    try {
      await disableGlobalFreeze()
      showSuccess(getString('freezeWindows.globalFreeze.enableFreezeSuccess', { scope }))
      refetch()
      hideEnableFreezeDialog()
    } catch (err: any) {
      showWarning(defaultTo(getRBACErrorMessage(err), getString('freezeWindows.globalFreeze.enableFreezeFailure')))
    }
  }

  const [openEnableFreezeDialog, hideEnableFreezeDialog] = useModalHook(
    () => (
      <Dialog
        isOpen
        canOutsideClickClose={false}
        title={`${getString('freezeWindows.globalFreeze.enableFreeze', { scope })} ?`}
        onClose={hideEnableFreezeDialog}
        enforceFocus={false}
        className={cx(css.dialog, Classes.DIALOG)}
      >
        <OverlaySpinner show={loading}>
          <ScheduleFreezeForm onSave={handleEnableGlobalFreeze} onCancel={hideEnableFreezeDialog} />
        </OverlaySpinner>
      </Dialog>
    ),
    []
  )

  const handleEnableGlobalFreeze = async (): Promise<void> => {
    try {
      await enableGlobalFreeze()
      showSuccess(getString('freezeWindows.globalFreeze.disableFreezeSuccess', { scope }))
      refetch()
      hideEnableFreezeDialog()
    } catch (err: any) {
      showWarning(defaultTo(getRBACErrorMessage(err), getString('freezeWindows.globalFreeze.disableFreezeFailure')))
    }
  }

  return (
    <Switch
      label={
        isGlobalFreezeActive
          ? getString('freezeWindows.globalFreeze.disableFreeze', { scope })
          : getString('freezeWindows.globalFreeze.enableFreeze', { scope })
      }
      onChange={event => (event.currentTarget.checked ? openEnableFreezeDialog() : openDisableFreezeDialog())}
      className={css.switch}
      checked={isGlobalFreezeActive}
    />
  )
}
