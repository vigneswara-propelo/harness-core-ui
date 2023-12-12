/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { useGetStatusInfoTypeV2Query } from '@harnessio/react-idp-service-client'
import { isEmpty } from 'lodash-es'
import { useToggleOpen } from '@harness/uicore'
import { Project } from 'services/cd-ng'
import { SideNav } from '@common/navigation/SideNavV2/SideNavV2'
import routes from '@common/RouteDefinitionsV2'
import { useStrings } from 'framework/strings'
import { AccountPathProps, Module } from '@common/interfaces/RouteInterfaces'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { Scope } from 'framework/types/types'
import { ScopeSelector } from '@projects-orgs/components/ScopeSelector/ScopeSelector'
import css from './IDPAdminSideNavLinks.module.scss'

const IDPAdminModule: Module = 'idp-admin'
const IDPModule: Module = 'idp'

function IDPAdminSideNavLinks(): React.ReactElement {
  const { getString } = useStrings()
  const history = useHistory()
  const { accountId } = useParams<AccountPathProps>()
  const { selectedProject } = useAppStore()

  const { identifier: projectIdentifier = '', orgIdentifier = '' } = selectedProject || {}
  const { isOpen: isScopeSelectorOpen, toggle: toggleScopeSelector, close: closeScopeSelector } = useToggleOpen()

  const { data } = useGetStatusInfoTypeV2Query(
    { type: 'onboarding' },
    {
      staleTime: 15 * 60 * 1000
    }
  )
  const onboardingStatus = data?.content?.onboarding?.current_status
  const [showGetStarted, setShowGetStarted] = useState(false)

  useEffect(() => {
    /* istanbul ignore if */
    if (!isEmpty(onboardingStatus)) {
      setShowGetStarted(onboardingStatus !== 'COMPLETED')
    }
  }, [onboardingStatus])

  function handleScopeChange(projectData?: Project): void {
    closeScopeSelector()
    history.push(
      routes.toPipelines({
        accountId,
        projectIdentifier: projectData?.identifier,
        orgIdentifier: projectData?.orgIdentifier,
        module: IDPAdminModule
      })
    )
  }

  return (
    <SideNav.Main disableCollapse disableScopeSelector>
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
            <SideNav.Link
              label={getString('idp.scorecards')}
              icon="idp-nav-scorecards"
              iconProps={{ padding: { right: 'xsmall' } }}
              to={routes.toScorecards({ accountId, module: IDPAdminModule })}
            />
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

      {!showGetStarted && (
        <>
          <div className={css.scopeSelector}>
            <ScopeSelector
              isOpen={isScopeSelectorOpen}
              onButtonClick={toggleScopeSelector}
              onClose={closeScopeSelector}
              allowedScopes={[Scope.PROJECT]}
              onScopeChange={handleScopeChange}
              noScopeSelected={!selectedProject}
            />
          </div>
          <SideNav.Section>
            <SideNav.Link
              icon="nav-pipeline"
              label={getString('pipelines')}
              to={
                selectedProject
                  ? routes.toPipelines({ accountId, projectIdentifier, orgIdentifier, module: IDPAdminModule })
                  : routes.toIDPProjectSetup({ accountId, module: IDPAdminModule })
              }
            />
            {selectedProject && (
              <SideNav.Link
                icon="execution"
                label={getString('executionsText')}
                to={routes.toDeployments({ accountId, projectIdentifier, orgIdentifier, module: IDPAdminModule })}
              />
            )}
          </SideNav.Section>
        </>
      )}
    </SideNav.Main>
  )
}

export default IDPAdminSideNavLinks
