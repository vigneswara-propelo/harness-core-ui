/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import { Card, Container, Heading, Icon, NoDataCard, PageError, Pagination } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { IDrawerProps } from '@blueprintjs/core'
import { noop } from 'lodash-es'
import noDataImage from '@cv/assets/noChangesData.svg'
import { useStrings } from 'framework/strings'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { useDrawer } from '@cv/hooks/useDrawerHook/useDrawerHook'
import ReportsTable from './ReportsTable'
import { useFetchReportsList } from './UseFetchReportsList'
import ReportDrawer from './ReportDrawer/ReportDrawer'
import { PAGE_SIZE } from './ReportsTable.constants'
import css from './ReportsTable.module.scss'

interface ReportTableInterface {
  startTime: number
  endTime: number
}

export default function ReportsTableCard(props: ReportTableInterface): JSX.Element {
  const { startTime, endTime } = props
  const { getString } = useStrings()
  const [page, setPage] = useState(0)
  const { data, loading, error, refetch } = useFetchReportsList({ startTime, endTime, pageIndex: page })
  const {
    content: resourceData = [],
    pageSize = 0,
    pageIndex = 0,
    totalPages = 0,
    totalItems = 0
  } = data?.resource || {}

  const drawerOptions = {
    size: '800px',
    onClose: noop
  } as IDrawerProps
  const { showDrawer: showReportDrawer } = useDrawer({
    createDrawerContent: drawerProps => <ReportDrawer {...drawerProps} />,
    drawerOptions,
    showConfirmationDuringClose: false
  })

  useEffect(() => {
    if (startTime && endTime) {
      refetch({
        queryParams: { startTime, endTime, pageIndex: page, pageSize: PAGE_SIZE },
        queryParamStringifyOptions: {
          arrayFormat: 'repeat'
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTime, endTime, page])

  let content = null

  if (loading) {
    content = (
      <Container height="100%" flex={{ justifyContent: 'center' }}>
        <Icon name="steps-spinner" color={Color.GREY_400} size={30} />
      </Container>
    )
  } else if (error) {
    content = <PageError message={getErrorMessage(error)} onClick={() => refetch()} />
  } else if (!resourceData.length) {
    content = (
      <NoDataCard
        image={noDataImage}
        containerClassName={css.noDataContainer}
        message={getString('cv.monitoredServices.noAvailableData')}
      />
    )
  } else if (resourceData.length) {
    content = <ReportsTable data={resourceData} showDrawer={showReportDrawer} />
  }

  const containerHeight = totalItems > PAGE_SIZE ? 415 : 475

  return (
    <>
      <Heading level={2} font={{ variation: FontVariation.H6 }} padding={{ bottom: 'medium' }}>
        {getString('ce.perspectives.reports.title', { count: totalItems })}
      </Heading>
      <Card className={css.reportsTableCard}>
        <Container className={css.tableContainer} height={containerHeight}>
          {content}
        </Container>
        <Pagination
          pageSize={pageSize}
          pageIndex={pageIndex}
          pageCount={totalPages}
          itemCount={totalItems}
          gotoPage={setPage}
        />
      </Card>
    </>
  )
}
