/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { Position, PopoverInteractionKind, Classes } from '@blueprintjs/core'
import { useParams, useHistory } from 'react-router-dom'
import cx from 'classnames'
import {
  Text,
  Layout,
  Container,
  Popover,
  Pagination,
  Button,
  ButtonVariation,
  ExpandingSearchInput,
  NoDataCard,
  GridListToggle,
  Views,
  TableV2,
  SelectOption,
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
import {
  RenderColumnProject,
  RenderColumnOrganization
} from '@projects-orgs/pages/projects/views/ProjectListView/ProjectListView'
import routes from '@common/RouteDefinitions'
import { Project, ProjectAggregateDTO, useGetProjectAggregateDTOList } from 'services/cd-ng'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useStrings } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { DEFAULT_PAGE_SIZE_OPTION } from '@modules/10-common/constants/Pagination'
import ProjectCard from '@projects-orgs/components/ProjectCard/ProjectCard'
import { PageSpinner } from '@common/components'
import { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import OrgDropdown from '@common/OrgDropdown/OrgDropdown'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import FavoriteStar from '@common/components/FavoriteStar/FavoriteStar'
import pointerImage from './pointer.svg'
import css from './ProjectSelector.module.scss'

export interface ProjectSelectorProps {
  onSelect: (project: Project) => void
  moduleFilter?: Required<Project>['modules'][0]
  fallbackAccountId?: string
}

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

const ProjectSelect: React.FC<ProjectSelectorProps> = ({ onSelect, fallbackAccountId = '' }) => {
  const accountProps = useParams<AccountPathProps>()
  const accountId = accountProps.accountId || fallbackAccountId
  const [selectedOrg, setSelectedOrg] = useState<SelectOption | undefined>()
  const history = useHistory()
  const { selectedProject } = useAppStore()
  const [page, setPage] = useState(0)
  const { PL_FAVORITES } = useFeatureFlags()
  const [searchTerm, setSearchTerm] = useState<string>()
  const { preference: sortPreference = SortMethod.LastModifiedDesc, setPreference: setSortPreference } =
    usePreferenceStore<SortMethod>(PreferenceScope.USER, `sort-${PAGE_NAME.ProjectListing}`)
  const [favorite, setFavorite] = useState<boolean>(false)
  const { preference: savedProjectView, setPreference: setSavedProjectView } = usePreferenceStore<Views | undefined>(
    PreferenceScope.MACHINE,
    'projectSelectorViewType'
  )
  const [projectView, setProjectView] = useState<Views>(savedProjectView || Views.GRID)
  const { getString } = useStrings()

  const { data, loading } = useGetProjectAggregateDTOList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: selectedOrg?.value as string,
      searchTerm,
      pageIndex: page,
      pageSize: DEFAULT_PAGE_SIZE_OPTION,
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
    <Popover
      interactionKind={PopoverInteractionKind.CLICK}
      position={Position.RIGHT}
      modifiers={{ offset: { offset: -50 } }}
      hasBackdrop={true}
      lazy={true}
      minimal
      fill={true}
      popoverClassName={css.popover}
    >
      <Button
        minimal
        rightIcon="chevron-right"
        data-testid="project-select-button"
        className={cx(css.popoverTarget, css.selectButton)}
        aria-label={getString('selectProject')}
        tooltipProps={{
          isDark: true,
          usePortal: true,
          fill: true
        }}
        tooltip={
          selectedProject ? (
            <Text padding="small" color={Color.WHITE}>
              {getString('selectProject')}
            </Text>
          ) : undefined
        }
        text={
          selectedProject ? (
            <Text color={Color.WHITE} font={{ size: 'normal' }} padding="xsmall" className={css.projectText}>
              {selectedProject.name}
            </Text>
          ) : (
            <Text color={Color.GREY_400} font={{ size: 'normal' }} padding="xsmall">
              {getString('selectProject')}
            </Text>
          )
        }
      />

      <Container width={600} padding="xlarge" className={css.selectContainer}>
        <Layout.Horizontal flex padding={{ bottom: 'large' }}>
          <Text font={{ size: 'medium', weight: 'bold' }} color={Color.BLACK}>
            {getString('selectProject')}
          </Text>
          <Button
            variation={ButtonVariation.LINK}
            text={getString('projectsOrgs.viewAllProjects')}
            onClick={() => history.push(routes.toProjects({ accountId }))}
          />
        </Layout.Horizontal>
        <Layout.Horizontal>
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
          <OrgDropdown
            value={selectedOrg}
            className={cx(css.orgDropdown, { [css.orgwidth]: PL_FAVORITES })}
            onChange={org => {
              setSelectedOrg(org)
            }}
            fallbackAccountId={fallbackAccountId}
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
                      onClick={() => {
                        onSelect(projectAggregate.projectResponse.project)
                      }}
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
                  onRowClick={projectAggregate => {
                    onSelect(projectAggregate.projectResponse.project)
                  }}
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
    </Popover>
  )
}
export const ProjectSelector: React.FC<ProjectSelectorProps> = ({ onSelect, moduleFilter, fallbackAccountId }) => {
  const { selectedProject, updateAppStore } = useAppStore()
  const { getString } = useStrings()

  useEffect(() => {
    // deselect current project if user switches module
    // and the new module isn't added on selected project
    if (moduleFilter && !selectedProject?.modules?.includes(moduleFilter)) {
      updateAppStore({ selectedProject: undefined })
    }
  }, [moduleFilter])

  return (
    <>
      <Layout.Vertical padding={{ left: 'medium', right: 'medium', top: 'large', bottom: 'small' }}>
        <Text margin={{ bottom: 'xsmall' }} font={{ size: 'small' }} color={Color.GREY_500}>
          {getString('projectLabel')}
        </Text>
        <ProjectSelect onSelect={onSelect} fallbackAccountId={fallbackAccountId} />
      </Layout.Vertical>

      {selectedProject ? null : (
        <div style={{ backgroundImage: `url(${pointerImage})` }} className={css.pickProjectHelp}>
          <Text color={Color.GREY_200} padding="small">
            {getString('pickProject')}
          </Text>
        </div>
      )}
    </>
  )
}
