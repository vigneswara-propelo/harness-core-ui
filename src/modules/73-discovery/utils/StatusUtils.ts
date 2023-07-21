/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color } from '@harness/design-system'
import type { DatabaseDelegateTaskStatus } from 'services/servicediscovery'

export enum DAgentTaskStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  ERROR = 'ERROR',
  PROCESSED = 'PROCESSED'
}

export const useDAgentStatusColorValue = (status?: DatabaseDelegateTaskStatus): string => {
  switch (status) {
    case DAgentTaskStatus.SUCCESS:
      return Color.GREEN_50
    case DAgentTaskStatus.FAILED:
      return Color.RED_50
    case DAgentTaskStatus.ERROR:
      return Color.ORANGE_50
    case DAgentTaskStatus.PROCESSED:
      return Color.YELLOW_100
    default:
      return Color.GREY_50
  }
}

export const useDAgentStatusTextColor = (status?: DatabaseDelegateTaskStatus): string => {
  switch (status) {
    case DAgentTaskStatus.SUCCESS:
      return Color.GREEN_700
    case DAgentTaskStatus.FAILED:
      return Color.RED_700
    case DAgentTaskStatus.ERROR:
      return Color.ORANGE_700
    case DAgentTaskStatus.PROCESSED:
      return Color.YELLOW_700
    default:
      return Color.GREY_700
  }
}
