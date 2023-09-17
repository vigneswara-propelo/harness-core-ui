import React from 'react'
import { useParams } from 'react-router-dom'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { SideNav } from '@common/navigation/SideNavV2/SideNavV2'
import routes from '@common/RouteDefinitionsV2'
import { AccountPathProps, Module } from '@common/interfaces/RouteInterfaces'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useStrings } from 'framework/strings'
import { Scope } from 'framework/types/types'
import { NAV_MODE } from '@common/utils/routeUtils'

const module: Module = 'sto'

const STOSideNavLinks = (mode: NAV_MODE): React.ReactElement => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { selectedProject } = useAppStore()
  const { identifier = '', orgIdentifier = '' } = selectedProject || {}
  const { STO_ALL_ISSUES_PAGE } = useFeatureFlags()

  return (
    <SideNav.Main>
      <SideNav.Section>
        <SideNav.Scope scope={Scope.PROJECT}>
          <SideNav.Link
            icon="nav-home"
            label={getString('overview')}
            to={routes.toOverview({ accountId, projectIdentifier: identifier, orgIdentifier, module })}
          />

          <SideNav.Link
            icon="main-issue"
            label={getString('sto.issues')}
            to={routes.toSTOIssues({ accountId, projectIdentifier: identifier, orgIdentifier, module })}
            hidden={!STO_ALL_ISSUES_PAGE}
          />

          <SideNav.Link
            icon="nav-pipeline"
            label={getString('common.pipelineExecution')}
            to={routes.toPipelines({ accountId, projectIdentifier: identifier, orgIdentifier, module })}
          />

          <SideNav.Link
            icon="error-tracking"
            label={getString('sto.targets.testTargets')}
            to={routes.toSTOTargets({ accountId, projectIdentifier: identifier, orgIdentifier, module })}
          />

          <SideNav.Link
            icon="ban-circle"
            label={getString('sto.exemptions')}
            to={routes.toSTOSecurityReview({ accountId, projectIdentifier: identifier, orgIdentifier, module })}
          />

          <SideNav.Link
            icon="sto-grey"
            label={getString('sto.gettingStarted')}
            to={routes.toSTOGettingStarted({ accountId, projectIdentifier: identifier, orgIdentifier, module })}
          />
        </SideNav.Scope>
      </SideNav.Section>

      <SideNav.SettingsLink mode={mode} module={module} />
    </SideNav.Main>
  )
}

export default STOSideNavLinks
