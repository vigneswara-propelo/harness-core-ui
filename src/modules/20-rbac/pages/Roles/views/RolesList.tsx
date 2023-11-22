/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import {
  ButtonVariation,
  Container,
  ExpandingSearchInput,
  Layout,
  Pagination,
  PageHeader,
  PageBody,
  ListHeader,
  sortByCreated,
  sortByName,
  SortMethod,
  GridListToggle,
  Views,
  TableV2,
  Icon,
  TagsPopover,
  Text,
  Button,
  Popover
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import { identity, uniq } from 'lodash-es'
import { useHistory, useParams } from 'react-router-dom'
import { Classes, PopoverInteractionKind, Position } from '@blueprintjs/core'
import type { CellProps, Column, Renderer } from 'react-table'
import { useStrings } from 'framework/strings'
import { Role, RoleResponse, RoleWithPrincipalCountResponse, useGetRoleList } from 'services/rbac'
import RoleCard from '@rbac/components/RoleCard/RoleCard'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useRoleModal } from '@rbac/modals/RoleModal/useRoleModal'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import routes from '@common/RouteDefinitions'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { getRoleIcon, isAccountBasicRole } from '@rbac/utils/utils'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import { CommonPaginationQueryParams, useDefaultPaginationProps } from '@common/hooks/useDefaultPaginationProps'
import { useQueryParamsOptions, UseQueryParamsOptions } from '@common/hooks/useQueryParams'
import { usePreviousPageWhenEmpty } from '@common/hooks/usePreviousPageWhenEmpty'
import { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import RoleMenu from '@rbac/components/RoleMenu/RoleMenu'
import useDeleteRoleDialog from '@rbac/hooks/useDeleteRoleDialog'
import RbacFactory from '@rbac/factories/RbacFactory'
import AssignedCounts from './AssignedCounts'
import css from '../Roles.module.scss'

const ROLES_PAGE_SIZE_OPTIONS = [12, 24, 48, 96]
const DEFAULT_ROLES_PAGE_SIZE = ROLES_PAGE_SIZE_OPTIONS[0] as number
const NEW_DEFAULT_ROLES_PAGE_SIZE = ROLES_PAGE_SIZE_OPTIONS[3] as number

export const useRolesQueryParamOptions = (): UseQueryParamsOptions<
  RequiredPick<CommonPaginationQueryParams & { searchTerm?: string }, keyof CommonPaginationQueryParams>
> => {
  const { PL_NEW_PAGE_SIZE } = useFeatureFlags()

  return useQueryParamsOptions({
    page: 0,
    size: PL_NEW_PAGE_SIZE ? NEW_DEFAULT_ROLES_PAGE_SIZE : DEFAULT_ROLES_PAGE_SIZE
  })
}

const RenderColumnRole: Renderer<CellProps<RoleResponse>> = ({
  row: {
    original: { role }
  }
}) => {
  return (
    <Layout.Horizontal spacing="small" className={css.roleRow}>
      <Icon name={getRoleIcon(role.identifier)} size={30} />
      <Text>{role.name}</Text>
      {role.tags && Object.keys(role.tags || {}).length ? (
        <TagsPopover tags={role.tags} iconProps={{ size: 12, color: Color.GREY_600 }} />
      ) : null}
    </Layout.Horizontal>
  )
}

const RenderSelectedResources: Renderer<CellProps<RoleResponse>> = ({
  row: {
    original: { role }
  }
}) => {
  const { getString } = useStrings()
  const resources = uniq(
    role.permissions?.map(permission => RbacFactory.permissionToResourceTypeMap.get(permission as PermissionIdentifier))
  ).filter(identity)

  const showResources = resources.slice(0, 5)
  const remainingResources = resources.length - showResources.length
  return (
    <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'left' }} spacing="xsmall">
      {showResources.map(resourceType => {
        if (!resourceType) return
        const resourceHandler = RbacFactory.getResourceTypeHandler(resourceType)
        if (!resourceHandler) return
        return (
          <Popover
            key={resourceType}
            content={<Text padding="small">{getString(resourceHandler.label)}</Text>}
            interactionKind={PopoverInteractionKind.HOVER}
          >
            <Icon name={resourceHandler.icon} size={24} />
          </Popover>
        )
      })}
      {remainingResources > 0 ? <span className={css.resourceCount}>+{remainingResources}</span> : null}
    </Layout.Horizontal>
  )
}

