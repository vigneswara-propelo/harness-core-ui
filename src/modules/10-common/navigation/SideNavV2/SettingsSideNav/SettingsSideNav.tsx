/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitionsV2'
import { NAV_MODE, isNavMode } from '@common/utils/routeUtils'
import { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { Module } from 'framework/types/ModuleName'
import SideNavLink from '../SideNavLink/SideNavLink'

enum Scope {
  PROJECT = 'Project',
  ORGANISATION = 'Organisation',
  ACCOUNT = 'Account'
}

export const SettingsSideNavLink = ({
  mode,
  module: moduleFromParent
}: {
  mode?: NAV_MODE
  module?: Module
}): JSX.Element => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { currentMode, selectedProject, selectedOrg, currentModule } = useAppStore()
  const { orgIdentifier = '', identifier: projectIdentifier = '' } = selectedProject || {}
  const { identifier: orgId = '' } = selectedOrg || {}
  const currentOrgIdentifier = orgId || orgIdentifier
  const module = moduleFromParent || (currentModule as Module)
  const finalMode =
    mode || (currentMode && isNavMode(currentMode) ? currentMode : currentModule ? NAV_MODE.MODULE : NAV_MODE.ADMIN)
  const currentScope = selectedProject ? Scope.PROJECT : selectedOrg ? Scope.ORGANISATION : Scope.ACCOUNT

  return (
    <>
      {currentScope === Scope.PROJECT ? (
        <SideNavLink
          to={routes.toSettings({
            accountId,
            orgIdentifier: currentOrgIdentifier,
            projectIdentifier,
            mode: finalMode,
            module
          })}
          label={getString('common.settingsPage.title.projectSettingsTitle')}
          icon="setting"
        />
      ) : null}
      {currentScope === Scope.ORGANISATION ? (
        <SideNavLink
          to={routes.toSettings({
            accountId,
            orgIdentifier: currentOrgIdentifier,
            mode: finalMode,
            module
          })}
          label={getString('common.settingsPage.title.orgSettingsTitle')}
          icon="setting"
        />
      ) : null}

      {currentScope === Scope.ACCOUNT ? (
        <SideNavLink
          to={routes.toSettings({ accountId, mode: finalMode, module })}
          label={getString('common.accountSettings')}
          icon="setting"
        />
      ) : null}
    </>
  )
}
