/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { noop } from 'lodash-es'
import { NotificationsHeader } from '@pipeline/components/Notifications/NotificationHeader'
import NotificationTable, {
  NotificationRulesItem as _NotificationRulesItem
} from '@pipeline/components/Notifications/NotificationTable'
import { Actions } from '@pipeline/components/Notifications/NotificationUtils'
import { FreezeWindowContext } from '@freeze-windows/components/FreezeWindowStudio/FreezeWindowContext/FreezeWindowContext'
import type { FreezeNotificationRules } from '@freeze-windows/types'
import { FreezeEvents } from './FreezeEvents'
import css from '@pipeline/components/PipelineStudio/PipelineNotifications/PipelineNotifications.module.scss'

const PAGE_SIZE = 10

export interface NotificationRulesItem {
  index: number
  notificationRules: FreezeNotificationRules
}

export const FreezeNotifications = () => {
  const {
    isReadOnly,
    state: { freezeObj }
  } = React.useContext(FreezeWindowContext)
  const [selectedNotificationTypeFilter, setSelectedNotificationTypeFilter] = useState<string | undefined>(undefined)
  const [page, setPage] = React.useState(0)
  // Freeze Object Notification rules
  const [initialNotificationRules, setInitialNotificationRules] = React.useState<FreezeNotificationRules[]>([])
  // Notification component rules
  const [notificationRulesInState, setNotificationRulesInState] = React.useState<FreezeNotificationRules[]>(
    initialNotificationRules || []
  )

  React.useEffect(() => {
    setInitialNotificationRules((freezeObj.notificationRules || []) as FreezeNotificationRules[])
    setNotificationRulesInState((freezeObj.notificationRules || []) as FreezeNotificationRules[])
  }, [freezeObj.notificationRules])

  const allRowsData: NotificationRulesItem[] = (notificationRulesInState || []).map(
    (notificationRules: FreezeNotificationRules, index: number) => ({
      index,
      notificationRules
    })
  )

  // filter table data
  let data = allRowsData
  if (selectedNotificationTypeFilter) {
    data = allRowsData.filter(
      item => item.notificationRules.notificationMethod?.type === selectedNotificationTypeFilter
    )
  }

  return (
    <>
      <NotificationsHeader
        isReadonly={isReadOnly}
        applyChanges={noop}
        discardChanges={noop}
        name={freezeObj.name as string}
        isUpdated={false} // todo implement
      />
      <div className={css.pipelineNotifications}>
        <NotificationTable
          // getExistingNotificationNames
          data={data.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)}
          onUpdate={(notificationItem?: _NotificationRulesItem, action?: Actions, closeModal?: () => void) => {
            const index = notificationItem?.index
            const notification: FreezeNotificationRules = notificationItem?.notificationRules as FreezeNotificationRules

            if (action === Actions.Delete) {
              setNotificationRulesInState((notificationRules: FreezeNotificationRules[]) => {
                notificationRules?.splice(index || 0, 1)
                return [...notificationRules]
              })
            } else if (action === Actions.Added && notification) {
              setNotificationRulesInState((notificationRules: FreezeNotificationRules[]) => {
                notification.enabled = true
                return [notification, ...notificationRules]
              })
              closeModal?.()
            } else if (action === Actions.Update && notification) {
              setNotificationRulesInState(notificationRules => {
                notificationRules?.splice(index || 0, 1, notification)
                return [...notificationRules]
              })
              closeModal?.()
            }
          }}
          filterType={selectedNotificationTypeFilter}
          onFilterType={type => {
            setSelectedNotificationTypeFilter(type)
          }}
          gotoPage={index => {
            setPage(index)
          }}
          totalItems={data.length}
          totalPages={Math.ceil(data.length / PAGE_SIZE)}
          pageItemCount={PAGE_SIZE}
          pageSize={PAGE_SIZE}
          pageIndex={page}
          isReadonly={isReadOnly}
          EventsTabComponent={FreezeEvents}
        />
      </div>
    </>
  )
}
