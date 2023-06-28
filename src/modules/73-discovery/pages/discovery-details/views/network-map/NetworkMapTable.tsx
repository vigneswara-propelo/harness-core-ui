/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Classes, Menu, MenuItem, Position } from '@blueprintjs/core'
import {
  Avatar,
  Button,
  ButtonVariation,
  Container,
  ExpandingSearchInput,
  Layout,
  Page,
  Popover,
  TableV2,
  Text,
  useToaster
} from '@harness/uicore'
import React from 'react'
import { Color } from '@harness/design-system'
import type { CellProps, Column, Renderer } from 'react-table'
import { useHistory, useParams } from 'react-router-dom'
import { getTimeAgo } from '@pipeline/utils/CIUtils'
import type { DiscoveryPathProps, ModulePathParams } from '@common/interfaces/RouteInterfaces'
import { DatabaseNetworkMapCollection, useDeleteNetworkMap, useListNetworkMap } from 'services/servicediscovery'
import routes from '@common/RouteDefinitions'
import { useQueryParams } from '@common/hooks'
import { useDefaultPaginationProps } from '@common/hooks/useDefaultPaginationProps'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE, ServiceDiscoveryFilterParams } from '@discovery/interface/filters'
import { useStrings } from 'framework/strings'
import EmptyStateNetworkMap from './EmptyStateNetworkMap'
import css from './NetworkMapTable.module.scss'

const NetworkMapTable: React.FC = /* istanbul ignore next */ () => {
  const { dAgentId, accountId, orgIdentifier, projectIdentifier } = useParams<DiscoveryPathProps & ModulePathParams>()
  const history = useHistory()
  const { getString } = useStrings()
  const { showError, showSuccess } = useToaster()
  const [search, setSearch] = React.useState('')

  //States for pagination
  const { page, size } = useQueryParams<ServiceDiscoveryFilterParams>()

  const {
    data: networkMapList,
    loading: networkMapListLoading,
    refetch: refetchListNetwork
  } = useListNetworkMap({
    agentIdentity: dAgentId,
    queryParams: {
      accountIdentifier: accountId,
      organizationIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier,
      page: page ? parseInt(page) : DEFAULT_PAGE_INDEX,
      limit: size ? parseInt(size) : DEFAULT_PAGE_SIZE,
      all: false,
      search: search
    }
  })

  const paginationProps = useDefaultPaginationProps({
    itemCount: networkMapList?.page?.totalItems ?? 1,
    pageSize: size ? parseInt(size) : DEFAULT_PAGE_SIZE,
    pageCount: networkMapList?.page?.totalPages ?? 1,
    pageIndex: page ? parseInt(page) : 0
  })

  const { mutate: deleteNetworkMap } = useDeleteNetworkMap({
    queryParams: {
      accountIdentifier: accountId,
      organizationIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier
    },
    agentIdentity: dAgentId
  })

  const handleDelete = (networkMapId: string): void => {
    deleteNetworkMap(networkMapId)
      .then(() => {
        showSuccess('Network Map deleted successfully')
        refetchListNetwork()
      })
      .catch(e => showError(e))
  }

  const Name: Renderer<CellProps<DatabaseNetworkMapCollection>> = ({ row }) => (
    <Text font={{ size: 'normal', weight: 'semi-bold' }} margin={{ left: 'medium' }} color={Color.PRIMARY_7}>
      {row.original.name}
    </Text>
  )

  const ServiceCount: Renderer<CellProps<DatabaseNetworkMapCollection>> = ({ row }) => (
    <Layout.Vertical width={50} height={40} className={css.totalServiceContainer}>
      <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.GREY_500}>
        {row.original.resources?.length}
      </Text>
    </Layout.Vertical>
  )

  const LastModified: Renderer<CellProps<DatabaseNetworkMapCollection>> = ({ row }) => {
    return (
      <Layout.Horizontal flex={{ align: 'center-center', justifyContent: 'flex-start' }}>
        <Avatar hoverCard={false} name={row.original.updatedAt} size="normal" />
        <Layout.Vertical spacing={'xsmall'}>
          <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.GREY_900} lineClamp={1}>
            {row.original.updatedAt}
          </Text>
          <Text font={{ size: 'xsmall' }} color={Color.GREY_500} lineClamp={1}>
            {row.original.createdAt ? getTimeAgo(new Date(row.original.createdAt).getTime()) : getString('na')}
          </Text>
        </Layout.Vertical>
      </Layout.Horizontal>
    )
  }

  const ThreeDotMenu: Renderer<CellProps<DatabaseNetworkMapCollection>> = ({ row }) => {
    return (
      <Layout.Horizontal style={{ justifyContent: 'flex-end', marginRight: '10px' }}>
        <Popover className={Classes.DARK} position={Position.LEFT}>
          <Button variation={ButtonVariation.ICON} icon="Options" />
          <Menu data-testid="options" style={{ backgroundColor: 'unset' }}>
            <MenuItem icon="edit" text={'Edit'} onClick={() => void 0} className={css.menuItem} />
            <MenuItem
              icon="delete"
              text={'Delete'}
              className={css.menuItem}
              onClick={() => handleDelete(row.original.id ?? '')}
            />
          </Menu>
        </Popover>
      </Layout.Horizontal>
    )
  }

  const networkMapListData: DatabaseNetworkMapCollection[] = React.useMemo(
    () => networkMapList?.items || [],
    [networkMapList?.items]
  )

  const columns: Column<DatabaseNetworkMapCollection>[] = React.useMemo(
    () => [
      {
        Header: getString('common.networkMap'),
        width: '30%',
        Cell: Name
      },
      {
        Header: getString('discovery.networkMapTable.noOfService'),
        width: '30%',
        Cell: ServiceCount
      },
      {
        Header: getString('lastUpdatedBy'),
        width: '30%',
        Cell: LastModified
      },
      {
        Header: '',
        id: 'threeDotMenu',
        width: '10%',
        Cell: ThreeDotMenu
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [networkMapList, refetchListNetwork]
  )

  return (
    <Container>
      {networkMapList?.items?.length !== 0 ? (
        <>
          <Page.SubHeader>
            <Layout.Horizontal width="100%" flex={{ justifyContent: 'space-between' }}>
              <Button
                text={getString('discovery.newNetworkMap')}
                icon="plus"
                variation={ButtonVariation.PRIMARY}
                onClick={() => {
                  history.push({
                    pathname: routes.toCreateNetworkMap({
                      dAgentId: dAgentId,
                      accountId,
                      orgIdentifier,
                      projectIdentifier
                    })
                  })
                }}
              />
              <ExpandingSearchInput
                alwaysExpanded
                width={232}
                placeholder={getString('discovery.searchNetworkMap')}
                throttle={500}
                defaultValue={search}
                onChange={value => setSearch(value)}
              />
            </Layout.Horizontal>
          </Page.SubHeader>
          <Page.Body>
            {networkMapListLoading ? (
              <Page.Spinner />
            ) : (
              <Container className={css.tableBody}>
                <TableV2<DatabaseNetworkMapCollection>
                  sortable={true}
                  columns={columns}
                  data={networkMapListData}
                  pagination={paginationProps}
                />
              </Container>
            )}
          </Page.Body>
        </>
      ) : (
        <EmptyStateNetworkMap />
      )}
    </Container>
  )
}

export default NetworkMapTable
