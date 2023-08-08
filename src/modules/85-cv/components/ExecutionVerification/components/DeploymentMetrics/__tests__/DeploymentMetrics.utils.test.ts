/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  dateDetailsMock,
  expetedPointsData,
  metricDataMock,
  selectedDateFormatMock,
  transformMetricsExpectedResult
} from './DeploymentMetrics.mock'
import { getIsDataOccursWithinGivenDuration, transformMetricData } from '../DeploymentMetrics.utils'
import {
  InputData,
  startTimestampDataMock
} from '../components/DeploymentMetricsAnalysisRow/tests/DeploymentMetricsAnalysisRow.mocks'

describe('Unit tests for DeploymentMetrics utils', () => {
  test('Ensure transformMetricData works correctly', async () => {
    const metricData = {
      content: InputData
    }
    expect(transformMetricData(selectedDateFormatMock, startTimestampDataMock, metricData)).toEqual(
      transformMetricsExpectedResult
    )
  })

  test('Should check only points within the given duration alone must be included for the metrics chart', async () => {
    expect(transformMetricData(selectedDateFormatMock, dateDetailsMock, metricDataMock)).toEqual(expetedPointsData)
  })

  test('should check getIsDataOccursWithinGivenDuration return true when the timestamp value of the point occured within the given duration', () => {
    expect(getIsDataOccursWithinGivenDuration(1, 30000)).toBe(true)
  })
  test('should check getIsDataOccursWithinGivenDuration return false when the timestamp value of the point occured beyond the given duration', () => {
    expect(getIsDataOccursWithinGivenDuration(1, 120000)).toBe(false)
  })
})
