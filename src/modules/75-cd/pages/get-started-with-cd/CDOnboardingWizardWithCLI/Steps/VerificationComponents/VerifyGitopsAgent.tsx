import React, { lazy, useEffect } from 'react'
import { noop } from 'lodash-es'
import { usePolling } from '@common/hooks/usePolling'
// eslint-disable-next-line no-restricted-imports
import ChildComponentMounter from 'microfrontends/ChildComponentMounter'
import { V1Agent } from 'services/gitops'
import { useStrings } from 'framework/strings'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { StepsProgress } from '../../Store/OnboardingStore'
import { ONBOARDING_INTERACTIONS } from '../../TrackingConstants'
import { getBranchingProps } from '../../utils'

// eslint-disable-next-line import/no-unresolved
const VerifyGitopsAgent = lazy(() => import('gitopsui/VerifyGitopsAgent'))

interface VerifyAgentProps {
  isDisasterRecoverySecondaryAgent: boolean
  hideNavigation?: boolean
  onSuccess?: () => void
  showRetryVerification?: boolean
  name?: string
  provider?: V1Agent | null
  onPrevious?: () => void
  onNext?: () => void
  onFail: () => void
  argoType?: string
}

function AgentVerificationStep({
  agentInfo,
  onSuccess,
  onFail,
  stepsProgress
}: {
  agentInfo?: V1Agent
  onSuccess: () => void
  onFail: () => void
  stepsProgress: StepsProgress
}): JSX.Element {
  const { trackEvent } = useTelemetry()
  const { getString } = useStrings()

  useEffect(() => {
    trackEvent(ONBOARDING_INTERACTIONS.AGENT_VERIFICATION_START, getBranchingProps(stepsProgress, getString))
  }, [])

  return (
    <ChildComponentMounter<VerifyAgentProps & { customHooks: { usePolling: typeof usePolling } }>
      ChildComponent={VerifyGitopsAgent}
      provider={agentInfo}
      onPrevious={noop}
      onNext={noop}
      onFail={onFail}
      argoType=""
      customHooks={{
        usePolling
      }}
      isDisasterRecoverySecondaryAgent={false}
      hideNavigation
      onSuccess={onSuccess}
      showRetryVerification
    />
  )
}
export default React.memo(AgentVerificationStep)
