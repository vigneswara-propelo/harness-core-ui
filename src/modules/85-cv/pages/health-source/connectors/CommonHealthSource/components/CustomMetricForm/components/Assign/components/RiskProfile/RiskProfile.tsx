/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout } from '@harness/uicore'
import type { useGetRiskCategoryForCustomHealthMetric } from 'services/cv'
import RiskProfileCategeory from './components/RiskProfileCategeory/RiskProfileCategeory'
import Deviation from './components/Deviation/Deviation'
import ServiceInstance from './components/ServiceInstance/ServiceInstance'
import css from './RiskProfile.module.scss'

interface RiskProfileProps {
  riskProfileResponse?: ReturnType<typeof useGetRiskCategoryForCustomHealthMetric>
  continuousVerificationEnabled?: boolean
  serviceInstance?: string
  riskCategory?: string
}

export function RiskProfile(props: RiskProfileProps): JSX.Element {
  const { continuousVerificationEnabled, serviceInstance, riskCategory, riskProfileResponse } = props

  return (
    <Layout.Vertical className={css.main} spacing="large">
      <RiskProfileCategeory riskCategory={riskCategory} riskProfileResponse={riskProfileResponse} />
      <Deviation />
      <ServiceInstance
        serviceInstance={serviceInstance}
        continuousVerificationEnabled={continuousVerificationEnabled}
      />
    </Layout.Vertical>
  )
}
