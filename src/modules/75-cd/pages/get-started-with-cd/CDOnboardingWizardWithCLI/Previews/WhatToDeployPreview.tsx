/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { get } from 'lodash-es'
import { Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { useOnboardingStore } from '../Store/OnboardingStore'
import { CDOnboardingSteps } from '../types'

export default function WhatToDeployPreview(): JSX.Element {
  const { getString } = useStrings()
  const { stepsProgress } = useOnboardingStore()
  const svcType = React.useMemo(() => {
    return get(stepsProgress[CDOnboardingSteps.WHAT_TO_DEPLOY].stepData, 'svcType.label')
  }, [stepsProgress])
  const artfiactType = React.useMemo(() => {
    return get(stepsProgress[CDOnboardingSteps.WHAT_TO_DEPLOY].stepData, 'artifactType.label')
  }, [stepsProgress])
  return (
    <Layout.Vertical>
      <Layout.Horizontal margin={{ bottom: 'small' }}>
        <Text icon="main-tick" iconProps={{ color: Color.SUCCESS }} color={Color.BLACK}>
          {getString('common.serviceType')}:
        </Text>
        <Text padding={{ left: 'small' }} color={Color.BLACK}>
          {svcType}
        </Text>
      </Layout.Horizontal>
      <Layout.Horizontal>
        <Text icon="main-tick" iconProps={{ color: Color.SUCCESS }} color={Color.BLACK}>
          {getString('cd.getStartedWithCD.flowByQuestions.what.svcrep')}:
        </Text>
        <Text padding={{ left: 'small' }} color={Color.BLACK}>
          {artfiactType}
        </Text>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}
