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
import RbacOptionsMenuButton from '@rbac/components/RbacOptionsMenuButton/RbacOptionsMenuButton'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { useStrings } from 'framework/strings'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import routes from '@common/RouteDefinitions'
import { DeleteFeatureFlagQueryParams, Feature } from 'services/cf'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { UseGitSync } from '@cf/hooks/useGitSync'
import type { RbacMenuItemProps } from '@rbac/components/MenuItem/MenuItem'
import useDeleteFlagModal from '../FlagActivation/hooks/useDeleteFlagModal'
import useArchiveFlagDialog from '../FlagArchiving/useArchiveFlagDialog'
import useRestoreFlagDialog from '../FlagArchiving/useRestoreFlagDialog'

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
}

const FlagOptionsMenuButton: FC<FlagOptionsMenuButtonProps> = ({
  environment,
  flagData,
  gitSync,
  deleteFlag,
  queryParams,
  refetchFlags,
  noEdit = false,
  clearFilter,
  isLastArchivedFlag
}) => {
  const history = useHistory()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<Record<string, string>>()
  const { withActiveEnvironment } = useActiveEnvironment()
  const { getString } = useStrings()
  const { isPlanEnforcementEnabled } = usePlanEnforcement()
  const { FFM_7921_ARCHIVING_FEATURE_FLAGS } = useFeatureFlags()
  const [openedArchivedDialog, setOpenedArchivedDialog] = useState<boolean>(false)

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
    onSuccess: () => {
      refetchFlags?.()
      if (isLastArchivedFlag) {
        clearFilter?.()
      }
    }
  })

  const { openDialog: openArchiveDialog } = useArchiveFlagDialog({
    archiveFlag: deleteFlag,
    flagData,
    onArchive: refetchFlags,
    openedArchivedDialog,
    queryParams
  })

  const openRestoreFlagDialog = useRestoreFlagDialog({
    flagData,
    queryParams,
    onRestore: () => {
      refetchFlags()
      if (isLastArchivedFlag) {
        clearFilter?.()
      }
    }
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

  const onClickArchiveButton = (): void => {
    setOpenedArchivedDialog(true)
    openArchiveDialog()
  }

  const options: Record<string, RbacMenuItemProps> = {
    archive: {
      icon: 'archive',
      text: getString('archive'),
      onClick: onClickArchiveButton,
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
    }
  }

  const getMenuItems = (
    archivingFlags: boolean,
    flag: Feature,
    menuOptions: Record<string, RbacMenuItemProps>
  ): RbacMenuItemProps[] => {
    if (archivingFlags) {
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

  return <RbacOptionsMenuButton items={getMenuItems(!!FFM_7921_ARCHIVING_FEATURE_FLAGS, flagData, options)} />
}

export default FlagOptionsMenuButton
