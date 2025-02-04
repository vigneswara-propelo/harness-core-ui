/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { MultiSelectOption, SelectOption } from '@harness/uicore'
import type { NotificationRule } from '../../NotificationsContainer.types'

export type FieldValueType = SelectOption | MultiSelectOption[] | string

export type MoreFieldsType = Record<string, FieldValueType | undefined>

export interface NotificationRuleRowProps {
  notificationRule: NotificationRule
  showDeleteNotificationsIcon: boolean
  handleChangeField: (
    notificationRule: NotificationRule,
    currentFieldValue: FieldValueType,
    currentField: string,
    moreFields?: MoreFieldsType
  ) => void
  handleDeleteNotificationRule: (id: string) => void
  index: number
  isCompositeRequestBasedSLO?: boolean
}
