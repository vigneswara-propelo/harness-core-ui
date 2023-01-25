/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import classnames from 'classnames'
import { Button, ButtonVariation, Container, HarnessDocTooltip, Layout, Text } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
// import { HelpPanel } from '@harness/help-panel'
import { useStrings, UseStringsReturn } from 'framework/strings'
import css from '../GetStartedWithCD.module.scss'

const AgentStaticInfo = ({ getString }: { getString: UseStringsReturn['getString'] }) => (
  <Container>
    <div className={css.agentFirstSection}>
      <div className={css.sectionNumberBlue}>1</div>
      <Text className={css.aboutHarnessAdapterAnswer}>{getString('cd.getStartedWithCD.hostedAgentExplain')}</Text>
    </div>
    <Text
      font={{ variation: FontVariation.FORM_INPUT_TEXT }}
      margin={{ top: 'small' }}
      color={Color.GREY_800}
      padding={{ left: 'xxxlarge' }}
    >
      {getString('cd.getStartedWithCD.hostedAgentExplainContent')}
    </Text>
    <div>
      <div className={css.agentSecondSection}>
        <div className={css.sectionNumberBlue}>2</div>
        <Text padding={{ left: 'var(--spacing-8)' }} className={css.aboutHarnessAdapterAnswer}>
          {getString('cd.getStartedWithCD.hostedAgentInstall')}
        </Text>
      </div>
      <div className={css.installedComponent}>
        <div className={css.blueDot} />
        {getString('cd.getStartedWithCD.gitOpsAgent')}
      </div>
      <div className={css.installedComponent}>
        <div className={css.blueDot} />
        {getString('cd.getStartedWithCD.repoServer')}
      </div>
      <div className={css.installedComponent}>
        <div className={css.blueDot} />
        {getString('cd.getStartedWithCD.redisCache')}
      </div>
      <div className={css.installedComponent}>
        <div className={css.blueDot} />
        {getString('cd.getStartedWithCD.applicationController')}
      </div>
      <div className={classnames(css.installedComponent, css.provisioningText)}>
        {getString('cd.getStartedWithCD.provisioningText')}
      </div>
    </div>

    <div className={css.agentThirdSection}>
      <div className={css.sectionNumberBlue}>3</div>
      <Text className={css.aboutHarnessAdapterAnswer}>{getString('cd.getStartedWithCD.hostedAgentInfoTitle')}</Text>
    </div>
  </Container>
)

export const GitOpsAgent = ({ onBack }: { onBack: () => void }) => {
  const { getString } = useStrings()
  return (
    <Container flex={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
      <Layout.Vertical width="70%">
        <Text
          font={{ variation: FontVariation.H3 }}
          padding={{ bottom: 'large' }}
          color={Color.GREY_600}
          data-tooltip-id="cdOnboardGitopsAgent"
        >
          {/*{getString('cd.getStartedWithCD.gitopsOnboardingAgentStep')}*/}
          <HarnessDocTooltip tooltipId="cdOnboardGitopsAgent" useStandAlone={true} />
        </Text>
        <div className={css.agentDiagram} />
        <AgentStaticInfo getString={getString} />
      </Layout.Vertical>
      <Layout.Vertical padding={{ left: 'huge' }}>
        {/*className={css.footer}*/}
        <Layout.Horizontal spacing="medium" padding={{ top: 'medium', bottom: 'large' }} width="100%">
          <Button
            variation={ButtonVariation.SECONDARY}
            text={getString('back')}
            icon="chevron-left"
            minimal
            onClick={onBack}
          />
          <Button
            text={'Start Provisioning'}
            variation={ButtonVariation.PRIMARY}
            rightIcon="chevron-right"
            // onClick={() => onClickNext?.()}
            // disabled={disableBtn}
          />
        </Layout.Horizontal>
      </Layout.Vertical>

      {/*<Container className={css.helpPanelContainer}>*/}
      {/*<HelpPanel referenceId="cdOnboardGitopsAgent" />*/}
      {/*</Container>*/}
    </Container>
  )
}
