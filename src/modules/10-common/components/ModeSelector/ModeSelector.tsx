/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { Container, Icon, Layout, Text, useToggleOpen } from '@harness/uicore'
import { Position, PopoverInteractionKind, Divider, Popover, Classes } from '@blueprintjs/core'
import { Color, FontVariation } from '@harness/design-system'
import routes from '@common/RouteDefinitionsV2'
import { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { NavModuleName, useNavModuleInfoMap, useNavModuleInfoReturnType } from '@common/hooks/useNavModuleInfo'
import { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import ModulesConfigurationScreen, {
  MODULES_CONFIG_PREFERENCE_STORE_KEY,
  ModulesPreferenceStoreData
} from '@common/navigation/ModuleConfigurationScreen/ModuleConfigurationScreen'

import { filterNavModules } from '@common/navigation/MainNav/util'
import { useStrings } from 'framework/strings'
import { NAV_MODE } from '@common/utils/routeUtils'
import { ModeCard, ModuleCard } from './ModeCard'
import css from './ModeSelector.module.scss'

export const getFilteredModules = (
  modules: NavModuleName[],
  selectedModules: NavModuleName[],
  moduleMap: Record<NavModuleName, useNavModuleInfoReturnType>
): NavModuleName[] => {
  return modules.filter(moduleName => moduleMap[moduleName]?.shouldVisible && selectedModules.indexOf(moduleName) > -1)
}

export const ModeSelector: React.FC = () => {
  const { preference: modulesPreferenceData, setPreference: setModuleConfigPreference } =
    usePreferenceStore<ModulesPreferenceStoreData>(PreferenceScope.USER, MODULES_CONFIG_PREFERENCE_STORE_KEY)
  const { selectedModules = [], orderedModules = [] } = modulesPreferenceData || {}
  const { getString } = useStrings()
  const { setCurrentMode } = useAppStore()
  const { accountId } = useParams<AccountPathProps>()
  const [selectedModule, setSelectedModule] = React.useState<NavModuleName>()

  const moduleMap = useNavModuleInfoMap() //todo currently added info for non-module in same map
  const { isOpen: isModuleConfigOpen, toggle: toggleModuleConfig, close: closeModuleConfig } = useToggleOpen(false)
  const { isOpen: isModeSelectorOpen, toggle: toggleModeSelector, close: closeModeSelector } = useToggleOpen(false)

  const visibleModules = React.useMemo(
    () => getFilteredModules(orderedModules, selectedModules, moduleMap),
    [moduleMap, orderedModules, selectedModules]
  )

  React.useEffect(() => {
    const { orderedModules: filteredOrderedModules, selectedModules: filteredSelectedModules } = filterNavModules(
      orderedModules,
      selectedModules,
      moduleMap
    )
    setModuleConfigPreference({
      orderedModules: filteredOrderedModules,
      selectedModules: filteredSelectedModules
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <Popover
        interactionKind={PopoverInteractionKind.CLICK}
        position={Position.RIGHT}
        lazy={true}
        popoverClassName={css.popover}
        isOpen={isModeSelectorOpen}
        onClose={closeModeSelector}
        hasBackdrop={true}
        usePortal={true}
        onOpening={() => {
          window.scrollTo({ top: 0 })
        }}
      >
        <Popover
          content={
            <Text color={Color.WHITE} padding="small">
              {getString('common.selectViewOrModule')}
            </Text>
          }
          hoverOpenDelay={500}
          interactionKind={PopoverInteractionKind.HOVER}
          popoverClassName={Classes.DARK}
          position={Position.RIGHT}
        >
          <Container
            className={cx(css.gridIconContent, { [css.active]: isModeSelectorOpen })}
            onClick={() => toggleModeSelector()}
            flex={{ justifyContent: 'center' }}
          >
            <Icon name="nine-dot-options" size={24} className={css.nineDotIcon} />
          </Container>
        </Popover>
        <Container width={460} padding="xlarge" className={css.modeSelectorPanel}>
          <Layout.Horizontal flex={{ alignItems: 'flex-start' }}>
            <ModeCard
              shortLabel="common.nav.allModules"
              icon="harness"
              modeBorderCss={css.default}
              to={routes.toMode({ accountId, mode: NAV_MODE.ALL, noscope: true })}
              onClick={() => {
                setCurrentMode?.(NAV_MODE.ALL)
                closeModeSelector()
              }}
              popoverProps={{
                modeLabel: 'common.nav.allModules',
                modeContent: getString('common.nav.allModulesInfo')
              }}
              hideLearnMore
            />
            <Text
              icon="customize"
              iconProps={{ size: 16 }}
              color={Color.PRIMARY_7}
              font={{ variation: FontVariation.SMALL_SEMI }}
              className={css.clickable}
              onClick={() => {
                toggleModuleConfig()
                closeModeSelector()
              }}
            >
              {getString('common.nav.configure')}
            </Text>
          </Layout.Horizontal>
          <Divider className={css.divider} />
          {visibleModules.length ? (
            <>
              <div className={css.moduleCardWrapper}>
                {visibleModules.map((moduleName, i) => {
                  return (
                    <ModuleCard
                      moduleName={moduleName}
                      key={`${moduleName}_${i}`}
                      onModuleClick={() => {
                        setCurrentMode?.(NAV_MODE.MODULE)
                        closeModeSelector()
                      }}
                      to={moduleMap[moduleName].homePageUrl}
                      learnMoreOnClick={() => {
                        setSelectedModule(moduleName)
                        toggleModuleConfig()
                        toggleModeSelector()
                      }}
                      showNewTag={moduleMap[moduleName].isNew}
                    />
                  )
                })}
              </div>
              <Divider className={css.divider} />
            </>
          ) : null}
          <Layout.Horizontal className={css.nonModuleSections}>
            <ModeCard
              shortLabel="common.nav.accountAdmin"
              icon="Account"
              popoverProps={{
                modeContent: getString('common.nav.accountAdminInfo'),
                modeLabel: 'common.nav.accountAdmin'
              }}
              onClick={() => {
                setCurrentMode?.(NAV_MODE.ADMIN)
                closeModeSelector()
              }}
              to={routes.toMode({ accountId, mode: NAV_MODE.ADMIN })}
              modeBorderCss={css.default}
              leftIcon
              iconprops={{ color: Color.PRIMARY_7, size: 24 }}
              hideLearnMore
            />
            <ModeCard
              shortLabel="common.dashboards"
              icon="dashboards-solid-border"
              popoverProps={{
                modeContent: getString('common.nav.dashboardInfo'),
                modeLabel: 'common.dashboards'
              }}
              onClick={() => {
                closeModeSelector()
              }}
              to={routes.toMode({ accountId, mode: NAV_MODE.DASHBOARDS })}
              modeBorderCss={css.default}
              leftIcon
              iconprops={{ color: Color.PRIMARY_7, size: 24 }}
              hideLearnMore
            />
          </Layout.Horizontal>
        </Container>
      </Popover>
      {isModuleConfigOpen ? (
        <ModulesConfigurationScreen
          onClose={() => {
            closeModuleConfig()
            toggleModeSelector()
            setSelectedModule(undefined)
          }}
          activeModuleIndex={selectedModule ? orderedModules.indexOf(selectedModule) : undefined}
          readOnly={!!selectedModule}
          hideHeader={!!selectedModule}
          hideReordering={!!selectedModule}
        />
      ) : null}
    </>
  )
}
