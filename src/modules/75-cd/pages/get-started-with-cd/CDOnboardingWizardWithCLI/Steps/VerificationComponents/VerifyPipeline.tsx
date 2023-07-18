/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Layout, ButtonVariation, Button, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { String, useStrings } from 'framework/strings'
import { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetPipeline } from 'services/pipeline-ng'
import { CDOnboardingSteps, PipelineSetupState } from '../../types'
import { PIPELINE_TO_STRATEGY_MAP } from '../../Constants'
import { useOnboardingStore } from '../../Store/OnboardingStore'
import css from '../../CDOnboardingWizardWithCLI.module.scss'
interface VerifyPipelineProps {
  saveProgress: (stepId: string, data: any) => void
}
export default function VerifyPipeline({ saveProgress }: VerifyPipelineProps): JSX.Element {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { stepsProgress } = useOnboardingStore()

  const pipelineStepsdata = React.useMemo((): PipelineSetupState => {
    return stepsProgress[CDOnboardingSteps.DEPLOYMENT_STEPS]?.stepData
  }, [stepsProgress])
  const { data, refetch, error } = useGetPipeline({
    pipelineIdentifier: PIPELINE_TO_STRATEGY_MAP[pipelineStepsdata?.strategy?.id as string] || '',
    lazy: true,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })
  useEffect(() => {
    if (data?.data && !pipelineStepsdata?.pipelineVerified) {
      saveProgress(CDOnboardingSteps.DEPLOYMENT_STEPS, { ...pipelineStepsdata, pipelineVerified: true })
    }

    if (error && pipelineStepsdata?.pipelineVerified) {
      saveProgress(CDOnboardingSteps.DEPLOYMENT_STEPS, { ...pipelineStepsdata, pipelineVerified: false })
    }
  }, [data, error, pipelineStepsdata])

  const refetchPipeline = async (): Promise<void> => {
    await refetch()
  }
  return (
    <Layout.Vertical className={css.verifyPipeline} margin={{ top: 'xlarge', bottom: 'xlarge' }}>
      {!pipelineStepsdata?.pipelineVerified && !data?.data && !error && (
        <Layout.Horizontal className={css.verifyPipelineText}>
          <Button width={80} onClick={refetchPipeline} variation={ButtonVariation.PRIMARY}>
            {getString('verify')}
          </Button>
          <Layout.Horizontal padding={{ left: 'large' }}>
            <String stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step6.verifyPipeline"></String>
          </Layout.Horizontal>
        </Layout.Horizontal>
      )}
      {error && !pipelineStepsdata?.pipelineVerified && <TroubleShootPipeline refetchPipeline={refetchPipeline} />}
      {(data?.data || pipelineStepsdata?.pipelineVerified) && <PipelineSuccess />}
    </Layout.Vertical>
  )
}

function PipelineSuccess(): JSX.Element {
  const { getString } = useStrings()
  return (
    <Layout.Vertical background={Color.GREEN_50} margin={{ top: 'xlarge', bottom: 'xlarge' }} padding="large">
      <Text
        icon="tick-circle"
        iconProps={{ color: Color.GREEN_900, padding: { right: 'large' } }}
        color={Color.GREEN_900}
      >
        {getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step6.pipelinesuccess')}
      </Text>
    </Layout.Vertical>
  )
}

function TroubleShootPipeline({ refetchPipeline }: { refetchPipeline: () => Promise<void> }): JSX.Element {
  const { getString } = useStrings()
  return (
    <Layout.Vertical background={Color.RED_50} padding="large" margin={{ top: 'xlarge', bottom: 'xlarge' }}>
      <Text
        padding={{ bottom: 'xlarge' }}
        icon="danger-icon"
        iconProps={{ color: Color.ERROR, padding: { right: 'large' } }}
        color={Color.ERROR}
      >
        {getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step6.pipelinenotfound')}
      </Text>
      <Text padding={{ bottom: 'xlarge' }}>
        {getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step6.recheckpipeline')}
      </Text>
      <Layout.Horizontal spacing="large">
        <Button variation={ButtonVariation.SECONDARY} onClick={refetchPipeline}>{`${getString('retry')} ${getString(
          'common.purpose.cv.verification'
        )}`}</Button>

        <Button variation={ButtonVariation.LINK}>{`${getString('retry')} ${getString(
          'delegates.delegateNotInstalled.tabs.commonProblems.troubleshoot'
        )}`}</Button>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}
