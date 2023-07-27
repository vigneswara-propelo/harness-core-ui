/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getColorForChangeEventType } from '@cv/components/ChangeTimeline/ChangeTimeline.utils'
import { ColumnChartProps } from '@cv/components/ColumnChart/ColumnChart.types'
import { ChangeSourceTypes } from '@cv/pages/ChangeSource/ChangeSourceDrawer/ChangeSourceDrawer.constants'
import { ChangeEventDTO } from 'services/cv'
import { TWO_HOURS_IN_MILLISECONDS } from './ChangeEventServiceHealth.constants'

export const getMarkerProps = (
  eventType: ChangeEventDTO['type'],
  propsStartTime: number,
  propsEndTime?: number,
  eventEndTime?: number,
  eventStatus?: string
): {
  multiTimeStampMarker?: ColumnChartProps['multiTimeStampMarker']
  timestampMarker?: ColumnChartProps['timestampMarker']
} => {
  return eventType === ChangeSourceTypes.DeploymentImpactAnalysis
    ? {
        multiTimeStampMarker: {
          markerStartTime: {
            timestamp: (propsStartTime + TWO_HOURS_IN_MILLISECONDS) as number,
            color: getColorForChangeEventType(eventType)
          },
          markerEndTime: {
            timestamp: propsEndTime as number,
            color: getColorForChangeEventType(eventType)
          },
          eventEndTime,
          eventStatus
        }
      }
    : {
        timestampMarker: {
          timestamp: propsStartTime as number,
          color: getColorForChangeEventType(eventType)
        }
      }
}
