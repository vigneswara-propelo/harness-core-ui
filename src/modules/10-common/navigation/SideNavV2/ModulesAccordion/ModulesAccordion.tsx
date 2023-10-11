/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Accordion, Container, Icon, Layout, Popover, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import React from 'react'
import cx from 'classnames'
import { NavLink, matchPath, useLocation, useParams } from 'react-router-dom'
import { PopoverInteractionKind, PopoverPosition } from '@blueprintjs/core'
import { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import { useStrings } from 'framework/strings'
import {
  MODULES_CONFIG_PREFERENCE_STORE_KEY,
  ModulesPreferenceStoreData
} from '@common/navigation/ModuleConfigurationScreen/ModuleConfigurationScreen'
import { getFilteredModules } from '@common/components/ModeSelector/ModeSelector'
import useNavModuleInfo, { NavModuleName, useNavModuleInfoMap } from '@common/hooks/useNavModuleInfo'
import routes from '@common/RouteDefinitionsV2'
import { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { ModuleName, moduleNameToModuleMapping } from 'framework/types/ModuleName'
import { NAV_MODE } from '@common/utils/routeUtils'
import ModuleRouteConfig from '@modules/ModuleRouteConfig'
import { SIDE_NAV_STATE, useLayoutV2 } from '@modules/10-common/router/RouteWithLayoutV2'
import css from './ModulesAccordion.module.scss'
interface SideNavLinksProps {
  module: NavModuleName
  mode: NAV_MODE
}

const filterSideNavScope = (
  element: React.ReactElement,
  components: React.ReactElement[] = []
): React.ReactElement[] => {
  React.Children.map(element, child => {
    if (child?.props?.__TYPE === 'SIDENAV_SCOPE' || child?.props?.__TYPE === 'SIDENAV_TITLE') {
      components.push({
        ...child,
        props: {
          ...child?.props,
          showLinksIfNotPresentInScope: true,
          isRenderedInAccordion: true
        }
      })
    }

    filterSideNavScope(child?.props?.children, components)
  })

  return components
}

function DirectAccessModules({ module }: { module: ModuleName }): React.ReactElement {
  const { getString } = useStrings()
  const { sideNavState } = useLayoutV2()
  const moduleMap = useNavModuleInfoMap()

  const { icon, shortLabel, color, homePageUrl } = moduleMap[module as NavModuleName]

  return (
    <NavLink to={homePageUrl}>
      <Layout.Horizontal className={css.container} flex={{ justifyContent: 'flex-start' }}>
        <Icon
          className={css.moduleIcon}
          name={icon}
          size={20}
          margin={{ right: 'small' }}
          style={{ fill: `var(${color})` }}
        />
        {sideNavState !== SIDE_NAV_STATE.COLLAPSED && (
          <Text color={Color.GREY_700} font={{ variation: FontVariation.BODY2 }}>
            {getString(shortLabel)}
          </Text>
        )}
      </Layout.Horizontal>
    </NavLink>
  )
}

export const SideNavLinksComponent: React.FC<SideNavLinksProps> = props => {
  const { sideNavState } = useLayoutV2()
  const Component: JSX.Element = ModuleRouteConfig[props.module].sideNavLinks(props.mode, { sideNavState })

  const components = filterSideNavScope(Component)

  return <>{components}</>
}

const ModuleSummary: React.FC<{ module: NavModuleName; isDirectAccessModule: boolean; selectedModule?: string }> = ({
  module,
  selectedModule,
  isDirectAccessModule
}) => {
  const { getString } = useStrings()
  const { icon, shortLabel, color } = useNavModuleInfo(module)
  const { sideNavState } = useLayoutV2()
  const isActive = selectedModule?.toLowerCase() === module.toLowerCase()

  if (isDirectAccessModule) {
    return <DirectAccessModules module={module} />
  }

  const isCollapsed = sideNavState === SIDE_NAV_STATE.COLLAPSED
  return (
    <Popover
      interactionKind={PopoverInteractionKind.HOVER}
      minimal
      position={PopoverPosition.BOTTOM_RIGHT}
      popoverClassName={css.popover}
      disabled={true}
      content={
        <Container className={css.module}>
          <SideNavLinksComponent module={module} mode={NAV_MODE.ALL} />
        </Container>
      }
    >
      <Layout.Horizontal
        className={cx(css.container, { [css.active]: isActive, [css.sideNavCollapsed]: isCollapsed })}
        flex={{ justifyContent: 'flex-start' }}
      >
        <Icon
          className={css.moduleIcon}
          name={icon}
          size={20}
          margin={{ right: 'small' }}
          style={{ fill: `var(${color})` }}
        />
        {!isCollapsed && (
          <Text color={isActive ? Color.PRIMARY_7 : Color.GREY_700} font={{ variation: FontVariation.BODY2 }}>
            {getString(shortLabel)}
          </Text>
        )}
      </Layout.Horizontal>
    </Popover>
  )
}

interface ModulesAccordionProps {
  mode?: NAV_MODE
}

const ModulesAccordion: React.FC<ModulesAccordionProps> = ({ mode = NAV_MODE.ALL }) => {
  const moduleMap = useNavModuleInfoMap()
  const { sideNavState } = useLayoutV2()
  const { accountId } = useParams<AccountPathProps>()
  const { preference: modulesPreferenceData } = usePreferenceStore<ModulesPreferenceStoreData>(
    PreferenceScope.USER,
    MODULES_CONFIG_PREFERENCE_STORE_KEY
  )
  const { pathname } = useLocation()
  const { selectedModules = [], orderedModules = [] } = modulesPreferenceData || {}
  const directAccessModules = [ModuleName.IDP]

  const visibleModules = React.useMemo(
    () => getFilteredModules(orderedModules, selectedModules, moduleMap),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [moduleMap, orderedModules, selectedModules]
  )

  const selectedModule = visibleModules.find(module =>
    matchPath(pathname, { path: routes.toModule({ mode, accountId, module: moduleNameToModuleMapping[module] }) })
  )

  return (
    <Accordion
      className={cx(css.accordion, { [css.sideNavCollapsed]: sideNavState === SIDE_NAV_STATE.COLLAPSED })}
      summaryClassName={css.summary}
      chevronClassName={css.chevron}
      activeId={selectedModule}
      panelClassName={css.panel}
      detailsClassName={css.accordionDetails}
    >
      {visibleModules.map(module => (
        <Accordion.Panel
          key={module}
          id={module}
          summary={
            <ModuleSummary
              module={module}
              selectedModule={selectedModule}
              isDirectAccessModule={directAccessModules.includes(module)}
            />
          }
          details={
            !directAccessModules.includes(module) && (
              <Container className={css.module} padding={{ left: 'small' }}>
                <SideNavLinksComponent module={module} mode={NAV_MODE.ALL} />
              </Container>
            )
          }
        />
      ))}
    </Accordion>
  )
}

export default ModulesAccordion