const RenderColumnAssignedTo: Renderer<CellProps<RoleWithPrincipalCountResponse>> = ({ row: { original: role } }) => {
  return <AssignedCounts role={role} className={css.assignedCount} />
}

const RolesList: React.FC = () => {
  const { accountId, projectIdentifier, orgIdentifier, module } = useParams<ProjectPathProps & ModulePathParams>()
  const { getString } = useStrings()
  const history = useHistory()
  const { PL_NEW_PAGE_SIZE } = useFeatureFlags()
  const { preference: sortPreference = SortMethod.Newest, setPreference: setSortPreference } =
    usePreferenceStore<SortMethod>(PreferenceScope.USER, `sort-${PAGE_NAME.Roles}`)
  useDocumentTitle(getString('roles'))
  const queryParamOptions = useRolesQueryParamOptions()
  const { searchTerm, size: pageSize, page: pageIndex } = useQueryParams(queryParamOptions)
  const { updateQueryParams } = useUpdateQueryParams<CommonPaginationQueryParams & { searchTerm?: string }>()

  const { data, loading, error, refetch } = useGetRoleList({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      pageIndex,
      pageSize,
      searchTerm,
      sortOrders: [sortPreference]
    },
    queryParamStringifyOptions: { arrayFormat: 'repeat' },
    debounce: 300
  })

  usePreviousPageWhenEmpty({ pageItemCount: data?.data?.pageItemCount, page: data?.data?.pageIndex })

  const { openRoleModal } = useRoleModal({
    onSuccess: role => {
      history.push(
        routes.toRoleDetails({
          accountId,
          orgIdentifier,
          projectIdentifier,
          module,
          roleIdentifier: role.identifier
        })
      )
    }
  })

  const editRoleModal = (role: Role): void => {
    openRoleModal(role)
  }

  const newRoleButton = (): JSX.Element => (
    <RbacButton
      text={getString('newRole')}
      data-testid="createRole"
      variation={ButtonVariation.PRIMARY}
      icon="plus"
      onClick={() => openRoleModal()}
      permission={{
        permission: PermissionIdentifier.UPDATE_ROLE,
        resource: {
          resourceType: ResourceType.ROLE
        },
        resourceScope: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier
        }
      }}
      featuresProps={{
        featuresRequest: {
          featureNames: [FeatureIdentifier.CUSTOM_ROLES]
        }
      }}
    />
  )

  const { getRBACErrorMessage } = useRBACError()

  const paginationProps = useDefaultPaginationProps({
    itemCount: data?.data?.totalItems || 0,
    pageSize: data?.data?.pageSize || (PL_NEW_PAGE_SIZE ? NEW_DEFAULT_ROLES_PAGE_SIZE : DEFAULT_ROLES_PAGE_SIZE),
    pageCount: data?.data?.totalPages || 0,
    pageIndex: data?.data?.pageIndex || 0,
    pageSizeOptions: ROLES_PAGE_SIZE_OPTIONS
  })

  const { preference: view = Views.LIST, setPreference: setView } = usePreferenceStore<Views | undefined>(
    PreferenceScope.MACHINE,
    'rolesViewType'
  )

  const RenderColumnMenu: Renderer<CellProps<RoleResponse>> = ({ row: { original: _data } }) => {
    const [menuOpen, setMenuOpen] = useState(false)
    const { openDeleteDialog } = useDeleteRoleDialog({ refetch, role: _data.role })

    return (
      <Popover
        isOpen={menuOpen}
        onInteraction={nextOpenState => {
          setMenuOpen(nextOpenState)
        }}
        className={Classes.DARK}
        position={Position.BOTTOM_RIGHT}
      >
        <Button
          minimal
          icon="Options"
          withoutBoxShadow
          onClick={e => {
            e.stopPropagation()
            setMenuOpen(true)
          }}
          data-testid={`row-options-${_data.role.identifier}`}
        />
        <RoleMenu
          role={_data.role}
          harnessManaged={_data.harnessManaged}
          setMenuOpen={setMenuOpen}
          editRoleModal={editRoleModal}
          openDeleteModal={openDeleteDialog}
        />
      </Popover>
    )
  }
  const columns: Column<RoleResponse>[] = useMemo(
    () => [
      {
        Header: getString('common.role'),
        id: 'name',
        accessor: row => row.role.name,
        width: '35%',
        Cell: RenderColumnRole
      },
      {
        Header: getString('rbac.selectedResources'),
        id: 'selectedResources',
        accessor: row => row.role.identifier,
        Cell: RenderSelectedResources,
        width: '30%'
      },
      {
        Header: getString('rbac.assignedTo'),
        id: 'assigned',
        Cell: RenderColumnAssignedTo,
        width: '30%'
      },
      {
        id: 'menu',
        accessor: row => row.role.identifier,
        Cell: RenderColumnMenu,
        width: '5%'
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const filteredRows = useMemo(
    () => data?.data?.content?.filter(roleResponse => !isAccountBasicRole(roleResponse.role.identifier)) || [],
    [data?.data?.content]
  )

  return (
    <>
      <PageHeader
        title={<Layout.Horizontal>{newRoleButton()}</Layout.Horizontal>}
        toolbar={
          <Layout.Horizontal margin={{ right: 'small' }} height="xxxlarge">
            <ExpandingSearchInput
              defaultValue={searchTerm}
              alwaysExpanded
              placeholder={getString('common.searchPlaceholder')}
              onChange={text => {
                updateQueryParams({ searchTerm: text.trim(), page: 0 })
              }}
              width={250}
              className={css.search}
            />
            <GridListToggle onViewToggle={setView} initialSelectedView={view} />
          </Layout.Horizontal>
        }
      />
      <PageBody
        loading={loading}
        error={error ? getRBACErrorMessage(error) : ''}
        retryOnError={() => refetch()}
        noData={
          !searchTerm
            ? {
                when: () => !data?.data?.content?.length,
                icon: 'nav-project',
                message: getString('rbac.roleDetails.noDataText'),
                button: newRoleButton()
              }
            : {
                when: () => !data?.data?.content?.length,
                icon: 'nav-project',
                message: getString('noRoles')
              }
        }
      >
        <ListHeader
          selectedSortMethod={sortPreference}
          sortOptions={[...sortByCreated, ...sortByName]}
          onSortMethodChange={option => {
            setSortPreference(option.value as SortMethod)
          }}
          totalCount={data?.data?.totalItems}
          className={css.listHeader}
        />
        {view === Views.GRID ? (
          <>
            <div className={css.masonry}>
              {filteredRows.map(roleResponse => (
                <RoleCard
                  key={roleResponse.role.identifier}
                  data={roleResponse}
                  reloadRoles={refetch}
                  editRoleModal={editRoleModal}
                />
              ))}
            </div>
            <Container className={css.pagination}>
              <Pagination {...paginationProps} />
            </Container>
          </>
        ) : (
          <TableV2
            columns={columns}
            data={filteredRows}
            className={css.listTable}
            onRowClick={({ role }) => {
              history.push(
                routes.toRoleDetails({
                  accountId: accountId,
                  orgIdentifier: orgIdentifier,
                  projectIdentifier: projectIdentifier,
                  roleIdentifier: role.identifier,
                  module: module
                })
              )
            }}
            pagination={paginationProps}
          />
        )}
      </PageBody>
    </>
  )
}

export default RolesList
