/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { Route, RouteProps } from 'react-router-dom'
import { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'

export enum SIDE_NAV_STATE {
  COLLAPSED = 'COLLAPSED',
  EXPANDED = 'EXPANDED',
  HIDDEN = 'HIDDEN'
}

export interface LayoutContextProps {
  sideNavState: SIDE_NAV_STATE
  setSideNavState: (state?: SIDE_NAV_STATE, changeDefaultExperience?: boolean) => void
  disableSideNavCollapse?: boolean
  setDisableSideNavCollapse?: (disable: boolean) => void
}

export const LayoutContext = React.createContext<LayoutContextProps>({
  sideNavState: SIDE_NAV_STATE.EXPANDED,
  setSideNavState: () => void 0
})

const RouteWithLayoutV2: React.FC<React.PropsWithChildren<RouteProps>> = ({ children, ...rest }) => {
  const [disableSideNavCollapse, setDisableSideNavCollapse] = useState(false)
  const { setPreference: setSideNavCollapsePrefStore, preference: collapseSideNav = false } =
    usePreferenceStore<boolean>(PreferenceScope.ACCOUNT, 'collapseSideNavV2')
  const [sideNavState, setSideNavState] = useState<SIDE_NAV_STATE>(
    collapseSideNav ? SIDE_NAV_STATE.COLLAPSED : SIDE_NAV_STATE.EXPANDED
  )

  useEffect(() => {
    if (disableSideNavCollapse) {
      setSideNavState(SIDE_NAV_STATE.EXPANDED)
    }
  }, [disableSideNavCollapse, collapseSideNav])

  return (
    <LayoutContext.Provider
      value={{
        sideNavState,
        disableSideNavCollapse,
        setSideNavState: (state, changeDefaultExperience) => {
          if (state === SIDE_NAV_STATE.HIDDEN) {
            setSideNavState(SIDE_NAV_STATE.HIDDEN)
          } else {
            if (changeDefaultExperience) {
              setSideNavCollapsePrefStore(state === SIDE_NAV_STATE.COLLAPSED)
            }
            const defaultState = collapseSideNav ? SIDE_NAV_STATE.COLLAPSED : SIDE_NAV_STATE.EXPANDED
            setSideNavState(state || defaultState)
          }
        },
        setDisableSideNavCollapse
      }}
    >
      <Route {...rest}>{children}</Route>
    </LayoutContext.Provider>
  )
}

export const useLayoutV2 = (): LayoutContextProps => {
  return React.useContext(LayoutContext)
}

export default RouteWithLayoutV2
