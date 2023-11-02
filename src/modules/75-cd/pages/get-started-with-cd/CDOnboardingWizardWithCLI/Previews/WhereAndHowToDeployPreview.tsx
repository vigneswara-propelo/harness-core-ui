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
import { UseStringsReturn, useStrings } from 'framework/strings'
import { useOnboardingStore } from '../Store/OnboardingStore'
import { CDOnboardingSteps, WhereAndHowToDeployType } from '../types'
import { useDelegateHeartBeat } from '../Steps/useDelegateHeartbeat'
import { isGitopsFlow } from '../utils'

export default function WhereAndHowToDeployPreview({
  saveProgress
}: {
  saveProgress: (stepId: string, data: any) => void
}): JSX.Element {
  const { stepsProgress } = useOnboardingStore()
  const { getString } = useStrings()
  const getStepData = (): WhereAndHowToDeployType => {
    return stepsProgress[CDOnboardingSteps.HOW_N_WHERE_TO_DEPLOY].stepData
  }

  const delegateStatusData = useDelegateHeartBeat({
    checkheartBeat: ['PENDING', 'TRYING'].includes(getStepData().delegateStatus),
    delegateName: getStepData().delegateName
  })
  return (
    <Layout.Vertical>
      {isGitopsFlow(stepsProgress) ? (
        <GitopsSuccessLabel data={getStepData()} getString={getString} />
      ) : (
        <DelegateStatusLabel
          getString={getString}
          data={getStepData()}
          saveProgress={saveProgress}
          delegateStatusData={delegateStatusData}
        />
      )}
    </Layout.Vertical>
  )
}

const DelegateStatusLabel = ({
  data,
  saveProgress,
  getString
}: {
  data: WhereAndHowToDeployType
  delegateStatusData: { error: boolean; loading: boolean; success: boolean }
  saveProgress: (stepId: string, data: any) => void
  getString: UseStringsReturn['getString']
}): JSX.Element => {
  return ['PENDING', 'TRYING'].includes(data?.delegateStatus) ? (
    <DelegateLoadingLabel data={data} getString={getString} />
  ) : data.delegateStatus === 'SUCCESS' ? (
    <DelegateSuccessLabel data={data} saveProgress={saveProgress} />
  ) : (
    <DelegateFailedLabel data={data} saveProgress={saveProgress} />
  )
}
const DeploymentTypeLabel = ({
  data,
  getString
}: {
  data: WhereAndHowToDeployType
  getString: UseStringsReturn['getString']
}): JSX.Element => (
  <Layout.Horizontal margin={{ bottom: 'small' }}>
    <Text icon="main-tick" iconProps={{ color: Color.SUCCESS }} color={Color.BLACK}>
      {getString('deploymentTypeText')}:
    </Text>
    <Text padding={{ left: 'small' }} color={Color.BLACK}>
      {getString(data.type?.label as keyof StringsMap)}
    </Text>
  </Layout.Horizontal>
)
const DelegateLoadingLabel = ({
  data,
  getString
}: {
  data: WhereAndHowToDeployType
  getString: UseStringsReturn['getString']
}): JSX.Element => {
  return (
    <Layout.Vertical spacing="small">
      <DeploymentTypeLabel data={data} getString={getString} />
      <Layout.Horizontal margin={{ bottom: 'small' }}>
        <Text icon="loading" iconProps={{ color: Color.SUCCESS }} color={Color.BLACK}>
          {getString('cd.getStartedWithCD.flowByQuestions.reviewAndRunStep.delegateLoading')}
        </Text>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

const GitopsSuccessLabel = ({
  getString,
  data
}: {
  data: WhereAndHowToDeployType
  getString: UseStringsReturn['getString']
}): JSX.Element => {
  return (
    <Layout.Vertical spacing="small">
      <DeploymentTypeLabel data={data} getString={getString} />
      <Layout.Horizontal>
        <Text icon="main-tick" iconProps={{ color: Color.SUCCESS }} color={Color.BLACK}>
          {getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureGitopsStep.initAgentSuccess')}
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
        </Text>
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
