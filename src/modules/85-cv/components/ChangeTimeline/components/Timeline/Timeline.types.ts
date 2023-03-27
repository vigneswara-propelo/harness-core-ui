/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SecondaryEventsResponse } from 'services/cv'
import type { AnnotationMessage } from '../TimelineRow/components/Annotation/Annotation.types'
import type { TimelineRowProps } from '../TimelineRow/TimelineRow.types'
export interface TimelineProps {
  timelineRows: Omit<TimelineRowProps, 'labelWidth'>[]
  labelWidth?: number
  timestamps?: number[]
  isLoading?: boolean
  rowOffset?: number
  hideTimeline?: boolean
  addAnnotation?: (annotationMessage?: AnnotationMessage) => void
  sloWidgetsData?: SecondaryEventsResponse[]
  sloWidgetsDataLoading?: boolean
  fetchSecondaryEvents?: () => Promise<void>
  isSLOChartTimeline?: boolean
}
