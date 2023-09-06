/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import type { MutateRequestOptions } from 'restful-react/dist/Mutate'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import usePlanEnforcement from '@cf/hooks/usePlanEnforcement'
import RbacOptionsMenuButton, {
  RbacOptionsMenuButtonProps
} from '@rbac/components/RbacOptionsMenuButton/RbacOptionsMenuButton'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { useStrings } from 'framework/strings'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import routes from '@common/RouteDefinitions'
import { DeleteFeatureFlagQueryParams, Feature } from 'services/cf'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { UseGitSync } from '@cf/hooks/useGitSync'
import type { RbacMenuItemProps } from '@rbac/components/MenuItem/MenuItem'
import { useQueryParamsState } from '@common/hooks/useQueryParamsState'
import { FeatureFlagStatus, StaleFlagStatusReason } from '@cf/pages/feature-flags/FlagStatus'
import { StaleFlagActionDialog } from '@cf/pages/feature-flags/components/StaleFlagActions/StaleFlagActionDialog'
import ArchiveDialog from '../FlagArchiving/ArchiveDialog'
import useDeleteFlagModal from '../FlagActivation/hooks/useDeleteFlagModal'
import useRestoreFlagDialog from '../FlagArchiving/useRestoreFlagDialog'
import { FilterProps } from '../TableFilters/TableFilters'
import css from './FlagOptionsMenuButton.module.scss'

export interface FlagOptionsMenuButtonProps {
  environment?: string
  flagData: Feature
  gitSync: UseGitSync
  deleteFlag: (
    data: string,
    mutateRequestOptions?: MutateRequestOptions<DeleteFeatureFlagQueryParams, void> | undefined
  ) => void
  queryParams: DeleteFeatureFlagQueryParams
  refetchFlags: () => void
  clearFilter?: () => void
  isLastArchivedFlag?: boolean
  noEdit?: boolean
  isStale?: boolean
  staleReason?: string
}

