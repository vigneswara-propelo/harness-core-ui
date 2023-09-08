/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import type { Column } from 'react-table'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { Text, TableV2, Layout, Card, NoDataCard, SelectOption, PageSpinner } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import moment from 'moment'
import { String, useStrings, StringKeys, UseStringsReturn } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { LicenseUsageDTO } from 'services/cd-ng'
import { ActiveServiceDTO, ResponsePageActiveServiceDTO, useDownloadActiveServiceMonitoredCSVReport } from 'services/cv'
import OrgDropdown from '@common/OrgDropdown/OrgDropdown'
import ProjectDropdown from '@common/ProjectDropdown/ProjectDropdown'
import ServiceDropdown from '@common/ServiceDropdown/ServiceDropdown'

import {
  ServiceNameCell,
  OrganizationCell,
  ProjectCell,
  EnvironmentNameCell,
  ActiveMonitoredServices
} from './SRMServiceLicenseTableCells'
import { getInfoIcon } from './UsageInfoCard'
import pageCss from '../SubscriptionsPage.module.scss'

export const DEFAULT_PAGE_INDEX = 0
export const DEFAULT_PAGE_SIZE = 10
export interface SRMServiceLicenseTableProps {
  data: ResponsePageActiveServiceDTO
  gotoPage: (pageNumber: number) => void
  updateFilters: (
    orgId: SelectOption | undefined,
    projId: SelectOption | undefined,
    serviceId: SelectOption | undefined
  ) => void
  servicesLoading: boolean
}

export const tableV2 = (
  columns: Column<LicenseUsageDTO>[],
  content: ActiveServiceDTO[],
  totalElements: number,
  size: number,
  totalPages: number,
  number: number,
  gotoPage: (pageNumber: number) => void
): React.ReactElement => {
  return (
    <TableV2
      className={pageCss.table}
      columns={columns}
      data={content}
      pagination={
        totalElements > size
          ? {
              itemCount: totalElements,
              pageSize: size,
              pageCount: totalPages,
              pageIndex: number,
              gotoPage
            }
          : undefined
      }
      sortable
    />
  )
}

export const NameHeader = (
  getString: UseStringsReturn['getString'],
  headerName: StringKeys,
  tooltip?: StringKeys
): React.ReactElement => {
  return (
    <Layout.Horizontal spacing="xsmall" flex={{ alignItems: 'baseline' }}>
      <Text font={{ size: 'small' }} color={Color.GREY_700}>
        {getString(headerName)}
      </Text>
      {tooltip && getInfoIcon(getString(tooltip))}
    </Layout.Horizontal>
  )
}

