/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { Classes } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import {
  Layout,
  Container,
  Pagination,
  ExpandingSearchInput,
  NoDataCard,
  GridListToggle,
  Views,
  TableV2,
  ListHeader,
  sortByCreated,
  sortByLastModified,
  sortByName,
  SortMethod,
  Checkbox,
  CheckboxVariant,
  Icon
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { CellProps, Column, Renderer } from 'react-table'
import { noop } from 'lodash-es'
import {
  RenderColumnProject,
  RenderColumnOrganization
} from '@projects-orgs/pages/projects/views/ProjectListView/ProjectListView'
import { ProjectAggregateDTO, useGetProjectAggregateDTOList } from 'services/cd-ng'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useStrings } from 'framework/strings'
import type { OrgPathProps } from '@common/interfaces/RouteInterfaces'
import ProjectCard from '@projects-orgs/components/ProjectCard/ProjectCard'
import { PageSpinner } from '@common/components'
import { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import FavoriteStar from '@common/components/FavoriteStar/FavoriteStar'
import css from '../ScopeSelector.module.scss'

const RenderColumnMenu: Renderer<CellProps<ProjectAggregateDTO>> = ({ row }) => {
  return (
    <FavoriteStar
      isFavorite={row.original.projectResponse.isFavorite}
      resourceId={row.original.projectResponse.project.identifier}
      resourceType="PROJECT"
      className={css.favorite}
      activeClassName={css.favoriteActive}
      scope={{ orgIdentifier: row.original.projectResponse.project.orgIdentifier }}
    />
  )
}

interface ProjectScopeSelectorProps {
  onClick?: (project: ProjectAggregateDTO) => void
}

export const ProjectScopeSelector: React.FC<ProjectScopeSelectorProps> = ({ onClick }): JSX.Element => {
  const { getString } = useStrings()
  const { accountId } = useParams<OrgPathProps>()
  const { selectedProject } = useAppStore()
  const { preference: sortPreference = SortMethod.LastModifiedDesc, setPreference: setSortPreference } =
    usePreferenceStore<SortMethod>(PreferenceScope.USER, `sort-${PAGE_NAME.ProjectListing}`)

  const [page, setPage] = useState(0)
  const { PL_FAVORITES } = useFeatureFlags()
  const [searchTerm, setSearchTerm] = useState<string>()
  const [favorite, setFavorite] = useState<boolean>(false)
  const { preference: savedProjectView, setPreference: setSavedProjectView } = usePreferenceStore<Views | undefined>(
    PreferenceScope.MACHINE,
    'projectSelectorViewType'
  )
  const [projectView, setProjectView] = useState<Views>(savedProjectView || Views.GRID)
  const { data, loading } = useGetProjectAggregateDTOList({
    queryParams: {
      accountIdentifier: accountId,
      searchTerm,
      pageIndex: page,
      pageSize: 50,
      sortOrders: [sortPreference],
      onlyFavorites: favorite
    },
    queryParamStringifyOptions: { arrayFormat: 'repeat' },
    debounce: 300
  })

  const columns: Column<ProjectAggregateDTO>[] = useMemo(
    () => [
      {
        Header: getString('projectLabel'),
        id: 'name',
        accessor: row => row.projectResponse.project.name,
        width: '55%',
        Cell: RenderColumnProject
      },
      {
        Header: getString('orgLabel'),
        id: 'orgName',
        accessor: row => row.projectResponse.project.orgIdentifier,
        width: '40%',
        Cell: RenderColumnOrganization
      },
      {
        Header: '',
        id: 'menu',
        accessor: row => row.projectResponse.project.identifier,
        width: '7%',
        Cell: RenderColumnMenu
      }
    ],
    []
  )

  return (
    <Container>
      <Layout.Horizontal>
        {PL_FAVORITES && (
          <Checkbox
            variant={CheckboxVariant.BOXED}
            checked={favorite}
            className={css.favorite}
            labelElement={<Icon name="star" color={Color.YELLOW_900} size={14} />}
            onChange={e => {
              setFavorite(e.currentTarget.checked)
            }}
            margin={{ right: 'small' }}
          />
        )}
        <ExpandingSearchInput
          defaultValue={searchTerm}
          placeholder={getString('projectsOrgs.searchProjectPlaceHolder')}
          alwaysExpanded
          autoFocus={true}
          className={css.projectSearch}
          onChange={text => {
            setSearchTerm(text.trim())
            setPage(0)
          }}
        />
        <GridListToggle
          initialSelectedView={projectView}
          onViewToggle={view => {
            setProjectView(view)
            setSavedProjectView(view)
          }}
        />
      </Layout.Horizontal>
      {loading && <PageSpinner />}
      <ListHeader
        selectedSortMethod={sortPreference}
        sortOptions={[...sortByLastModified, ...sortByCreated, ...sortByName]}
        onSortMethodChange={option => {
          setSortPreference(option.value as SortMethod)
        }}
        totalCount={data?.data?.totalItems}
        className={css.listHeader}
      />
      {data?.data?.content?.length ? (
        <>
          {projectView === Views.GRID ? (
            <Layout.Vertical className={css.projectContainerWrapper}>
              <div className={css.projectContainer}>
                {data.data.content.map(projectAggregate => (
                  <ProjectCard
                    key={`${projectAggregate.projectResponse.project.orgIdentifier}${projectAggregate.projectResponse.project.identifier}`}
                    data={projectAggregate}
                    minimal={true}
                    selected={
                      projectAggregate.projectResponse.project.identifier === selectedProject?.identifier &&
                      projectAggregate.projectResponse.project.orgIdentifier === selectedProject?.orgIdentifier
                    }
                    className={cx(css.projectCard, Classes.POPOVER_DISMISS)}
                    onClick={() => onClick?.(projectAggregate)} //integrate click after left-nav framework is done
                    hideAddOption={true}
                  />
                ))}
              </div>
              <Pagination
                className={css.pagination}
                itemCount={data?.data?.totalItems || 0}
                pageSize={data?.data?.pageSize || 10}
                pageCount={data?.data?.totalPages || 0}
                pageIndex={data?.data?.pageIndex || 0}
                gotoPage={pageNumber => setPage(pageNumber)}
                hidePageNumbers
              />
            </Layout.Vertical>
          ) : null}
          {projectView === Views.LIST ? (
            <div className={css.projectContainerWrapper}>
              <TableV2<ProjectAggregateDTO>
                columns={columns}
                name="ProjectListView"
                getRowClassName={_row => cx(Classes.POPOVER_DISMISS, css.row)}
                data={data?.data?.content || []}
                onRowClick={noop}
                pagination={{
                  itemCount: data?.data?.totalItems || 0,
                  pageSize: data?.data?.pageSize || 10,
                  pageCount: data?.data?.totalPages || 0,
                  pageIndex: data?.data?.pageIndex || 0,
                  gotoPage: pageNumber => setPage(pageNumber),
                  hidePageNumbers: true
                }}
              />
            </div>
          ) : null}
        </>
      ) : !loading ? (
        <NoDataCard icon="nav-project" message={getString('noProjects')} />
      ) : null}
    </Container>
  )
}
