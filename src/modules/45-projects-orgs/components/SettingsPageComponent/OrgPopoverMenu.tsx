/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Menu } from '@blueprintjs/core'
import type { Organization } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import { NAV_MODE } from '@common/utils/routeUtils'
import { useAppStore } from 'framework/AppStore/AppStoreContext'

interface OrgPopoverMenuProps {
  org: Organization
  editOrg?: () => void
  inviteCollab?: () => void
  setMenuOpen: (value: React.SetStateAction<boolean>) => void
  openDialog: () => void
}

const OrgPopoverMenu: React.FC<OrgPopoverMenuProps> = props => {
  const { org, setMenuOpen, inviteCollab, editOrg, openDialog } = props
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const { currentMode } = useAppStore()

  const permissionRequest = {
    resource: {
      resourceType: ResourceType.ORGANIZATION,
      resourceIdentifier: org.identifier
    }
  }

  const invitePermission = {
    resourceScope: {
      accountIdentifier: accountId,
      orgIdentifier: org.identifier
    },
    resource: {
      resourceType: ResourceType.USER
    },
    permission: PermissionIdentifier.INVITE_USER
  }

  const handleEdit = (e: React.MouseEvent): void => {
    e.stopPropagation()
    setMenuOpen(false)
    editOrg?.()
  }

  const handleInvite = (e: React.MouseEvent): void => {
    e.stopPropagation()
    setMenuOpen(false)
    inviteCollab?.()
  }

  const handleDelete = async (e: React.MouseEvent): Promise<void> => {
    e.stopPropagation()
    setMenuOpen(false)
    if (!org?.identifier) return
    openDialog()
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
          permission: PermissionIdentifier.UPDATE_ORG
        }}
      />
      <RbacMenuItem
        icon="new-person"
        // eslint-disable-next-line strings-restrict-modules
        text={getString('projectsOrgs.invite')}
        onClick={handleInvite}
        permission={invitePermission}
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
              permission: PermissionIdentifier.DELETE_ORG,
              resourceScope: {
                accountIdentifier: accountId,
                orgIdentifier: org.identifier
              }
            }}
          />
        </>
      )}
    </Menu>
  )
}

export default OrgPopoverMenu
