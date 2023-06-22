/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { TooltipOptions } from 'highcharts'
import type { StringKeys } from 'framework/strings'
import {
  controlDataMock,
  expectedChartConfigData,
  seriesMock,
  startTimestampDataMock,
  testDataMock
} from './DeploymentMetricsAnalysisRow.mocks'
import { chartsConfig } from '../DeeploymentMetricsChartConfig'

describe('DeploymentMetricsChartConfig', () => {
  test('it should give correct return data for chartsConfig', () => {
    const getString = (key: StringKeys): string => key

    // eslint-disable-next-line
    // @ts-ignore
    const chartConfigData = chartsConfig(seriesMock, 312.5806451612903, testDataMock, controlDataMock, getString)

    expect(chartConfigData).toEqual(expectedChartConfigData)
  })

  test('it should give correct tooltip data', () => {
    const getString = (key: StringKeys): string => key

    const { tooltip } = chartsConfig(
      // eslint-disable-next-line
      // @ts-ignore
      seriesMock,
      312.5806451612903,
      testDataMock,
      controlDataMock,
      getString,
      startTimestampDataMock
    )

    // eslint-disable-next-line
    // @ts-ignore
    const tooltipResult = tooltip?.formatter?.call({ points: [{ point: { index: 1 }, x: 0 }] }, null)

    expect(tooltipResult).toMatch(/81.25/)
    expect(tooltipResult).toMatch(/456.6667/)
  })

  test('it should give correct tooltip data when different length of data is passed', () => {
    const getString = (key: StringKeys): string => key

    const controlDataMockLocal = {
      points: [
        { x: 1642941960000, y: 456.6666666666667 },
        { x: 1642942020000, y: 10 },
        { x: 1642942080000, y: 466.6666666666667 }
      ],
      risk: 'HEALTHY',
      name: 'control host name'
    }

    const { tooltip } = chartsConfig(
      // eslint-disable-next-line
      // @ts-ignore
      seriesMock,
      312.5806451612903,
      testDataMock,
      controlDataMockLocal,
      getString,
      startTimestampDataMock
    )

    // eslint-disable-next-line
    // @ts-ignore
    const tooltipResult = tooltip?.formatter?.call({ points: [{ point: { index: 3 }, x: 180000 }] }, null)

    expect(tooltipResult).toMatch(/75.75/)
    expect(tooltipResult).toMatch(/noData/)
  })

  test('should provide correct config for simple verification', () => {
    const getString = (key: StringKeys): string => key

    const controlDataMockLocal = {
      points: [
        { x: 1642941960000, y: 456.6666666666667 },
        { x: 1642942020000, y: 10 },
        { x: 1642942080000, y: 466.6666666666667 }
      ],
      risk: 'HEALTHY',
      name: 'control host name'
    }

    const { tooltip } = chartsConfig(
      // eslint-disable-next-line
      // @ts-ignore
      seriesMock,
      312.5806451612903,
      testDataMock,
      controlDataMockLocal,
      getString,
      startTimestampDataMock,
      true
    )

    const { className } = tooltip as TooltipOptions

    expect(className).toBe('metricsGraph_tooltip_onlyTestData')

    // eslint-disable-next-line
    // @ts-ignore
    const tooltipResult = tooltip?.formatter?.call({ points: [{ point: { index: 3 }, x: 180000 }] }, null)

    expect(tooltipResult).toMatch(/valueLabel/)
  })
})
