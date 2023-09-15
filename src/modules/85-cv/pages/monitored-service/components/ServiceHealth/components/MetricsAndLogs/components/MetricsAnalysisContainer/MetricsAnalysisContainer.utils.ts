/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { cloneDeep } from 'lodash-es'
import type { MetricData, TimeSeriesMetricDataDTO } from 'services/cv'

const sortAnalysisData = (analysis: TimeSeriesMetricDataDTO): void => {
  if (analysis?.metricDataList) {
    analysis.metricDataList.sort((a: MetricData, b: MetricData) => {
      if (!a?.timestamp) {
        return b?.timestamp ? -1 : 0
      }
      if (!b?.timestamp) {
        return 1
      }
      return a.timestamp - b.timestamp
    })
  }
}

export const generatePointsForTimeSeries = (
  data: TimeSeriesMetricDataDTO[],
  startTime: number,
  endTime: number
): TimeSeriesMetricDataDTO[] => {
  const _data = cloneDeep(data)

  for (const metric of _data) {
    if (metric.metricDataList?.length) {
      sortAnalysisData(metric)

      const metricList = metric.metricDataList

      const firstMetricTimestamp = metricList[0].timestamp
      const lastMetricTimestamp = metricList[metricList.length - 1].timestamp

      if (firstMetricTimestamp && firstMetricTimestamp > startTime) {
        metricList.push({ timestamp: startTime })
      }

      if (lastMetricTimestamp && lastMetricTimestamp < endTime) {
        metricList.push({ timestamp: endTime })
      }

      metric.metricDataList = metricList
    }
  }

  return _data
}

export const roundOffToMilliseconds = (time: number) => {
  const roundedTime = time - (time % 1000)
  return roundedTime
}
