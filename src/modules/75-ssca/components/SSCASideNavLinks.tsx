import React from 'react'
import { useParams } from 'react-router-dom'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { SideNav } from '@common/navigation/SideNavV2/SideNavV2'
import routes from '@common/RouteDefinitionsV2'
import { AccountPathProps, Module } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { Scope } from 'framework/types/types'
import { NAV_MODE } from '@common/utils/routeUtils'
import { useGetSelectedScope } from '@common/navigation/SideNavV2/SideNavV2.utils'

const module: Module = 'ssca'

const SSCASideNavLinks = (mode: NAV_MODE): React.ReactElement => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { params } = useGetSelectedScope()
  const { projectIdentifier = '', orgIdentifier = '' } = params || {}
  const { SSCA_ARTIFACTS_ENABLED } = useFeatureFlags()

  return (
    <SideNav.Main>
      <SideNav.Section>
        <SideNav.Scope scope={Scope.PROJECT}>
          <SideNav.Link
            icon="nav-home"
            label={getString('overview')}
            to={routes.toOverview({ accountId, projectIdentifier, orgIdentifier, module })}
          />
          <SideNav.Link
            icon="ssca-artifacts"
            label={getString('artifacts')}
            to={routes.toSSCAArtifacts({ accountId, projectIdentifier, orgIdentifier, module })}
            hidden={!SSCA_ARTIFACTS_ENABLED}
          />
        </SideNav.Scope>
      </SideNav.Section>

      <SideNav.SettingsLink mode={mode} module={module} />
    </SideNav.Main>
  )
}

export default SSCASideNavLinks
