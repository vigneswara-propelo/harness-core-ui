import React, { lazy } from 'react'
import { Button, ButtonVariation, Dialog } from '@harness/uicore'
// eslint-disable-next-line no-restricted-imports
import ChildComponentMounter from 'microfrontends/ChildComponentMounter'
import { useStrings } from 'framework/strings'
import { V1Agent } from 'services/gitops'
import { usePolling } from '@common/hooks/usePolling'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { WIZARD_STEP_OPEN } from '../../TrackingConstants'
import { getBranchingProps } from '../../utils'
import { useOnboardingStore } from '../../Store/OnboardingStore'

// eslint-disable-next-line import/no-unresolved
const CreateGitOpsAgent = lazy(() => import('gitopsui/CreateGitOpsAgent'))
export interface CreateGitopsAgentModalProps {
  toggleVisible: () => void
  isVisible: boolean
  onAgentCreated: (data: V1Agent) => void
  agentInfo?: V1Agent | null
}

interface GitopsAppProps {
  provider?: V1Agent | null
  setNewAgent?: (data: V1Agent) => void
  onAgentDetails?: boolean
  onClose?: () => void
  isEditMode?: boolean
  agentIdentifer?: string
}
export default function CreateGitopsAgentModal({
  isVisible,
  onAgentCreated,
  toggleVisible,
  agentInfo
}: CreateGitopsAgentModalProps): JSX.Element {
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()
  const { stepsProgress } = useOnboardingStore()

  const toggleModal = (): void => {
    toggleVisible()
    !isVisible && trackEvent(WIZARD_STEP_OPEN.CREATE_AGENT_FLYOUT_OPENED, getBranchingProps(stepsProgress, getString))
  }
  return isVisible ? (
    <Dialog
      onClose={toggleVisible}
      isOpen={isVisible}
      style={{
        minWidth: 1175,
        minHeight: 690,
        borderLeft: 0,
        padding: 0,
        position: 'relative'
      }}
      enforceFocus={false}
      usePortal
      canOutsideClickClose={false}
    >
      <ChildComponentMounter<GitopsAppProps & { customHooks: { usePolling: typeof usePolling } }>
        ChildComponent={CreateGitOpsAgent}
        provider={agentInfo}
        customHooks={{
          usePolling
        }}
        onClose={toggleModal}
        setNewAgent={onAgentCreated}
      />
    </Dialog>
  ) : (
    <Button
      width={220}
      text={getString(
        agentInfo?.identifier ? 'cd.getStartedWithCD.updateGitopsAgent' : 'cd.getStartedWithCD.createGitopsAgent'
      )}
      variation={ButtonVariation.PRIMARY}
      onClick={toggleModal}
    />
  )
}
