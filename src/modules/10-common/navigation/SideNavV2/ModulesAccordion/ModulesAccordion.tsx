import { Accordion, Container, Icon, Layout, Popover, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import React from 'react'
import cx from 'classnames'
import { matchPath, useLocation, useParams } from 'react-router-dom'
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
import { moduleNameToModuleMapping } from 'framework/types/ModuleName'
import { NAV_MODE } from '@common/utils/routeUtils'
import ModuleRouteConfig from '@modules/ModuleRouteConfig'
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
          showLinksIfNotPresentInScope: true
        }
      })
    }

    filterSideNavScope(child?.props?.children, components)
  })

  return components
}

export const SideNavLinksComponent: React.FC<SideNavLinksProps> = props => {
  const Component: JSX.Element = ModuleRouteConfig[props.module].sideNavLinks(props.mode)

  const components = filterSideNavScope(Component)

  return <>{components}</>
}

const ModuleSummary: React.FC<{ module: NavModuleName; selectedModule?: string }> = ({ module, selectedModule }) => {
  const { getString } = useStrings()
  const { icon, shortLabel, color } = useNavModuleInfo(module)
  const isActive = selectedModule?.toLowerCase() === module.toLowerCase()
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
        className={cx(css.container, { [css.active]: isActive })}
        flex={{ justifyContent: 'flex-start' }}
      >
        <Icon
          className={css.moduleIcon}
          name={icon}
          size={20}
          margin={{ right: 'small' }}
          style={{ fill: `var(${color})` }}
        />
        <Text color={isActive ? Color.PRIMARY_7 : Color.GREY_700} font={{ variation: FontVariation.BODY2 }}>
          {getString(shortLabel)}
        </Text>
      </Layout.Horizontal>
    </Popover>
  )
}

interface ModulesAccordionProps {
  mode?: NAV_MODE
}

const ModulesAccordion: React.FC<ModulesAccordionProps> = ({ mode = NAV_MODE.ALL }) => {
  const moduleMap = useNavModuleInfoMap()
  const { accountId } = useParams<AccountPathProps>()
  const { preference: modulesPreferenceData } = usePreferenceStore<ModulesPreferenceStoreData>(
    PreferenceScope.USER,
    MODULES_CONFIG_PREFERENCE_STORE_KEY
  )
  const { pathname } = useLocation()
  const { selectedModules = [], orderedModules = [] } = modulesPreferenceData || {}

  const visibleModules = React.useMemo(
    () => getFilteredModules(orderedModules, selectedModules, moduleMap),
    [moduleMap, orderedModules, selectedModules]
  )

  const selectedModule = visibleModules.find(module =>
    matchPath(pathname, { path: routes.toModule({ mode, accountId, module: moduleNameToModuleMapping[module] }) })
  )

  return (
    <Accordion
      className={css.accordion}
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
          summary={<ModuleSummary module={module} selectedModule={selectedModule} />}
          details={
            <Container className={css.module} padding={{ left: 'small' }}>
              <SideNavLinksComponent module={module} mode={NAV_MODE.ALL} />
            </Container>
          }
        />
      ))}
    </Accordion>
  )
}

export default ModulesAccordion
