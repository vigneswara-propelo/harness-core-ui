/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { get } from 'lodash-es'
import type { CreateIpAllowlistConfigProps, UpdateIpAllowlistConfigProps } from '@harnessio/react-ng-manager-client'

import type { IIPAllowlistForm } from '@auth-settings/interfaces/IPAllowlistInterface'
import { SourceType } from '@auth-settings/interfaces/IPAllowlistInterface'
import { CurrencyType } from '@common/constants/SubscriptionTypes'

export function getAmountInCurrency(currency: CurrencyType, amount: number): string {
  switch (currency) {
    case CurrencyType.USD: {
      return amount.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD'
      })
    }
  }

  return ''
}

// dividing the actual amount by 100 as amount numbers are in cents
export function getDollarAmount(amount?: number, isYearly?: boolean): number {
  if (isYearly) {
    return (amount || 0) / 1200
  }
  return (amount || 0) / 100
}

export const getErrorMessage = (error: any): string =>
  get(error, 'data.error', get(error, 'data.message', error?.message))

export const buildCreateIPAllowlistPayload = (data: IIPAllowlistForm): CreateIpAllowlistConfigProps => {
  const allowSourceType = []
  if (data.allowSourceTypeUI) {
    allowSourceType.push(SourceType.UI)
  }
  if (data.allowSourceTypeAPI) {
    allowSourceType.push(SourceType.API)
  }
  return {
    body: {
      ip_allowlist_config: {
        allowed_source_type: allowSourceType,
        description: data?.description,
        enabled: false, // always false while creating
        identifier: data.identifier,
        ip_address: data.ipAddress,
        name: data.name,
        tags: data?.tags
      }
    }
  }
}

export const buildUpdateIPAllowlistPayload = (
  data: IIPAllowlistForm,
  overrideFields?: any
): UpdateIpAllowlistConfigProps => {
  const allowSourceType = []
  if (data.allowSourceTypeUI) {
    allowSourceType.push(SourceType.UI)
  }
  if (data.allowSourceTypeAPI) {
    allowSourceType.push(SourceType.API)
  }
  return {
    'ip-config-identifier': data.identifier,
    body: {
      ip_allowlist_config: {
        allowed_source_type: allowSourceType,
        description: data?.description,
        enabled: data?.enabled,
        identifier: data.identifier,
        ip_address: data.ipAddress,
        name: data.name,
        tags: data?.tags,
        ...overrideFields
      }
    }
  }
}

/**
 * Converts minutes to higher dimensions of time such as months, days and hours
 *
 * Examples:
 * formatMinutesToHigherDimensions(150);    // Output: "2 hours 30 minutes"
 * formatMinutesToHigherDimensions(4320);   // Output: "3 days"
 * formatMinutesToHigherDimensions(45000);  // Output: "1 month 1 day 6 hours"
 * @param minutes
 * @returns a string in higher dimensions
 */
export const formatMinutesToHigherDimensions = (minutes: number | undefined): string => {
  if (minutes === undefined || minutes < 0) {
    return 'Invalid input'
  }

  const MINUTES_IN_AN_HOUR = 60
  const HOURS_IN_A_DAY = 24
  const DAYS_IN_A_MONTH = 30

  const result = []

  if (minutes >= MINUTES_IN_AN_HOUR * HOURS_IN_A_DAY * DAYS_IN_A_MONTH) {
    const months = Math.floor(minutes / (MINUTES_IN_AN_HOUR * HOURS_IN_A_DAY * DAYS_IN_A_MONTH))
    result.push(`${months} month${months > 1 ? 's' : ''}`)
    minutes %= MINUTES_IN_AN_HOUR * HOURS_IN_A_DAY * DAYS_IN_A_MONTH
  }

  if (minutes >= MINUTES_IN_AN_HOUR * HOURS_IN_A_DAY) {
    const days = Math.floor(minutes / (MINUTES_IN_AN_HOUR * HOURS_IN_A_DAY))
    result.push(`${days} day${days > 1 ? 's' : ''}`)
    minutes %= MINUTES_IN_AN_HOUR * HOURS_IN_A_DAY
  }

  if (minutes >= MINUTES_IN_AN_HOUR) {
    const hours = Math.floor(minutes / MINUTES_IN_AN_HOUR)
    result.push(`${hours} hour${hours > 1 ? 's' : ''}`)
    minutes %= MINUTES_IN_AN_HOUR
  }

  if (minutes > 0) {
    result.push(`${minutes} minute${minutes > 1 ? 's' : ''}`)
  }

  return result.join(' ')
}
