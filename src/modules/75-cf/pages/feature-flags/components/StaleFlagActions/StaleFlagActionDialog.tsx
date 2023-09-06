/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Button, ButtonVariation, Layout, ModalDialog, Text } from '@harness/uicore'
import { Intent } from '@harness/design-system'
import React, { FC } from 'react'
import { Spinner } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { usePatchFeatures } from 'services/cf'
import useResponseError from '@cf/hooks/useResponseError'

export interface StaleFlagActionDialogProps {
  markAsNotStale?: boolean
  selectedFlags: string[]
  onAction: () => void
  onClose: () => void
}

export const StaleFlagActionDialog: FC<StaleFlagActionDialogProps> = ({
  selectedFlags,
  onAction,
  markAsNotStale,
  onClose
}) => {
  const { getString } = useStrings()
  const { handleResponseError } = useResponseError()
  const { orgIdentifier, accountId: accountIdentifier, projectIdentifier } = useParams<Record<string, string>>()

  const { mutate: patchFeatures, loading } = usePatchFeatures({
    queryParams: {
      accountIdentifier,
      orgIdentifier,
      projectIdentifier
    }
  })

  const patchFlag = async (instruction: string): Promise<void> => {
    try {
      await patchFeatures({
        flags: selectedFlags.map(identifier => ({
          identifier,
          instructions: [{ kind: instruction, parameters: {} }]
        }))
      })
      onAction()
    } catch (err) {
      handleResponseError(err)
    }
  }

  return (
    <ModalDialog
      isOpen
      enforceFocus={false}
      onClose={onClose}
      title={
        markAsNotStale ? getString('cf.staleFlagAction.notStale') : getString('cf.staleFlagAction.readyForCleanup')
      }
      footer={
        <Layout.Horizontal spacing="small">
          <Button
            text={
              markAsNotStale
                ? getString('cf.staleFlagAction.notStale')
                : getString('cf.staleFlagAction.readyForCleanup')
            }
            variation={ButtonVariation.PRIMARY}
            intent={Intent.PRIMARY}
            onClick={() => {
              patchFlag(markAsNotStale ? 'markAsNotStale' : 'markAsStale')
            }}
            disabled={loading}
          />
          <Button
            text={getString('cancel')}
            variation={ButtonVariation.TERTIARY}
            onClick={onClose}
            disabled={loading}
          />
          {loading && <Spinner size={16} />}
        </Layout.Horizontal>
      }
    >
      <Text>
        {markAsNotStale
          ? getString('cf.staleFlagAction.notStaleDesc')
          : getString('cf.staleFlagAction.readyForCleanupDesc')}
      </Text>
    </ModalDialog>
  )
}
