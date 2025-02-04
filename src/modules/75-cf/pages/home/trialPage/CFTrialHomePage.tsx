/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Heading, Layout, Container } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { ResponseModuleLicenseDTO, StartFreeLicenseQueryParams, useStartFreeLicense } from 'services/cd-ng'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { getGaClientID, getSavedRefererURL, isOnPrem } from '@common/utils/utils'
import bgImageURL from '../ff.svg'
import CFTrialPanel from './CFTrialPanel'
import css from './CFTrialPage.module.scss'

const CFTrialHomePage: React.FC = () => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const isFreeEnabled = !isOnPrem()
  const refererURL = getSavedRefererURL()
  const gaClientID = getGaClientID()
  const { mutate: startFreePlan, loading: startingFree } = useStartFreeLicense({
    queryParams: {
      accountIdentifier: accountId,
      moduleType: 'CF' as StartFreeLicenseQueryParams['moduleType'],
      ...(refererURL ? { referer: refererURL } : {}),
      ...(gaClientID ? { gaClientId: gaClientID } : {})
    },
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    }
  })

  function handleStartTrial(): Promise<ResponseModuleLicenseDTO> {
    return startFreePlan()
  }

  const startTrialProps = {
    description: getString('cf.cfTrialHomePage.startTrial.description'),
    learnMore: {
      description: getString('cf.learnMore'),
      url: 'https://docs.harness.io/article/0a2u2ppp8s-getting-started-with-continuous-features'
    },
    startBtn: {
      description: isFreeEnabled
        ? getString('cf.cfTrialHomePage.startFreePlanBtn')
        : getString('cf.cfTrialHomePage.startTrial.startBtn.description')
    }
  }

  return (
    <Container className={css.body} style={{ background: `transparent url(${bgImageURL}) no-repeat` }}>
      <Layout.Vertical spacing="medium">
        <Heading className={css.heading} font={{ variation: FontVariation.H1 }} color={Color.BLACK_100}>
          {getString('cf.cfTrialHomePage.featureFlagsDescription')}
        </Heading>
        <CFTrialPanel {...startTrialProps} startTrial={handleStartTrial} loading={startingFree} />
      </Layout.Vertical>
    </Container>
  )
}

export default CFTrialHomePage
