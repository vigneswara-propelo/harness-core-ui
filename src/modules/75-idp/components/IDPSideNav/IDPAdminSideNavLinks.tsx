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
import { useStrings } from 'framework/strings'
import { AccountPathProps, Module } from '@common/interfaces/RouteInterfaces'

const IDPAdminModule: Module = 'idp-admin'
const IDPModule: Module = 'idp'

function IDPAdminSideNavLinks(): React.ReactElement {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()

  const { data } = useGetStatusInfoByTypeQuery(
    { type: 'onboarding' },
    {
      staleTime: 15 * 60 * 1000
    }
  )
  const onboardingStatus = data?.content?.status?.current_status
  const [showGetStarted, setShowGetStarted] = useState(false)

  useEffect(() => {
    if (!isEmpty(onboardingStatus)) {
      setShowGetStarted(onboardingStatus !== 'COMPLETED')
    }
  }, [onboardingStatus])

  return (
    <SideNav.Main disableScopeSelector>
      <SideNav.Section>
        {showGetStarted ? (
          <SideNav.Link
            label={getString('getStarted')}
            to={routes.toGetStartedWithIDP({ accountId, module: IDPAdminModule })}
          />
        ) : (
          <>
            <SideNav.Link
              label={getString('back')}
              to={routes.toIDP({ accountId, module: IDPModule })}
              icon="main-chevron-left"
            />
            <SideNav.Link
              label={getString('common.plugins')}
              to={routes.toPluginsPage({ accountId, module: IDPAdminModule })}
            />
            <SideNav.Link
              label={getString('common.configurations')}
              to={routes.toConfigurations({ accountId, module: IDPAdminModule })}
            />
            <SideNav.Link
              label={getString('idp.oAuthConfig')}
              to={routes.toIDPOAuthConfig({ accountId, module: IDPAdminModule })}
            />
            <SideNav.Link
              label={getString('idp.scorecards')}
              to={routes.toScorecards({ accountId, module: IDPAdminModule })}
            />
            <SideNav.Link
              label={getString('idp.layout')}
              to={routes.toLayoutConfig({ accountId, module: IDPAdminModule })}
            />
            <SideNav.Link
              label={getString('accessControl')}
              to={routes.toIDPAccessControl({ accountId, module: IDPAdminModule })}
            />
            <SideNav.Link
              label={getString('connectorsLabel')}
              to={routes.toConnectorsPage({ accountId, module: IDPAdminModule })}
            />
            <SideNav.Link
              label={getString('idp.urlAllowList')}
              to={routes.toIDPAllowListURL({ accountId, module: IDPAdminModule })}
            />
          </>
        )}
      </SideNav.Section>
    </SideNav.Main>
  )
}

export default IDPAdminSideNavLinks
