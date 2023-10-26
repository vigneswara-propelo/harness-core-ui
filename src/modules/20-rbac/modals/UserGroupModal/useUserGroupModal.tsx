/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useState } from 'react'
import { Dialog } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'

import type { UserGroupAggregateDTO } from 'services/cd-ng'
import UserGroupForm from '@rbac/modals/UserGroupModal/views/UserGroupForm'
import { useStrings } from 'framework/strings'
import type { ScopeAndIdentifier } from '@common/components/MultiSelectEntityReference/MultiSelectEntityReference'

export interface UseUserGroupModalProps {
  onSuccess: (data?: ScopeAndIdentifier) => void
  onCloseModal?: () => void
}

export interface UseUserGroupModalReturn {
  openUserGroupModal: (userGroupAggregate?: UserGroupAggregateDTO, _isAddMember?: boolean) => void
  closeUserGroupModal: () => void
}

export const useUserGroupModal = ({ onSuccess }: UseUserGroupModalProps): UseUserGroupModalReturn => {
  const [userGroupAggregateData, setUserGroupAggregateData] = useState<UserGroupAggregateDTO>()
  const [isAddMember, setIsAddMember] = useState<boolean>(false)
  const { getString } = useStrings()
  const getTitle = (): string => {
    if (!!userGroupAggregateData && !isAddMember) {
      return getString('rbac.userGroupPage.editUserGroup')
    }
    if (isAddMember) {
      return getString('rbac.userGroupPage.addMembers')
    }
    return getString('rbac.userGroupPage.newUserGroup')
  }

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog isOpen={true} enforceFocus={false} title={getTitle()} onClose={hideModal} canOutsideClickClose={false}>
        <UserGroupForm
          data={userGroupAggregateData}
          isEdit={!!userGroupAggregateData && !isAddMember}
          isAddMember={isAddMember}
          onSubmit={data => {
            onSuccess(data)
            hideModal()
          }}
          onCancel={hideModal}
        />
      </Dialog>
    ),
    [userGroupAggregateData, isAddMember, onSuccess]
  )
  const open = useCallback(
    (_userGroupAggregate?: UserGroupAggregateDTO, _isAddMember?: boolean) => {
      setUserGroupAggregateData(_userGroupAggregate)
      setIsAddMember(_isAddMember || false)
      showModal()
    },
    [showModal]
  )

  return {
    openUserGroupModal: (userGroupAggregate?: UserGroupAggregateDTO, _isAddMember?: boolean) =>
      open(userGroupAggregate, _isAddMember),
    closeUserGroupModal: hideModal
  }
}
