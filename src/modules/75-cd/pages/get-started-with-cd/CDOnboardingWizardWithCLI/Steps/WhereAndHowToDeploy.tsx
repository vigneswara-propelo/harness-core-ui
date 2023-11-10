/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Color, FontVariation } from '@harness/design-system'
import { Layout, Text, CardSelect, Icon, IconName } from '@harness/uicore'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { StringsMap } from 'stringTypes'
import CommandBlock from '@modules/10-common/CommandBlock/CommandBlock'
import { useStrings } from 'framework/strings'
import { Servicev1HealthStatus, V1Agent } from 'services/gitops'
import {
  CDOnboardingSteps,
  DelegateStatus,
  DeploymentFlowType,
  WhatToDeployType,
  WhereAndHowToDeployType
} from '../types'
import GitopsFlow from './DeploymentFlowTypes/GitopsFlow'
import { useOnboardingStore } from '../Store/OnboardingStore'
import {
  ARTIFACT_BY_APP_LABEL_MAP,
  DELEGATE_TYPE_BY_ARTIFACT_MAP,
  DEPLOYMENT_FLOW_ENUMS,
  DEPLOYMENT_FLOW_TYPES,
  SERVICE_TYPES
} from '../Constants'
import type { DelgateDetails } from '../DelegateModal'
import CDPipeline from './DeploymentFlowTypes/CDPipeline'
import { getBranchingProps, getCommandStrWithNewline, isK8sSwimlane } from '../utils'
import { ONBOARDING_INTERACTIONS, WIZARD_STEP_OPEN } from '../TrackingConstants'
import css from '../CDOnboardingWizardWithCLI.module.scss'

