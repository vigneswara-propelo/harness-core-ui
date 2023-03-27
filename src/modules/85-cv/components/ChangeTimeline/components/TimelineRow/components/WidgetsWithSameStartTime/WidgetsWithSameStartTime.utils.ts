import type { TimelineDataPoint } from '../../TimelineRow.types'
import { SLO_WIDGETS } from '../../TimelineRow.constants'

export function getWidgetsGroupedByType(widgets: TimelineDataPoint[]): {
  widgetsWithDownTimeType: TimelineDataPoint[]
  widgetsWithAnnotationType: TimelineDataPoint[]
} {
  const widgetsWithDownTimeType = []
  const widgetsWithAnnotationType = []
  for (const widget of widgets) {
    if (widget.type === SLO_WIDGETS.DOWNTIME) {
      widgetsWithDownTimeType.push(widget)
    } else if (widget.type === SLO_WIDGETS.ANNOTATION) {
      widgetsWithAnnotationType.push(widget)
    }
  }
  return { widgetsWithDownTimeType, widgetsWithAnnotationType }
}
