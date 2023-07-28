/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { Intent } from '@harness/design-system'
import { useModalHook } from '@harness/use-modal'
import { UseConfirmationDialogReturn, useToaster } from '@harness/uicore'
import { useStrings, String } from 'framework/strings'
import { useRestoreFeatureFlag, RestoreFeatureFlagQueryParams, Feature } from 'services/cf'
import useResponseError from '@cf/hooks/useResponseError'
import { useConfirmAction } from '@common/hooks'
import { GitSyncFormValues, UseGitSync } from '@cf/hooks/useGitSync'
import { GIT_COMMIT_MESSAGES } from '@cf/constants/GitSyncConstants'
import SaveFlagToGitModal from '../SaveFlagToGitModal/SaveFlagToGitModal'
import css from './useRestoreFlagDialog.module.scss'

export interface RestoreFlagDialogProps {
  flagData: Feature
  gitSync: UseGitSync
  queryParams: RestoreFeatureFlagQueryParams
  onRestore: () => void
}

const useRestoreFlagDialog = ({
  flagData,
  gitSync,
  queryParams: restoreQueryParams,
  onRestore
}: RestoreFlagDialogProps): UseConfirmationDialogReturn['openDialog'] => {
  const { showSuccess } = useToaster()
  const { getString } = useStrings()
  const { handleResponseError } = useResponseError()

  const { gitSyncInitialValues, gitSyncValidationSchema } = gitSync.getGitSyncFormMeta(
    GIT_COMMIT_MESSAGES.RESTORED_FLAG
  )

  const [showGitModal, hideGitModal] = useModalHook(() => {
    return (
      <SaveFlagToGitModal
        flagName={flagData.name}
        flagIdentifier={flagData.identifier}
        gitSyncInitialValues={gitSyncInitialValues}
        gitSyncValidationSchema={gitSyncValidationSchema}
        onSubmit={handleRestore}
        onClose={hideGitModal}
      />
    )
  }, [flagData.name, flagData.identifier])

  const queryParams = useMemo(
    () => ({
      identifier: flagData.identifier,
      environmentIdentifier: flagData.envProperties?.environment,
      ...restoreQueryParams,
      commitMsg: ''
    }),
    [flagData.envProperties?.environment, flagData.identifier, restoreQueryParams]
  )

  const { mutate: restoreFeatureFlag } = useRestoreFeatureFlag({
    identifier: flagData.identifier,
    queryParams
  })

  const handleRestore = async (gitSyncFormValues?: GitSyncFormValues): Promise<void> => {
    let commitMessage

    if (gitSync.isGitSyncEnabled && gitSync.isAutoCommitEnabled) {
      commitMessage = gitSyncInitialValues.gitDetails.commitMsg
    } else {
      commitMessage = gitSyncFormValues?.gitDetails.commitMsg || ''
    }

    queryParams.commitMsg = commitMessage

    try {
      await restoreFeatureFlag()
      showSuccess(getString('cf.featureFlags.archiving.restoreSuccess'))
      onRestore()
    } catch (e) {
      handleResponseError(e)
    }
  }

  return useConfirmAction({
    title: getString('cf.featureFlags.archiving.restoreFlag'),
    intent: Intent.DANGER,
    confirmText: getString('cf.featureFlags.archiving.restore'),
    message: (
      <String
        className={css.restoreMessage}
        useRichText
        stringID="cf.featureFlags.archiving.restoreDescription"
        vars={{ flagName: flagData.name }}
      />
    ),
    action: () => {
      if (gitSync?.isGitSyncEnabled && !gitSync?.isAutoCommitEnabled) {
        showGitModal()
      } else {
        handleRestore()
      }
    }
  })
}

export default useRestoreFlagDialog
