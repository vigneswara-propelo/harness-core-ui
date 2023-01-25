/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import classnames from 'classnames'
import { useParams } from 'react-router-dom'
import { noop } from 'lodash-es'
import { Button, ButtonVariation, Container, HarnessDocTooltip, Layout, Text } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
// import { HelpPanel } from '@harness/help-panel'
import { Spinner } from '@blueprintjs/core'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings, UseStringsReturn } from 'framework/strings'
import { useAgentServiceForServerCreate, V1AgentType } from 'services/gitops'
import css from '../GetStartedWithCD.module.scss'
import createK8sCSS from '../CreateKubernetesDelegateWizard/CreateK8sDelegate.module.scss'

const AgentStaticInfo = ({ getString }: { getString: UseStringsReturn['getString'] }) => (
  <Container>
    <ul className={createK8sCSS.progress}>
      <li className={classnames(createK8sCSS.progressItem, createK8sCSS.progressItemActive, css.progressItem)}>
        <div className={css.agentFirstSection}>
          <Text className={css.aboutHarnessAdapterAnswer}>{getString('cd.getStartedWithCD.hostedAgentExplain')}</Text>
        </div>
        <Text font={{ variation: FontVariation.FORM_INPUT_TEXT }} margin={{ top: 'small' }} color={Color.GREY_800}>
          {getString('cd.getStartedWithCD.hostedAgentExplainContent')}
        </Text>
      </li>
      <li className={classnames(createK8sCSS.progressItem, createK8sCSS.progressItemActive, css.progressItem)}>
        <div>
          <div className={css.agentSecondSection}>
            <Text className={css.aboutHarnessAdapterAnswer}>{getString('cd.getStartedWithCD.hostedAgentInstall')}</Text>
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
      </li>
      <li className={classnames(createK8sCSS.progressItem, createK8sCSS.progressItemActive, css.progressItem)}>
        <div className={css.agentThirdSection}>
          <Text className={css.aboutHarnessAdapterAnswer}>{getString('cd.getStartedWithCD.hostedAgentInfoTitle')}</Text>
        </div>
        <div className={classnames(css.installedComponent, css.provisioningText)}>
          {getString('cd.getStartedWithCD.setupIPWhiteListing')}
        </div>
      </li>
    </ul>
  </Container>
)

const ProvisioningStaticInfo = ({
  loading,
  errorMessage,
  getString
}: {
  loading: boolean
  errorMessage?: string
  getString: UseStringsReturn['getString']
}) => (
  <Container>
    <div className={css.provisioningInfo}>
      {loading ? (
        <Spinner size={24} />
      ) : errorMessage ? (
        <div className={css.error}>{errorMessage}</div>
      ) : (
        <div>{getString('cd.getStartedWithCD.agentProvisionedSuccessfully')}</div>
      )}
    </div>
    <div className={css.provisioningSecondaryInfo}>
      {loading
        ? getString('cd.getStartedWithCD.agentSetupTimeInfo')
        : getString('cd.getStartedWithCD.ensureFullConnectivity')}
    </div>
  </Container>
)

export const GitOpsAgent = ({ onBack, onNext }: { onBack: () => void; onNext: () => void }) => {
  const { getString } = useStrings()
  // isProvisioningScreen is 2nd screen
  const [isProvisioningScreen, setIsProvisioningScreen] = React.useState(false)
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { mutate: createAgent, loading, error } = useAgentServiceForServerCreate({})
  const onProvisionAgent = async () => {
    setIsProvisioningScreen(true)
    const payload = {
      name: 'Hosted Agent uuid',
      identifier: 'Hosted_Agent_uuid',
      type: 'HOSTED_ARGO_PROVIDER' as V1AgentType,
      metadata: {
        highAvailability: false,
        existingInstallation: false
      },
      projectIdentifier: projectIdentifier,
      orgIdentifier: orgIdentifier,

      accountIdentifier: accountId
    }
    await createAgent(payload).then(noop).catch(noop)
  }

  return (
    <>
      <Container flex={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
        <Layout.Vertical width="70%">
          <Text font={{ variation: FontVariation.H3 }} padding={{ bottom: 'large' }} color={Color.GREY_600}>
            {getString('cd.getStartedWithCD.gitopsOnboardingAgentStep')}
            <HarnessDocTooltip tooltipId="cdOnboardGitopsAgent" useStandAlone={true} />
          </Text>
          <div className={css.agentDiagram} />
          {isProvisioningScreen ? (
            <ProvisioningStaticInfo loading={loading} errorMessage={error?.message} getString={getString} />
          ) : (
            <AgentStaticInfo getString={getString} />
          )}
        </Layout.Vertical>

        {/*<Container className={css.helpPanelContainer}>*/}
        {/*<HelpPanel referenceId="cdOnboardGitopsAgent" />*/}
        {/*</Container>*/}
      </Container>
      <Layout.Vertical>
        {/*className={css.footer}*/}
        <Layout.Horizontal spacing="medium" padding={{ top: 'medium', bottom: 'large' }} width="100%">
          {isProvisioningScreen ? (
            <>
              <Button
                variation={ButtonVariation.SECONDARY}
                text={getString('back')}
                icon="chevron-left"
                minimal
                onClick={onBack}
              />
              <Button
                text={`${getString('next')}: ${getString('connectors.ceAws.curExtention.stepB.step1.p1')}`}
                variation={ButtonVariation.PRIMARY}
                rightIcon="chevron-right"
                onClick={onNext}
                // disabled={disableBtn}
              />
            </>
          ) : (
            <>
              <Button
                variation={ButtonVariation.SECONDARY}
                text={getString('back')}
                icon="chevron-left"
                minimal
                onClick={onBack}
              />
              <Button
                text={getString('common.gitops.startProvisioning')}
                variation={ButtonVariation.PRIMARY}
                rightIcon="chevron-right"
                onClick={onProvisionAgent}
              />
            </>
          )}
        </Layout.Horizontal>
      </Layout.Vertical>
    </>
  )
}