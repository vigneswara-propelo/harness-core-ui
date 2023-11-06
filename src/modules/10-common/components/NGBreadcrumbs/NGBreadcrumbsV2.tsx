/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { matchPath, useLocation, useHistory, Link } from 'react-router-dom'
import { Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { Boundary, Breadcrumbs, IBreadcrumbProps } from '@blueprintjs/core'
import cx from 'classnames'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useStrings } from 'framework/strings'
import { NAV_MODE, getRouteParams } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitionsV2'
import { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import useSecondaryScopeSwitchDialog from '@common/navigation/SideNavV2/ScopeSwitchDialog/useSecondaryScopeSwiitchDialog'
import { Scope } from 'framework/types/types'
import { useGetSelectedScope } from '@common/navigation/SideNavV2/SideNavV2.utils'
import { NGBreadcrumbsProps } from './NGBreadcrumbs'
import css from './NGBreadcrumbsV2.module.scss'

const renderLabelAndName = (label: string, name?: string): string => {
  if (name) {
    return `${label}: ${name}`
  }

  return label
}

const NGBreadcrumbsV2: React.FC<Partial<NGBreadcrumbsProps>> = props => {
  const { getString } = useStrings()
  const { module, orgIdentifier, projectIdentifier } = getRouteParams<ModulePathParams & ProjectPathProps>()
  const { selectedProject, selectedOrg, accountInfo, currentMode: mode } = useAppStore()
  const { scope } = useGetSelectedScope()
  const { pathname } = useLocation()
  const history = useHistory()
  const { showDialog: showSecondaryScopeSwitchDialog, closeDialog: closeSecondaryScopeSwitchDialog } =
    useSecondaryScopeSwitchDialog()

  const { className, links } = props

  const list: IBreadcrumbProps[] = [
    {
      text: (
        <Text font={{ size: 'small' }} lineClamp={1} color={Color.PRIMARY_7}>
          {renderLabelAndName(getString('account'), accountInfo?.name)}
        </Text>
      ),
      onClick: () => {
        if (scope !== Scope.ACCOUNT && mode !== NAV_MODE.ADMIN) {
          showSecondaryScopeSwitchDialog({
            targetScope: Scope.ACCOUNT,
            onContinue: () => {
              closeSecondaryScopeSwitchDialog()
              history.push(routes.toMode({ module }))
            },
            pageName: `[${renderLabelAndName(getString('account'), accountInfo?.name)}]`
          })
        } else {
          history.push(routes.toMode({ module }))
        }
      }
    }
  ]

  if (orgIdentifier) {
    list.push({
      text: (
        <Text font={{ size: 'small' }} lineClamp={1} color={Color.PRIMARY_7}>
          {renderLabelAndName(getString('orgLabel'), selectedOrg?.name)}
        </Text>
      ),
      onClick: () => {
        if (scope !== Scope.ORGANIZATION && mode !== NAV_MODE.ADMIN) {
          showSecondaryScopeSwitchDialog({
            targetScope: Scope.ORGANIZATION,
            onContinue: () => {
              closeSecondaryScopeSwitchDialog()
              history.push(routes.toMode({ orgIdentifier, module }))
            },
            pageName: `[${renderLabelAndName(getString('orgsText'), selectedOrg?.name)}]`
          })
        } else {
          history.push(routes.toMode({ orgIdentifier, module }))
        }
      }
    })
  }

  if (projectIdentifier) {
    list.push({
      text: (
        <Text font={{ size: 'small' }} lineClamp={1} color={Color.PRIMARY_7}>
          {renderLabelAndName(getString('projectLabel'), selectedProject?.name)}
        </Text>
      ),
      onClick: () => {
        if (scope !== Scope.PROJECT && mode !== NAV_MODE.ADMIN) {
          showSecondaryScopeSwitchDialog({
            targetScope: Scope.PROJECT,
            onContinue: () => {
              closeSecondaryScopeSwitchDialog()
              history.push(routes.toMode({ projectIdentifier, orgIdentifier, module }))
            },
            pageName: `[${renderLabelAndName(getString('projectLabel'), selectedProject?.name)}]`
          })
        } else {
          history.push(routes.toMode({ projectIdentifier, orgIdentifier, module }))
        }
      }
    })
  }

  // If settings page, add settings link
  const isSettingsPage = matchPath(pathname, {
    path: routes.toSettings({ module, projectIdentifier, orgIdentifier })
  })

  if (isSettingsPage) {
    list.push({
      text: (
        <Link to={routes.toSettings({ module, projectIdentifier, orgIdentifier })}>
          <Text font={{ size: 'small' }} lineClamp={1} color={Color.PRIMARY_7}>
            {getString('settingsLabel')}
          </Text>
        </Link>
      )
    })
  }

  if (links) {
    links.forEach(link => {
      list.push({
        text: (
          <Link to={link.url}>
            <Text font={{ size: 'small' }} lineClamp={1} color={Color.PRIMARY_7}>
              {link.label}
            </Text>
          </Link>
        )
      })
    })
  }

  return (
    <>
      <Breadcrumbs
        items={list}
        collapseFrom={Boundary.START}
        minVisibleItems={0}
        className={className}
        popoverProps={{ popoverClassName: cx(css.breadcrumbs, className) }}
      />
    </>
  )
}

export default NGBreadcrumbsV2
