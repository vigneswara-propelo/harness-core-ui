/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type * as Yup from 'yup'
import type { SettingDTO } from 'services/cd-ng'
import type { SettingType } from '@common/constants/Utils'
export type SettingCategory = SettingDTO['category']
export enum SettingGroups {
  test_group_2 = 'test_group_2',
  PERSPECTIVES_PREFERENCES = 'perspectives_preferences',
  TICKETING_PREFERENCES = 'ticketing_preferences',
  SLACK_NOTIFICATION_SETTINGS_GROUP = 'slack_notification_settings',
  MSTEAM_NOTIFICATION_SETTINGS_GROUP = 'msTeam_notification_settings',
  WEBHOOK_NOTIFICATION_SETTINGS_GROUP = 'webhook_notification_settings',
  STO_DEFAULT_BASELINE_REGEX = 'sto_default_baseline_regex',
  PAGERDUTY_NOTIFICATION_SETTINGS_GROUP = 'pagerduty_notification_settings'
}
export type YupValidation =
  | Yup.BooleanSchema
  | Yup.StringSchema
  | Yup.DateSchema
  | Yup.MixedSchema<any>
  | Yup.NumberSchema
export type SettingYupValidation = {
  [Key in SettingType]?: YupValidation
}
