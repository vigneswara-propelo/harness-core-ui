/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Icon } from '@harness/icons'
import cx from 'classnames'
import { Layout } from '@harness/uicore'
import { SIDE_NAV_STATE, useLayoutV2 } from '@modules/10-common/router/RouteWithLayoutV2'
import css from './SideNavHeader.module.scss'

const SideNavHeader: React.FC = () => {
  const { sideNavState } = useLayoutV2()

  const isCollapsed = sideNavState === SIDE_NAV_STATE.COLLAPSED

  return (
    <Layout.Horizontal
      flex={{ alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between' }}
      className={cx(css.container)}
    >
      {isCollapsed ? (
        <Icon name={'nav-harness'} size={32} />
      ) : (
        <Icon className={cx(css.harnessLogo)} name={'harness-logo-black'} size={100} margin={{ right: 'small' }} />
      )}
    </Layout.Horizontal>
  )
}

export default SideNavHeader