export function SRMServiceLicenseTable({
  data,
  gotoPage,
  updateFilters,
  servicesLoading
}: SRMServiceLicenseTableProps): React.ReactElement {
  const { getString } = useStrings()
  const {
    content = [],
    totalPages = 0,
    number = DEFAULT_PAGE_INDEX,
    size = DEFAULT_PAGE_SIZE,
    totalElements
  } = data.data || {}

  const columns: Column<LicenseUsageDTO>[] = React.useMemo(() => {
    return [
      {
        Header: NameHeader(getString, 'common.purpose.service', 'common.subscriptions.usage.cdServiceTooltip'),
        accessor: 'name',
        width: '14%',
        disableSortBy: true,
        Cell: ServiceNameCell
      },
      {
        Header: NameHeader(getString, 'common.purpose.activeMonitoredService'),
        accessor: 'activeMonitoredServices',
        width: '20%',
        disableSortBy: true,
        Cell: ActiveMonitoredServices
      },
      {
        Header: NameHeader(getString, 'common.environment'),
        accessor: 'env',
        width: '30%',
        disableSortBy: true,
        Cell: EnvironmentNameCell
      },
      {
        Header: NameHeader(getString, 'common.organizations'),
        accessor: 'storeType',
        disableSortBy: true,
        width: '13%',
        Cell: OrganizationCell
      },
      {
        Header: NameHeader(getString, 'common.projects', 'common.trialInProgressDescription'),
        accessor: 'storeType1',
        disableSortBy: true,
        width: '15%',
        Cell: ProjectCell
      }
    ] as unknown as Column<LicenseUsageDTO>[]
  }, [])
  const { accountId } = useParams<AccountPathProps>()
  const [selectedOrg, setSelectedOrg] = useState<SelectOption | undefined>()
  const [selectedProj, setSelectedProj] = useState<SelectOption | undefined>()
  const [selectedService, setSelectedService] = useState<SelectOption | undefined>()
  const activeServiceText = `${totalElements}`

  const [initialContent, setInitialContent] = useState<string>('')
  const { data: dataInCsv, refetch } = useDownloadActiveServiceMonitoredCSVReport({
    queryParams: {
      accountIdentifier: accountId
    },
    lazy: true
  })
  useEffect(() => {
    if (dataInCsv) {
      ;(dataInCsv as unknown as Response)
        .clone()
        .text()
        .then((cont: string) => {
          setInitialContent(cont)
        })
    }
  }, [dataInCsv])

  useEffect(() => {
    refetch()
  }, [refetch])
  const formattedTime = moment(new Date().getTime()).format('MMM DD YYYY hh:mm:ss')
  return (
    <Card className={pageCss.outterCard}>
      <Layout.Vertical spacing="xxlarge" flex={{ alignItems: 'stretch' }}>
        <Layout.Horizontal spacing="small" flex={{ justifyContent: 'space-between' }} width={'100%'}>
          <Layout.Vertical className={pageCss.badgesContainer}>
            <div className={cx(pageCss.badge, pageCss.runningExecutions)}>
              <Text className={pageCss.badgeText}>{activeServiceText}&nbsp;</Text>
              <String stringID={'common.subscriptions.usage.services'} />
              <Text>(</Text>
              <Text>{getString('common.lastUpdatedAt')} -</Text>
              <Text className={pageCss.badgeText}>{formattedTime}</Text>
              <Text>)</Text>
            </div>
          </Layout.Vertical>
          <div className={pageCss.exportButtonAlign}>
            {' '}
            <a
              href={`data:text/csv;charset=utf-8,${escape(initialContent || '')}`}
              download="serviceLicensesData.csv"
              className={pageCss.exportButton}
            >
              {'Export CSV'}
            </a>
          </div>
        </Layout.Horizontal>
        <Layout.Horizontal spacing="small" flex={{ justifyContent: 'flex-end' }} width={'100%'}>
          <Layout.Vertical>
            <OrgDropdown
              value={selectedOrg}
              className={pageCss.orgDropdown}
              onChange={org => {
                setSelectedOrg(org)
              }}
            />
          </Layout.Vertical>
          <div></div>
          <ProjectDropdown
            value={selectedProj}
            className={pageCss.orgDropdown}
            onChange={proj => {
              setSelectedProj(proj)
            }}
          />
          <ServiceDropdown
            value={selectedService}
            className={pageCss.orgDropdown}
            onChange={service => {
              setSelectedService(service)
            }}
          />
          <Text
            className={pageCss.fetchButton}
            font={{ variation: FontVariation.LEAD }}
            color={Color.PRIMARY_7}
            onClick={() => {
              updateFilters(selectedOrg, selectedProj, selectedService)
            }}
          >
            Update
          </Text>
        </Layout.Horizontal>
        {servicesLoading && <PageSpinner />}
        {content?.length > 0 ? (
          tableV2(columns, content, totalElements || 0, size, totalPages, number, gotoPage)
        ) : (
          <NoDataCard
            message={getString('common.noActiveServiceData')}
            className={pageCss.noDataCard}
            containerClassName={pageCss.noDataCardContainer}
          />
        )}
      </Layout.Vertical>
    </Card>
  )
}
