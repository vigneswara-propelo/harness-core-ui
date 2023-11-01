/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FeatureFlag } from '@modules/10-common/featureFlags'
import { useFeatureFlag } from '@modules/10-common/hooks/useFeatureFlag'
import SRMApp from '@modules/85-cv/SRMApp'
import ServiceHealth from './ServiceHealth'
import { ServiceHealthProps } from './ServiceHealth.types'

export const ServiceHealthMFEWrapper = (prop: ServiceHealthProps): JSX.Element => {
  const isMFEEnabled = useFeatureFlag(FeatureFlag.SRM_MICRO_FRONTEND)
  return isMFEEnabled ? (
    <SRMApp renderComponent={{ componentName: 'ServiceHealth', componentProps: { ...prop } }} />
  ) : (
    <ServiceHealth {...prop} />
  )
}
