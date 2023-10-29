/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { TableV2 } from '@harness/uicore'
import React from 'react'
import type { Column } from 'react-table'
import { GetPolicyViolationsOkResponse, PolicyViolation } from '@harnessio/react-ssca-manager-client'
import { useStrings } from 'framework/strings'
import { useDefaultPaginationProps } from '@common/hooks/useDefaultPaginationProps'
import {
  PackageSupplierCell,
  PackageNameCell,
  ViolationsDetailsCell,
  SortBy,
  LicenseCell
} from './PolicyViolationsTableCells'
import { ENFORCEMENT_VIOLATIONS_PAGE_INDEX, ENFORCEMENT_VIOLATIONS_PAGE_SIZE, PageOptions } from './utils'
import css from './PolicyViolations.module.scss'

export interface PolicyViolationsTableProps {
  data: GetPolicyViolationsOkResponse
  pageOptions: PageOptions
  updatePageOptions: (pageOptions: Partial<PageOptions>) => void
}

export function PolicyViolationsTable({
  data,
  pageOptions,
  updatePageOptions
}: PolicyViolationsTableProps): React.ReactElement {
  const { getString } = useStrings()

  const { total, pageSize, pageCount, pageNumber } = data.pagination || {}
  const paginationProps = useDefaultPaginationProps({
    itemCount: total || ENFORCEMENT_VIOLATIONS_PAGE_INDEX,
    pageSize: pageSize || ENFORCEMENT_VIOLATIONS_PAGE_SIZE,
    pageCount: pageCount || 0,
    pageIndex: pageNumber,
    gotoPage: page => updatePageOptions({ page }),
    onPageSizeChange: size => updatePageOptions({ page: 0, size })
  })
  const columns: Column<PolicyViolation>[] = React.useMemo(() => {
    // TODO: get this type exported from UICore table
    const getServerSortProps = (id: string): unknown => {
      return {
        enableServerSort: true,
        isServerSorted: pageOptions.sort === id,
        isServerSortedDesc: pageOptions.order === 'DESC',
        getSortedColumn: (sortBy: SortBy) => {
          updatePageOptions({ sort: sortBy.sort, order: pageOptions.order === 'DESC' ? 'ASC' : 'DESC' })
        }
      }
    }

    return [
      {
        Header: getString('common.resourceCenter.ticketmenu.component'),
        accessor: 'name',
        Cell: PackageNameCell,
        serverSortProps: getServerSortProps('name')
      },
      {
        Header: getString('pipeline.supplier'),
        accessor: 'supplier',
        Cell: PackageSupplierCell,
        serverSortProps: getServerSortProps('supplier')
      },
      {
        Header: getString('pipeline.license'),
        accessor: 'license',
        Cell: LicenseCell,
        serverSortProps: getServerSortProps('license')
      },

      {
        Header: getString('pipeline.violationDetails'),
        accessor: 'violation_details',
        Cell: ViolationsDetailsCell,
        disableSortBy: true
      }
    ]
  }, [getString, pageOptions.order, pageOptions.sort, updatePageOptions])

  return (
    <TableV2 className={css.table} columns={columns} data={data.content || []} sortable pagination={paginationProps} />
  )
}
