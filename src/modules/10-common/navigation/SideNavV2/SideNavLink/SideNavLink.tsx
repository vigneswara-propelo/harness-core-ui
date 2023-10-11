/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Layout, Text, IconProps } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { Icon, IconName } from '@harness/icons'
import { NavLink, NavLinkProps, useHistory } from 'react-router-dom'
import { Scope } from 'framework/types/types'
import { NAV_MODE, getRouteParams } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitionsV2'
import { ModePathProps, ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { SIDE_NAV_STATE, useLayoutV2 } from '@modules/10-common/router/RouteWithLayoutV2'
import { useGetSelectedScope } from '../SideNavV2.utils'
import useSecondaryScopeSwitchDialog from '../ScopeSwitchDialog/useSecondaryScopeSwiitchDialog'
import css from './SideNavLink.module.scss'

export interface SideNavLinkProps extends NavLinkProps {
  icon?: IconName
  iconProps?: Partial<IconProps>
  label: string
  scope?: Scope | Scope[]
  isRenderedInAccordion?: boolean
  hidden?: boolean
  __TYPE?: string
  className?: string
}

export const SideNavLink: React.FC<SideNavLinkProps> = props => {
  const { icon, iconProps, label, scope, className, hidden, isRenderedInAccordion, to, ...rest } = props
  const { path, module, projectIdentifier, orgIdentifier } = getRouteParams<
    { path: string } & ModulePathParams & ProjectPathProps & ModePathProps
  >(true, to as string)
  const { showDialog: showSecondaryScopeSwitchDialog } = useSecondaryScopeSwitchDialog()
  const { scope: selectedScope } = useGetSelectedScope()
  const history = useHistory()
  const { selectedProject, selectedOrg } = useAppStore()
  const { sideNavState } = useLayoutV2()

  let disabled = false
  let targetScope: Scope
  if (scope) {
    if (Array.isArray(scope)) {
      if (selectedScope && scope.indexOf(selectedScope) === -1) {
        // redireting default to first scope available, we can take this from props
        targetScope = scope[0]
        disabled = true
      }
    } else if (selectedScope !== scope) {
      targetScope = scope
      disabled = true
    }
  }

  if (hidden) {
    return null
  }

  const handleLinkClick = (e: React.MouseEvent): void => {
    if (disabled && targetScope) {
      e.preventDefault()
      e.stopPropagation()
      if (targetScope === Scope.ACCOUNT) {
        showSecondaryScopeSwitchDialog({
          targetScope,
          pageName: label,
          onContinue: () => {
            history.push(
              `${routes.replace({
                module: module || '',
                projectIdentifier: '',
                orgIdentifier: '',
                path
              })}`
            )
          }
        })
      }

      if (targetScope === Scope.ORGANIZATION) {
        if (orgIdentifier || selectedOrg?.identifier) {
          showSecondaryScopeSwitchDialog({
            targetScope,
            pageName: label,
            onContinue: () => {
              history.push(
                `${routes.replace({
                  module: module || '',
                  projectIdentifier: '',
                  orgIdentifier: orgIdentifier || selectedOrg?.identifier,
                  path
                })}`
              )
            }
          })
        } else {
          // This situation occurs when a user clicks on the Org level link, even though we currently lack an org level page. We will address this issue once we create the org level page.
        }
      }

      if (targetScope === Scope.PROJECT) {
        if (projectIdentifier || selectedProject?.identifier) {
          showSecondaryScopeSwitchDialog({
            targetScope,
            pageName: label,
            onContinue: () => {
              history.push(
                `${routes.replace({
                  module: module || '',
                  projectIdentifier: projectIdentifier || selectedProject?.identifier,
                  orgIdentifier: orgIdentifier || selectedProject?.orgIdentifier,
                  path
                })}`
              )
            }
          })
        } else {
          showSecondaryScopeSwitchDialog({
            targetScope,
            pageName: label,
            onContinue: () => {
              history.push(routes.toMode({ mode: NAV_MODE.ALL, noscope: true }))
            }
          })
        }
      }
    }
  }
  const isCollapsed = sideNavState === SIDE_NAV_STATE.COLLAPSED

  const renderIcon = () => {
    if (isRenderedInAccordion) {
      if (isCollapsed) {
        return <div className={css.dot} />
      }

      return undefined
    }

    return icon ? (
      <Icon name={icon} size={20} margin={{ right: isCollapsed ? 'none' : 'small' }} {...iconProps} />
    ) : undefined
  }

  const renderText = () => {
    if (!isCollapsed) {
      return (
        <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_800}>
          {label}
        </Text>
      )
    }

    return undefined
  }

  return (
    <NavLink
      data-name="nav-link"
      className={cx(css.link, { [css.collapsed]: isCollapsed }, className)}
      activeClassName={cx({ [css.selected]: !!to })}
      to={to}
      {...rest}
      onClick={rest.onClick || handleLinkClick}
    >
      {renderIcon()}
      {renderText()}
    </NavLink>
  )
}

SideNavLink.defaultProps = {
  __TYPE: 'SIDENAV_LINK'
}

interface SideNavSectionProps {
  className?: string
  children: React.ReactElement<SideNavLinkProps> | React.ReactElement<SideNavLinkProps>[]
}

export const SideNavSection: React.FC<SideNavSectionProps> = props => {
  return <Layout.Vertical className={css.section}>{props.children}</Layout.Vertical>
}

export default SideNavLink
