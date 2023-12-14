/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { UseStringsReturn } from 'framework/strings'
import { LogEvents } from '../../LogAnalysis.types'

export const getEventTypeFromClusterType = (
  tag: LogEvents,
  getString: UseStringsReturn['getString'],
  fullName = false
): string => {
  switch (tag) {
    case LogEvents.KNOWN:
      return 'Known'
    case LogEvents.UNKNOWN:
      return 'Unknown'
    case LogEvents.UNEXPECTED:
      return fullName ? getString('cv.unexpectedFrequency') : 'Unexpected'
    case LogEvents.NO_BASELINE_AVAILABLE:
      return getString('newLabel')
    default:
      return ''
  }
}

export const isNoLogSelected = (selectedLog?: string | null): boolean =>
  selectedLog === null || typeof selectedLog === 'undefined'
