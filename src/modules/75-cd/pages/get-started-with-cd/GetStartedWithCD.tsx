/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import cx from 'classnames'
import { Text, Icon, Layout, Container, Card, Button, ButtonSize, ButtonVariation } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useHistory, useParams } from 'react-router-dom'
import { useFeatureFlag } from '@harnessio/ff-react-client-sdk'
import { String, useStrings } from 'framework/strings'
import WithABFFProvider from '@common/components/WithFFProvider/WithFFProvider'
import type { ProjectPathProps, ServicePathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { CDOnboardingActions } from '@common/constants/TrackingConstants'
import { PLG_EXPERIMENTS, EXPOSURE_EVENT } from '@common/components/WithFFProvider/PLGExperiments'
import { FeatureFlag } from '@common/featureFlags'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { PLG_CD_GET_STARTED_VARIANTS } from '@common/components/ConfigureOptions/constants'
import GetStartedWithCDV2 from './GetStartedWithCDv2'
import css from './GetStartedWithCD.module.scss'
interface GetStartedClickFn {
  onGetStartedClick?: () => void
}
function GetStartedWithCD({ onGetStartedClick }: GetStartedClickFn): React.ReactElement {
  return (
    <Layout.Vertical flex>
      <Container className={cx(css.topPage, css.oldGetStarted, css.fullscreenPage)}>
        <div className={css.getStartedGrid}>
          <GetStartedSection onGetStartedClick={onGetStartedClick} />
          <HarnessInfoSection />
        </div>
      </Container>
    </Layout.Vertical>
  )
}

function GetStartedSection({ onGetStartedClick }: GetStartedClickFn): JSX.Element {
  const { trackEvent } = useTelemetry()
  const history = useHistory()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps & ServicePathProps>()
  const getStartedClickHandler = (): void => {
    trackEvent(CDOnboardingActions.GetStartedClicked, {})
    if (onGetStartedClick) {
      onGetStartedClick()
    } else {
      history.push(routes.toCDOnboardingWizard({ accountId, orgIdentifier, projectIdentifier, module: 'cd' }))
    }
  }
  const { getString } = useStrings()
  const CDResources = [
    {
      label: getString('cd.getStartedWithCD.cdresources.cdconcepts'),
      url: 'https://developer.harness.io/docs/continuous-delivery/get-started/key-concepts'
    },
    {
      label: getString('cd.getStartedWithCD.cdresources.cdtuts'),
      url: 'https://developer.harness.io/tutorials/cd-pipelines'
    },
    {
      label: getString('cd.getStartedWithCD.cdresources.gitopsbasics'),
      url: 'https://developer.harness.io/docs/continuous-delivery/gitops/get-started/harness-git-ops-basics'
    },
    {
      label: getString('cd.getStartedWithCD.cdresources.pipelineModeling'),
      url: 'https://developer.harness.io/docs/continuous-delivery/get-started/cd-pipeline-modeling-overview'
    },
    {
      label: getString('cd.getStartedWithCD.cdresources.getstartedcli'),
      url: 'https://developer.harness.io/docs/platform/automation/cli/install'
    },
    {
      label: getString('cd.getStartedWithCD.cdresources.delgateOverview'),
      url: 'https://developer.harness.io/docs/platform/delegates/delegate-concepts/delegate-overview/'
    }
  ]
  return (
    <div className={css.harnessLinksSection}>
      <Card className={cx(css.sampleDeploymentcard, css.cardsPadding)}>
        <Text font={{ variation: FontVariation.H4, weight: 'semi-bold' }} margin={{ bottom: 'small' }}>
          {getString('cd.getStartedWithCD.getStartedPage.sampleDeployment')}
        </Text>
        <Text color={Color.BLACK} margin={{ bottom: 'large' }}>
          <String stringID="cd.getStartedWithCD.getStartedPage.prereq" useRichText />
        </Text>
        <Button
          variation={ButtonVariation.PRIMARY}
          rightIcon="right-arrow"
          size={ButtonSize.LARGE}
          text={getString('getStarted')}
          onClick={getStartedClickHandler}
        />
      </Card>
      <Card className={cx(css.cardsPadding)}>
        <Text
          margin={{ bottom: 'medium' }}
          font={{ variation: FontVariation.H5, weight: 'semi-bold' }}
          color={Color.GREY_900}
        >
          <String stringID="cd.getStartedWithCD.getStartedPage.moreAboutCD" />
        </Text>
        <div className={css.cdlinks}>
          {CDResources.map(data => (
            <Text key={data.label} font={{ align: 'left' }} margin={{ bottom: 'large' }}>
              <a target="_blank" href={data.url} rel="noreferrer noopener nofollow">
                {data.label}
              </a>
            </Text>
          ))}
        </div>
      </Card>
      <Card className={cx(css.cardsPadding, css.pointer)} onClick={() => history.push(routes.toCIHome({ accountId }))}>
        <Layout.Horizontal flex={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <div className={css.cicard}>
            <Text
              margin={{ bottom: 'medium' }}
              font={{ variation: FontVariation.H5, weight: 'semi-bold' }}
              color={Color.GREY_900}
            >
              <String stringID="cd.getStartedWithCD.getStartedPage.optimizeBuilds" />
            </Text>
            <Text
              color={Color.BLACK}
              margin={{ bottom: 'large' }}
              onClick={e => {
                e.stopPropagation()
              }}
            >
              <String stringID="cd.getStartedWithCD.getStartedPage.ciVsCd" useRichText />
            </Text>
          </div>
          <Icon size={32} name="right-arrow" />
        </Layout.Horizontal>
      </Card>
    </div>
  )
}
function HarnessInfoSection(): JSX.Element {
  const { getString } = useStrings()
  return (
    <div className={css.harnessInfoSection}>
      <Card className={cx(css.aboutHarnesscard, css.cardsPadding)}>
        <Layout.Vertical spacing="large">
          <Button
            variation={ButtonVariation.LINK}
            color={Color.GREEN_600}
            className={css.videoBtn}
            href="https://www.youtube.com/watch?v=k-f1nbgGkww&ab_channel=harness"
            target="_blank"
          >
            <Icon name="play" />
            <String stringID="cd.getStartedWithCD.getStartedPage.videoOverview" />
          </Button>
          <InfoRow
            title={getString('cd.getStartedWithCD.getStartedPage.deployAnywhere')}
            subtitle={getString('cd.getStartedWithCD.getStartedPage.deployAnywhereInfo')}
          />
          <InfoRow
            title={getString('cd.getStartedWithCD.getStartedPage.stdDeployment')}
            subtitle={getString('cd.getStartedWithCD.getStartedPage.stdDeploymentInfo')}
          />
          <InfoRow
            title={getString('cd.getStartedWithCD.getStartedPage.fastRelease')}
            subtitle={getString('cd.getStartedWithCD.getStartedPage.fastReleaseInfo')}
          />
          <InfoRow
            title={getString('cd.getStartedWithCD.getStartedPage.improveRelease')}
            subtitle={getString('cd.getStartedWithCD.getStartedPage.improveReleaseInfo')}
          />
          <InfoRow
            title={getString('cd.getStartedWithCD.getStartedPage.reduceDeployment')}
            subtitle={getString('cd.getStartedWithCD.getStartedPage.reduceDeploymentInfo')}
          />
        </Layout.Vertical>
      </Card>
    </div>
  )
}
function InfoRow({ title, subtitle }: { title: string; subtitle: string }): JSX.Element {
  return (
    <div>
      <Text font={{ weight: 'semi-bold' }} margin={{ bottom: 'xsmall' }}>
        {title}
      </Text>
      <Text>{subtitle}</Text>
    </div>
  )
}

const GetStartedWithAB: React.FC<GetStartedClickFn> = ({ onGetStartedClick }) => {
  const {
    currentUserInfo: { uuid }
  } = useAppStore()
  return (
    <WithABFFProvider
      fallback={<GetStartedWithCD onGetStartedClick={onGetStartedClick} />}
      featureFlagsToken={window.HARNESS_PLG_FF_SDK_KEY}
      config={{ experimentKey: PLG_EXPERIMENTS.CD_GET_STARTED, identifier: uuid }}
    >
      <GetStartedWithHooks onGetStartedClick={onGetStartedClick} />
    </WithABFFProvider>
  )
}

const GetStartedWithHooks: React.FC<GetStartedClickFn> = ({ onGetStartedClick }) => {
  const FLOW_TYPE = useFeatureFlag(FeatureFlag.PLG_CD_GET_STARTED_AB)
  const trackExposure = useFeatureFlag(FeatureFlag.PLG_GET_STARTED_EXPOSURE_ENABLED)
  const { trackEvent } = useTelemetry()
  useEffect(() => {
    trackExposure &&
      trackEvent(EXPOSURE_EVENT, {
        flag_key: FeatureFlag.PLG_CD_GET_STARTED_AB,
        variant: FLOW_TYPE
      })
  }, [])
  return FLOW_TYPE === PLG_CD_GET_STARTED_VARIANTS.INFO_HEAVY ? (
    <GetStartedWithCD onGetStartedClick={onGetStartedClick} />
  ) : (
    <GetStartedWithCDV2 />
  )
}
export default GetStartedWithAB
