/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo } from 'lodash-es'
import type { Cell, CellValue, ColumnInstance, Renderer, Row, TableInstance } from 'react-table'
import moment from 'moment'
import type { FreezeSummaryResponse } from 'services/cd-ng'
import type { Module } from 'framework/types/ModuleName'

export enum FreezeStatus {
  EXPIRED = 'EXPIRED',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export const DATE_PARSE_FORMAT = 'YYYY-MM-DD hh:mm A'

export interface FrozenExecutionListTableProps {
  data: FreezeSummaryResponse[]
}

export interface FreezeWindowListColumnActions {
  freezeStatusMap: Record<string, FreezeStatus>
  module: Module
}

export type CellTypeWithActions<D extends Record<string, any>, V = any> = TableInstance<D> & {
  column: ColumnInstance<D> & FreezeWindowListColumnActions
  row: Row<D>
  cell: Cell<D, V>
  value: CellValue<V>
}

export type CellType = Renderer<CellTypeWithActions<FreezeSummaryResponse>>
export type CellProps = CellTypeWithActions<FreezeSummaryResponse>

export const getReadableDateFromDateString = (dateTime?: string): string =>
  dateTime ? moment(dateTime, DATE_PARSE_FORMAT).format('lll') : 'NA'

export const getFreezeStatus = (data?: FreezeSummaryResponse, isEnabled?: boolean): FreezeStatus => {
  const currentOrUpcomingWindow = data?.currentOrUpcomingWindow
  if (!currentOrUpcomingWindow) {
    return data?.windows ? FreezeStatus['EXPIRED'] : FreezeStatus['INACTIVE']
  } else if (
    isEnabled &&
    moment().isBetween(moment(currentOrUpcomingWindow.startTime), moment(currentOrUpcomingWindow.endTime))
  ) {
    return FreezeStatus['ACTIVE']
  }
  /* istanbul ignore next */
  return FreezeStatus['INACTIVE']
}
export const getComputedFreezeStatusMap = (content: FreezeSummaryResponse[]): Record<string, FreezeStatus> => {
  return content.reduce((acc, item) => {
    acc[defaultTo(item.identifier, '')] = getFreezeStatus(item, item.status === 'Enabled')
    return acc
  }, {} as Record<string, FreezeStatus>)
}
