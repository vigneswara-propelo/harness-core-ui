/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Card, CardBody, Icon, Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useHistory, useParams } from 'react-router-dom'
import { Classes } from '@blueprintjs/core'
import type { Role, RoleResponse } from 'services/rbac'
import routes from '@common/RouteDefinitions'
import { getRoleIcon } from '@rbac/utils/utils'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import useDeleteRoleDialog from '@rbac/hooks/useDeleteRoleDialog'
import AssignedCounts from '@rbac/pages/Roles/views/AssignedCounts'
import RoleMenu from '@rbac/components/RoleMenu/RoleMenu'

import css from './RoleCard.module.scss'

interface RoleCardProps {
  data: RoleResponse
  reloadRoles: () => void
  editRoleModal: (role: Role) => void
}

const RoleCard: React.FC<RoleCardProps> = ({ data, reloadRoles, editRoleModal }) => {
  const { role, harnessManaged } = data
  const { accountId, projectIdentifier, orgIdentifier, module } = useParams<ProjectPathProps & ModulePathParams>()
  const history = useHistory()
  const [menuOpen, setMenuOpen] = useState(false)

  const roleDetailsUrl = routes.toRoleDetails({
    roleIdentifier: role.identifier,
    accountId,
    orgIdentifier,
    projectIdentifier,
    module
  })

  const { openDeleteDialog } = useDeleteRoleDialog({ role, refetch: reloadRoles })

  return (
    <Card
      className={css.card}
      data-testid={`role-card-${role.identifier}`}
      onClick={() => {
        history.push(roleDetailsUrl)
      }}
      interactive
    >
      <CardBody.Menu
        menuContent={
          <RoleMenu
            role={role}
            setMenuOpen={setMenuOpen}
            harnessManaged={harnessManaged}
            openDeleteModal={openDeleteDialog}
            editRoleModal={editRoleModal}
          />
        }
        menuPopoverProps={{
          className: Classes.DARK,
          isOpen: menuOpen,
          onInteraction: nextOpenState => {
            setMenuOpen(nextOpenState)
          }
        }}
      />

      <Layout.Vertical flex={{ align: 'center-center' }} spacing="large" height="100%">
        <Icon name={getRoleIcon(role.identifier)} size={40} />
        <Text className={css.name} lineClamp={3} color={Color.BLACK} font={{ size: 'normal', weight: 'semi-bold' }}>
          {role.name}
        </Text>
        <AssignedCounts role={data} className={css.assignedCounts} />
      </Layout.Vertical>
    </Card>
  )
}

export default RoleCard
