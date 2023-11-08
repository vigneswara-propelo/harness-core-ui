import React from 'react'
import { useParams } from 'react-router-dom'
import { HarnessIconName } from '@harness/icons'
import { DashboardFolderPathProps } from '@common/interfaces/RouteInterfaces'
import { SideNav } from '@common/navigation/SideNavV2/SideNavV2'
import routes from '@common/RouteDefinitionsV2'
import { useFeatureFlags } from '@modules/10-common/hooks/useFeatureFlag'
import { useStrings } from 'framework/strings'

const DashboardsSideNav = (): React.ReactElement => {
  const { accountId, folderId } = useParams<DashboardFolderPathProps>()
  const { CDB_MFE_ENABLED } = useFeatureFlags()
  const { getString } = useStrings()

  const dashboardIcon: HarnessIconName = 'dashboards-solid-border'
  const folderIcon: HarnessIconName = 'main-folder'
  const homeIcon: HarnessIconName = 'nav-home'

  return (
    <SideNav.Main disableScopeSelector>
      <SideNav.Section>
        {CDB_MFE_ENABLED ? (
          <SideNav.Link to={routes.toDashboardsOverview({ accountId })} label={getString('overview')} icon={homeIcon} />
        ) : (
          <SideNav.Link
            to={routes.toDashboardsFolder({ accountId, folderId })}
            label={getString('common.dashboards')}
            icon={dashboardIcon}
          />
        )}
        {!CDB_MFE_ENABLED && (
          <SideNav.Link
            to={routes.toDashboardsFoldersPage({ accountId })}
            label={getString('common.folders')}
            icon={folderIcon}
          />
        )}
      </SideNav.Section>
    </SideNav.Main>
  )
}

export default DashboardsSideNav
