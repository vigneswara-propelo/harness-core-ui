/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Color, FontVariation } from '@harness/design-system'
import { Icon } from '@harness/icons'
import { Link, matchPath, useLocation, useParams } from 'react-router-dom'
import { Layout, Text } from '@harness/uicore'
import { ModeSelector } from '@common/components/ModeSelector/ModeSelector'
import { useStrings } from 'framework/strings'
import { NavModuleName, useNavModuleInfoMap } from '@common/hooks/useNavModuleInfo'
import routes from '@common/RouteDefinitionsV2'
import { ModePathProps, NAV_MODE, accountPathProps, modePathProps, modulePathProps } from '@common/utils/routeUtils'
import { AccountPathProps, ModulePathParams } from '@common/interfaces/RouteInterfaces'
import { Module, moduleToModuleNameMapping } from 'framework/types/ModuleName'
import css from './SideNavHeader.module.scss'

const SideNavHeader: React.FC = () => {
  const moduleMap = useNavModuleInfoMap()
  const { pathname } = useLocation()
  const { accountId } = useParams<AccountPathProps>()
  const match = matchPath<ModePathProps & ModulePathParams>(pathname, {
    path: routes.toModule({ ...accountPathProps, ...modePathProps, ...modulePathProps })
  })
  const moduleFromParam = match?.params.module as Module
  const module = moduleFromParam ? moduleToModuleNameMapping[moduleFromParam] : undefined
  const {
    icon = undefined,
    color = undefined,
    label = undefined
  } = module && match?.params.mode === NAV_MODE.MODULE && moduleMap[module as NavModuleName]
    ? moduleMap[module as NavModuleName]
    : {}
  const { getString } = useStrings()
  const moduleProps = match?.params.mode === NAV_MODE.MODULE ? { module: moduleFromParam } : {}

  return (
    <Layout.Horizontal
      flex={{ justifyContent: 'space-between' }}
      className={css.container}
      style={{ borderColor: color ? `var(${color})` : 'var(--primary-6' }}
    >
      <Link
        className={css.link}
        to={routes.toMode({ mode: match?.params.mode || NAV_MODE.ADMIN, accountId, ...moduleProps })}
      >
        <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
          <Icon name={icon || 'harness-logo-black'} size={icon ? 32 : 100} margin={{ right: 'small' }} />
          {label && (
            <Text color={Color.GREY_800} font={{ variation: FontVariation.BODY2 }} className={css.label}>
              {getString(label)}
            </Text>
          )}
        </Layout.Horizontal>
      </Link>
      <ModeSelector />
    </Layout.Horizontal>
  )
}

export default SideNavHeader
