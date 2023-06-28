/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Classes, Menu, MenuDivider, MenuItem, Position } from '@blueprintjs/core'
import { Avatar, Button, ButtonVariation, Layout, Popover, TableV2, Text } from '@harness/uicore'
import React from 'react'
import { Color } from '@harness/design-system'
import type { CellProps, Column, Renderer } from 'react-table'
import moment from 'moment'
import { Link, useParams } from 'react-router-dom'
import { killEvent } from '@common/utils/eventUtils'
import { getTimeAgo } from '@pipeline/utils/CIUtils'
import type { ApiGetAgentResponse } from 'services/servicediscovery'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { PaginationPropsWithDefaults } from '@common/hooks/useDefaultPaginationProps'
import { useStrings } from 'framework/strings'
import css from './DiscoveryAgentTable.module.scss'

interface DiscoveryAgentTableProps {
  listData: ApiGetAgentResponse[]
  pagination: PaginationPropsWithDefaults
}

const Name: Renderer<CellProps<ApiGetAgentResponse>> = /* istanbul ignore next */ ({ row }) => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  return (
    <>
      <Link
        to={routes.toDiscoveryDetails({
          accountId,
          orgIdentifier,
          projectIdentifier,
          dAgentId: row.original.identity,
          module: 'chaos'
        })}
      >
        <Text font={{ size: 'normal', weight: 'bold' }} color={Color.PRIMARY_7} style={{ cursor: 'pointer' }}>
          {row.original.name}
        </Text>
      </Link>
      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'start' }} margin={{ top: 'xsmall' }}>
        <Text font={{ size: 'small', weight: 'light' }} color={Color.GREY_500}>
          ID:
        </Text>
        <Text
          font={{ size: 'small', weight: 'light' }}
          lineClamp={1}
          className={css.idPill}
          style={{ background: '#F3F3FA', borderRadius: '5px' }}
        >
          {row?.original?.id}
        </Text>
      </Layout.Horizontal>
    </>
  )
}

const NetworkCount: Renderer<CellProps<ApiGetAgentResponse>> = /* istanbul ignore next */ ({ row }) => (
  <Layout.Vertical width={50} height={40} className={css.totalServiceContainer}>
    <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.GREY_500}>
      {row.original.networkMapCount}
    </Text>
  </Layout.Vertical>
)

const ServiceCount: Renderer<CellProps<ApiGetAgentResponse>> = /* istanbul ignore next */ ({ row }) => (
  <Layout.Vertical width={60} height={50} className={css.totalServiceContainer}>
    <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.GREY_500}>
      {row.original.serviceCount}
    </Text>
  </Layout.Vertical>
)

const LastServiceDiscovery: Renderer<CellProps<ApiGetAgentResponse>> = /* istanbul ignore next */ ({ row }) => {
  const date = moment(row.original.installationDetails?.updatedAt).format('MMM DD, YYYY hh:mm A')
  return (
    <Layout.Horizontal flex={{ align: 'center-center', justifyContent: 'flex-start' }}>
      <Layout.Vertical spacing={'xsmall'}>
        <Text font={{ size: 'small' }} lineClamp={1}>
          {date}
        </Text>
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}

const LastModified: Renderer<CellProps<ApiGetAgentResponse>> = /* istanbul ignore next */ ({ row }) => {
  const { getString } = useStrings()
  return (
    <Layout.Horizontal flex={{ align: 'center-center', justifyContent: 'flex-start' }}>
      <Avatar hoverCard={false} name={''} size="normal" />
      <Layout.Vertical spacing={'xsmall'}>
        <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.GREY_900} lineClamp={1}>
          {}
        </Text>
        <Text font={{ size: 'xsmall' }} color={Color.GREY_500} lineClamp={1}>
          {row?.original.createdAt ? getTimeAgo(new Date(row.original.createdAt).getTime()) : getString('na')}
        </Text>
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}

const ThreeDotMenu: Renderer<CellProps<ApiGetAgentResponse>> = /* istanbul ignore next */ () => (
  <Layout.Horizontal style={{ justifyContent: 'flex-end', marginRight: '10px' }} onClick={killEvent}>
    <Popover className={Classes.DARK} position={Position.LEFT}>
      <Button variation={ButtonVariation.ICON} icon="Options" />
      <Menu style={{ backgroundColor: 'unset' }}>
        <MenuItem icon="edit" text={'Edit'} onClick={() => void 0} className={css.menuItem} />
        <MenuDivider />
        <MenuItem icon="delete" text={'Delete'} className={css.deleteMenuItem} onClick={() => void 0} />
      </Menu>
    </Popover>
  </Layout.Horizontal>
)

const DiscoveryAgentTable: React.FC<DiscoveryAgentTableProps> = ({ listData, pagination }) => {
  const columns: Column<ApiGetAgentResponse>[] = React.useMemo(
    () => [
      {
        Header: 'Discovery Agent',
        id: 'toggleButton',
        width: '25%',
        Cell: Name
      },
      {
        Header: 'Network Maps',
        width: '20%',
        Cell: NetworkCount
      },
      {
        Header: 'Services Discovered',
        width: '20%',
        Cell: ServiceCount
      },
      {
        Header: 'Last Service Discovery',
        width: '30%',
        Cell: LastServiceDiscovery
      },
      {
        Header: 'Last Updated',
        width: '20%',
        Cell: LastModified
      },
      {
        id: 'threeDotMenu',
        Cell: ThreeDotMenu
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [listData]
  )

  return <TableV2<ApiGetAgentResponse> sortable={true} columns={columns} data={listData} pagination={pagination} />
}

export default DiscoveryAgentTable
