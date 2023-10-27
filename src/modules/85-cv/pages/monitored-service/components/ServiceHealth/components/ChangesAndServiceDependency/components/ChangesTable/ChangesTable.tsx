/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState, useMemo, useRef } from 'react'
import { defaultTo, noop } from 'lodash-es'
import type { IDrawerProps } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import type { Column } from 'react-table'
import { Icon, Container, NoDataCard, PageError, TableV2, Pagination, Layout } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { useChangeEventList, useChangeEventListForAccount } from 'services/cv'
import { useDeepCompareEffect, useQueryParams } from '@common/hooks'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import {
  getErrorMessage,
  getMonitoredServiceIdentifierProp,
  getMonitoredServiceIdentifiers
} from '@cv/utils/CommonUtils'
import noDataImage from '@cv/assets/noChangesData.svg'
import { useDrawer } from '@cv/hooks/useDrawerHook/useDrawerHook'
import type { ChangesTableContentWrapper, ChangesTableInterface } from './ChangesTable.types'
import { RenderTime, RenderName, RenderImpact, RenderType, RenderChangeType } from './ChangesTable.utils'
import { PAGE_SIZE } from './ChangesTable.constants'
import ChangeEventCard from './components/ChangeEventCard/ChangeEventCard'
import ChangesTableWrapper from './ChangesTableWrapper'
import css from './ChangeTable.module.scss'

