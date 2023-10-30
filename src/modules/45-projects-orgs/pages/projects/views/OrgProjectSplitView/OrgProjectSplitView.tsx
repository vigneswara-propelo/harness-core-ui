/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { Classes, PopoverInteractionKind } from '@blueprintjs/core'
import cx from 'classnames'
import {
  Layout,
  Container,
  Pagination,
  ExpandingSearchInput,
  NoDataCard,
  TableV2,
  SortMethod,
  Text,
  ListHeader,
  sortByLastModified,
  sortByCreated,
  sortByName,
  Icon,
  Utils,
  PageSpinner
} from '@harness/uicore'
import type { CellProps, Column, Renderer } from 'react-table'
import { FontVariation, Color } from '@harness/design-system'
import { RenderColumnProject } from '@projects-orgs/pages/projects/views/ProjectListView/ProjectListView'
import {
  ProjectAggregateDTO,
  OrganizationAggregateDTO,
  ResponsePageProjectAggregateDTO,
  ResponsePageOrganizationAggregateDTO
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import FavoriteStar from '@common/components/FavoriteStar/FavoriteStar'
import css from './OrgProjectSplitView.module.scss'

const RenderColumnMenu: Renderer<CellProps<ProjectAggregateDTO>> = ({ row }) => {
  return (
    <Layout.Horizontal flex={{ justifyContent: 'flex-end' }}>
      <FavoriteStar
        isFavorite={row.original.projectResponse.isFavorite}
        resourceId={row.original.projectResponse.project.identifier}
        resourceType="PROJECT"
        className={css.favorite}
        activeClassName={css.favoriteActive}
        scope={{ orgIdentifier: row.original.organization?.name }}
      />
      <Utils.WrapOptionalTooltip
        tooltip={
          <Text color={Color.GREY_100} padding="small">
            {row.original.projectResponse.project.orgIdentifier}
          </Text>
        }
        tooltipProps={{ isDark: true, interactionKind: PopoverInteractionKind.HOVER }}
      >
        <Icon name="nav-organization" size={24} />
      </Utils.WrapOptionalTooltip>
    </Layout.Horizontal>
  )
}

interface ProjectScopeSelectorProps {
  projData: ResponsePageProjectAggregateDTO | null
  onProjectClick?: (project: ProjectAggregateDTO) => void
  selectedOrg: string | undefined
  setSelectedOrg: (orgId: string | undefined) => void
  selectedProject: string | undefined
  sortPreference: SortMethod
  setSortPreference: (sortMethod: SortMethod) => void
  setPage: (pageNumber: number) => void
  orgData: ResponsePageOrganizationAggregateDTO | null
  setOrgPage: (pageNumber: number) => void
  searchTerm: string | undefined
  setSearchTerm: (searchTerm: string) => void
  orgLoading: boolean
  projLoading: boolean
}

export const OrgProjectSplitView: React.FC<ProjectScopeSelectorProps> = ({
  projData,
  onProjectClick,
  setSelectedOrg,
  sortPreference,
  setSortPreference,
  selectedOrg,
  setPage,
  selectedProject,
  orgData,
  setOrgPage,
  searchTerm,
  setSearchTerm,
  orgLoading,
  projLoading
}): JSX.Element => {
  const { getString } = useStrings()

  const orgButton = (org: OrganizationAggregateDTO): JSX.Element => {
    return (
      <Container
        onClick={() => setSelectedOrg(org.organizationResponse.organization.identifier)}
        className={cx(css.link, { [css.active]: selectedOrg === org.organizationResponse.organization.identifier })}
      >
        <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600} lineClamp={1}>
          {org.organizationResponse.organization.name}
        </Text>
      </Container>
    )
  }

  const columns: Column<ProjectAggregateDTO>[] = useMemo(
    () => [
      {
        id: 'name',
        width: '90%',
        Cell: RenderColumnProject
      },
      {
        id: 'menu',
        width: '10%',
        Cell: RenderColumnMenu
      }
    ],
    []
  )

  return (
    <>
      {(orgLoading || projLoading) && <PageSpinner />}
      <Layout.Horizontal width={'100%'} margin={{ top: 'xxlarge' }}>
        <Layout.Vertical width={276}>
          <Container height={32} margin={{ bottom: 'small' }}>
            <ExpandingSearchInput
              defaultValue={searchTerm}
              placeholder={getString('projectsOrgs.orgSearchPlaceHolder')}
              alwaysExpanded
              autoFocus={true}
              className={css.projectSearch}
              onChange={text => {
                setSearchTerm(text.trim())
                setOrgPage(0)
              }}
            />
          </Container>
          <Container
            margin={{ right: 'medium' }}
            onClick={() => setSelectedOrg('')}
            className={cx(css.link, { [css.active]: !selectedOrg }, css.allButton)}
          >
            <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600} lineClamp={1}>
              {getString('common.allOrganizations')}
            </Text>
          </Container>
          <div className={css.divider} />
          {orgData?.data?.content?.length ? (
            <Layout.Vertical padding={{ right: 'medium' }} height={'82%'} className={css.orgDataContainer}>
              {orgData.data.content.map(org => orgButton(org as OrganizationAggregateDTO))}
            </Layout.Vertical>
          ) : (
            <NoDataCard icon="nav-organization" message={getString('projectsOrgs.noOrganizations')} />
          )}
          <div className={css.divider} />
          <Pagination
            className={css.pagination}
            itemCount={orgData?.data?.totalItems || 0}
            pageSize={orgData?.data?.pageSize || 10}
            pageCount={orgData?.data?.totalPages || 0}
            pageIndex={orgData?.data?.pageIndex || 0}
            pageSizeOptions={[]}
            gotoPage={pageNumber => setOrgPage(pageNumber)}
            hidePageSize={true}
            hidePageNumbers
            minimal
          />
        </Layout.Vertical>
        <div className={css.sectionDivider} />
        <Container className={css.flexContainer} height={'100%'}>
          {projData?.data?.content?.length ? (
            <ListHeader
              selectedSortMethod={sortPreference}
              sortOptions={[...sortByLastModified, ...sortByCreated, ...sortByName]}
              onSortMethodChange={option => {
                setSortPreference(option.value as SortMethod)
              }}
              totalCount={projData?.data?.totalItems}
              className={css.listHeader}
            />
          ) : null}
          <Container
            className={css.tableContainer}
            margin={{ top: 'small' }}
            height={'95%'}
            padding={{ right: 'medium' }}
          >
            {projData?.data?.content?.length ? (
              <TableV2<ProjectAggregateDTO>
                columns={columns}
                name="ProjectListView"
                hideHeaders={true}
                getRowClassName={_row =>
                  cx(Classes.POPOVER_DISMISS, css.row, {
                    [css.activeRow]: selectedProject === _row.original.projectResponse.project.identifier
                  })
                }
                data={projData?.data?.content || []}
                onRowClick={projectData => onProjectClick?.(projectData)}
                pagination={{
                  itemCount: projData?.data?.totalItems || 0,
                  pageSize: projData?.data?.pageSize || 10,
                  pageCount: projData?.data?.totalPages || 0,
                  pageIndex: projData?.data?.pageIndex || 0,
                  gotoPage: pageNumber => setPage(pageNumber),
                  hidePageNumbers: true
                }}
              />
            ) : (
              <NoDataCard icon="nav-project" message={getString('noProjects')} />
            )}
          </Container>
        </Container>
      </Layout.Horizontal>
    </>
  )
}
