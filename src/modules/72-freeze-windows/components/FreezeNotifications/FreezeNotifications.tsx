/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { noop } from 'lodash-es'
import { NotificationsHeader } from '@pipeline/components/Notifications/NotificationHeader'
import { FreezeWindowContext } from '@freeze-windows/components/FreezeWindowStudio/FreezeWindowContext/FreezeWindowContext'
import NotificationTable from '@pipeline/components/Notifications/NotificationTable'
import css from '@pipeline/components/PipelineStudio/PipelineNotifications/PipelineNotifications.module.scss'

const PAGE_SIZE = 10

export const FreezeNotifications = () => {
  const {
    isReadOnly,
    state: { freezeObj }
  } = React.useContext(FreezeWindowContext)
  const [selectedNotificationTypeFilter, setSelectedNotificationTypeFilter] = useState<string | undefined>(undefined)
  const [page, setPage] = React.useState(0)
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
          data={[]}
          onUpdate={noop}
          filterType={selectedNotificationTypeFilter}
          onFilterType={type => {
            setSelectedNotificationTypeFilter(type)
          }}
          gotoPage={index => {
            setPage(index)
          }}
          totalItems={100}
          totalPages={10}
          pageItemCount={PAGE_SIZE}
          pageSize={PAGE_SIZE}
          pageIndex={page}
          isReadonly={isReadOnly}
        />
      </div>
    </>
  )
}
