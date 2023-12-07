/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import { RouteWithLayout } from '@common/router'
import routes from '@common/RouteDefinitions'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { AccountSideNavProps } from '@common/RouteDestinations'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'

import type { LicenseRedirectProps } from 'framework/LicenseStore/LicenseStoreContext'

import type { ModulePathParams } from '@common/interfaces/RouteInterfaces'
import CertificatesPage from './pages/certificates/CertificatesPage'

export default (
  <>
    <RouteWithLayout sidebarProps={AccountSideNavProps} path={[routes.toCertificates({ ...accountPathProps })]}>
      <CertificatesPage />
    </RouteWithLayout>
  </>
)

export const CertificatesRoutes: React.FC<{
  moduleParams: ModulePathParams
  licenseRedirectData?: LicenseRedirectProps
  sidebarProps?: SidebarContext
}> = ({ moduleParams, licenseRedirectData, sidebarProps }) => (
  <>
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={sidebarProps}
      path={[
        routes.toCertificates({
          ...accountPathProps,
          ...projectPathProps,
          ...moduleParams
        })
      ]}
      pageName={PAGE_NAME.CertificatesPage}
    >
      <CertificatesPage />
    </RouteWithLayout>
  </>
)
