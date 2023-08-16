/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { Layout, Text } from '@harness/uicore'
import { capitalize } from 'lodash-es'
import { Color } from '@harness/design-system'
import { StringsMap } from 'stringTypes'
import { useStrings } from 'framework/strings'
import { useOnboardingStore } from '../Store/OnboardingStore'
import { CDOnboardingSteps, WhereAndHowToDeployType } from '../types'
import { useDelegateHeartBeat } from '../Steps/useDelegateHeartbeat'

export default function WhereAndHowToDeployPreview({
  saveProgress
}: {
  saveProgress: (stepId: string, data: any) => void
}): JSX.Element {
  const { stepsProgress } = useOnboardingStore()
  const getStepData = (): WhereAndHowToDeployType => {
    return stepsProgress[CDOnboardingSteps.HOW_N_WHERE_TO_DEPLOY].stepData
  }

  const delegateStatusData = useDelegateHeartBeat({
    checkheartBeat: ['PENDING', 'TRYING'].includes(getStepData().delegateStatus),
    delegateName: getStepData().delegateName
  })

  return (
    <Layout.Vertical>
      <DelegateStatusLabel data={getStepData()} saveProgress={saveProgress} delegateStatusData={delegateStatusData} />
    </Layout.Vertical>
  )
}

const DelegateStatusLabel = ({
  data,
  saveProgress
}: {
  data: WhereAndHowToDeployType
  delegateStatusData: { error: boolean; loading: boolean; success: boolean }
  saveProgress: (stepId: string, data: any) => void
}): JSX.Element => {
  return ['PENDING', 'TRYING'].includes(data?.delegateStatus) ? (
    <DelegateLoadingLabel data={data} />
  ) : data.delegateStatus === 'SUCCESS' ? (
    <DelegateSuccessLabel data={data} saveProgress={saveProgress} />
  ) : (
    <DelegateFailedLabel data={data} saveProgress={saveProgress} />
  )
}

const DelegateLoadingLabel = ({ data }: { data: WhereAndHowToDeployType }): JSX.Element => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical spacing="small">
      <Layout.Horizontal margin={{ bottom: 'small' }}>
        <Text icon="main-tick" iconProps={{ color: Color.SUCCESS }} color={Color.BLACK}>
          {getString('deploymentTypeText')}:
        </Text>
        <Text padding={{ left: 'small' }} color={Color.BLACK}>
          {getString(data.type?.label as keyof StringsMap)}
        </Text>
      </Layout.Horizontal>
      <Layout.Horizontal margin={{ bottom: 'small' }}>
        <Text icon="loading" iconProps={{ color: Color.SUCCESS }} color={Color.BLACK}>
          {getString('cd.getStartedWithCD.flowByQuestions.reviewAndRunStep.delegateLoading')}
        </Text>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

const DelegateSuccessLabel = ({
  data,
  saveProgress
}: {
  data: WhereAndHowToDeployType
  saveProgress: (stepId: string, data: any) => void
}): JSX.Element => {
  const { getString } = useStrings()

  useEffect(() => {
    saveProgress(CDOnboardingSteps.HOW_N_WHERE_TO_DEPLOY, {
      ...data,
      delegateStatus: 'SUCCESS'
    } as WhereAndHowToDeployType)
  }, [])

  return (
    <Layout.Vertical spacing="small">
      <Layout.Horizontal margin={{ bottom: 'small' }}>
        <Text icon="main-tick" iconProps={{ color: Color.SUCCESS }} color={Color.BLACK}>
          {getString('deploymentTypeText')}:
        </Text>
        <Text padding={{ left: 'small' }} color={Color.BLACK}>
          {getString(data.type?.label as keyof StringsMap)}
        </Text>
      </Layout.Horizontal>
      <Layout.Horizontal margin={{ bottom: 'small' }}>
        <Text icon="main-tick" iconProps={{ color: Color.SUCCESS }} color={Color.BLACK}>
          {`${capitalize(data.delegateType)} ${getString('delegate.DelegateName')} :`}
        </Text>{' '}
        -
        <Text padding={{ left: 'small' }} color={Color.BLACK}>
          {getString('cd.getStartedWithCD.flowByQuestions.howNwhere.K8s.cdPipeline.delegateInstalled')}
        </Text>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

const DelegateFailedLabel = ({
  data,
  saveProgress
}: {
  data: WhereAndHowToDeployType
  saveProgress: (stepId: string, data: any) => void
}): JSX.Element => {
  const { getString } = useStrings()

  useEffect(() => {
    saveProgress(CDOnboardingSteps.HOW_N_WHERE_TO_DEPLOY, {
      ...data,
      delegateStatus: 'FAILED'
    } as WhereAndHowToDeployType)
  }, [])

  return (
    <Layout.Vertical spacing="small">
      <Layout.Horizontal margin={{ bottom: 'small' }}>
        <Text icon="main-tick" iconProps={{ color: Color.SUCCESS }} color={Color.BLACK}>
          {getString('deploymentTypeText')}
        </Text>
        <Text padding={{ left: 'small' }} color={Color.BLACK}>
          {getString(data.type?.label as keyof StringsMap)}
        </Text>
      </Layout.Horizontal>
      <Layout.Horizontal margin={{ bottom: 'small' }}>
        <Text icon="circle-cross" iconProps={{ color: Color.ERROR }} color={Color.BLACK}>
          {getString('cd.getStartedWithCD.flowByQuestions.howNwhere.K8s.cdPipeline.delegateFailed')}
        </Text>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}
