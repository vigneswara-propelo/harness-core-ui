/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Redirect, useParams } from 'react-router-dom'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import routes from '@common/RouteDefinitions'
import { RouteWithLayout } from '@common/router'
import { projectPathProps, accountPathProps } from '@common/utils/routeUtils'
import { String as LocaleString, useStrings } from 'framework/strings'
import ChildAppMounter from 'microfrontends/ChildAppMounter'
import { ResourceCategory, ResourceType } from '@rbac/interfaces/ResourceType'
import RbacFactory from '@rbac/factories/RbacFactory'
import { LicenseRedirectProps, LICENSE_STATE_NAMES } from 'framework/LicenseStore/LicenseStoreContext'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import { MinimalLayout } from '@common/layouts'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { AccessControlRouteDestinations } from '@rbac/RouteDestinations'
import SEISideNav from './components/SEISideNav/SEISideNav'
import SEIHomePage from './pages/home/SEIHomePage'
import SEITrialPage from './pages/home/SEITrialPage/SEITrialPage'

// eslint-disable-next-line import/no-unresolved
const SEIMicroFrontend = React.lazy(() => import('sei/MicroFrontendApp'))

const RedirectToSEIModule = ({ accountId }: { accountId: string }): React.ReactElement => {
  // const { accountId } = useParams<ProjectPathProps>()
  const { selectedProject } = useAppStore()

  if (selectedProject) {
    return (
      <Redirect
        to={routes.toSEIInsights({
          accountId: accountId,
          orgIdentifier: selectedProject.orgIdentifier || '',
          projectIdentifier: selectedProject.identifier
        })}
      />
    )
  } else {
    return <Redirect to={routes.toModuleHome({ accountId, module: 'sei' })} />
  }
}

