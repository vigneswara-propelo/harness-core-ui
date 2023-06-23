/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { MetricPackDTO, RestResponseListMetricPackDTO } from 'services/cv'

interface GetMetricDataArgs {
  metricPacks: RestResponseListMetricPackDTO | null
  metricPackValue?: MetricPackDTO[]
  isEdit: boolean
}
export const getMetricData = ({
  metricPacks,
  metricPackValue,
  isEdit
}: GetMetricDataArgs): { [key: string]: boolean } => {
  const metricData: { [key: string]: boolean } = {}
  let metricList: MetricPackDTO[] = []
  const hasMetricPackValue = metricPackValue && metricPackValue.length
  if (isEdit) {
    if (hasMetricPackValue) {
      metricList = metricPackValue
    }
  } else {
    if (hasMetricPackValue) {
      metricList = metricPackValue
    } else if (metricPacks && metricPacks.resource) {
      metricList = metricPacks.resource
    }
  }

  metricList.forEach((i: MetricPackDTO) => (metricData[i.identifier as string] = true))
  return metricData
}
