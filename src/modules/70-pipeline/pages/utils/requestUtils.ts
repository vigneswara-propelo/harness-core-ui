/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { COMMON_DEFAULT_PAGE_SIZE } from '@common/constants/Pagination'
import { CommonPaginationQueryParams } from '@common/hooks/useDefaultPaginationProps'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { UseQueryParamsOptions, useQueryParamsOptions } from '@common/hooks/useQueryParams'
import { WebhookEventStatus } from '../webhooks/utils'

export interface EventsDateFilter {
  startTime: number
  endTime: number
}

export type WebhookEventsQueryParams = {
  dateFilter?: EventsDateFilter
  webhookIdentifier?: string
  eventId?: string
  eventStatus?: WebhookEventStatus[]
} & CommonPaginationQueryParams

export type WebhookEventsQueryParamsWithDefaults = RequiredPick<
  WebhookEventsQueryParams,
  'page' | 'size' | 'dateFilter'
>

export const WEBHOOK_EVENTS_PAGE_INDEX = 0
export const WEBHOOK_EVENTS_PAGE_SIZE = 20

export const useWebhookEventsQueryParamOptions = (): UseQueryParamsOptions<WebhookEventsQueryParamsWithDefaults> => {
  const { PL_NEW_PAGE_SIZE } = useFeatureFlags()

  const start = new Date()
  start.setDate(start.getDate() - 7)
  start.setHours(0, 0, 0, 0)
  const end = new Date()
  end.setHours(23, 59, 59, 999)

  return useQueryParamsOptions({
    page: WEBHOOK_EVENTS_PAGE_INDEX,
    size: PL_NEW_PAGE_SIZE ? COMMON_DEFAULT_PAGE_SIZE : WEBHOOK_EVENTS_PAGE_SIZE,
    dateFilter: {
      startTime: start.getTime(),
      endTime: end.getTime()
    }
  })
}
