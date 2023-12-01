/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { Classes } from '@blueprintjs/core'
import { useParams, useHistory } from 'react-router-dom'
import cx from 'classnames'
import {
  Layout,
  Container,
  Pagination,
  ExpandingSearchInput,
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
  Icon,
  SelectOption,
  Button,
  ButtonVariation,
  Page
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { CellProps, Column, Renderer } from 'react-table'
import {
  RenderColumnProject,
  RenderColumnOrganization
} from '@projects-orgs/pages/projects/views/ProjectListView/ProjectListView'
import { ProjectAggregateDTO, useGetOrganizationAggregateDTOList, useGetProjectAggregateDTOList } from 'services/cd-ng'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useStrings } from 'framework/strings'
import type { OrgPathProps } from '@common/interfaces/RouteInterfaces'
import { DEFAULT_PAGE_SIZE_OPTION } from '@modules/10-common/constants/Pagination'
import ProjectCard from '@projects-orgs/components/ProjectCard/ProjectCard'
import OrgDropdown from '@common/OrgDropdown/OrgDropdown'
import { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import FavoriteStar from '@common/components/FavoriteStar/FavoriteStar'
import { OrgProjectSplitView } from '@projects-orgs/pages/projects/views/OrgProjectSplitView/OrgProjectSplitView'
import routes from '@modules/10-common/RouteDefinitionsV2'
import { NAV_MODE } from '@modules/10-common/utils/routeUtils'
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
  onProjectClick?: (project: ProjectAggregateDTO) => void
}

export const ProjectScopeSelector: React.FC<ProjectScopeSelectorProps> = ({ onProjectClick }): JSX.Element => {
  const { getString } = useStrings()
  const history = useHistory()
  const { accountId } = useParams<OrgPathProps>()
  const { selectedProject } = useAppStore()
  const { preference: sortPreference = SortMethod.LastModifiedDesc, setPreference: setSortPreference } =
    usePreferenceStore<SortMethod>(PreferenceScope.USER, `sort-${PAGE_NAME.ProjectListing}`)
  const [selectedOrg, setSelectedOrg] = useState<string | undefined>()
  const [page, setPage] = useState(0)
  const [orgPage, setOrgPage] = useState(0)
  const { PL_FAVORITES } = useFeatureFlags()
  const [searchTerm, setSearchTerm] = useState<string>()
  const [orgSearchTerm, setOrgSearchTerm] = useState<string>()
  const [favorite, setFavorite] = useState<boolean>(false)
  const { preference: savedProjectView, setPreference: setSavedProjectView } = usePreferenceStore<Views | undefined>(
    PreferenceScope.MACHINE,
    'projectSelectorViewTypeV2'
  )
  const [projectView, setProjectView] = useState<Views>(savedProjectView || Views.GRID)
  const { data, loading } = useGetProjectAggregateDTOList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: selectedOrg,
      searchTerm,
      pageIndex: page,
      pageSize: DEFAULT_PAGE_SIZE_OPTION,
      sortOrders: [sortPreference],
      onlyFavorites: favorite
    },
    queryParamStringifyOptions: { arrayFormat: 'repeat' },
    debounce: 300
  })
  const { loading: orgDataLoading, data: orgData } = useGetOrganizationAggregateDTOList({
    queryParams: {
      accountIdentifier: accountId,
      searchTerm: orgSearchTerm,
      pageIndex: orgPage,
      pageSize: DEFAULT_PAGE_SIZE_OPTION
    },
    queryParamStringifyOptions: { arrayFormat: 'repeat' },
    debounce: 300
  })

  const columns: Column<ProjectAggregateDTO>[] = useMemo(
    () => [
      {
        Header: getString('projectLabel'),
        id: 'name',
        width: '55%',
        Cell: RenderColumnProject
      },
      {
        Header: getString('orgLabel'),
        id: 'orgName',
        width: '40%',
        Cell: RenderColumnOrganization
      },
      {
        Header: '',
        id: 'menu',
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
        {projectView !== Views.SPLIT_VIEW && (
          <OrgDropdown
            value={{ label: selectedOrg, value: selectedOrg } as SelectOption}
            className={cx(css.orgDropdown, { [css.orgwidth]: PL_FAVORITES })}
            onChange={item => {
              setSelectedOrg(item.value as string)
            }}
          />
        )}
        <GridListToggle
          initialSelectedView={projectView}
          onViewToggle={view => {
            setProjectView(view)
            setSavedProjectView(view)
          }}
          splitView={true}
        />
        <Button
          variation={ButtonVariation.LINK}
          className={css.viewAllProjects}
          text={getString('projectsOrgs.viewAllProjects')}
          onClick={() => {
            history.push(routes.toProjects({ accountId, mode: NAV_MODE.ADMIN }))
          }}
        />
      </Layout.Horizontal>

      {!(projectView === Views.SPLIT_VIEW) && (
        <ListHeader
          selectedSortMethod={sortPreference}
          sortOptions={[...sortByLastModified, ...sortByCreated, ...sortByName]}
          onSortMethodChange={option => {
            setSortPreference(option.value as SortMethod)
          }}
          totalCount={data?.data?.totalItems}
          className={css.listHeader}
        />
      )}
      <Page.Body
        loading={(orgDataLoading || loading) && projectView !== Views.SPLIT_VIEW}
        className={css.pageSpinnerStyle}
      >
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
                      onClick={() => onProjectClick?.(projectAggregate)}
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
                  getRowClassName={_row =>
                    cx(Classes.POPOVER_DISMISS, css.row, {
                      [css.activeRow]: selectedProject?.identifier === _row.original.projectResponse.project.identifier
                    })
                  }
                  data={data?.data?.content || []}
                  onRowClick={projectData => onProjectClick?.(projectData)}
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
        ) : null}
        {projectView === Views.SPLIT_VIEW ? (
          <div className={cx(css.projectContainerWrapper, css.splitViewContainer)}>
            <OrgProjectSplitView
              onProjectClick={onProjectClick}
              projData={data}
              setSelectedOrg={setSelectedOrg}
              sortPreference={sortPreference}
              setSortPreference={setSortPreference}
              selectedOrg={selectedOrg}
              setPage={setPage}
              selectedProject={selectedProject?.identifier as string}
              orgData={orgData}
              setOrgPage={setOrgPage}
              searchTerm={orgSearchTerm}
              setSearchTerm={setOrgSearchTerm}
              orgLoading={orgDataLoading}
              projLoading={loading}
            />
          </div>
        ) : null}
      </Page.Body>
    </Container>
  )
}