export default function SEIRoutes(): React.ReactElement {
  const isSEIEnabled = useFeatureFlag(FeatureFlag.SEI_ENABLED)
  const { getString } = useStrings()
  const { accountId } = useParams<ProjectPathProps>()

  const SEISideNavProps: SidebarContext = {
    navComponent: SEISideNav,
    subtitle: getString('sei.softwareEngineering'),
    title: getString('sei.insights'),
    icon: 'sei-main'
  }

  if (isSEIEnabled) {
    RbacFactory.registerResourceTypeHandler(ResourceType.SEI_CONFIGURATION_SETTINGS, {
      icon: 'res-users',
      label: 'sei.configurationSettings',
      category: ResourceCategory.SEI,
      permissionLabels: {
        [PermissionIdentifier.VIEW_SEI_CONFIGURATIONSETTINGS]: <LocaleString stringID="rbac.permissionLabels.view" />,
        [PermissionIdentifier.EDIT_SEI_CONFIGURATIONSETTINGS]: <LocaleString stringID="rbac.permissionLabels.edit" />,
        [PermissionIdentifier.CREATE_SEI_CONFIGURATIONSETTINGS]: (
          <LocaleString stringID="rbac.permissionLabels.create" />
        ),
        [PermissionIdentifier.DELETE_SEI_CONFIGURATIONSETTINGS]: (
          <LocaleString stringID="rbac.permissionLabels.delete" />
        )
      }
    })

    RbacFactory.registerResourceTypeHandler(ResourceType.SEI_COLLECTIONS, {
      icon: 'res-users',
      label: 'common.purpose.sei.collections',
      category: ResourceCategory.SEI,
      permissionLabels: {
        [PermissionIdentifier.VIEW_SEI_COLLECTIONS]: <LocaleString stringID="rbac.permissionLabels.view" />,
        [PermissionIdentifier.EDIT_SEI_COLLECTIONS]: <LocaleString stringID="rbac.permissionLabels.edit" />,
        [PermissionIdentifier.CREATE_SEI_COLLECTIONS]: <LocaleString stringID="rbac.permissionLabels.create" />,
        [PermissionIdentifier.DELETE_SEI_COLLECTIONS]: <LocaleString stringID="rbac.permissionLabels.delete" />
      }
    })

    RbacFactory.registerResourceTypeHandler(ResourceType.SEI_INSIGHTS, {
      icon: 'res-users',
      label: 'sei.insights',
      category: ResourceCategory.SEI,
      permissionLabels: {
        [PermissionIdentifier.VIEW_SEI_INSIGHTS]: <LocaleString stringID="rbac.permissionLabels.view" />,
        [PermissionIdentifier.EDIT_SEI_INSIGHTS]: <LocaleString stringID="rbac.permissionLabels.edit" />,
        [PermissionIdentifier.CREATE_SEI_INSIGHTS]: <LocaleString stringID="rbac.permissionLabels.create" />,
        [PermissionIdentifier.DELETE_SEI_INSIGHTS]: <LocaleString stringID="rbac.permissionLabels.delete" />
      }
    })

    RbacFactory.registerResourceTypeHandler(ResourceType.SEI_TRELLIS_SCORE, {
      icon: 'res-users',
      label: 'sei.trellisScore',
      category: ResourceCategory.SEI,
      permissionLabels: {
        [PermissionIdentifier.VIEW_SEI_TRELLISSCORE]: <LocaleString stringID="rbac.permissionLabels.view" />,
        [PermissionIdentifier.EDIT_SEI_TRELLISSCORE]: <LocaleString stringID="rbac.permissionLabels.edit" />
      }
    })
  }
  const RedirectToModuleTrialHome = (): React.ReactElement => {
    return (
      <Redirect
        to={routes.toModuleTrialHome({
          accountId,
          module: 'sei'
        })}
      />
    )
  }

  const RedirectToSubscriptions = (): React.ReactElement => {
    return (
      <Redirect
        to={routes.toSubscriptions({
          accountId,
          moduleCard: 'sei'
        })}
      />
    )
  }
  const moduleParams: ModulePathParams = {
    module: ':module(sei)'
  }
  const licenseRedirectData: LicenseRedirectProps = {
    licenseStateName: LICENSE_STATE_NAMES.CD_LICENSE_STATE,
    startTrialRedirect: RedirectToModuleTrialHome,
    expiredTrialRedirect: RedirectToSubscriptions
  }
  return (
    <>
      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        path={routes.toSEI({ ...projectPathProps })}
        exact
        pageName={PAGE_NAME.SEIHomePage}
      >
        <RedirectToSEIModule accountId={accountId} />
      </RouteWithLayout>
      <RouteWithLayout
        layout={MinimalLayout}
        path={routes.toModuleTrialHome({ ...accountPathProps, module: 'sei' })}
        exact
        pageName={PAGE_NAME.SEIHomePage}
      >
        <SEITrialPage />
      </RouteWithLayout>
      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        sidebarProps={SEISideNavProps}
        path={routes.toModuleHome({ ...accountPathProps, module: 'sei' })}
        exact
        pageName={PAGE_NAME.SEIHomePage}
      >
        <SEIHomePage />
      </RouteWithLayout>
      {
        AccessControlRouteDestinations({
          moduleParams,
          licenseRedirectData,
          sidebarProps: SEISideNavProps
        })?.props.children
      }
      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        sidebarProps={SEISideNavProps}
        path={routes.toSEIInsights({ ...projectPathProps })}
      >
        <ChildAppMounter ChildApp={SEIMicroFrontend} />
      </RouteWithLayout>
      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        sidebarProps={SEISideNavProps}
        path={routes.toSEICollectionsHome({ ...projectPathProps })}
      >
        <ChildAppMounter ChildApp={SEIMicroFrontend} />
      </RouteWithLayout>
      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        sidebarProps={SEISideNavProps}
        path={routes.toSEIMicroFrontend({ ...projectPathProps })}
      >
        <ChildAppMounter ChildApp={SEIMicroFrontend} />
      </RouteWithLayout>
      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        sidebarProps={SEISideNavProps}
        path={routes.toSEI({ ...accountPathProps })}
      >
        <ChildAppMounter ChildApp={SEIMicroFrontend} />
      </RouteWithLayout>
    </>
  )
}
