/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'

import { useToggleOpen, Container } from '@harness/uicore'
import { matchPath, useLocation } from 'react-router-dom'
import { Scope } from 'framework/types/types'
import { LinkInfo } from './SideNavV2'
import { useGetSelectedScope } from './SideNavV2.utils'
import css from './SideNavV2.module.scss'

import { ScopeSelector } from '@projects-orgs/components/ScopeSelector/ScopeSelector' //eslint-disable-line

export interface SideNavContextProps {
  updateAvailableLinks: (_links: Record<Scope, LinkInfo[]>) => void
  availableLinks: Record<Scope, LinkInfo[]>
  activeLink: LinkInfo | undefined
}

export const SideNavContext = React.createContext<SideNavContextProps>({
  updateAvailableLinks: (_links: Record<Scope, LinkInfo[]>) => void 0,
  availableLinks: {
    Project: [],
    Organization: [],
    Account: []
  },
  activeLink: undefined
})

export const SideNavContextProvider = (
  props: React.PropsWithChildren<{ disableScopeSelector?: boolean }>
): React.ReactElement => {
  const { isOpen: isScopeSelectorOpen, toggle: toggleScopeSelector, close: closeScopeSelector } = useToggleOpen()
  const { scope: selectedScope } = useGetSelectedScope()
  const [availableLinks, setAvailableLinks] = useState<Record<Scope, LinkInfo[]>>({
    Project: [],
    Organization: [],
    Account: []
  })
  const { pathname } = useLocation()
  const [activeLink, setActiveLink] = useState<LinkInfo | undefined>()

  useEffect(() => {
    const match = selectedScope
      ? availableLinks[selectedScope].find(link =>
          matchPath(pathname, {
            path: link.url
          })
        )
      : undefined

    setActiveLink(match)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableLinks, pathname])

  return (
    <SideNavContext.Provider
      value={{
        updateAvailableLinks: (links: Record<Scope, LinkInfo[]>) => {
          const tempAvailableLinks = { ...availableLinks }

          Object.keys(links).map(scope => {
            const scopeLinks = links[scope as Scope]
            scopeLinks.forEach((link: LinkInfo) => {
              if (
                tempAvailableLinks[scope as Scope].findIndex(
                  (availableLink: LinkInfo) => availableLink.url === link.url
                ) === -1
              )
                tempAvailableLinks[scope as Scope].push(link)
            })
          })

          setAvailableLinks(tempAvailableLinks)
        },
        availableLinks,
        activeLink
      }}
    >
      {!props.disableScopeSelector ? (
        <ScopeSelector
          isOpen={isScopeSelectorOpen}
          onButtonClick={toggleScopeSelector}
          onClose={closeScopeSelector}
          availableLinks={availableLinks}
          activeLink={activeLink}
        />
      ) : null}
      <Container className={css.center}>{props.children}</Container>
    </SideNavContext.Provider>
  )
}
