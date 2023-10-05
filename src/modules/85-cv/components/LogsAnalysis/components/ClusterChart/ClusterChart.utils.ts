/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type Highcharts from 'highcharts'
import type { LogAnalysisClusterChartDTO } from 'services/cv'
import { RiskValues, getRiskColorValue, getSecondaryRiskColorValue } from '@cv/utils/CommonUtils'
import type { UseStringsReturn } from 'framework/strings'

export const mapRisk = (risk: LogAnalysisClusterChartDTO['risk']): Highcharts.PointOptionsObject => {
  switch (risk) {
    case RiskValues.HEALTHY:
      return {
        color: getSecondaryRiskColorValue(RiskValues.HEALTHY),
        marker: {
          lineWidth: 1,
          lineColor: getRiskColorValue(RiskValues.HEALTHY),
          radius: 8
        }
      }
    case RiskValues.NEED_ATTENTION:
      return {
        color: getSecondaryRiskColorValue(RiskValues.NEED_ATTENTION),
        marker: {
          lineWidth: 1,
          lineColor: getRiskColorValue(RiskValues.NEED_ATTENTION),
          radius: 8
        }
      }
    case RiskValues.UNHEALTHY:
      return {
        color: getSecondaryRiskColorValue(RiskValues.UNHEALTHY),
        marker: {
          lineWidth: 1,
          lineColor: getRiskColorValue(RiskValues.UNHEALTHY),
          radius: 8
        }
      }
    case RiskValues.OBSERVE:
      return {
        color: getSecondaryRiskColorValue(RiskValues.OBSERVE),
        marker: {
          lineWidth: 1,
          lineColor: getRiskColorValue(RiskValues.OBSERVE),
          radius: 8
        }
      }
    default:
      return {}
  }
}

export const chartOptions = (series: Highcharts.SeriesScatterOptions[], getString: UseStringsReturn['getString']) => {
  return {
    chart: {
      renderTo: 'chart',
      height: 120
    },
    credits: {
      enabled: false
    },
    title: {
      text: undefined
    },
    yAxis: {
      lineWidth: 0,
      tickLength: 0,
      gridLineWidth: 0,
      labels: { enabled: false },
      title: {
        enabled: false
      }
    },
    xAxis: {
      lineWidth: 0,
      tickLength: 0,
      gridLineWidth: 0,
      labels: { enabled: false },
      title: {
        enabled: false
      }
    },
    legend: {
      enabled: false
    },
    series,
    tooltip: {
      formatter: function (this: any): any {
        return `
        <p><strong>${getString('message')}: </strong>${this?.point?.message}</p></br>${
          this?.point?.hostname ? `<p><strong>${getString('common.node')}: </strong> ${this.point.hostname}</p>` : ''
        }
        `
      },
      style: {
        textOverflow: 'ellipsis'
      }
    }
  }
}
