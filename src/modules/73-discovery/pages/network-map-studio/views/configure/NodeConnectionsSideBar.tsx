/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  Button,
  ButtonVariation,
  Card,
  ExpandingSearchInput,
  Icon,
  Layout,
  TableV2,
  Text,
  useToggleOpen
} from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import React from 'react'
import { CellProps, Column, Renderer } from 'react-table'
import { isEqual } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { ApiCreateNetworkMapRequest, DatabaseConnection, DatabaseNetworkMapEntity } from 'services/servicediscovery'
import RelationPopover, { ServiceRelationFormType } from './RelationPopover'
import css from './ConfigureNetworkMap.module.scss'

interface NodeConnectionsSideBarProps {
  sourceService: DatabaseNetworkMapEntity
  networkMap: ApiCreateNetworkMapRequest
  updateNetworkMap: (networkMap: ApiCreateNetworkMapRequest) => Promise<void>
  newRelation?: ServiceRelationFormType
  closeSideBar: () => void
}

export default function NodeConnectionsSideBar({
  sourceService,
  networkMap,
  updateNetworkMap,
  newRelation,
  closeSideBar
}: NodeConnectionsSideBarProps): React.ReactElement {
  const { getString } = useStrings()
  const [searchTerm, setSearchTerm] = React.useState<string>('')
  const { isOpen: isNewRelationOpen, open: openNewRelation, close: closeNewRelation } = useToggleOpen()

  React.useEffect(() => {
    if (newRelation !== undefined) openNewRelation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newRelation])

  const serviceConnections = networkMap.connections
    ?.filter(conn => conn.from?.id === sourceService.id || conn.to?.id === sourceService.id)
    .filter(conn => {
      if (conn.from?.id === sourceService.id) return conn.to?.name?.includes(searchTerm)
      else return conn.from?.name?.includes(searchTerm)
    })

  const RenderServiceName: Renderer<CellProps<DatabaseConnection>> = ({ row }) => {
    const { isOpen: isEditRelationOpen, open: openEditRelation, close: closeEditRelation } = useToggleOpen()
    const targetService = row.original.from?.id === sourceService.id ? row.original.to : row.original.from

    return (
      <RelationPopover
        networkMap={networkMap}
        updateNetworkMap={updateNetworkMap}
        isOpen={isEditRelationOpen}
        open={openEditRelation}
        close={closeEditRelation}
        initialValues={{
          source: sourceService.id ?? '',
          target: targetService?.id ?? '',
          properties: { type: row.original.type ?? 'TCP', port: row.original.port ?? '', ...row.original.params }
        }}
      >
        <Text className={css.serviceName} font={{ size: 'normal', weight: 'semi-bold' }} icon="service-kubernetes">
          {targetService?.name}
        </Text>
      </RelationPopover>
    )
  }
  const RenderTrafficRoute: Renderer<CellProps<DatabaseConnection>> = ({ row }) => {
    return (
      <Text>
        {row.original.from?.id === sourceService.id ? getString('discovery.outbound') : getString('discovery.inbound')}
      </Text>
    )
  }
  const RenderDeleteConnection: Renderer<CellProps<DatabaseConnection>> = ({ row }) => {
    /* istanbul ignore next */
    async function deleteConnection(): Promise<void> {
      const modifiedConnections = networkMap.connections?.filter(conn => !isEqual(conn, row.original))

      const newNetworkMap: ApiCreateNetworkMapRequest = {
        ...networkMap,
        connections: modifiedConnections
      }
      await updateNetworkMap(newNetworkMap)
    }

    return (
      <Button
        className={row.original.manual ? css.deleteEnabled : css.deleteDisabled}
        icon="code-delete"
        iconProps={{ size: 20 }}
        onClick={deleteConnection}
        disabled={!row.original.manual}
        withoutBoxShadow
        border={false}
        minimal
        tooltip={getString('discovery.disableDeleteConnections')}
        tooltipProps={{
          disabled: row.original.manual
        }}
      />
    )
  }

  const columns: Column<DatabaseConnection>[] = React.useMemo(
    () => [
      {
        Header: getString('services'),
        id: 'name',
        width: '50%',
        Cell: RenderServiceName
      },
      {
        Header: getString('discovery.trafficRoute'),
        id: 'traffic',
        width: '40%',
        Cell: RenderTrafficRoute
      },
      {
        Header: '',
        id: 'delete',
        width: '10%',
        Cell: RenderDeleteConnection
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [serviceConnections, networkMap]
  )

  return (
    <Layout.Vertical spacing="medium" className={css.sidebar}>
      <Card className={css.headerCard}>
        <Text font={{ variation: FontVariation.H4 }} icon="chaos-service-discovery" iconProps={{ size: 24 }}>
          {sourceService.name}
        </Text>
        <Icon
          data-testid="closeButton"
          className={css.closeButton}
          name="code-close"
          size={24}
          onClick={closeSideBar}
        />
      </Card>
      <Layout.Horizontal
        padding={{ top: 'large', right: 'large', bottom: 0, left: 'large' }}
        flex={{ justifyContent: 'space-between' }}
      >
        <RelationPopover
          networkMap={networkMap}
          updateNetworkMap={updateNetworkMap}
          isOpen={isNewRelationOpen}
          open={openNewRelation}
          close={closeNewRelation}
          initialValues={
            newRelation ?? { source: sourceService.id ?? '', target: '', properties: { type: 'TCP', port: '' } }
          }
        >
          <Button variation={ButtonVariation.LINK} icon="plus" text={getString('discovery.newRelation')} />
        </RelationPopover>
        <ExpandingSearchInput
          alwaysExpanded
          width={206}
          placeholder={getString('discovery.searchService')}
          throttle={500}
          defaultValue={searchTerm}
          onChange={/* istanbul ignore next */ value => setSearchTerm(value)}
        />
      </Layout.Horizontal>
      <TableV2<DatabaseConnection> className={css.tableBody} columns={columns} data={serviceConnections ?? []} />
    </Layout.Vertical>
  )
}
