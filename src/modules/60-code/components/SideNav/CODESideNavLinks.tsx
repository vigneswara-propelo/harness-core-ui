/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { get } from 'lodash-es'
import { useParams, matchPath, useLocation } from 'react-router-dom'
import type { match } from 'react-router-dom'
import { SideNav } from '@common/navigation/SideNavV2/SideNavV2'
import { Scope } from 'framework/types/types'
import { useStrings } from 'framework/strings'
import { useGetSelectedScope } from '@common/navigation/SideNavV2/SideNavV2.utils'
import { NAV_MODE } from '@common/utils/routeUtils'
import { CODEPathProps, CODEProps, routesV2 as routes } from '@modules/60-code/RouteDefinitions'
import { buildCODERoutePaths } from '@modules/60-code/CODERouteDestinations'
import css from './CODESideNavLinks.module.scss'

export default function CODESideNavLinks(mode: NAV_MODE): React.ReactElement {
  const { pathname } = useLocation()
  const { getString } = useStrings()
  const { accountId } = useParams<CODEPathProps>()
  const { params } = useGetSelectedScope()
  const { projectIdentifier, orgIdentifier } = params || {}
  const routePaths = buildCODERoutePaths(mode)
  let matchedRouteInfo: match<CODEProps> | null = null
  let matchedRouteKey = ''

  //
  // NavLinks does not have full page route context (it's stayed on top-level route),
  // meaning `useParams` does not give back Gitness' params. We need to retrieve
  // Gitness specific route params by using native react-router-dom matching APIs.
  //
  // Using findLast to make sure more specific routes defined in routePaths are matched
  // first (i.e: File Edit route matches before Repository route).
  //
  Object.entries(routePaths).findLast(([_pathKey, path]) => {
    matchedRouteKey = _pathKey
    matchedRouteInfo = !Array.isArray(path) ? matchPath(pathname, { path }) : null

    if (Array.isArray(path)) {
      // No need to use findLast here as child paths are already sorted
      path.find(_path => {
        matchedRouteInfo = matchPath(pathname, { path: _path })
        return !!matchedRouteInfo
      })
    } else {
      matchedRouteInfo = matchPath(pathname, { path })
    }

    return !!matchedRouteInfo
  })
  const repoName = get(matchedRouteInfo, 'params.repoName', '')
  const gitRef = get(matchedRouteInfo, 'params.gitRef', get(matchedRouteInfo, 'params.commitRef', ''))

  return (
    <SideNav.Main>
      {repoName ? (
        <SideNav.Section>
          <SideNav.Link
            icon="arrow-left"
            label={getString('code.backToRepositories')}
            data-code-nav-version="2"
            to={routes.toCODERepositories({ space: [accountId, orgIdentifier, projectIdentifier].join('/') })}
            isActive={() => matchedRouteKey === 'toCODERepositories' && !location.pathname.endsWith('/settings')}
          />
          <SideNav.Scope scope={[Scope.PROJECT]}>
            <SideNav.Link
              className={css.link}
              data-code-repo-section="files"
              icon="code-file"
              label={getString('common.files')}
              to={routes.toCODERepository({
                repoPath: [accountId, orgIdentifier, projectIdentifier, repoName].join('/'),
                gitRef: isGitRev(gitRef) ? '' : gitRef
              })}
              isActive={() => ['toCODERepository', 'toCODEFileEdit'].includes(matchedRouteKey)}
            />

            <SideNav.Link
              className={css.link}
              data-code-repo-section="commits"
              icon="git-commit"
              label={getString('commits')}
              to={routes.toCODECommits({
                repoPath: [accountId, orgIdentifier, projectIdentifier, repoName].join('/'),
                commitRef: isGitRev(gitRef) ? '' : gitRef
              })}
              isActive={() => ['toCODECommits', 'toCODECommit'].includes(matchedRouteKey)}
            />

            <SideNav.Link
              className={css.link}
              icon="git-branch"
              label={getString('code.branches')}
              to={routes.toCODEBranches({
                repoPath: [accountId, orgIdentifier, projectIdentifier, repoName].join('/')
              })}
              iconProps={{ size: 16 }}
            />

            <SideNav.Link
              className={css.link}
              icon="code-tag"
              label={getString('tagsLabel')}
              to={routes.toCODETags({
                repoPath: [accountId, orgIdentifier, projectIdentifier, repoName].join('/')
              })}
              iconProps={{ size: 22 }}
            />

            <SideNav.Link
              className={css.link}
              icon="git-pull"
              label={getString('code.pullRequests')}
              to={routes.toCODEPullRequests({
                repoPath: [accountId, orgIdentifier, projectIdentifier, repoName].join('/')
              })}
              isActive={() => ['toCODEPullRequests', 'toCODEPullRequest'].includes(matchedRouteKey)}
              iconProps={{ size: 16 }}
            />

            <SideNav.Link
              className={css.link}
              icon="code-webhook"
              label={getString('common.webhooks')}
              to={routes.toCODEWebhooks({
                repoPath: [accountId, orgIdentifier, projectIdentifier, repoName].join('/')
              })}
              iconProps={{ size: 24 }}
            />

            <SideNav.Link
              className={css.link}
              icon="main-search"
              label={getString('search')}
              to={routes.toCODERepositorySearch({
                repoPath: [accountId, orgIdentifier, projectIdentifier, repoName].join('/')
              })}
              iconProps={{
                size: 16
              }}
            />

            <SideNav.Link
              className={css.link}
              icon="setting"
              label={getString('settingsLabel')}
              to={routes.toCODESettings({
                repoPath: [accountId, orgIdentifier, projectIdentifier, repoName].join('/')
              })}
            />
          </SideNav.Scope>
        </SideNav.Section>
      ) : (
        <SideNav.Section>
          <SideNav.Scope scope={[Scope.PROJECT]}>
            <SideNav.Link
              label={getString('repositories')}
              data-code-nav-version="2"
              to={routes.toCODERepositories({ space: [accountId, orgIdentifier, projectIdentifier].join('/') })}
              isActive={() => matchedRouteKey === 'toCODERepositories' && !location.pathname.endsWith('/settings')}
            />
            <SideNav.Link
              exact
              label={getString('search')}
              data-code-nav-version="2"
              to={routes.toCODEProjectSearch({ space: [accountId, orgIdentifier, projectIdentifier].join('/') })}
            />
          </SideNav.Scope>
        </SideNav.Section>
      )}

      <SideNav.CommonScopeLinks mode={mode} module={CODE} />
    </SideNav.Main>
  )
}

const CODE = 'code'

declare global {
  interface Array<T> {
    findLast(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: unknown): T
  }
}

// Check if gitRef is a git commit hash (https://github.com/diegohaz/is-git-rev, MIT © Diego Haz)
const isGitRev = (gitRef = ''): boolean => /^[0-9a-f]{7,40}$/i.test(gitRef)
