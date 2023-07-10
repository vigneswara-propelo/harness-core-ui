import React from 'react'
import { useStrings } from 'framework/strings'
import CLISetupStep from './CLISetupStep'
import PipelineSetupStep from './PipelineSetupStep'
import DeploymentStrategySelection from './DeploymentStrategyStep'
import { CDOnboardingSteps, DeploymentStrategyTypes, PipelineSetupState } from '../../types'
import { useOnboardingStore } from '../../Store/OnboardingStore'
interface DeploymentSetupStepsProps {
  saveProgress: (stepId: string, data: any) => void
}
export default function DeploymentSetupSteps({ saveProgress }: DeploymentSetupStepsProps): JSX.Element {
  const { getString } = useStrings()
  const { stepsProgress } = useOnboardingStore()
  const [state, setState] = React.useState<PipelineSetupState>(() => {
    const defaultState = {
      apiKey: getString('cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step1.apiKeyPlacholder'),
      githubUsername: getString(
        'cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step4.commands.gitusernamePlaceholder'
      ),
      githubPat: getString(
        'cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step4.commands.gitpatPlaceholder'
      )
    }
    return stepsProgress?.[CDOnboardingSteps.DEPLOYMENT_STEPS]?.stepData || defaultState
  })
  React.useEffect(() => {
    saveProgress(CDOnboardingSteps.DEPLOYMENT_STEPS, {
      ...state,
      apiKey: getString('cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step1.apiKeyPlacholder'),
      githubPat: getString(
        'cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step4.commands.gitpatPlaceholder'
      )
    })
  }, [state])

  const onUpdate = (data: PipelineSetupState): void => {
    setState({ ...state, ...data })
  }

  const setDeploymentStrategy = (strategy?: DeploymentStrategyTypes): void => {
    setState({ ...state, strategy })
  }
  return (
    <>
      <CLISetupStep state={state} onKeyGenerate={onUpdate} />
      <PipelineSetupStep state={state} onUpdate={onUpdate} />
      <DeploymentStrategySelection updateState={setDeploymentStrategy} saveProgress={saveProgress} />
    </>
  )
}