interface WhereAndHowToDeployProps {
  saveProgress: (stepId: string, data: any) => void
}
function WhereAndHowToDeploy({ saveProgress }: WhereAndHowToDeployProps): JSX.Element {
  const { stepsProgress } = useOnboardingStore()
  const { trackEvent } = useTelemetry()
  const deploymentTypeDetails = React.useMemo((): WhatToDeployType => {
    return stepsProgress[CDOnboardingSteps.WHAT_TO_DEPLOY].stepData
  }, [stepsProgress])
  const [state, setState] = React.useState<WhereAndHowToDeployType>(() => {
    return (
      stepsProgress?.[CDOnboardingSteps.HOW_N_WHERE_TO_DEPLOY]?.stepData || {
        isDelegateVerified: false,
        delegateStatus: 'PENDING',
        delegateProblemType: deploymentTypeDetails.artifactType?.id,
        type: DEPLOYMENT_FLOW_TYPES['cd-pipeline']
      }
    )
  })
  const [isDrawerOpen, setDrawerOpen] = React.useState<boolean>(false)

  const { getString } = useStrings()

  React.useEffect(() => {
    const stepData = stepsProgress?.[CDOnboardingSteps.HOW_N_WHERE_TO_DEPLOY]?.stepData as WhereAndHowToDeployType
    trackEvent(WIZARD_STEP_OPEN.HOW_N_WHERE_STEP_OPENED, getBranchingProps(stepsProgress, getString))
    triggerBranchSelectionEvent(stepData?.type?.id as string)
  }, [])

  React.useEffect(() => {
    saveProgress(CDOnboardingSteps.HOW_N_WHERE_TO_DEPLOY, state)
  }, [state])

  const openDelagateDialog = (): void => {
    !state.installDelegateTried && setState(prevState => ({ ...prevState, installDelegateTried: true }))
    trackEvent(WIZARD_STEP_OPEN.CREATE_DELEGATE_FLYOUT_OPENED, getBranchingProps(stepsProgress, getString))
    setDrawerOpen(true)
  }
  const closeDelegateDialog = (data: DelgateDetails): void => {
    if (data?.delegateName && data?.delegateType) {
      setState(prevState => ({
        ...prevState,
        delegateName: data.delegateName as string,
        delegateType: data.delegateType as any
      }))
    }
    setDrawerOpen(false)
  }
  const onChangeHandler = React.useCallback(
    (delegateStatus: DelegateStatus): void => {
      const isDelegateVerified = delegateStatus === 'SUCCESS' ? true : false
      setState(prevState => ({ ...prevState, isDelegateVerified: isDelegateVerified, delegateStatus }))
    },
    [state.isDelegateVerified]
  )

  const onDelegateFail = (): void => {
    onChangeHandler('FAILED')
    trackEvent(ONBOARDING_INTERACTIONS.DELEGATE_VERIFICATION_FAIL, {
      ...getBranchingProps(stepsProgress, getString),
      delegateName: state?.delegateName,
      delegateType: state?.delegateType
    })
  }

  const onDelegateSuccess = (): void => {
    onChangeHandler('SUCCESS')
    trackEvent(ONBOARDING_INTERACTIONS.DELEGATE_VERIFICATION_SUCCESS, {
      ...getBranchingProps(stepsProgress, getString),
      delegateName: state?.delegateName,
      delegateType: state?.delegateType
    })
  }

  const onVerificationStart = (): void => {
    onChangeHandler('TRYING')
    trackEvent(ONBOARDING_INTERACTIONS.DELEGATE_VERIFICATION_START, {
      ...getBranchingProps(stepsProgress, getString),
      delegateName: state?.delegateName,
      delegateType: state?.delegateType
    })
  }

  const triggerBranchSelectionEvent = (selectedType: string): void =>
    trackEvent(ONBOARDING_INTERACTIONS.CD_ONBOARDING_BRANCH_SELECTED, {
      ...getBranchingProps(stepsProgress, getString),
      question: getString('cd.getStartedWithCD.flowByQuestions.howNwhere.K8s.title', {
        serviceType: getString(ARTIFACT_BY_APP_LABEL_MAP[deploymentTypeDetails.artifactType?.id as string])
      }),
      answer: selectedType
    })

  const setType = (selectedType: DeploymentFlowType): void => {
    triggerBranchSelectionEvent(selectedType?.id)

    const clearGitops =
      selectedType?.id === DEPLOYMENT_FLOW_ENUMS.CDPipeline && state.type?.id !== DEPLOYMENT_FLOW_ENUMS.CDPipeline
    if (clearGitops) {
      setState(prevState => ({ ...prevState, type: selectedType, agentInfo: undefined }))
    } else {
      setState(prevState => ({ ...prevState, type: selectedType }))
    }
  }
  const onAgentVerificationSuccess = (status?: Servicev1HealthStatus): void => {
    setState((prevState: WhereAndHowToDeployType) => ({ ...prevState, agentStatus: status }))
  }
  const updateAgentInfo = (agentDetails: V1Agent): void => {
    setState((prevState: WhereAndHowToDeployType) => ({
      ...prevState,
      agentInfo: agentDetails,
      installAgentTried: agentDetails ? true : false
    }))
  }
  const deploymentTypes = React.useMemo((): DeploymentFlowType[] => {
    const deploymentTypeMap = new Map<DEPLOYMENT_FLOW_ENUMS, DeploymentFlowType>([
      [DEPLOYMENT_FLOW_ENUMS.CDPipeline, DEPLOYMENT_FLOW_TYPES[DEPLOYMENT_FLOW_ENUMS.CDPipeline]],
      [DEPLOYMENT_FLOW_ENUMS.Gitops, DEPLOYMENT_FLOW_TYPES[DEPLOYMENT_FLOW_ENUMS.Gitops]]
    ])
    const finalDeploymentTypes: DeploymentFlowType[] = []
    Array.from(deploymentTypeMap.entries()).forEach(([_key, deploymentType]) => {
      if (
        deploymentType.id === DEPLOYMENT_FLOW_ENUMS.Gitops &&
        deploymentTypeDetails.svcType?.id !== SERVICE_TYPES.KubernetesService?.id
      ) {
        return false
      }
      finalDeploymentTypes.push(deploymentType)
    })
    return finalDeploymentTypes
  }, [])

  return (
    <Layout.Vertical>
      {!isK8sSwimlane(stepsProgress) ? (
        <Layout.Vertical>
          <Text color={Color.BLACK} className={css.bold}>
            {getString('cd.getStartedWithCD.flowByQuestions.howNwhere.K8s.cdPipeline.title')}
          </Text>

          <CDPipeline
            state={state}
            onDelegateSuccess={onDelegateSuccess}
            openDelagateDialog={openDelagateDialog}
            isDrawerOpen={isDrawerOpen}
            closeDelegateDialog={closeDelegateDialog}
            onDelegateFail={onDelegateFail}
            onVerificationStart={onVerificationStart}
            deploymentTypeDetails={deploymentTypeDetails}
            delegateTypes={
              deploymentTypeDetails.artifactSubType
                ? DELEGATE_TYPE_BY_ARTIFACT_MAP[deploymentTypeDetails.artifactSubType?.id]
                : DELEGATE_TYPE_BY_ARTIFACT_MAP[deploymentTypeDetails?.artifactType?.id as string]
            }
          />
        </Layout.Vertical>
      ) : (
        <Layout.Vertical>
          <Text color={Color.BLACK} className={css.bold} margin={{ bottom: 'large' }}>
            {getString('cd.getStartedWithCD.flowByQuestions.howNwhere.K8s.title')}
          </Text>

          <Layout.Vertical margin={{ bottom: 'xlarge' }}>
            <Text color={Color.BLACK} margin={{ bottom: 'large' }}>
              {getString('cd.getStartedWithCD.prefilghtText')}
            </Text>
            <CommandBlock
              allowCopy
              ignoreWhiteSpaces={false}
              commandSnippet={getCommandStrWithNewline([getString('cd.getStartedWithCD.preflightScript')])}
              downloadFileProps={{ downloadFileName: 'harness-delegate-preflight', downloadFileExtension: 'xdf' }}
              copyButtonText={getString('common.copy')}
              onCopy={() => {
                trackEvent(WIZARD_STEP_OPEN.PREFLIGHT_SCRIPT_COPIED, getBranchingProps(stepsProgress, getString))
              }}
            />
          </Layout.Vertical>
          <Layout.Vertical>
            <Text color={Color.BLACK} className={css.bold} margin={{ bottom: 'large' }}>
              {getString('cd.getStartedWithCD.connectHarness')}
            </Text>
            <CardSelect<DeploymentFlowType>
              data={deploymentTypes}
              cornerSelected
              className={cx(css.serviceTypeCards, css.flowcards)}
              renderItem={(item: DeploymentFlowType) => (
                <Layout.Vertical flex spacing={'xlarge'}>
                  <Icon name={item?.icon as IconName} size={30} />
                  <Layout.Vertical>
                    <Text
                      padding={{ bottom: 'small' }}
                      font={{ variation: FontVariation.BODY }}
                      color={state?.type?.id === item.id ? Color.PRIMARY_7 : Color.GREY_800}
                    >
                      {getString(item.label as keyof StringsMap)}
                    </Text>
                  </Layout.Vertical>
                </Layout.Vertical>
              )}
              selected={state.type}
              onChange={setType}
            />
          </Layout.Vertical>
          {state.type?.id === DEPLOYMENT_FLOW_ENUMS.CDPipeline && (
            <CDPipeline
              state={state}
              onDelegateSuccess={onDelegateSuccess}
              openDelagateDialog={openDelagateDialog}
              isDrawerOpen={isDrawerOpen}
              closeDelegateDialog={closeDelegateDialog}
              onDelegateFail={onDelegateFail}
              onVerificationStart={onVerificationStart}
              deploymentTypeDetails={deploymentTypeDetails}
              delegateTypes={
                deploymentTypeDetails.artifactSubType
                  ? DELEGATE_TYPE_BY_ARTIFACT_MAP[deploymentTypeDetails.artifactSubType?.id]
                  : DELEGATE_TYPE_BY_ARTIFACT_MAP[deploymentTypeDetails?.artifactType?.id as string]
              }
            />
          )}
          {state.type?.id === DEPLOYMENT_FLOW_ENUMS.Gitops && (
            <GitopsFlow
              updateAgentInfo={updateAgentInfo}
              agentInfo={state.agentInfo}
              onAgentVerificationSuccess={onAgentVerificationSuccess}
              artifactType={
                deploymentTypeDetails.artifactSubType
                  ? deploymentTypeDetails.artifactSubType?.id
                  : (deploymentTypeDetails?.artifactType?.id as string)
              }
            />
          )}
        </Layout.Vertical>
      )}
    </Layout.Vertical>
  )
}
export default WhereAndHowToDeploy