export default function ChangesTable({
  isCardView = true,
  startTime,
  endTime,
  monitoredServiceIdentifier,
  serviceIdentifier,
  environmentIdentifier,
  customCols,
  changeCategories,
  changeSourceTypes,
  recordsPerPage,
  dataTooltipId,
  monitoredServiceDetails,
  resetFilters,
  isChangesPage,
  isCompositeSLO
}: ChangesTableInterface): JSX.Element {
  const [page, setPage] = useState(0)
  const { getString } = useStrings()
  const { orgIdentifier, projectIdentifier, accountId } = useParams<ProjectPathProps & { identifier: string }>()
  const isAccountLevel = !orgIdentifier && !projectIdentifier && !!accountId

  const projectRef = useRef(projectIdentifier)
  const { eventId: queryParamActivityId } = useQueryParams<{ eventId?: number }>()

  const drawerOptions = {
    size: '800px',
    onClose: noop
  } as IDrawerProps
  const { showDrawer } = useDrawer({
    createDrawerContent: props => <ChangeEventCard activityId={props.id} />,
    drawerOptions,
    showConfirmationDuringClose: false
  })

  const monitoredServiceIdentifiers = useMemo(
    () => getMonitoredServiceIdentifiers(isAccountLevel, monitoredServiceDetails),
    [isAccountLevel, monitoredServiceDetails]
  )

  const changeEventListQueryParams = useMemo(() => {
    const monitoredServiceIdentifierProp = getMonitoredServiceIdentifierProp(
      isAccountLevel,
      !!isCompositeSLO,
      monitoredServiceIdentifiers,
      monitoredServiceIdentifier
    )
    return {
      ...monitoredServiceIdentifierProp,
      ...(!monitoredServiceIdentifier && serviceIdentifier
        ? { serviceIdentifiers: Array.isArray(serviceIdentifier) ? serviceIdentifier : [serviceIdentifier] }
        : {}),
      ...(!monitoredServiceIdentifier && environmentIdentifier
        ? { envIdentifiers: Array.isArray(environmentIdentifier) ? environmentIdentifier : [environmentIdentifier] }
        : {}),
      changeSourceTypes: defaultTo(changeSourceTypes, []),
      changeCategories: defaultTo(changeCategories, []),
      startTime,
      endTime,
      pageIndex: page,
      pageSize: defaultTo(recordsPerPage, PAGE_SIZE)
    }
  }, [
    endTime,
    recordsPerPage,
    monitoredServiceIdentifier,
    environmentIdentifier,
    serviceIdentifier,
    startTime,
    changeSourceTypes,
    changeCategories,
    page
  ])

  const { pageIndex: _, ...changeEventListQueryParamsExceptPage } = changeEventListQueryParams

  useDeepCompareEffect(() => {
    if (projectRef.current === projectIdentifier) {
      setPage(0)
    }
  }, [changeEventListQueryParamsExceptPage])

  const {
    data: accountLevelChangeEventListData,
    refetch: accountLevelChangeEventListRefetch,
    loading: accountLevelChangeEventListLoading,
    error: accountLevelChangeEventListError
  } = useChangeEventListForAccount({
    lazy: true,
    accountIdentifier: accountId,
    queryParams: changeEventListQueryParams,
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    }
  })

  const {
    data: projectLevelChangeEventListData,
    refetch: projectLevelChangeEventListRefetch,
    loading: projectLevelChangeEventListLoading,
    error: projectLevelChangeEventListError
  } = useChangeEventList({
    lazy: true,
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    queryParams: changeEventListQueryParams,
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    }
  })

  const { data, refetch, loading, error } = {
    data: isAccountLevel ? accountLevelChangeEventListData : projectLevelChangeEventListData,
    refetch: isAccountLevel ? accountLevelChangeEventListRefetch : projectLevelChangeEventListRefetch,
    loading: isAccountLevel ? accountLevelChangeEventListLoading : projectLevelChangeEventListLoading,
    error: isAccountLevel ? accountLevelChangeEventListError : projectLevelChangeEventListError
  }

  const { content = [], pageSize = 0, pageIndex = 0, totalPages = 0, totalItems = 0 } = data?.resource ?? {}

  const wrapperProps: ChangesTableContentWrapper = { isCardView, totalItems, dataTooltipId }

  useEffect(() => {
    if (queryParamActivityId) {
      showDrawer({ id: queryParamActivityId })
    }
  }, [])

  useEffect(() => {
    if (startTime && endTime && projectRef.current === projectIdentifier) {
      refetch({
        queryParams: changeEventListQueryParams,
        queryParamStringifyOptions: {
          arrayFormat: 'repeat'
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTime, endTime, page, changeEventListQueryParams])

  useEffect(() => {
    if (projectRef.current !== projectIdentifier && isChangesPage) {
      projectRef.current = projectIdentifier
      setPage(0)
      resetFilters?.()
    }
  }, [projectIdentifier])

  const columns: Column<any>[] = useMemo(
    () =>
      customCols || [
        {
          Header: getString('timeLabel'),
          Cell: RenderTime,
          accessor: 'eventTime',
          width: '15%'
        },
        {
          Header: getString('name'),
          Cell: RenderName,
          accessor: 'name',
          width: '30%'
        },
        {
          Header: getString('cv.monitoredServices.changesTable.impact'),
          Cell: RenderImpact,
          accessor: 'serviceIdentifier',
          width: '20%'
        },
        {
          Header: getString('source'),
          Cell: RenderType,
          accessor: 'type',
          width: '20%'
        },
        {
          Header: getString('typeLabel'),
          width: '15%',
          accessor: 'category',
          Cell: RenderChangeType
        }
      ],
    [customCols, content]
  )

  if (loading) {
    return (
      <ChangesTableWrapper {...wrapperProps}>
        <Container height="100%" flex={{ justifyContent: 'center' }}>
          <Icon name="steps-spinner" color={Color.GREY_400} size={30} />
        </Container>
      </ChangesTableWrapper>
    )
  }

  if (error) {
    return (
      <ChangesTableWrapper {...wrapperProps}>
        <PageError message={getErrorMessage(error)} onClick={() => refetch()} />
      </ChangesTableWrapper>
    )
  }

  if (!content.length) {
    return (
      <ChangesTableWrapper {...wrapperProps}>
        <NoDataCard
          image={noDataImage}
          containerClassName={css.noDataContainer}
          message={getString('cv.monitoredServices.noAvailableData')}
        />
      </ChangesTableWrapper>
    )
  }

  return (
    <ChangesTableWrapper {...wrapperProps}>
      <Layout.Vertical height="100%">
        <Container className={css.tableContainer}>
          <TableV2 sortable data={content} columns={columns} onRowClick={showDrawer} />
        </Container>
        <Container padding={{ left: 'medium', right: 'medium' }}>
          <Pagination
            pageSize={pageSize}
            pageIndex={pageIndex}
            pageCount={totalPages}
            itemCount={totalItems}
            gotoPage={setPage}
          />
        </Container>
      </Layout.Vertical>
    </ChangesTableWrapper>
  )
}