const FlagOptionsMenuButton: FC<FlagOptionsMenuButtonProps> = ({
  environment,
  flagData,
  gitSync,
  deleteFlag,
  queryParams,
  refetchFlags,
  noEdit = false,
  isStale,
  staleReason
}) => {
  const history = useHistory()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<Record<string, string>>()
  const [flagFilter] = useQueryParamsState<Optional<FilterProps>>('filter', {})
  const { withActiveEnvironment } = useActiveEnvironment()
  const { getString } = useStrings()
  const { isPlanEnforcementEnabled } = usePlanEnforcement()
  const { FFM_7921_ARCHIVING_FEATURE_FLAGS, FFM_8344_FLAG_CLEANUP } = useFeatureFlags()
  const [showArchiveDialog, setShowArchiveDialog] = useState<boolean>()
  const [showNotStaleDialog, setShowNotStaleDialog] = useState<boolean>(false)
  const [showCleanupDialog, setShowCleanupDialog] = useState<boolean>(false)
  const isWaitingForCleanup = staleReason === StaleFlagStatusReason.WAITING_FOR_CLEANUP && isStale

  const handleShowCleanupDialog = (): void => {
    setShowCleanupDialog(true)
  }

  const handleShowNotStaleDialog = (): void => {
    setShowNotStaleDialog(true)
  }

  const planEnforcementProps = isPlanEnforcementEnabled
    ? {
        featuresProps: {
          featuresRequest: {
            featureNames: [FeatureIdentifier.MAUS]
          }
        }
      }
    : undefined

  const { confirmDeleteFlag } = useDeleteFlagModal({
    featureFlag: flagData,
    gitSync,
    queryParams,
    deleteFeatureFlag: deleteFlag,
    onSuccess: refetchFlags
  })

  const openRestoreFlagDialog = useRestoreFlagDialog({
    flagData,
    gitSync,
    queryParams,
    onRestore: refetchFlags
  })

  const gotoDetailPage = (): void => {
    history.push(
      withActiveEnvironment(
        routes.toCFFeatureFlagsDetail({
          orgIdentifier: orgIdentifier as string,
          projectIdentifier: projectIdentifier as string,
          featureFlagIdentifier: flagData.identifier,
          accountId
        }),
        environment
      )
    )
  }

  const options: Record<string, RbacMenuItemProps> = {
    archive: {
      icon: 'archive',
      text: getString('archive'),
      onClick: () => setShowArchiveDialog(true),
      permission: {
        resource: { resourceType: ResourceType.FEATUREFLAG },
        permission: PermissionIdentifier.DELETE_FF_FEATUREFLAG
      },
      ...planEnforcementProps
    },
    delete: {
      icon: 'trash',
      text: getString('delete'),
      onClick: confirmDeleteFlag,
      permission: {
        resource: { resourceType: ResourceType.FEATUREFLAG },
        permission: PermissionIdentifier.DELETE_FF_FEATUREFLAG
      },
      ...planEnforcementProps
    },
    restore: {
      icon: 'redo',
      text: getString('cf.featureFlags.archiving.restore'),
      onClick: openRestoreFlagDialog,
      permission: {
        resource: { resourceType: ResourceType.FEATUREFLAG },
        permission: PermissionIdentifier.DELETE_FF_FEATUREFLAG
      },
      ...planEnforcementProps
    },
    edit: {
      icon: 'edit',
      text: getString('edit'),
      onClick: gotoDetailPage,
      permission: {
        resource: { resourceType: ResourceType.ENVIRONMENT, resourceIdentifier: environment },
        permission: PermissionIdentifier.EDIT_FF_FEATUREFLAG
      },
      ...planEnforcementProps
    },
    cleanup: {
      className: css.staleFlagItem,
      icon: 'blank',
      text: getString('cf.staleFlagAction.readyForCleanup'),
      onClick: handleShowCleanupDialog
    },
    notStale: {
      className: css.staleFlagItem,
      icon: 'blank',
      text: getString('cf.staleFlagAction.notStale'),
      onClick: handleShowNotStaleDialog
    }
  }

  const getMenuItems = (
    archivingFlags: boolean,
    flag: Feature,
    menuOptions: Record<string, RbacMenuItemProps>
  ): RbacOptionsMenuButtonProps['items'] => {
    if (FFM_8344_FLAG_CLEANUP && flagFilter.queryProps?.value === FeatureFlagStatus.POTENTIALLY_STALE) {
      if (!isWaitingForCleanup) {
        return [menuOptions.edit, menuOptions.archive, '-', menuOptions.cleanup, menuOptions.notStale]
      } else {
        return [menuOptions.edit, menuOptions.archive, '-', menuOptions.notStale]
      }
    } else if (archivingFlags) {
      if (flag.archived) {
        return [menuOptions.restore, menuOptions.delete]
      } else {
        return [menuOptions.edit, menuOptions.archive]
      }
    } else if (noEdit) {
      return [menuOptions.delete]
    } else {
      return [menuOptions.edit, menuOptions.delete]
    }
  }

  return (
    <>
      {showArchiveDialog && (
        <ArchiveDialog
          archiveFlag={deleteFlag}
          flagIdentifier={flagData.identifier}
          flagName={flagData.name}
          onSuccess={refetchFlags}
          gitSync={gitSync}
          queryParams={queryParams}
          setShowArchiveDialog={setShowArchiveDialog}
        />
      )}

      {showCleanupDialog && (
        <StaleFlagActionDialog
          selectedFlags={[flagData.identifier]}
          onAction={refetchFlags}
          onClose={() => setShowCleanupDialog(false)}
        />
      )}

      {showNotStaleDialog && (
        <StaleFlagActionDialog
          markAsNotStale
          selectedFlags={[flagData.identifier]}
          onAction={refetchFlags}
          onClose={() => setShowNotStaleDialog(false)}
        />
      )}

      <RbacOptionsMenuButton items={getMenuItems(!!FFM_7921_ARCHIVING_FEATURE_FLAGS, flagData, options)} />
    </>
  )
}

export default FlagOptionsMenuButton
