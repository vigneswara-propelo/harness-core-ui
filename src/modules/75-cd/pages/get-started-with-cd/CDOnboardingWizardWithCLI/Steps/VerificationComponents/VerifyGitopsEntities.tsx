import React, { useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Button, ButtonVariation, IconName, IconProps, Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { String, useStrings } from 'framework/strings'
import { useAgentRepositoryServiceGet, useAgentApplicationServiceGet, useAgentClusterServiceGet } from 'services/gitops'
import SuccessBanner from './SuccessBanner'
import { useOnboardingStore } from '../../Store/OnboardingStore'
import { CDOnboardingSteps, PipelineSetupState, WhatToDeployType, WhereAndHowToDeployType } from '../../types'
import { GITOPS_ENTITY_IDS_BY_DEPLOYMENT_TYPE } from '../../Constants'
import { ONBOARDING_INTERACTIONS } from '../../TrackingConstants'
import { getBranchingProps } from '../../utils'
import css from '../../CDOnboardingWizardWithCLI.module.scss'

export default function VerifyGitopsEntities({
  saveProgress
}: {
  saveProgress: (stepId: string, data: unknown) => void
}): JSX.Element {
  const { getString } = useStrings()
  const { stepsProgress } = useOnboardingStore()
  const { trackEvent } = useTelemetry()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const configdata = stepsProgress?.[CDOnboardingSteps.HOW_N_WHERE_TO_DEPLOY]?.stepData as WhereAndHowToDeployType

  const entityIds = useMemo((): { application: string; cluster: string; repo: string } => {
    const data = stepsProgress?.[CDOnboardingSteps.WHAT_TO_DEPLOY]?.stepData as WhatToDeployType
    const artifactId = data.artifactSubType ? data.artifactSubType?.id : (data.artifactType?.id as string)
    return GITOPS_ENTITY_IDS_BY_DEPLOYMENT_TYPE[artifactId] || {}
  }, [])

  const {
    loading: clusterLoading,
    refetch: refetchCluster,
    error: clusterFailed,
    data: clusterData
  } = useAgentClusterServiceGet({
    agentIdentifier: configdata?.agentInfo?.identifier as string,
    identifier: entityIds?.cluster,
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier },
    lazy: true
  })

  const {
    loading: repoLoading,
    refetch: refetchRepo,
    error: repoFailed,
    data: repoData
  } = useAgentRepositoryServiceGet({
    agentIdentifier: configdata?.agentInfo?.identifier as string,
    identifier: entityIds?.repo,
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier },
    lazy: true
  })

  const {
    loading: applicationLoading,
    refetch: refetchApp,
    error: appFailed,
    data: appData
  } = useAgentApplicationServiceGet({
    queryName: entityIds?.application,
    agentIdentifier: configdata?.agentInfo?.identifier as string,
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier },
    lazy: true
  })

  const setupState = React.useMemo((): PipelineSetupState => {
    return stepsProgress?.[CDOnboardingSteps.DEPLOYMENT_STEPS]?.stepData
  }, [stepsProgress])

  useMemo((): string => {
    const data = stepsProgress?.[CDOnboardingSteps.HOW_N_WHERE_TO_DEPLOY]?.stepData as WhereAndHowToDeployType
    return data?.agentInfo?.identifier as string
  }, [])

  const successIconProps = React.useMemo((): { icon: IconName; iconProps: Omit<IconProps, 'name'> } => {
    return {
      icon: 'tick-circle',
      iconProps: { padding: { right: 'medium' }, color: Color.GREEN_700 }
    }
  }, [])

  const failIconProps = React.useMemo((): { icon: IconName; iconProps: Omit<IconProps, 'name'> } => {
    return {
      icon: 'danger-icon',
      iconProps: { padding: { right: 'medium' }, color: Color.ERROR, className: css.redIcon }
    }
  }, [])

  const loadingIconProps = React.useMemo((): { icon: IconName; iconProps: Omit<IconProps, 'name'> } => {
    return {
      icon: 'steps-spinner',
      iconProps: { padding: { right: 'medium' } }
    }
  }, [])

  useEffect(() => {
    if (appData?.name) {
      trackEvent(ONBOARDING_INTERACTIONS.APP_VERIFICATION_SUCCESS, getBranchingProps(stepsProgress, getString))
    }
    if (repoData?.repository) {
      trackEvent(ONBOARDING_INTERACTIONS.REPO_VERIFICATION_SUCCESS, getBranchingProps(stepsProgress, getString))
    }
    if (clusterData?.cluster) {
      trackEvent(ONBOARDING_INTERACTIONS.CLUSTER_VERIFICATION_SUCCESS, getBranchingProps(stepsProgress, getString))
    }
  }, [appData, clusterData, repoData])

  useEffect(() => {
    trackEvent(ONBOARDING_INTERACTIONS.APP_VERIFICATION_START, getBranchingProps(stepsProgress, getString))
    trackEvent(ONBOARDING_INTERACTIONS.REPO_VERIFICATION_START, getBranchingProps(stepsProgress, getString))
    trackEvent(ONBOARDING_INTERACTIONS.CLUSTER_VERIFICATION_START, getBranchingProps(stepsProgress, getString))
  }, [])

  useEffect(() => {
    const allChecksPassed = [appFailed, repoFailed, clusterFailed].every(error => error === null)
    const isEntityLoading = [applicationLoading, repoLoading, clusterLoading].includes(true)
    if (allChecksPassed && !isEntityLoading && !setupState?.gitopsEntitiesVerified) {
      saveProgress(CDOnboardingSteps.DEPLOYMENT_STEPS, {
        gitopsEntitiesVerified: true,
        pipelineVerified: false
      } as PipelineSetupState)
    } else if (!allChecksPassed && !isEntityLoading && setupState?.gitopsEntitiesVerified) {
      saveProgress(CDOnboardingSteps.DEPLOYMENT_STEPS, {
        gitopsEntitiesVerified: false,
        pipelineVerified: false
      } as PipelineSetupState)
    }

    appFailed && trackEvent(ONBOARDING_INTERACTIONS.APP_VERIFICATION_FAIL, getBranchingProps(stepsProgress, getString))
    repoFailed &&
      trackEvent(ONBOARDING_INTERACTIONS.REPO_VERIFICATION_FAIL, getBranchingProps(stepsProgress, getString))
    clusterFailed &&
      trackEvent(ONBOARDING_INTERACTIONS.CLUSTER_VERIFICATION_FAIL, getBranchingProps(stepsProgress, getString))
  }, [
    appFailed,
    repoFailed,
    clusterFailed,
    applicationLoading,
    repoLoading,
    clusterLoading,
    setupState?.gitopsEntitiesVerified
  ])

  const retryVerification = (): void => {
    if (clusterFailed) {
      refetchCluster()
    }

    if (appFailed) {
      refetchApp()
    }

    if (repoFailed) {
      refetchRepo()
    }
  }

  const isVerifiedOnce = (): boolean => {
    const hasData = [repoData, clusterData, appData].every(data => data !== null)
    const hasError = [appFailed, repoFailed, clusterFailed].every(error => error !== null)
    return hasData || hasError
  }

  const verifyEntites = (): void => {
    refetchCluster()
    refetchApp()
    refetchRepo()
  }

  const isLoading = applicationLoading || repoLoading || clusterLoading

  return (
    <Layout.Vertical spacing={'medium'}>
      <Text color={Color.BLACK} className={css.bold}>
        <String
          color={Color.BLACK}
          stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureGitopsStep.verifyEntities"
        />
      </Text>
      <div>
        {(isVerifiedOnce() || isLoading || setupState?.gitopsEntitiesVerified) && (
          <SuccessBanner
            textList={[
              {
                ...(repoLoading ? loadingIconProps : repoFailed ? failIconProps : successIconProps),
                text: getString(
                  repoLoading
                    ? 'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureGitopsStep.repoLoading'
                    : repoFailed
                    ? 'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureGitopsStep.repoFailed'
                    : 'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureGitopsStep.repoSuccess'
                )
              },
              {
                ...(clusterLoading ? loadingIconProps : clusterFailed ? failIconProps : successIconProps),
                text: getString(
                  clusterLoading
                    ? 'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureGitopsStep.clusterLoading'
                    : clusterFailed
                    ? 'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureGitopsStep.clusterFailed'
                    : 'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureGitopsStep.clusterSuccess'
                )
              },
              {
                ...(applicationLoading ? loadingIconProps : appFailed ? failIconProps : successIconProps),
                text: getString(
                  applicationLoading
                    ? 'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureGitopsStep.appLoading'
                    : appFailed
                    ? 'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureGitopsStep.appFailed'
                    : 'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureGitopsStep.appSuccess'
                )
              }
            ]}
          />
        )}

        {!setupState?.gitopsEntitiesVerified && (
          <Layout.Horizontal
            spacing="large"
            flex={{ alignItems: 'center', justifyContent: 'start' }}
            margin={{ left: 'large' }}
          >
            <Button
              disabled={isLoading}
              onClick={isVerifiedOnce() ? retryVerification : verifyEntites}
              variation={ButtonVariation.PRIMARY}
              text={
                isVerifiedOnce()
                  ? getString(
                      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.deploymentStrategyStep.retryVerify'
                    )
                  : getString('verify')
              }
              width={isVerifiedOnce() ? 200 : 120}
            />
            <Text color={Color.BLACK}>
              <String
                color={Color.BLACK}
                stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.deploymentStrategyStep.verifyPipeline"
              />
            </Text>
          </Layout.Horizontal>
        )}
      </div>
    </Layout.Vertical>
  )
}
