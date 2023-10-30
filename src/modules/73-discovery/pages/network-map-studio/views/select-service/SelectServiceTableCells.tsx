/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Layout, Text, Checkbox, Popover, Button, ButtonVariation } from '@harness/uicore'
import { Color } from '@harness/design-system'
import React from 'react'
import { CellProps, Renderer } from 'react-table'
import { Classes, Menu, PopoverInteractionKind, Position } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { ApiCreateNetworkMapRequest, DatabaseDiscoveredServiceCollection } from 'services/servicediscovery'
import MenuItem from '@rbac/components/MenuItem/MenuItem'

export const RenderSelectServiceCheckbox: React.FC<
  CellProps<DatabaseDiscoveredServiceCollection> & {
    networkMap: ApiCreateNetworkMapRequest
    handleSelectionChange: (isSelect: boolean, service: DatabaseDiscoveredServiceCollection) => void
  }
> = ({ row, networkMap, handleSelectionChange }) => {
  const isChecked = networkMap.resources.some(nwMap => nwMap.id === row.original.id)
  return (
    <Checkbox
      checked={isChecked}
      key={row.original.spec.kubernetes?.name}
      margin={{ left: 'medium' }}
      onChange={(event: React.FormEvent<HTMLInputElement>) => {
        handleSelectionChange(event.currentTarget.checked, row.original)
      }}
    />
  )
}

export const RenderServiceName: Renderer<CellProps<DatabaseDiscoveredServiceCollection>> = ({ row }) => {
  const { getString } = useStrings()

  return (
    <Layout.Vertical spacing={'small'} margin={{ left: 'small' }}>
      <Text lineClamp={1} font={{ size: 'normal', weight: 'semi-bold' }} color={Color.PRIMARY_7}>
        {row.original.spec.kubernetes?.name}
      </Text>
      <Text lineClamp={1} font={{ size: 'small', weight: 'semi-bold' }} color={Color.GREY_400}>
        {getString('discovery.discoveryDetails.id')}: {row.original.id}
      </Text>
    </Layout.Vertical>
  )
}

export const RenderServiceNamespace: Renderer<CellProps<DatabaseDiscoveredServiceCollection>> = ({ row }) => {
  const { getString } = useStrings()

  return (
    <Layout.Vertical spacing={'small'}>
      <Text lineClamp={1} font={{ size: 'normal', weight: 'semi-bold' }} color={Color.BLACK}>
        {getString('common.namespace')}
      </Text>
      <Text
        lineClamp={1}
        font={{ size: 'small', weight: 'semi-bold' }}
        color={Color.GREY_600}
        icon="service-deployment"
      >
        {row.original.spec.kubernetes?.namespace}
      </Text>
    </Layout.Vertical>
  )
}

export const RenderServiceIPAddress: Renderer<CellProps<DatabaseDiscoveredServiceCollection>> = ({ row }) => {
  const { getString } = useStrings()

  return (
    <Layout.Vertical spacing={'small'}>
      <Text lineClamp={1} font={{ size: 'normal', weight: 'semi-bold' }} color={Color.BLACK}>
        {getString('common.ipAddress')}
      </Text>
      <Text lineClamp={1} font={{ size: 'small', weight: 'semi-bold' }} color={Color.PRIMARY_7}>
        {row.original.spec?.kubernetes?.service?.clusterIP}
      </Text>
    </Layout.Vertical>
  )
}

export const RenderServicePort: Renderer<CellProps<DatabaseDiscoveredServiceCollection>> = ({ row }) => {
  const { getString } = useStrings()

  return (
    <Layout.Vertical spacing={'small'}>
      <Text lineClamp={1} font={{ size: 'normal', weight: 'semi-bold' }} color={Color.BLACK}>
        {getString('common.smtp.port')}
      </Text>
      <Text lineClamp={1} font={{ size: 'small', weight: 'semi-bold' }} color={Color.PRIMARY_7}>
        {row?.original?.spec?.kubernetes?.service?.ports?.map(p => p.targetPort).join(', ')}
      </Text>
    </Layout.Vertical>
  )
}

export const RenderMenuCell: React.FC<
  CellProps<DatabaseDiscoveredServiceCollection> & {
    handleClick: () => void
  }
> = ({ handleClick }) => {
  const { getString } = useStrings()

  return (
    <Layout.Horizontal style={{ justifyContent: 'flex-end' }}>
      <Popover className={Classes.DARK} position={Position.LEFT} interactionKind={PopoverInteractionKind.HOVER}>
        <Button variation={ButtonVariation.ICON} icon="Options" />
        <Menu style={{ backgroundColor: 'unset' }}>
          <MenuItem icon={'Edit'} text={getString('discovery.selectRelatedServices')} onClick={handleClick} />
        </Menu>
      </Popover>
    </Layout.Horizontal>
  )
}
