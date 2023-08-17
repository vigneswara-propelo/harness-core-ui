/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { TableV2 } from '@harness/uicore'
import React from 'react'
import type { Column } from 'react-table'
import type { EnforcementResult, EnforcementnewViolationsOkResponse } from '@harnessio/react-ssca-service-client'
import { useStrings } from 'framework/strings'
import { useDefaultPaginationProps } from '@common/hooks/useDefaultPaginationProps'
import { useUpdateQueryParams, useQueryParams } from '@common/hooks'
import {
  PackageSupplierCell,
  PackageNameCell,
  ViolationsDetailsCell,
  SortBy,
  LicenseCell
} from './PolicyViolationsTableCells'
import {
  ENFORCEMENT_VIOLATIONS_PAGE_INDEX,
  ENFORCEMENT_VIOLATIONS_PAGE_SIZE,
  EnforcementViolationQueryParams,
  getQueryParamOptions
} from './utils'
import css from './PolicyViolations.module.scss'

export interface PolicyViolationsTableProps {
  data: EnforcementnewViolationsOkResponse
}

export function PolicyViolationsTable({ data }: PolicyViolationsTableProps): React.ReactElement {
  const { getString } = useStrings()
  const { updateQueryParams } = useUpdateQueryParams<Partial<EnforcementViolationQueryParams>>()
  const { sort, order } = useQueryParams<EnforcementViolationQueryParams>(getQueryParamOptions())

  const paginationProps = useDefaultPaginationProps({
    itemCount: data.pagination?.total || ENFORCEMENT_VIOLATIONS_PAGE_INDEX,
    pageSize: data.pagination?.pageSize || ENFORCEMENT_VIOLATIONS_PAGE_SIZE,
    pageCount: data.pagination?.pageCount || 0,
    pageIndex: data.pagination?.pageNumber
  })

  const columns: Column<EnforcementResult>[] = React.useMemo(() => {
    const getServerSortProps = (id: string) => {
      return {
        enableServerSort: true,
        isServerSorted: sort === id,
        isServerSortedDesc: order === 'DESC',
        getSortedColumn: (sortBy: SortBy) => {
          updateQueryParams({ sort: sortBy.sort, order: order === 'DESC' ? 'ASC' : 'DESC' })
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
        accessor: 'violationDetails',
        Cell: ViolationsDetailsCell,
        disableSortBy: true
      }
    ]
  }, [getString, order, sort, updateQueryParams])

  return (
    <TableV2
      className={css.table}
      columns={columns}
      data={data.content.results || []}
      sortable
      pagination={paginationProps}
    />
  )
}
