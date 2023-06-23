/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { RestResponseListMetricPackDTO } from 'services/cv'
import { getMetricData } from '../MetricPackCustom.utils'
import { metricPackValue, metricPacks } from './HealthSources.mock'

describe('Validate MetricPackCustom utils', () => {
  test('should validate getMetricData', () => {
    const createModeWithMetricPack = getMetricData({
      isEdit: false,
      metricPackValue,
      metricPacks: metricPacks as RestResponseListMetricPackDTO
    })
    expect(createModeWithMetricPack).toEqual({ Performance: true })
    const editModeWithMetricPack = getMetricData({
      isEdit: true,
      metricPackValue,
      metricPacks: metricPacks as RestResponseListMetricPackDTO
    })
    expect(editModeWithMetricPack).toEqual({ Performance: true })
    const createModeWithoutMetricPack = getMetricData({
      isEdit: false,
      metricPackValue: [],
      metricPacks: metricPacks as RestResponseListMetricPackDTO
    })
    expect(createModeWithoutMetricPack).toEqual({ Performance: true, Infrastructure: true })
    const editModeWithoutMetricPack = getMetricData({
      isEdit: true,
      metricPackValue: [],
      metricPacks: metricPacks as RestResponseListMetricPackDTO
    })
    expect(editModeWithoutMetricPack).toEqual({})
    const noMetricPacks = getMetricData({
      isEdit: true,
      metricPackValue: [],
      metricPacks: null
    })
    expect(noMetricPacks).toEqual({})
  })
})
