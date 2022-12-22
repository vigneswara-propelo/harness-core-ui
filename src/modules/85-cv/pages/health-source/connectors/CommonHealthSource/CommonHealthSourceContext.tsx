/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { createContext } from 'react'
import type { FormikHelpers } from 'formik'
import type { CommonHealthSourceConfigurations } from './CommonHealthSource.types'

export enum CommonHealthSourceContextFields {
  SelectedMetric = 'selectedMetric',
  CustomMetricsMap = 'customMetricsMap'
}
interface CommonHealthSourceContextValues {
  updateParentFormik: FormikHelpers<CommonHealthSourceConfigurations>['setFieldValue']
}
const CommonHealthSourceContext = createContext<CommonHealthSourceContextValues>({} as CommonHealthSourceContextValues)

export default CommonHealthSourceContext
