/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useConfirmationDialog, useToaster, getErrorInfoFromErrorObject } from '@harness/uicore'
import { Intent } from '@blueprintjs/core'
import { useParams, useHistory } from 'react-router-dom'
import { defaultTo } from 'lodash-es'
import routes from '@common/RouteDefinitions'
import RbacMenuItem from '@modules/20-rbac/components/MenuItem/MenuItem'
import { useStrings } from 'framework/strings'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { useDeleteServiceV2 } from 'services/cd-ng'
import { ModulePathParams, ProjectPathProps } from '@modules/10-common/interfaces/RouteInterfaces'
import { useEntityDeleteErrorHandlerDialog } from '@common/hooks/EntityDeleteErrorHandlerDialog/useEntityDeleteErrorHandlerDialog'
import useRBACError from '@modules/20-rbac/utils/useRBACError/useRBACError'
import { ServiceTabs } from '../utils/ServiceUtils'

interface ServiceDeleteMenuItemProps {
  identifier: string
  name: string
  isForceDeleteEnabled?: boolean
  remoteQueryParams: string
  onDeleteModalClose?: () => void
  onServiceDeleteSuccess?: () => void
}

const ServiceDeleteMenuItem: React.FC<ServiceDeleteMenuItemProps> = props => {
  const { identifier, name, isForceDeleteEnabled, remoteQueryParams, onServiceDeleteSuccess, onDeleteModalClose } =
    props
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<ModulePathParams & ProjectPathProps>()
  const { showSuccess, showError } = useToaster()
  const [customErrorMessage, setCustomErrorMessage] = useState<string | undefined>()
  const [hideReferencedByButton, setHideReferencedByButton] = useState(false)
  const history = useHistory()
  const { getRBACErrorMessage } = useRBACError()

  const { openDialog } = useConfirmationDialog({
    titleText: getString('common.deleteService'),
    contentText: getString('common.deleteServiceConfirmation', { name: name }),
    cancelButtonText: getString('cancel'),
    confirmButtonText: getString('confirm'),
    intent: Intent.DANGER,
    onCloseDialog: async isConfirmed => {
      if (isConfirmed) {
        deleteHandler(false)
      } else {
        onDeleteModalClose?.()
      }
    }
  })

  const redirectToReferencedBy = (): void => {
    history.push({
      pathname: routes.toServiceStudio({
        accountId,
        orgIdentifier,
        projectIdentifier,
        serviceId: identifier,
        module
      }),
      search: `tab=${ServiceTabs.REFERENCED_BY}${remoteQueryParams}`
    })
  }

  const { openDialog: openReferenceErrorDialog } = useEntityDeleteErrorHandlerDialog({
    entity: {
      type: ResourceType.SERVICE,
      name: defaultTo(name, '')
    },
    hideReferencedByButton,
    customErrorMessage,
    redirectToReferencedBy,
    forceDeleteCallback: () => deleteHandler(true)
  })

  const { mutate: deleteService } = useDeleteServiceV2({})

  const deleteHandler = async (forceDelete?: boolean): Promise<void> => {
    try {
      const response = await deleteService(identifier, {
        headers: { 'content-type': 'application/json' },
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          forceDelete
        }
      })
      if (response.status === 'SUCCESS') {
        showSuccess(getString('common.deleteServiceMessage'))
        onServiceDeleteSuccess?.()
      }
    } catch (err) {
      if (isForceDeleteEnabled) {
        if (err?.data?.code === 'ENTITY_REFERENCE_EXCEPTION') {
          setCustomErrorMessage(undefined)
          openReferenceErrorDialog()
        } else if (err?.data?.code === 'ACTIVE_SERVICE_INSTANCES_PRESENT_EXCEPTION') {
          setCustomErrorMessage(getErrorInfoFromErrorObject(err))
          setHideReferencedByButton(true)
          openReferenceErrorDialog()
        }
      } else {
        showError(getRBACErrorMessage(err))
      }
    }
  }

  const handleDelete = (e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    e.stopPropagation()
    openDialog()
  }

  return (
    <RbacMenuItem
      icon="trash"
      text={getString('delete')}
      onClick={handleDelete}
      permission={{
        resource: {
          resourceType: ResourceType.SERVICE,
          resourceIdentifier: defaultTo(identifier, '')
        },
        permission: PermissionIdentifier.DELETE_SERVICE
      }}
    />
  )
}

export default React.memo(ServiceDeleteMenuItem)
