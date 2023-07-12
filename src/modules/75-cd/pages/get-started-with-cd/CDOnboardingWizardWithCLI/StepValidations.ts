import { isEmpty } from 'lodash-es'
import { CDOnboardingSteps, WhatToDeployType, WhereAndHowToDeployType, PipelineSetupState } from './types'

function validateWhatToDeployStep(data: WhatToDeployType): boolean {
  return !isEmpty(data?.svcType?.id) && !isEmpty(data?.artifactType?.id)
}

function validateWhereAndHowToDeployStep(data: WhereAndHowToDeployType): boolean {
  return Boolean(data?.installDelegateTried)
}

function validatePipelineSetupStep(data: PipelineSetupState): boolean {
  return Boolean(data?.pipelineVerified)
}

export const STEP_VALIDATION_MAP: { [key: string]: (data: any) => boolean } = {
  [CDOnboardingSteps.WHAT_TO_DEPLOY]: validateWhatToDeployStep,
  [CDOnboardingSteps.HOW_N_WHERE_TO_DEPLOY]: validateWhereAndHowToDeployStep,
  [CDOnboardingSteps.DEPLOYMENT_STEPS]: validatePipelineSetupStep
}