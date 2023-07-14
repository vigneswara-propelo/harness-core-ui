/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { AnalyzeDeploymentImpactWidgetSectionsProps } from './types'
import BaseAnalyzeDeploymentImpact from './components/BaseAnalyzeDeploymentImpact/BaseAnalyzeDeploymentImpact'
import ConfiguredMonitoredService from './components/ConfiguredMonitoredService/ConfiguredMonitoredService'

export function AnalyzeDeploymentImpactWidgetSections({
  formik,
  isNewStep,
  stepViewType,
  allowableTypes
}: AnalyzeDeploymentImpactWidgetSectionsProps): JSX.Element {
  return (
    <>
      <BaseAnalyzeDeploymentImpact isNewStep={isNewStep} stepViewType={stepViewType} allowableTypes={allowableTypes} />
      <ConfiguredMonitoredService formik={formik} allowableTypes={allowableTypes} />
    </>
  )
}
