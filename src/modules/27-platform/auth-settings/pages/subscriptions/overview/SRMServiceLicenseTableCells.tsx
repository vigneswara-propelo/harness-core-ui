/* eslint-disable react/function-component-definition */
/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color } from '@harness/design-system'
import { Text } from '@harness/uicore'
import type { Cell, CellValue, ColumnInstance, Renderer, Row, TableInstance } from 'react-table'
import React from 'react'
import type { ActiveServiceDTO } from 'services/cv'

type CellTypeWithActions<D extends ActiveServiceDTO, V = ActiveServiceDTO> = TableInstance<D> & {
  column: ColumnInstance<D>
  row: Row<D>
  cell: Cell<D, V>
  value: CellValue<V>
}

type CellType = Renderer<CellTypeWithActions<ActiveServiceDTO>>
export const ServiceNameCell: CellType = ({ row }) => {
  const data = row.original
  return (
    <Text color={Color.GREY_900} font={{ size: 'small' }} lineClamp={1}>
      {data.name}
    </Text>
  )
}
export const ActiveMonitoredServices: CellType = ({ row }) => {
  const data = row.original
  return (
    <Text color={Color.GREY_900} font={{ size: 'small' }} lineClamp={1} margin={{ left: 'xxxlarge' }}>
      {data.monitoredServiceCount}
    </Text>
  )
}

export const EnvironmentNameCell: CellType = ({ row }) => {
  const data = row.original
  const envs = data.envNames?.join(',') || '-'
  return (
    <Text color={Color.GREY_900} font={{ size: 'small' }} lineClamp={1}>
      {envs}
    </Text>
  )
}

export const OrganizationCell: CellType = ({ row }) => {
  const data = row.original
  return (
    <Text color={Color.GREY_900} font={{ size: 'small' }} lineClamp={1}>
      {data.orgName}
    </Text>
  )
}
export const ProjectCell: CellType = ({ row }) => {
  const data = row.original
  return (
    <Text color={Color.GREY_900} font={{ size: 'small' }} lineClamp={1}>
      {data.projectName}
    </Text>
  )
}
