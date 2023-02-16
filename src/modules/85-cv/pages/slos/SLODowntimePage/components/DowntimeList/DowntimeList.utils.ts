/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { UseStringsReturn } from 'framework/strings'
import type { DowntimeDuration, DowntimeRecurrence, DowntimeStatusDetails } from 'services/cv'
import { DowntimeStatus } from '../../SLODowntimePage.types'

export const getIsSetPreviousPage = (pageIndex: number, pageItemCount: number): boolean => {
  return Boolean(pageIndex) && pageItemCount === 1
}

export const getDuration = (getString: UseStringsReturn['getString'], duration?: DowntimeDuration): string => {
  const { durationValue, durationType } = duration || {}
  switch (durationType) {
    case 'Weeks':
      return durationValue === 1 ? getString('cv.sloDowntime.oneWeek') : `${durationValue} ${getString('cv.weeks')}`
    case 'Days':
      return durationValue === 1
        ? getString('cv.serviceDashboardPage.oneDay')
        : `${durationValue} ${getString('cv.days')}`
    case 'Hours':
      return durationValue === 1
        ? getString('cv.serviceDashboardPage.oneHour')
        : `${durationValue} ${getString('hours')}`
    case 'Minutes':
      return durationValue === 1 ? getString('cv.sloDowntime.oneMinute') : `${durationValue} ${getString('cv.minutes')}`
    default:
      return `30 ${getString('cv.minutes')}`
  }
}

export const getRecurrenceType = (
  downtimeRecurrence: DowntimeRecurrence,
  getString: UseStringsReturn['getString']
): string => {
  const { recurrenceValue, recurrenceType } = downtimeRecurrence
  switch (recurrenceType) {
    case 'Day':
      return recurrenceValue === 1 ? getString('cv.day') : `${recurrenceValue} ${getString('cv.days')}`
    case 'Week':
      return recurrenceValue === 1 ? getString('cv.week') : `${recurrenceValue} ${getString('cv.weeks')}`
    case 'Month':
      return recurrenceValue === 1 ? getString('cv.month') : `${recurrenceValue} ${getString('cv.months')}`
    default:
      return getString('cv.week')
  }
}

export const getDowntimeStatusLabel = (
  getString: UseStringsReturn['getString'],
  status?: DowntimeStatusDetails['status']
): string => {
  switch (status) {
    case DowntimeStatus.ACTIVE:
      return getString('active')
    case DowntimeStatus.SCHEDULED:
    default:
      return getString('triggers.scheduledLabel').replace(/'/g, '')
  }
}
