/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { TimelineDataPoint } from '../../TimelineRow.types'
import { SLO_WIDGETS } from '../../TimelineRow.constants'

export function getWidgetsGroupedByType(widgets: TimelineDataPoint[]): {
  widgetsWithDownTimeType: TimelineDataPoint[]
  widgetsWithAnnotationType: TimelineDataPoint[]
  widgetsWithImpactAnalysisType: TimelineDataPoint[]
} {
  const widgetsWithDownTimeType = []
  const widgetsWithAnnotationType = []
  const widgetsWithImpactAnalysisType = []
  for (const widget of widgets) {
    if (widget.type === SLO_WIDGETS.DOWNTIME) {
      widgetsWithDownTimeType.push(widget)
    } else if (widget.type === SLO_WIDGETS.ANNOTATION) {
      widgetsWithAnnotationType.push(widget)
    } else if (widget.type === SLO_WIDGETS.SRM_ANALYSIS_IMPACT) {
      widgetsWithImpactAnalysisType.push(widget)
    }
  }
  return { widgetsWithDownTimeType, widgetsWithAnnotationType, widgetsWithImpactAnalysisType }
}
