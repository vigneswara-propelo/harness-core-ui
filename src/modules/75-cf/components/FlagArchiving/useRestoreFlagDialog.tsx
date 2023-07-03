/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Intent } from '@harness/design-system'
import { UseConfirmationDialogReturn, useToaster } from '@harness/uicore'
import { useStrings, String } from 'framework/strings'
import { useRestoreFeatureFlag, RestoreFeatureFlagQueryParams, Feature } from 'services/cf'
import useResponseError from '@cf/hooks/useResponseError'
import { useConfirmAction } from '@common/hooks'
import css from './useRestoreFlagDialog.module.scss'

export interface RestoreFlagDialogProps {
  flagData: Feature
  queryParams: RestoreFeatureFlagQueryParams
  onRestore: () => void
}

const useRestoreFlagDialog = ({
  flagData,
  queryParams: restoreQueryParams,
  onRestore
}: RestoreFlagDialogProps): UseConfirmationDialogReturn['openDialog'] => {
  const { showSuccess } = useToaster()
  const { getString } = useStrings()
  const { handleResponseError } = useResponseError()

  const queryParams = {
    identifier: flagData.identifier,
    environmentIdentifier: flagData.envProperties?.environment,
    ...restoreQueryParams
  }

  const { mutate: restoreFeatureFlag } = useRestoreFeatureFlag({
    identifier: flagData.identifier,
    queryParams
  })

  const handleRestore = async (): Promise<void> => {
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
    action: handleRestore
  })
}

export default useRestoreFlagDialog
