/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Layout, Text, useToggle } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { Servicev1HealthStatus, V1Agent } from 'services/gitops'
import { String, useStrings } from 'framework/strings'
import { useTelemetry } from '@common/hooks/useTelemetry'
import CreateGitopsAgentModal from './CreateAgentModal'
import AgentVerificationStep from '../VerificationComponents/VerifyGitopsAgent'
import SuccessBanner from '../VerificationComponents/SuccessBanner'
import { ONBOARDING_INTERACTIONS } from '../../TrackingConstants'
import { getBranchingProps } from '../../utils'
import { useOnboardingStore } from '../../Store/OnboardingStore'

export default function GitopsFlow({
  updateAgentInfo,
  agentInfo,
  onAgentVerificationSuccess
}: {
  artifactType: string
  updateAgentInfo: (agentDetails: V1Agent) => void
  agentInfo?: V1Agent
  onAgentVerificationSuccess: (status?: Servicev1HealthStatus) => void
}): JSX.Element {
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()
  const { stepsProgress } = useOnboardingStore()
  const [isVisible, toggleVisible] = useToggle()
  const [isVerificationVisible, toggleVerificationVisible] = useState<boolean>(false)

  const [isSuccess, setSuccess] = useState(false)

  const onVerificationSuccess = (): void => {
    onAgentVerificationSuccess('HEALTHY')
    setSuccess(true)
    trackEvent(ONBOARDING_INTERACTIONS.AGENT_VERIFICATION_SUCCESS, getBranchingProps(stepsProgress, getString))
  }
  const onVerificationFail = (): void => {
    trackEvent(ONBOARDING_INTERACTIONS.AGENT_VERIFICATION_FAIL, getBranchingProps(stepsProgress, getString))
  }
  return (
    <Layout.Vertical spacing={'large'}>
      <Text color={Color.BLACK}>
        <String stringID="cd.getStartedWithCD.flowByQuestions.howNwhere.K8s.cdGitops.description" useRichText />
      </Text>

      <CreateGitopsAgentModal
        agentInfo={agentInfo}
        toggleVisible={toggleVisible}
        isVerificationVisible={isVerificationVisible}
        toggleVerificationVisible={toggleVerificationVisible}
        isVisible={isVisible}
        onAgentCreated={updateAgentInfo}
      />

      {isSuccess && (
        <Layout.Vertical margin={{ top: 'xlarge' }}>
          <SuccessBanner
            spacing="medium"
            textList={[
              {
                icon: 'tick',
                iconProps: { padding: { right: 'medium' }, color: Color.GREEN_700 },
                text: getString('delegate.successVerification.heartbeatReceived')
              },
              {
                icon: 'tick',
                iconProps: { padding: { right: 'medium' }, color: Color.GREEN_700 },
                text: getString('cd.getStartedWithCD.agentInstalled')
              },
              {
                icon: 'tick',
                iconProps: { padding: { right: 'medium' }, color: Color.GREEN_700 },
                text: getString('cd.getStartedWithCD.repoServerInstalled')
              },
              {
                icon: 'tick',
                iconProps: { padding: { right: 'medium' }, color: Color.GREEN_700 },
                text: getString('cd.getStartedWithCD.redisCacheInstalled')
              },
              {
                icon: 'tick',
                iconProps: { padding: { right: 'medium' }, color: Color.GREEN_700 },
                text: getString('cd.getStartedWithCD.appControllerInstalled')
              }
            ]}
          />
        </Layout.Vertical>
      )}
      {isVerificationVisible && agentInfo && !isSuccess && (
        <AgentVerificationStep
          stepsProgress={stepsProgress}
          onFail={onVerificationFail}
          onSuccess={onVerificationSuccess}
          agentInfo={agentInfo}
        />
      )}
    </Layout.Vertical>
  )
}
