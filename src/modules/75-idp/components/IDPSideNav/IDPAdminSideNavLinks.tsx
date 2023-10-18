/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useGetStatusInfoByTypeQuery } from '@harnessio/react-idp-service-client'
import { isEmpty } from 'lodash-es'
import { SideNav } from '@common/navigation/SideNavV2/SideNavV2'
import routes from '@common/RouteDefinitionsV2'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { useStrings } from 'framework/strings'
import { AccountPathProps, Module } from '@common/interfaces/RouteInterfaces'
import { FeatureFlag } from '@common/featureFlags'
import css from './IDPAdminSideNavLinks.module.scss'

const IDPAdminModule: Module = 'idp-admin'
const IDPModule: Module = 'idp'

function IDPAdminSideNavLinks(): React.ReactElement {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const IDPScorecardsEnabled = useFeatureFlag(FeatureFlag.IDP_ENABLE_SCORECARDS)

  const { data } = useGetStatusInfoByTypeQuery(
    { type: 'onboarding' },
    {
      staleTime: 15 * 60 * 1000
    }
  )
  const onboardingStatus = data?.content?.status?.current_status
  const [showGetStarted, setShowGetStarted] = useState(false)

  useEffect(() => {
    /* istanbul ignore if */
    if (!isEmpty(onboardingStatus)) {
      setShowGetStarted(onboardingStatus !== 'COMPLETED')
    }
  }, [onboardingStatus])

  return (
    <SideNav.Main disableScopeSelector disableCollapse>
      <SideNav.Section>
        {showGetStarted ? (
          /* istanbul ignore next */ <SideNav.Link
            label={getString('getStarted')}
            to={routes.toGetStartedWithIDP({ accountId, module: IDPAdminModule })}
          />
        ) : (
          <>
            <SideNav.Link
              label={getString('idp.backtoIDP')}
              to={routes.toIDP({ accountId, module: IDPModule })}
              icon="arrow-left"
              className={css.backToMenu}
            />
            <SideNav.Link
              label={getString('common.plugins')}
              icon="idp-nav-plugins"
              iconProps={{ padding: { right: 'xsmall' } }}
              to={routes.toPluginsPage({ accountId, module: IDPAdminModule })}
            />
            <SideNav.Link
              label={getString('common.configurations')}
              icon="idp-nav-pluginconfig"
              iconProps={{ padding: { right: 'xsmall' } }}
              to={routes.toConfigurations({ accountId, module: IDPAdminModule })}
            />
            <SideNav.Link
              label={getString('idp.oAuthConfig')}
              icon="idp-nav-oauth"
              iconProps={{ padding: { right: 'xsmall' } }}
              to={routes.toIDPOAuthConfig({ accountId, module: IDPAdminModule })}
            />
            {IDPScorecardsEnabled && (
              <SideNav.Link
                label={getString('idp.scorecards')}
                icon="idp-nav-scorecards"
                iconProps={{ padding: { right: 'xsmall' } }}
                to={routes.toScorecards({ accountId, module: IDPAdminModule })}
              />
            )}
            <SideNav.Link
              label={getString('idp.layout')}
              icon="idp-nav-layout"
              iconProps={{ padding: { right: 'xsmall' } }}
              to={routes.toLayoutConfig({ accountId, module: IDPAdminModule })}
            />
            <SideNav.Link
              label={getString('accessControl')}
              icon="user"
              iconProps={{ size: 18, padding: { right: 'xsmall' } }}
              to={routes.toIDPAccessControl({ accountId, module: IDPAdminModule })}
            />
            <SideNav.Link
              label={getString('connectorsLabel')}
              icon="idp-nav-connectors"
              iconProps={{ padding: { right: 'xsmall' } }}
              to={routes.toConnectorsPage({ accountId, module: IDPAdminModule })}
            />
            <SideNav.Link
              label={getString('idp.urlAllowList')}
              icon="idp-nav-allowlist"
              to={routes.toIDPAllowListURL({ accountId, module: IDPAdminModule })}
            />
          </>
        )}
      </SideNav.Section>
    </SideNav.Main>
  )
}

export default IDPAdminSideNavLinks
