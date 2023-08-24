/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Position, PopoverInteractionKind } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import cx from 'classnames'

import { Text, Container, Popover, Button, Tabs, Layout, useToggleOpen } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { defaultTo } from 'lodash-es'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useStrings } from 'framework/strings'
import { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import pointerImageDark from './pointer-dark.svg'
import { ProjectScopeSelector } from './ProjectScopeSelector/ProjectScopeSelector'
import { OrgScopeSelector } from './OrgScopeSelector/OrgScopeSelector'
import { AccountScopeSelector } from './AccountScopeSelector/AccountScopeSelector'
import css from './ScopeSelector.module.scss'

export enum Scope {
  PROJECT = 'Project',
  ORGANISATION = 'Organisation',
  ACCOUNT = 'Account'
}

// Only for now, Need to have logic similar on appStore
const scopeFromParam = (projectIdentifier: string, orgIdentifier: string): Scope => {
  let currentScope = Scope.ACCOUNT
  if (projectIdentifier && orgIdentifier) {
    currentScope = Scope.PROJECT
  } else if (orgIdentifier) {
    currentScope = Scope.ORGANISATION
  }
  return currentScope
}

export const ScopeSelector: React.FC = () => {
  const { currentUserInfo, selectedProject, selectedOrg } = useAppStore()
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const selectedScope = scopeFromParam(projectIdentifier, orgIdentifier) //Only for now, later add logic to appstore or something else
  const [selectedTabId, setSelectedTabId] = React.useState<Scope>(defaultTo(selectedScope, Scope.PROJECT))
  const handleTabChange = (tabId: Scope): void => {
    setSelectedTabId(tabId)
  }
  const { isOpen: isScopeSelectorOpen, toggle: toggleScopeSelector, close: closeScopeSelector } = useToggleOpen(false)

  return (
    <>
      <Container padding={{ top: 'medium', bottom: 'small' }}>
        <Popover
          interactionKind={PopoverInteractionKind.CLICK}
          position={Position.RIGHT}
          modifiers={{ offset: { offset: -50 } }}
          hasBackdrop={true}
          lazy={true}
          fill={true}
          popoverClassName={css.popover}
          isOpen={isScopeSelectorOpen}
          onOpening={() => setSelectedTabId(defaultTo(selectedScope, Scope.PROJECT))}
          onClose={closeScopeSelector}
        >
          <Button
            minimal
            rightIcon="chevron-right"
            iconProps={{ color: Color.GREY_400 }}
            className={cx(css.selectButton, { [css.active]: isScopeSelectorOpen })}
            tooltipProps={{
              isDark: true,
              usePortal: true,
              fill: true
            }}
            tooltip={
              selectedScope && selectedScope !== Scope.ACCOUNT ? (
                <Text padding="small" color={Color.WHITE}>
                  {selectedScope === Scope.PROJECT ? getString('selectProject') : getString('projectsOrgs.selectOrg')}
                </Text>
              ) : undefined
            }
            onClick={toggleScopeSelector}
          >
            <Layout.Vertical spacing="xsmall">
              {selectedScope === Scope.PROJECT ? (
                selectedProject ? (
                  <>
                    <Text className={css.scopeLabelText} color={Color.GREY_350}>
                      {getString('projectLabel').toUpperCase()}
                    </Text>
                    <Text color={Color.GREY_1000} font={{ variation: FontVariation.BODY }} className={css.scopeText}>
                      {selectedProject?.name}
                    </Text>
                  </>
                ) : (
                  <Text color={Color.GREY_800} font={{ variation: FontVariation.BODY }}>
                    {getString('selectProject')}
                  </Text>
                )
              ) : null}
              {selectedScope === Scope.ORGANISATION ? (
                selectedOrg ? (
                  <>
                    <Text className={css.scopeLabelText} color={Color.GREY_350}>
                      {getString('common.organizations').toUpperCase()}
                    </Text>
                    <Text color={Color.GREY_1000} font={{ variation: FontVariation.BODY }} className={css.scopeText}>
                      {selectedOrg?.name}
                    </Text>
                  </>
                ) : (
                  <Text color={Color.GREY_800} font={{ variation: FontVariation.BODY }}>
                    {getString('projectsOrgs.selectOrg')}
                  </Text>
                )
              ) : null}
              {selectedScope === Scope.ACCOUNT ? (
                <>
                  <Text className={css.scopeLabelText} color={Color.GREY_350}>
                    {getString('account').toUpperCase()}
                  </Text>
                  <Text color={Color.GREY_1000} font={{ variation: FontVariation.BODY }} className={css.scopeText}>
                    {currentUserInfo?.accounts?.find(account => account.uuid === accountId)?.accountName}
                  </Text>
                </>
              ) : null}
            </Layout.Vertical>
          </Button>
          <Container width={760} padding="xlarge" className={css.selectContainer}>
            <Tabs
              id="scopeSelector"
              onChange={handleTabChange}
              selectedTabId={selectedTabId}
              data-tabId={selectedTabId}
              tabList={[
                {
                  id: Scope.PROJECT,
                  title: getString('projectLabel'),
                  iconProps: { name: 'nav-project' },
                  panel: <ProjectScopeSelector />
                },
                {
                  id: Scope.ORGANISATION,
                  title: getString('orgLabel'),
                  iconProps: { name: 'nav-organization' },
                  panel: <OrgScopeSelector onClose={() => closeScopeSelector()} />
                },
                {
                  id: Scope.ACCOUNT,
                  title: getString('account'),
                  iconProps: { name: 'Account' },
                  panel: <AccountScopeSelector />
                }
              ]}
            />
          </Container>
        </Popover>
      </Container>
      {(selectedScope === Scope.PROJECT && !selectedProject) ||
      (selectedScope === Scope.ORGANISATION && !selectedOrg) ? (
        <div style={{ backgroundImage: `url(${pointerImageDark})` }} className={css.pickScopeHelp}>
          <Text color={Color.GREY_450} font={{ variation: FontVariation.BODY }} padding="small">
            {getString('projectsOrgs.pickScope', { scope: selectedScope })}
          </Text>
        </div>
      ) : null}
    </>
  )
}
