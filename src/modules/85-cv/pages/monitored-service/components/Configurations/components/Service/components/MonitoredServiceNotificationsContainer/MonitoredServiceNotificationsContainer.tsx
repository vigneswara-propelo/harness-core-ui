/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import {
  NotificationRuleCondition,
  NotificationRuleRefDTO,
  NotificationRuleResponse,
  useGetNotificationRulesForMonitoredService
} from 'services/cv'
import { NOTIFICATIONS_PAGE_SIZE } from '@cv/components/Notifications/NotificationsContainer.constants'
import {
  Condition,
  EventType
} from '@cv/components/Notifications/components/ConfigureMonitoredServiceAlertConditions/ConfigureMonitoredServiceAlertConditions.constants'
import MonitoredServiceNotifications from './MonitoredServiceNotifications'

interface MonitoredServiceNotificationsProps {
  notificationRuleRefs?: NotificationRuleRefDTO[]
  setFieldValue: (field: string, value: any) => void
  identifier: string
}

export default function MonitoredServiceNotificationsContainer(props: MonitoredServiceNotificationsProps): JSX.Element {
  const { setFieldValue, identifier } = props
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [page, setPage] = useState(0)
  const [notificationsTableData, setNotificationsTableData] = useState<NotificationRuleResponse[]>([])

  const {
    data,
    loading,
    error,
    refetch: getNotifications
  } = useGetNotificationRulesForMonitoredService({
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier,
      pageNumber: page,
      pageSize: NOTIFICATIONS_PAGE_SIZE
    },
    identifier,
    lazy: true
  })

  useEffect(() => {
    if (identifier) {
      getNotifications()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identifier])

  useEffect(() => {
    // backwards compatibility - forcefully remove TimeoutErrors event type for Code Errors condition
    if (!data?.data?.content) {
      return
    }
    const notificationRuleResponseArray = [...data.data.content]
    notificationRuleResponseArray?.forEach((notificationRuleResponse: NotificationRuleResponse) => {
      notificationRuleResponse.notificationRule.conditions.forEach((condition: NotificationRuleCondition) => {
        if (condition.type === Condition.CODE_ERRORS) {
          const timeoutErrorsIndex = condition.spec.errorTrackingEventTypes.indexOf(EventType.TIMEOUT_ERRORS)
          if (timeoutErrorsIndex !== -1) {
            condition.spec.errorTrackingEventTypes.splice(timeoutErrorsIndex, 1)
          }
        }
      })
    })
    setNotificationsTableData(notificationRuleResponseArray)
  }, [data])

  return (
    <MonitoredServiceNotifications
      setFieldValue={setFieldValue}
      initialNotificationsTableData={notificationsTableData}
      setPage={setPage}
      page={page}
      loading={loading}
      error={error}
      getNotifications={getNotifications}
    />
  )
}
