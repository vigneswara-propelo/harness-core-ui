/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { matchPath, useLocation, Link } from 'react-router-dom'
import { Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { Boundary, Breadcrumbs, IBreadcrumbProps } from '@blueprintjs/core'
import cx from 'classnames'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useStrings } from 'framework/strings'
import { getRouteParams } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitionsV2'
import { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
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
  const { selectedProject, selectedOrg, accountInfo } = useAppStore()
  const { pathname } = useLocation()

  const { className, links } = props

  const list: IBreadcrumbProps[] = [
    {
      text: (
        <Link to={routes.toMode({ module })}>
          <Text font={{ size: 'small' }} lineClamp={1} color={Color.PRIMARY_7}>
            {renderLabelAndName(getString('account'), accountInfo?.name)}
          </Text>
        </Link>
      )
    }
  ]

  if (orgIdentifier) {
    list.push({
      text: (
        <Link to={routes.toMode({ orgIdentifier, module })}>
          <Text font={{ size: 'small' }} lineClamp={1} color={Color.PRIMARY_7}>
            {renderLabelAndName(getString('orgLabel'), selectedOrg?.name)}
          </Text>
        </Link>
      )
    })
  }

  if (projectIdentifier) {
    list.push({
      text: (
        <Link to={routes.toMode({ projectIdentifier, orgIdentifier, module })}>
          <Text font={{ size: 'small' }} lineClamp={1} color={Color.PRIMARY_7}>
            {renderLabelAndName(getString('projectLabel'), selectedProject?.name)}
          </Text>
        </Link>
      )
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
