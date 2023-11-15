/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Dialog, Icon, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useParams, useHistory } from 'react-router-dom'
import { String, useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import { ProjectPathProps } from '@modules/10-common/interfaces/RouteInterfaces'
import GetStartedWithAB from '../GetStartedWithCD'
import CDOnboardingWizard from './CDOnboardingWizard'
import css from './CDOnboardingWizardWithCLI.module.scss'

enum OnbaordingScreenType {
  GET_STARTED = 'GET_STARTED',
  WIZARD = 'WIZARD'
}
export default function CDOnboardingFullScreen(): JSX.Element {
  const [screenType, setScreenType] = useState<OnbaordingScreenType>(OnbaordingScreenType.GET_STARTED)
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const history = useHistory()
  const gotoPipelines = (): void => {
    history.push(
      routes.toPipelines({
        projectIdentifier,
        orgIdentifier,
        accountId,
        module: 'cd'
      })
    )
  }

  const onStateChange = (): void => {
    setScreenType(OnbaordingScreenType.WIZARD)
  }
  return (
    <Dialog
      onClose={gotoPipelines}
      isOpen={true}
      style={{
        minWidth: '100%',
        height: '100%',
        borderLeft: 0,
        padding: 0,
        position: 'relative',
        margin: 0
      }}
      enforceFocus={false}
      usePortal
      canOutsideClickClose={false}
    >
      <CDOnboardingTitleBanner screenType={screenType} />
      {screenType === OnbaordingScreenType.GET_STARTED ? (
        <GetStartedWithAB onGetStartedClick={onStateChange} />
      ) : (
        <CDOnboardingWizard />
      )}
    </Dialog>
  )
}

function CDOnboardingTitleBanner({ screenType }: { screenType: OnbaordingScreenType }): JSX.Element {
  const { getString } = useStrings()
  return (
    <Layout.Horizontal
      flex={{ alignItems: 'center', justifyContent: 'start' }}
      padding={{ top: 'xlarge', right: 'large', bottom: 'xlarge', left: 'large' }}
      className={css.cdTitleBanner}
    >
      <div className={css.cdLogo}>
        <Icon name="cd-main" size={40} />
        <Text
          margin={{ bottom: 'medium' }}
          font={{ variation: FontVariation.H5, weight: 'semi-bold' }}
          color={Color.GREY_900}
          width={100}
          flex={{ alignItems: 'center' }}
        >
          <String stringID="common.purpose.cd.continuous" />
        </Text>
      </div>
      <Layout.Vertical>
        <Text font={{ variation: FontVariation.H1, weight: 'semi-bold' }} padding={{ left: 'xxxlarge' }}>
          {getString(
            screenType === OnbaordingScreenType.WIZARD
              ? 'cd.getStartedWithCD.getStartedPage.sampleDeployment'
              : 'cd.getStartedWithCD.onboardingTitle'
          )}
        </Text>
        {screenType === OnbaordingScreenType.WIZARD && (
          <Text padding={{ left: 'xxxlarge' }} font={{ variation: FontVariation.BODY1 }}>
            {getString('cd.getStartedWithCD.onBoardingSubTitle')}
          </Text>
        )}
      </Layout.Vertical>
      <div></div>
    </Layout.Horizontal>
  )
}
