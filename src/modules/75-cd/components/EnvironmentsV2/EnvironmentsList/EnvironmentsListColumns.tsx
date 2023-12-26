/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import ReactTimeago from 'react-timeago'
import { defaultTo, get, isEmpty } from 'lodash-es'
import { Classes, Menu, PopoverInteractionKind, Position } from '@blueprintjs/core'
import { Layout, TagsPopover, Text, Checkbox, useConfirmationDialog, Popover, Button, Icon } from '@harness/uicore'
import { Intent, Color, FontVariation } from '@harness/design-system'
import { ResourceType as GitResourceType } from '@common/interfaces/GitSyncInterface'

import type { EnvironmentResponse, EnvironmentResponseDTO } from 'services/cd-ng'
import { useStrings } from 'framework/strings'

import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import type { PermissionRequest } from '@rbac/hooks/usePermission'

import { EnvironmentType } from '@common/constants/EnvironmentType'

import { StoreType } from '@modules/10-common/constants/GitSyncTypes'
import { CodeSourceWrapper } from '@modules/70-pipeline/components/CommonPipelineStages/PipelineStage/utils'
import { useFeatureFlags } from '@modules/10-common/hooks/useFeatureFlag'
import useMigrateResource from '@modules/70-pipeline/components/MigrateResource/useMigrateResource'
import { MigrationType } from '@modules/70-pipeline/components/MigrateResource/MigrateUtils'
import css from './EnvironmentsList.module.scss'

interface EnvironmentRowColumn {
  row: { original: EnvironmentResponse }
  column: {
    actions: {
      onEdit: (identifier: string) => void
      onDelete: (identifier: string) => void
    }
  }
}

export function withEnvironment(Component: any) {
  // eslint-disable-next-line react/display-name
  return (props: EnvironmentRowColumn) => {
    return <Component {...props.row.original} {...props.column.actions} />
  }
}

export function EnvironmentName({
  environment: { name, tags, identifier }
}: {
  environment: EnvironmentResponseDTO
}): JSX.Element {
  const { getString } = useStrings()
  return (
    <Layout.Vertical>
      <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing="small" margin={{ bottom: 'small' }}>
        <Text color={Color.BLACK} lineClamp={1}>
          {name}
        </Text>
        {!isEmpty(tags) && (
          <TagsPopover
            className={css.tagsPopover}
            iconProps={{ size: 14, color: Color.GREY_600 }}
            tags={defaultTo(tags, {})}
          />
        )}
      </Layout.Horizontal>

      <Text color={Color.GREY_500} font={{ size: 'small' }} lineClamp={1}>
        {getString('common.ID')}: {identifier}
      </Text>
    </Layout.Vertical>
  )
}

export function EnvironmentTypes({ environment: { type } }: { environment: EnvironmentResponseDTO }): JSX.Element {
  const { getString } = useStrings()
  return (
    <Text
      className={cx(css.environmentType, {
        [css.production]: type === EnvironmentType.PRODUCTION
      })}
      font={{ size: 'small' }}
    >
      {getString(type === EnvironmentType.PRODUCTION ? 'cd.serviceDashboard.prod' : 'cd.preProductionType')}
    </Text>
  )
}

export function LastUpdatedBy({ lastModifiedAt }: EnvironmentResponse): React.ReactElement {
  return (
    <Layout.Vertical spacing={'small'}>
      <ReactTimeago date={lastModifiedAt as number} />
    </Layout.Vertical>
  )
}

