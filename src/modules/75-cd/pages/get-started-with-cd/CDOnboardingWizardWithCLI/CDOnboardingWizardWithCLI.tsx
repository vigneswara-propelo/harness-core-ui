import React from 'react'
import cx from 'classnames'
import produce from 'immer'
import { Container, Icon, Layout, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { Stepper } from '@common/components/Stepper/Stepper'
import { useStrings } from 'framework/strings'
import WhatToDeploy from './Steps/WhatToDeploy'
import WhereAndHowToDeploy from './Steps/WhereAndHowToDeploy'
import DeploymentSetupSteps from './Steps/DeploymentSetupSteps/DeploymentSetupSteps'
import WhatToDeployPreview from './Previews/WhatToDeployPreview'
import WhereAndHowToDeployPreview from './Previews/WhereAndHowToDeployPreview'
import { StepsProgress, useOnboardingStore } from './Store/OnboardingStore'
import { CDOnboardingSteps } from './types'
import PipelineSetupPreview from './Previews/PipelineSetupPreview'
import { STEP_VALIDATION_MAP } from './StepValidations'
import ReviewAndRunPipeline from './Steps/ReviewAndRunPipeline'
import css from '../GetStartedWithCD.module.scss'

export default function CDOnboardingWizardWithCLI(): JSX.Element {
  const { getString } = useStrings()
  const { updateOnboardingStore, ...state } = useOnboardingStore()
  const onStepChange = (stepId: string): void => {
    const updatedStepsProgress = produce(state.stepsProgress, (draft: StepsProgress) => {
      draft[stepId] = { ...state.stepsProgress[stepId], isComplete: true }
    })
    updateOnboardingStore({ stepsProgress: updatedStepsProgress, activeStepId: stepId })
  }

  const saveProgress = (stepId: string, data: any): void => {
    const updatedStepsProgress = produce(state.stepsProgress, (draft: StepsProgress) => {
      draft[stepId] = { ...state.stepsProgress[stepId], stepData: data }
    })
    updateOnboardingStore({ stepsProgress: updatedStepsProgress })
  }

  const isStepValid = (stepId: string): boolean => {
    if (STEP_VALIDATION_MAP[stepId]) {
      return STEP_VALIDATION_MAP?.[stepId](state?.stepsProgress[stepId]?.stepData)
    }
    return true
  }

  return (
    <Layout.Vertical flex={{ alignItems: 'start' }}>
      <Container className={cx(css.topPage, css.oldGetStarted, css.cdwizardcli)}>
        <Layout.Vertical>
          <Layout.Horizontal className={css.alignicon}>
            <Icon name="cd-main" size={30} />
            <Text padding={{ left: 'xxlarge' }} font={{ variation: FontVariation.H1 }}>
              {getString('cd.getStartedWithCD.title')}
            </Text>
          </Layout.Horizontal>
          <Text className={css.descriptionLeftpad} font={{ variation: FontVariation.BODY1 }}>
            {getString('cd.getStartedWithCD.description')}
          </Text>
        </Layout.Vertical>
        <Stepper
          id="cdOnboardingStepper"
          isStepValid={isStepValid}
          onStepChange={onStepChange}
          activeStepId={state.activeStepId}
          stepList={[
            {
              id: CDOnboardingSteps.WHAT_TO_DEPLOY,
              title: getString('cd.getStartedWithCD.flowbyquestions.what.title'),
              panel: <WhatToDeploy saveProgress={saveProgress} />,
              preview: <WhatToDeployPreview />,
              disableNext: () => !isStepValid(CDOnboardingSteps.WHAT_TO_DEPLOY)
            },
            {
              id: CDOnboardingSteps.HOW_N_WHERE_TO_DEPLOY,
              title: getString('cd.getStartedWithCD.flowbyquestions.howNwhere.title'),
              panel: <WhereAndHowToDeploy saveProgress={saveProgress} />,
              preview: <WhereAndHowToDeployPreview saveProgress={saveProgress} />,
              disableNext: () => !isStepValid(CDOnboardingSteps.HOW_N_WHERE_TO_DEPLOY),
              errorMessage: ['Delegate should be working to move to next step']
            },
            {
              id: CDOnboardingSteps.DEPLOYMENT_STEPS,
              title: getString('cd.getStartedWithCD.flowbyquestions.deplopymentSteps.title'),
              panel: <DeploymentSetupSteps saveProgress={saveProgress} />,
              preview: <PipelineSetupPreview />,
              disableNext: () => !isStepValid(CDOnboardingSteps.DEPLOYMENT_STEPS)
            },
            {
              id: CDOnboardingSteps.REVIEW_AND_RUN_PIPELINE,
              title: getString('cd.getStartedWithCD.flowbyquestions.reviewAndRunStep.title'),
              panel: <ReviewAndRunPipeline saveProgress={saveProgress} />
            }
          ]}
        ></Stepper>
      </Container>
    </Layout.Vertical>
  )
}
