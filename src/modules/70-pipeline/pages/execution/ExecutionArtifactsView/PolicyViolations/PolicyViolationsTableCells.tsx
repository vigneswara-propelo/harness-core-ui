/* eslint-disable react/function-component-definition */
/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color, FontVariation } from '@harness/design-system'
import { Layout, Text } from '@harness/uicore'
import React from 'react'
import type { Cell, CellValue, ColumnInstance, Renderer, Row, TableInstance, UseTableCellProps } from 'react-table'
import type { EnforcementResultResponseBody } from 'services/ssca'

export type SortBy = {
  sort: 'name' | 'supplier' | 'license'
  order: 'ASC' | 'DESC'
}
export interface EnforcementResultColumnActions {
  setSortBy: React.Dispatch<React.SetStateAction<SortBy>>
  sortBy: SortBy
}

type CellTypeWithActions<D extends Record<string, any>, V = any> = TableInstance<D> & {
  column: ColumnInstance<D> & EnforcementResultColumnActions
  row: Row<D>
  cell: Cell<D, V>
  value: CellValue<V>
}

type CellType = Renderer<CellTypeWithActions<EnforcementResultResponseBody>>

export interface CellTypeRegister {
  component: React.ComponentType<UseTableCellProps<EnforcementResultResponseBody>>
}

export const PackageNameCell: CellType = ({ row }) => {
  const data = row.original

  return (
    <Layout.Vertical spacing="xsmall">
      <Text font={{ variation: FontVariation.SMALL_SEMI }} lineClamp={1}>
        {data.name}
      </Text>

      <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600} lineClamp={1}>
        {data.version}
      </Text>
    </Layout.Vertical>
  )
}

export const PackageSupplierCell: CellType = ({ row }) => {
  const data = row.original
  return (
    <Text font={{ variation: FontVariation.SMALL }} lineClamp={1}>
      {data.supplier}
    </Text>
  )
}

export const LicenseCell: CellType = ({ row }) => {
  const data = row.original
  return (
    <Text font={{ variation: FontVariation.SMALL }} lineClamp={1}>
      {data.license}
    </Text>
  )
}

export const ViolationsDetailsCell: CellType = ({ row }) => {
  const data = row.original
  return (
    <Layout.Vertical spacing="xsmall">
      <Text font={{ variation: FontVariation.SMALL_SEMI }} lineClamp={1}>
        {data.violationDetails}
      </Text>

      <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600} lineClamp={1}>
        {data.violationType}
      </Text>
    </Layout.Vertical>
  )
}
