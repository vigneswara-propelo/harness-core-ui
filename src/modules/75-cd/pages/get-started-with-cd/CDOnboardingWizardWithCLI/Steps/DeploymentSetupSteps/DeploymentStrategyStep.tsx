/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Color, FontVariation } from '@harness/design-system'
import { Layout, CardSelect, Text, Icon, IconName } from '@harness/uicore'
import { StringsMap } from 'stringTypes'
import CommandBlock from '@common/CommandBlock/CommandBlock'
import { String, useStrings } from 'framework/strings'
import { DEPLOYMENT_STRATEGY_TYPES, StrategyVideoByType } from '../../Constants'
import { CDOnboardingSteps, DeploymentStrategyTypes } from '../../types'
import { useOnboardingStore } from '../../Store/OnboardingStore'
import VerifyPipeline from '../VerificationComponents/VerifyPipeline'
import css from '../../CDOnboardingWizardWithCLI.module.scss'

interface DeploymentStrategySelectionProps {
  updateState: (data?: DeploymentStrategyTypes) => void
  saveProgress: (stepId: string, data: any) => void
}
export default function DeploymentStrategySelection({
  updateState,
  saveProgress
}: DeploymentStrategySelectionProps): JSX.Element {
  const { stepsProgress } = useOnboardingStore()
  const [state, setState] = React.useState<DeploymentStrategyTypes | undefined>(() => {
    return stepsProgress[CDOnboardingSteps.DEPLOYMENT_STEPS]?.stepData?.strategy || DEPLOYMENT_STRATEGY_TYPES.Canary
  })
  const { getString } = useStrings()

  const deploymentStrategies = React.useMemo((): DeploymentStrategyTypes[] => {
    return Object.values(DEPLOYMENT_STRATEGY_TYPES).map((data: DeploymentStrategyTypes) => {
      return data
    })
  }, [])

  React.useEffect(() => {
    updateState(state)
  }, [state])

  const setDeploymentStrategy = (selected: DeploymentStrategyTypes): void => {
    setState(selected)
    saveProgress(CDOnboardingSteps.DEPLOYMENT_STEPS, { ...state, pipelineVerified: false })
  }
  return (
    <Layout.Vertical>
      <Text color={Color.BLACK} font={{ variation: FontVariation.FORM_TITLE }} margin={{ bottom: 'large' }}>
        <String color={Color.BLACK} stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step6.title" />
      </Text>
      <Text color={Color.BLACK} padding={{ bottom: 'xlarge' }}>
        <String
          color={Color.BLACK}
          className={css.marginBottomLarge}
          stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step6.description"
        />
      </Text>

      <CardSelect<DeploymentStrategyTypes>
        data={deploymentStrategies}
        cornerSelected
        className={cx(css.serviceTypeCards, css.deploymentStrategyCards)}
        renderItem={(item: DeploymentStrategyTypes) => (
          <Layout.Vertical flex spacing={'xlarge'}>
            <Icon name={item?.icon as IconName} size={30} />
            <Text
              className={cx({ [css.bold]: state?.id === item.id })}
              font={{
                variation: FontVariation.BODY2
              }}
              color={state?.id === item.id ? Color.PRIMARY_7 : Color.GREY_800}
            >
              {item.label}
            </Text>
            <Text
              margin={{ top: 'small' }}
              font={{
                variation: FontVariation.BODY2_SEMI
              }}
              color={Color.GREY_800}
            >
              {getString(item.subtitle as keyof StringsMap)}
            </Text>
          </Layout.Vertical>
        )}
        selected={state}
        onChange={setDeploymentStrategy}
      />

      {state && (
        <Layout.Vertical margin={{ bottom: 'xlarge' }}>
          <PipelineCommandStep strategy={state} />
          <Layout.Horizontal>
            <video key={state.id} className={css.videoPlayer} autoPlay data-testid="videoPlayer">
              <source src={StrategyVideoByType[state.id]} type="video/mp4"></source>
              <Text tooltipProps={{ dataTooltipId: 'videoNotSupportedError' }}>
                {getString('common.videoNotSupportedError')}
              </Text>
            </video>
            <Layout.Vertical className={css.deploymentStrategySteps}>
              {DEPLOYMENT_STRATEGY_TYPES[state.id].steps?.map((stepText, index) => {
                return (
                  <Layout.Vertical key={index} className={css.deploymentStrategyStep}>
                    <Text color={Color.BLACK} className={css.bold}>
                      {stepText.title}:
                    </Text>
                    <Text color={Color.BLACK}>{getString(stepText.description as keyof StringsMap)}</Text>
                  </Layout.Vertical>
                )
              })}
            </Layout.Vertical>
          </Layout.Horizontal>
        </Layout.Vertical>
      )}

      <VerifyPipeline key={state?.id} saveProgress={saveProgress} />
    </Layout.Vertical>
  )
}

function PipelineCommandStep({ strategy }: { strategy: DeploymentStrategyTypes }): JSX.Element {
  const { getString } = useStrings()

  return (
    <Layout.Vertical margin={{ bottom: 'xlarge', top: 'large' }}>
      <CommandBlock
        darkmode
        allowCopy={true}
        commandSnippet={getString(strategy.pipelineCommand)}
        ignoreWhiteSpaces={false}
        downloadFileProps={{ downloadFileName: 'harness-cli-setup', downloadFileExtension: 'xdf' }}
        copyButtonText={getString('common.copy')}
      />
    </Layout.Vertical>
  )
}