export function EnvironmentMenu({
  environment,
  onEdit,
  onDelete,
  reload
}: {
  environment: EnvironmentResponseDTO
  onEdit: (identifier: string, environment: EnvironmentResponseDTO) => void
  onDelete: (environment: EnvironmentResponseDTO) => void
  reload: () => void
}): React.ReactElement {
  const [menuOpen, setMenuOpen] = React.useState(false)
  const { CDS_ENV_GITX } = useFeatureFlags()
  const { getString } = useStrings()

  const { openDialog } = useConfirmationDialog({
    titleText: getString('cd.environment.delete'),
    contentText: getString('cd.environment.deleteConfirmation'),
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    intent: Intent.DANGER,
    buttonIntent: Intent.DANGER,
    onCloseDialog: async (isConfirmed: boolean) => {
      /* istanbul ignore else */
      if (isConfirmed) {
        onDelete(environment)
      }
      setMenuOpen(false)
    }
  })
  const { showMigrateResourceModal: showMoveResourceModal } = useMigrateResource({
    resourceType: GitResourceType.ENVIRONMENT,
    modalTitle: getString('common.moveEntitytoGit', { resourceType: getString('environment') }),
    migrationType: MigrationType.INLINE_TO_REMOTE,
    extraQueryParams: { name: environment.name, identifier: environment.identifier },
    onSuccess: () => reload()
  })

  const handleEdit = (event: React.MouseEvent): void => {
    event.stopPropagation()
    onEdit(defaultTo(environment?.identifier, ''), environment)
    setMenuOpen(false)
  }

  const handleDelete = (event: React.MouseEvent): void => {
    event.stopPropagation()
    openDialog()
    setMenuOpen(false)
  }

  const handleMoveInlineToRemote = (event: React.MouseEvent): void => {
    event.stopPropagation()
    showMoveResourceModal()
    setMenuOpen(false)
  }

  const resourceAndScope: Pick<PermissionRequest, 'resource' | 'resourceScope'> = {
    resource: {
      resourceType: ResourceType.ENVIRONMENT,
      resourceIdentifier: environment.identifier
    },
    resourceScope: {
      accountIdentifier: environment.accountId,
      orgIdentifier: environment.orgIdentifier,
      projectIdentifier: environment.projectIdentifier
    }
  }

  return (
    <Layout.Horizontal style={{ justifyContent: 'flex-end' }}>
      <Popover isOpen={menuOpen} onInteraction={setMenuOpen} className={Classes.DARK} position={Position.LEFT}>
        <Button
          minimal
          style={{
            transform: 'rotate(90deg)'
          }}
          icon="more"
          onClick={e => {
            e.stopPropagation()
            setMenuOpen(true)
          }}
        />
        <Menu style={{ minWidth: 'unset' }}>
          <RbacMenuItem
            icon="edit"
            text={getString('edit')}
            onClick={handleEdit}
            permission={{
              ...resourceAndScope,
              permission: PermissionIdentifier.EDIT_ENVIRONMENT
            }}
          />
          <RbacMenuItem
            icon="trash"
            text={getString('delete')}
            onClick={handleDelete}
            permission={{
              ...resourceAndScope,
              permission: PermissionIdentifier.DELETE_ENVIRONMENT
            }}
          />
          {CDS_ENV_GITX && environment.storeType !== StoreType.REMOTE && (
            <RbacMenuItem
              icon="git-merge"
              text={getString('common.moveToGit')}
              onClick={handleMoveInlineToRemote}
              permission={{
                ...resourceAndScope,
                permission: PermissionIdentifier.EDIT_ENVIRONMENT
              }}
              data-testid="move-env-inline-remote"
            />
          )}
        </Menu>
      </Popover>
    </Layout.Horizontal>
  )
}

export function DeleteCheckbox({ row, column }: any): JSX.Element {
  return (
    <Checkbox
      onClick={event => column.onCheckboxSelect(event, row?.original)}
      checked={column.environmentsToRemove.some(
        (selectedEnv: EnvironmentResponse) =>
          (selectedEnv as any).environment.identifier === row?.original?.environment.identifier
      )}
    />
  )
}
export function CodeSourceCell({ environment }: { environment: EnvironmentResponseDTO }): React.ReactElement {
  const { entityGitDetails: gitDetails, storeType } = environment
  const { getString } = useStrings()
  const isRemote = storeType === StoreType.REMOTE
  const inlineWrapper: CodeSourceWrapper = {
    textName: getString('inline'),
    iconName: 'repository',
    size: 10
  }
  const remoteWrapper: CodeSourceWrapper = {
    textName: getString('repository'),
    iconName: 'remote-setup',
    size: 12
  }

  return (
    <div className={css.codeSourceColumnContainer}>
      <Popover
        disabled={!isRemote}
        position={Position.TOP}
        interactionKind={PopoverInteractionKind.HOVER}
        className={Classes.DARK}
        content={
          <Layout.Vertical spacing="small" padding="large" className={css.contentWrapper}>
            <Layout.Horizontal spacing="small" flex={{ alignItems: 'center', justifyContent: 'start' }}>
              <Icon name="github" size={14} color={Color.GREY_200} />
              <Text color={Color.WHITE} font={{ variation: FontVariation.SMALL }}>
                {get(gitDetails, 'repoName', get(gitDetails, 'repoIdentifier'))}
              </Text>
            </Layout.Horizontal>
            {gitDetails?.filePath && (
              <Layout.Horizontal spacing="small" flex={{ alignItems: 'center', justifyContent: 'start' }}>
                <Icon name="remotefile" size={14} color={Color.GREY_200} />
                <Text color={Color.WHITE} font={{ variation: FontVariation.SMALL }}>
                  {gitDetails.filePath}
                </Text>
              </Layout.Horizontal>
            )}
          </Layout.Vertical>
        }
      >
        <div className={css.codeSourceColumn}>
          <Icon
            name={isRemote ? remoteWrapper.iconName : inlineWrapper.iconName}
            size={isRemote ? remoteWrapper.size : inlineWrapper.size}
            color={Color.GREY_600}
          />
          <Text margin={{ left: 'xsmall' }} font={{ variation: FontVariation.TINY_SEMI }} color={Color.GREY_600}>
            {isRemote ? remoteWrapper.textName : inlineWrapper.textName}
          </Text>
        </div>
      </Popover>
    </div>
  )
}
