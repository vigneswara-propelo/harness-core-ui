import { Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import React from 'react'
import { RoleWithPrincipalCountResponse } from 'services/rbac'
import { String } from 'framework/strings'

interface AssignedCountsProps {
  role: RoleWithPrincipalCountResponse
  className?: string
}

export default function AssignedCounts({ role, className }: AssignedCountsProps): React.ReactElement {
  return (
    <table className={className}>
      <thead>
        <tr>
          <th>
            <Text font={{ variation: FontVariation.TINY }} color={Color.GREY_400}>
              <String stringID="common.userGroups" />
            </Text>
          </th>
          <th>
            <Text font={{ variation: FontVariation.TINY }} color={Color.GREY_400}>
              <String stringID="users" />
            </Text>
          </th>
          <th>
            <Text font={{ variation: FontVariation.TINY }} color={Color.GREY_400}>
              <String stringID="rbac.serviceAccounts.label" />
            </Text>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <Text font={{ variation: FontVariation.SMALL_BOLD }}>{role.roleAssignedToUserGroupCount}</Text>
          </td>
          <td>
            <Text font={{ variation: FontVariation.SMALL_BOLD }}>{role.roleAssignedToUserCount}</Text>
          </td>
          <td>
            <Text font={{ variation: FontVariation.SMALL_BOLD }}>{role.roleAssignedToServiceAccountCount}</Text>
          </td>
        </tr>
      </tbody>
    </table>
  )
}
