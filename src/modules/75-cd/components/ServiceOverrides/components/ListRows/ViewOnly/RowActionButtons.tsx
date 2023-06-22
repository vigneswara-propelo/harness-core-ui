import React from 'react'
import { useParams } from 'react-router-dom'
import { ButtonVariation, Layout } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'

import { Scope } from '@common/interfaces/SecretsInterface'
import { getIdentifierFromScopedRef } from '@common/utils/utils'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'

import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import RbacButton, { ButtonProps } from '@rbac/components/Button/Button'

import { useServiceOverridesContext } from '@cd/components/ServiceOverrides/context/ServiceOverrideContext'
import { getScopeFromValue } from '@common/components/EntityReference/EntityReference'

export default function RowActionButtons({
  rowIndex,
  environmentRef
}: {
  rowIndex: number
  environmentRef: string
}): React.ReactElement {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<PipelinePathProps>()

  const { onEdit, onDelete, onClone } = useServiceOverridesContext()
  const scope = getScopeFromValue(environmentRef)
  const environmentIdentifier = getIdentifierFromScopedRef(environmentRef)

  const buttonPermission: ButtonProps['permission'] = {
    resource: {
      resourceType: ResourceType.ENVIRONMENT,
      resourceIdentifier: environmentIdentifier
    },
    resourceScope: {
      accountIdentifier: accountId,
      ...(scope !== Scope.ACCOUNT && { orgIdentifier }),
      ...(scope === Scope.PROJECT && { projectIdentifier })
    },
    permission: PermissionIdentifier.EDIT_ENVIRONMENT
  }

  return (
    <Layout.Horizontal spacing={'small'} width={110}>
      <RbacButton
        icon="duplicate"
        variation={ButtonVariation.ICON}
        font={{ variation: FontVariation.BODY1 }}
        onClick={() => onClone(rowIndex)}
        permission={buttonPermission}
      />
      <RbacButton
        icon="Edit"
        variation={ButtonVariation.ICON}
        font={{ variation: FontVariation.BODY1 }}
        onClick={() => onEdit(rowIndex)}
        permission={buttonPermission}
      />
      <RbacButton
        icon="main-trash"
        variation={ButtonVariation.ICON}
        font={{ variation: FontVariation.BODY1 }}
        onClick={() => onDelete(rowIndex)}
        permission={buttonPermission}
      />
    </Layout.Horizontal>
  )
}
