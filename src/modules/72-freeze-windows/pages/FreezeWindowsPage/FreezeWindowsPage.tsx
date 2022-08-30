/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  DropDown,
  ExpandingSearchInput,
  ExpandingSearchInputHandle,
  HarnessDocTooltip,
  Layout,
  Page
} from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import GitFilters, { GitFilterScope } from '@common/components/GitFilters/GitFilters'
import { getLinkForAccountResources } from '@common/utils/BreadcrumbUtils'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import NoResultsView from './views/NoResultsView/NoResultsView'
// import { useUpdateQueryParams } from '@common/hooks'
import css from './FreezeWindowsPage.module.scss'

export default function FreezeWindowsPage(): React.ReactElement {
  const { getString } = useStrings()
  const { isGitSyncEnabled: isGitSyncEnabledForProject, gitSyncEnabledOnlyForFF } = useAppStore()
  // const { updateQueryParams } = useUpdateQueryParams<{ templateType?: TemplateType }>()
  const isGitSyncEnabled = isGitSyncEnabledForProject && !gitSyncEnabledOnlyForFF
  // const history = useHistory()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const [gitFilter, setGitFilter] = useState<GitFilterScope | null>(null)
  const [, setPage] = useState(0)
  const [searchParam, setSearchParam] = useState('')
  const searchRef = React.useRef<ExpandingSearchInputHandle>({} as ExpandingSearchInputHandle)
  const scope = getScopeFromDTO({ projectIdentifier, orgIdentifier, accountIdentifier: accountId })

  useDocumentTitle([getString('common.freezeWindows')])

  const reset = React.useCallback((): void => {
    searchRef.current.clear()
    // updateQueryParams({ templateType: [] as any })
    setGitFilter(null)
  }, [searchRef.current, setGitFilter]) // updateQueryParams,

  return (
    <>
      <Page.Header
        title={
          <div className="ng-tooltip-native">
            <h2 data-tooltip-id="freezeWindowsPageHeading"> {getString('common.freezeWindows')}</h2>
            <HarnessDocTooltip tooltipId="freezeWindowPageHeading" useStandAlone={true} />
          </div>
        }
        breadcrumbs={
          <NGBreadcrumbs
            links={getLinkForAccountResources({ accountId, orgIdentifier, projectIdentifier, getString })}
          />
        }
      />

      <Page.SubHeader className={css.freeeWindowsPageSubHeader}>
        <Layout.Horizontal spacing={'medium'}>
          {/*<NewTemplatePopover />*/}
          <DropDown
            onChange={() => {
              // todo
            }}
            // value={templateType}
            filterable={false}
            addClearBtn={true}
            // items={allowedTemplateTypes}
            items={[]}
            placeholder={getString('all')}
            popoverClassName={css.dropdownPopover}
          />
          {isGitSyncEnabled && (
            <GitSyncStoreProvider>
              <GitFilters
                onChange={filter => {
                  setGitFilter(filter)
                  setPage(0)
                }}
                className={css.gitFilter}
                defaultValue={gitFilter || undefined}
              />
            </GitSyncStoreProvider>
          )}
        </Layout.Horizontal>
        <Layout.Horizontal spacing="small" style={{ alignItems: 'center' }}>
          <ExpandingSearchInput
            alwaysExpanded
            width={200}
            placeholder={getString('search')}
            onChange={(text: string) => {
              setPage(0)
              setSearchParam(text)
            }}
            ref={searchRef}
            defaultValue={searchParam}
            className={css.expandSearch}
          />
        </Layout.Horizontal>
      </Page.SubHeader>

      <Page.Body>
        <NoResultsView
          hasSearchParam={!!searchParam} //  || !!templateType
          onReset={reset}
          text={getString('freezeWindows.freezeWindowsPage.noFreezeWindows', { scope })}
        />
      </Page.Body>
    </>
  )
}
