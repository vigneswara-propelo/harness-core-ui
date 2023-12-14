/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Route as RouterRoute } from 'react-router-dom'
import type { RouteProps as RouterRouteprops } from 'react-router-dom'

import { ModalProvider } from '@harness/use-modal'
import { DefaultLayout } from '@common/layouts'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { LICENSE_STATE_VALUES } from 'framework/LicenseStore/licenseStoreUtil'
import type { LicenseRedirectProps } from 'framework/LicenseStore/LicenseStoreContext'
import type { PAGE_NAME } from '@common/pages/pageContext/PageName'
import type { PublicViewProps } from '@common/interfaces/RouteInterfaces'
import PageProvider from '@common/pages/pageContext/PageProvider'
import { TemplateSelectorContextProvider } from 'framework/Templates/TemplateSelectorContext/TemplateSelectorContext'
import { TemplateSelectorDrawer } from 'framework/Templates/TemplateSelectorDrawer/TemplateSelectorDrawer'
import { SIDE_NAV_STATE } from '../RouteWithLayoutV2'

export interface RouteWithContextProps extends RouterRouteprops {
  licenseRedirectData?: LicenseRedirectProps
  pageName?: PAGE_NAME
  sideNavState?: SIDE_NAV_STATE
  disableAuxNav?: boolean
  public?: boolean
  publicViewProps?: PublicViewProps
}

export function RouteWithContext(props: React.PropsWithChildren<RouteWithContextProps>): React.ReactElement {
  const {
    children,
    licenseRedirectData,
    pageName,
    sideNavState,
    disableAuxNav,
    public: isRoutePublic = false,
    ...rest
  } = props
  const licenseStore = useLicenseStore()

  const childComponent = (
    <RouterRoute {...rest}>
      <ModalProvider>
        <TemplateSelectorContextProvider>
          <PageProvider pageName={pageName}>
            <DefaultLayout sideNavState={sideNavState} disableAuxNav={disableAuxNav} public={isRoutePublic}>
              {children}
            </DefaultLayout>
          </PageProvider>
          <TemplateSelectorDrawer />
        </TemplateSelectorContextProvider>
      </ModalProvider>
    </RouterRoute>
  )

  // For modules with no licenseStateName passed we will always show the child components
  // This allows pages to still render for products like CD and CE which have not gone GA and are still
  // using old licensing mechanisms
  if (!licenseRedirectData) {
    return childComponent
  }

  const {
    licenseStateName,
    startTrialRedirect: StartTrialRedirect
    // expiredTrialRedirect: ExpiredTrialRedirect
  } = licenseRedirectData

  const licenseValue = licenseStateName && licenseStore[licenseStateName]

  switch (licenseValue) {
    case LICENSE_STATE_VALUES.ACTIVE:
      return childComponent
    case LICENSE_STATE_VALUES.NOT_STARTED:
      return (
        <RouterRoute {...rest}>
          <StartTrialRedirect />
        </RouterRoute>
      )
    // case LICENSE_STATE_VALUES.EXPIRED:
    //   return (
    //     <RouterRoute {...rest}>
    //       <ExpiredTrialRedirect />
    //     </RouterRoute>
    //   )
    default:
      return childComponent
  }
}
