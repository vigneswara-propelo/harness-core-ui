/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Menu } from '@blueprintjs/core'
import type { Project } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { PermissionRequest } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { NAV_MODE } from '@common/utils/routeUtils'

interface PopoverMenuProps {
  project: Project
  reloadProjects?: () => Promise<unknown>
  editProject?: (project: Project) => void
  collaborators?: () => void
  setMenuOpen?: (value: React.SetStateAction<boolean>) => void
  openDialog?: () => void
  refetch: () => Promise<unknown>
}

const PopoverMenu: React.FC<PopoverMenuProps> = props => {
  const { project, setMenuOpen, collaborators, editProject, openDialog } = props
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const { currentMode } = useAppStore()

  const permissionRequest: Optional<PermissionRequest, 'permission'> = {
    resourceScope: {
      accountIdentifier: accountId,
      orgIdentifier: project?.orgIdentifier
    },
    resource: {
      resourceType: ResourceType.PROJECT,
      resourceIdentifier: project?.identifier
    }
  }

  const handleDelete = (event: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    event.stopPropagation()
    setMenuOpen?.(false)
    openDialog?.()
  }

  const handleEdit = (event: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    event.stopPropagation()
    setMenuOpen?.(false)
    editProject?.(project)
  }

  const handleCollaborate = (event: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    event.stopPropagation()
    setMenuOpen?.(false)
    collaborators?.()
  }

  return (
    <Menu style={{ minWidth: 'unset' }}>
      <RbacMenuItem
        icon="edit"
        text={getString('edit')}
        onClick={handleEdit}
        data-testid={'edit-project'}
        permission={{
          ...permissionRequest,
          permission: PermissionIdentifier.UPDATE_PROJECT
        }}
      />
      <RbacMenuItem
        icon="new-person"
        // eslint-disable-next-line strings-restrict-modules
        text={getString('projectsOrgs.invite')}
        onClick={handleCollaborate}
        permission={{
          resourceScope: {
            accountIdentifier: accountId,
            orgIdentifier: project.orgIdentifier,
            projectIdentifier: project.identifier
          },
          resource: {
            resourceType: ResourceType.USER
          },
          permission: PermissionIdentifier.INVITE_USER
        }}
      />
      {currentMode === NAV_MODE.ADMIN && (
        <>
          <Menu.Divider />
          <RbacMenuItem
            icon="trash"
            text={getString('delete')}
            onClick={handleDelete}
            permission={{
              ...permissionRequest,
              permission: PermissionIdentifier.DELETE_PROJECT
            }}
          />
        </>
      )}
    </Menu>
  )
}

export default PopoverMenu
