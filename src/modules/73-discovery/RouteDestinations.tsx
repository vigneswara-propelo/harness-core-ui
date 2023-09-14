/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { PageSpinner } from '@harness/uicore'
import type { ModulePathParams } from '@common/interfaces/RouteInterfaces'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import type { LicenseRedirectProps } from 'framework/LicenseStore/LicenseStoreContext'
import { RouteWithLayout } from '@common/router'
import routes from '@common/RouteDefinitions'
import { accountPathProps, discoveryPathProps, networkMapPathProps, projectPathProps } from '@common/utils/routeUtils'

import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import RbacFactory from '@rbac/factories/RbacFactory'
import { ResourceCategory, ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { String as LocaleString } from 'framework/strings'
import { AccountSideNavProps } from '@common/RouteDestinations'

const DiscoveryDetails = React.lazy(
  () => import(/* webpackChunkName: "discoveryDetails"*/ './pages/discovery-details/DiscoveryDetails')
)
const DiscoveryPage = React.lazy(() => import(/* webpackChunkName: "discoveryPage"*/ './pages/home/DiscoveryPage'))
const NetworkMapStudio = React.lazy(
  () => import(/* webpackChunkName: "networkMapStudio"*/ './pages/network-map-studio/NetworkMapStudio')
)

export default (
  <>
    <RouteWithLayout sidebarProps={AccountSideNavProps} path={routes.toDiscovery({ ...accountPathProps })} exact>
      <React.Suspense fallback={<PageSpinner />}>
        <DiscoveryPage />
      </React.Suspense>
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routes.toDiscoveredResource({
        ...accountPathProps,
        ...discoveryPathProps
      })}
      exact
    >
      <React.Suspense fallback={<PageSpinner />}>
        <DiscoveryDetails />
      </React.Suspense>
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routes.toCreateNetworkMap({
        ...accountPathProps,
        ...networkMapPathProps
      })}
      exact
    >
      <React.Suspense fallback={<PageSpinner />}>
        <NetworkMapStudio />
      </React.Suspense>
    </RouteWithLayout>
  </>
)

export const DiscoveryRouteDestinations: React.FC<{
  moduleParams: ModulePathParams
  licenseRedirectData?: LicenseRedirectProps
  sidebarProps?: SidebarContext
}> = ({ moduleParams, licenseRedirectData, sidebarProps }) => {
  const isDiscoveryEnabled = useFeatureFlag(FeatureFlag.PL_DISCOVERY_ENABLE)

  if (isDiscoveryEnabled) {
    // RBAC registrations
    RbacFactory.registerResourceCategory(ResourceCategory.DISCOVERY, {
      icon: 'chaos-service-discovery',
      label: 'common.discovery'
    })

    RbacFactory.registerResourceTypeHandler(ResourceType.NETWORK_MAP, {
      icon: 'chaos-service-discovery',
      label: 'common.networkMap',
      category: ResourceCategory.DISCOVERY,
      permissionLabels: {
        [PermissionIdentifier.VIEW_NETWORK_MAP]: <LocaleString stringID="rbac.permissionLabels.view" />,
        [PermissionIdentifier.CREATE_NETWORK_MAP]: <LocaleString stringID="rbac.permissionLabels.create" />,
        [PermissionIdentifier.EDIT_NETWORK_MAP]: <LocaleString stringID="rbac.permissionLabels.edit" />,
        [PermissionIdentifier.DELETE_NETWORK_MAP]: <LocaleString stringID="rbac.permissionLabels.delete" />
      }
    })
  }

  return (
    <>
      <RouteWithLayout
        exact
        licenseRedirectData={licenseRedirectData}
        sidebarProps={sidebarProps}
        path={routes.toDiscovery({ ...accountPathProps, ...projectPathProps, ...moduleParams })}
        pageName={PAGE_NAME.DiscoveryPage}
      >
        <React.Suspense fallback={<PageSpinner />}>
          <DiscoveryPage />
        </React.Suspense>
      </RouteWithLayout>
      <RouteWithLayout
        exact
        licenseRedirectData={licenseRedirectData}
        sidebarProps={sidebarProps}
        path={routes.toDiscoveredResource({
          ...accountPathProps,
          ...projectPathProps,
          ...moduleParams,
          ...discoveryPathProps
        })}
        pageName={PAGE_NAME.DiscoveryDetails}
      >
        <React.Suspense fallback={<PageSpinner />}>
          <DiscoveryDetails />
        </React.Suspense>
      </RouteWithLayout>
      <RouteWithLayout
        exact
        licenseRedirectData={licenseRedirectData}
        sidebarProps={sidebarProps}
        path={routes.toCreateNetworkMap({
          ...accountPathProps,
          ...projectPathProps,
          ...moduleParams,
          ...networkMapPathProps
        })}
        pageName={PAGE_NAME.CreateNetworkMap}
      >
        <React.Suspense fallback={<PageSpinner />}>
          <NetworkMapStudio />
        </React.Suspense>
      </RouteWithLayout>
    </>
  )
}
