/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import moment from 'moment'
import type { PointOptionsObject } from 'highcharts'
import { getRiskColorValue, getSecondaryRiskColorValue } from '@cv/utils/CommonUtils'
import type { UseStringsReturn } from 'framework/strings'
import type { HostControlTestData, HostTestData } from './DeploymentMetricsAnalysisRow.constants'
import type { DeploymentMetricsAnalysisRowChartSeries } from './DeploymentMetricsAnalysisRow.types'
import type { StartTimestampDataType } from '../../DeploymentMetrics.types'

const getPointIndex = (hoveredXValue: number, points?: PointOptionsObject[]): number | null => {
  if (!points) {
    return null
  }

  let foundIndex = null

  const isPointWithSameValueExists = points.some((point, index) => {
    if (point.x === hoveredXValue) {
      foundIndex = index
    }

    return point.x === hoveredXValue
  })

  return isPointWithSameValueExists ? foundIndex : null
}

const getControlDataTooltipData = ({
  baseDataTimestamp,
  baseDataDisplayValue,
  getString,
  isSimpleVerification
}: {
  baseDataTimestamp: string
  baseDataDisplayValue: string
  getString: UseStringsReturn['getString']
  isSimpleVerification?: boolean
}): string => {
  if (isSimpleVerification) {
    return ''
  }

  return ` <div style="margin-bottom: var(--spacing-xsmall); color: var(--grey-350)">${baseDataTimestamp}</div>
  <div class="sectionParent"> 
  <div class="riskIndicator" style="border: 1px solid var(--primary-7);background: var(--primary-2); margin:0 10px 0 4px"></div> 
  <p><span style="color: var(--grey-350)">${getString(
    'pipeline.verification.controlData'
  )}:</span><span style="color: var(--white); margin-left: var(--spacing-small)" >${baseDataDisplayValue}</span></p>
  </div>`
}

export function chartsConfig(
  series: DeploymentMetricsAnalysisRowChartSeries[],
  width: number,
  testData: HostTestData | undefined,
  controlData: HostControlTestData | undefined,
  getString: UseStringsReturn['getString'],
  startTimestampData?: StartTimestampDataType,
  isSimpleVerification?: boolean
): Highcharts.Options {
  return {
    chart: {
      height: 120,
      width,
      type: 'spline',
      backgroundColor: '#f8f8fe'
    },
    credits: undefined,
    title: {
      text: ''
    },
    legend: {
      enabled: false
    },
    xAxis: {
      tickLength: 0,
      labels: {
        enabled: false
      },
      crosshair: {
        width: 1,
        color: 'var(--primary-9-dark)'
      }
    },
    yAxis: {
      gridLineWidth: 0,
      labels: {
        enabled: false
      },
      title: {
        text: ''
      }
    },
    plotOptions: {
      series: {
        stickyTracking: false,
        lineWidth: 3,
        turboThreshold: 50000,
        states: {
          inactive: {
            opacity: 1
          }
        }
      }
    },
    tooltip: {
      formatter: function tooltipFormatter(): string {
        const { controlDataStartTimestamp, testDataStartTimestamp } = startTimestampData || {}

        // eslint-disable-next-line
        // @ts-ignore
        const hoveredXValue = this.points[0]?.x

        const controlHostHoveredPointIndex = getPointIndex(hoveredXValue, controlData?.points as PointOptionsObject[])
        const testHostHoveredPointIndex = getPointIndex(hoveredXValue, testData?.points as PointOptionsObject[])

        // eslint-disable-next-line
        // @ts-ignore
        const baseDataValue = controlData?.points[controlHostHoveredPointIndex]?.y
        // eslint-disable-next-line
        // @ts-ignore
        const testDataValue = testData?.points[testHostHoveredPointIndex]?.y

        // to show "No data" text when the y axis value is null
        const baseDataDisplayValue = baseDataValue?.toFixed(4) ?? getString('noData')
        const testDataDisplayValue = testDataValue?.toFixed(4) ?? getString('noData')

        // eslint-disable-next-line
        // @ts-ignore
        const baseDataTime = controlData?.points[controlHostHoveredPointIndex]?.x + controlDataStartTimestamp
        const baseDataTimestamp = baseDataTime ? moment(baseDataTime).format('lll') : getString('noData')

        // eslint-disable-next-line
        // @ts-ignore
        const testeDataTime = testData?.points[testHostHoveredPointIndex]?.x + testDataStartTimestamp
        const testDataTimestamp = testeDataTime ? moment(testeDataTime).format('lll') : getString('noData')

        const testDataLabel = isSimpleVerification
          ? getString('valueLabel')
          : getString('pipeline.verification.testData')

        return `
        <div style="margin-bottom: var(--spacing-xsmall); color: var(--grey-350)">${testDataTimestamp}</div>
        <div class="sectionParent" style="margin-top: 4px">
        <div class="riskIndicator" style="border: 1px solid ${getRiskColorValue(
          testData?.risk
        )};background: ${getSecondaryRiskColorValue(testData?.risk)}; margin:0 10px 0 4px"></div>
        <div>
        <p><span style="color: var(--grey-350)">${testDataLabel}:</span><span style="color: var(--white); margin-left: var(--spacing-small)">${testDataDisplayValue}</span></p>
        </div>
        </div>      
        ${getControlDataTooltipData({ baseDataDisplayValue, baseDataTimestamp, getString, isSimpleVerification })}`
      },
      positioner: (_, __, point) => {
        const { plotX } = point || {}
        let xPosition = plotX - 100
        if (xPosition > 700) {
          xPosition = plotX - 200
        } else if (xPosition < 30) {
          xPosition = xPosition + 100
        }
        return {
          x: xPosition,
          y: -70
        }
      },
      useHTML: true,
      outside: false,
      className: isSimpleVerification ? 'metricsGraph_tooltip_onlyTestData' : 'metricsGraph_tooltip',
      shared: true
    },
    subtitle: undefined,
    series
  }
}
