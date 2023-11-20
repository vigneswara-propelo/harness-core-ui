/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { Drawer } from '@blueprintjs/core'
import {
  Container,
  DateRangePickerButton,
  ExpandingSearchInput,
  Heading,
  Icon,
  Layout,
  Page,
  Pagination,
  TableV2,
  Text,
  getErrorInfoFromErrorObject,
  useToaster
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { GitXWebhookEventResponse, useListGitxWebhookEventsRefQuery } from '@harnessio/react-ng-manager-client'
import { defaultTo, isEmpty } from 'lodash-es'
import { DateRange } from '@blueprintjs/datetime'
import { useParams } from 'react-router-dom'
import EmptyContentImg from '@common/images/EmptySearchResults.svg'
import { drawerStates } from '@audit-trail/components/EventSummary/EventSummary'
import { useStrings } from 'framework/strings'
import YamlBuilder from '@common/components/YAMLBuilder/YamlBuilder'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { useDefaultPaginationProps } from '@common/hooks/useDefaultPaginationProps'
import { PAGE_TEMPLATE_DEFAULT_PAGE_INDEX } from '@common/constants/Pagination'
import { EventsDateFilter } from '@pipeline/pages/utils/requestUtils'
import { ProjectPathProps } from '@modules/10-common/interfaces/RouteInterfaces'
import { ColumnTimeStamp, ColumnUser, EventId, withWebhookEvents } from '../WebhookEvents/WebhooksEventsListColumns'
import { CustomColumn } from '../WebhookEvents/WebhooksEventsList'
import css from './WebhookSyncDrawer.module.scss'

interface WebhookSyncDrawerInterface {
  onClose: () => void
  repoName: string
  filePath: string
}

function WebhooksPayloadDetails({
  payload,
  onClick
}: {
  payload: string
  onClick: (payload: string) => void
}): JSX.Element {
  return (
    <Icon
      name="main-chevron-right"
      className={css.payloadBtn}
      onClick={() => onClick(payload)}
      color={Color.PRIMARY_8}
    />
  )
}

function getDefaultDateState(): EventsDateFilter {
  const start = new Date()
  start.setDate(start.getDate() - 7)
  start.setHours(0, 0, 0, 0)
  const end = new Date()
  end.setHours(23, 59, 59, 999)
  return {
    startTime: start.getTime(),
    endTime: end.getTime()
  }
}

interface PaginationStateInterface {
  size: number
  index: number
}

export default function WebhookSyncDrawer(props: WebhookSyncDrawerInterface): JSX.Element {
  const { onClose, repoName, filePath } = props
  const { orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [payload, setPayload] = React.useState<string>('')
  const [dateFilter, setDateFilter] = React.useState<EventsDateFilter>(() => getDefaultDateState())
  const [search, setSearch] = React.useState<string>('')
  const [selectedRow, setSelectedRow] = React.useState<GitXWebhookEventResponse>()
  const [paginationState, setPaginationState] = React.useState<PaginationStateInterface>({
    size: 20,
    index: 0
  })
  const { showError } = useToaster()
  const { getString } = useStrings()
  const {
    data,
    isInitialLoading: loading,
    refetch,
    error
  } = useListGitxWebhookEventsRefQuery({
    queryParams: {
      limit: paginationState.size,
      page: paginationState.index,
      repo_name: repoName,
      file_path: filePath,
      event_start_time: dateFilter.startTime,
      event_end_time: dateFilter.endTime,
      event_identifier: search
    },
    pathParams: {
      org: orgIdentifier,
      project: projectIdentifier
    }
  })
  const { startTime, endTime } = getDefaultDateState()
  const dateRange: DateRange = [new Date(Number(dateFilter.startTime)), new Date(Number(dateFilter.endTime))]
  const isLast7Days = dateRange[0]?.getTime() === startTime && dateRange[1]?.getTime() === endTime
  const hasData = Boolean(!loading && data && !isEmpty(data.content))
  const webhookIdentifier = data?.content?.[0]?.webhook_identifier

  function handlePayloadDetailsClick(selectedPayload: string): void {
    setPayload(selectedPayload)
  }

  const syncDrawerColumns: CustomColumn<GitXWebhookEventResponse>[] = useMemo(
    () => [
      {
        Header: getString('pipeline.webhookEvents.dateTime').toUpperCase(),
        id: 'dateTime',
        width: '20%',
        Cell: withWebhookEvents(ColumnTimeStamp)
      },
      {
        Header: getString('pipeline.webhookEvents.author').toUpperCase(),
        id: 'pusher',
        width: '35%',
        Cell: withWebhookEvents(ColumnUser)
      },
      {
        Header: getString('pipeline.webhookEvents.eventId').toUpperCase(),
        id: 'eventId',
        width: '35%',
        Cell: withWebhookEvents(EventId)
      },
      {
        Header: '',
        id: 'payloadDetails',
        width: '10%',
        Cell: withWebhookEvents(WebhooksPayloadDetails),
        actions: {
          onClick: handlePayloadDetailsClick
        }
      }
    ],
    [getString]
  )

  const parsedPayload = React.useMemo(() => {
    let _parsedPaylod
    try {
      _parsedPaylod = JSON.parse(payload)
    } catch (e) {
      // if the parsing fails show toaster and render empty payload in the YAML builder
      showError(e)
      _parsedPaylod = {}
    }
    return _parsedPaylod
  }, [payload, showError])

  const onDateChange = (selectedDates: [Date, Date]): void => {
    setDateFilter({
      startTime: selectedDates[0].getTime(),
      endTime: selectedDates[1].getTime()
    })
  }
  const handlePageIndexChange = /* istanbul ignore next */ (index: number): void => {
    setPaginationState(prevPaginationState => {
      return { ...prevPaginationState, index: index }
    })
  }

  const paginationProps = useDefaultPaginationProps({
    itemCount: defaultTo(data?.pagination?.total, 0),
    pageSize: defaultTo(data?.pagination?.pageSize, 0),
    pageCount: defaultTo(data?.pagination?.pageCount, 0),
    pageIndex: defaultTo(data?.pagination?.pageNumber, 0),
    gotoPage: handlePageIndexChange,
    onPageSizeChange: newSize => {
      setPaginationState({ index: PAGE_TEMPLATE_DEFAULT_PAGE_INDEX, size: newSize })
    }
  })

  return (
    <Drawer className={css.drawer} {...drawerStates} onClose={onClose} isCloseButtonShown>
      <Layout.Horizontal height="100%">
        <Layout.Vertical width={700} padding="xlarge">
          <Text font={{ variation: FontVariation.H4 }} margin={{ bottom: 'medium' }}>
            {getString('pipeline.webhookEvents.events')}
          </Text>
          {error ? (
            <Page.Error message={getErrorInfoFromErrorObject(defaultTo(error, {}))} onClick={() => refetch()} />
          ) : (
            <>
              <>
                <Layout.Horizontal margin={{ bottom: 'medium' }}>
                  <Text
                    icon="repository"
                    iconProps={{ size: 14, padding: { right: 'small' } }}
                    margin={{ right: 'medium' }}
                    padding={{ right: 'medium' }}
                    border={{ right: true, width: 1, color: Color.GREY_200 }}
                  >
                    {repoName}
                  </Text>
                  {webhookIdentifier && (
                    <Text icon="code-webhook" iconProps={{ size: 16, padding: { right: 'small' } }}>
                      {webhookIdentifier}
                    </Text>
                  )}
                </Layout.Horizontal>
                <Layout.Horizontal margin={{ bottom: 'medium' }}>
                  <DateRangePickerButton
                    className={css.dateRange}
                    initialButtonText={
                      isLast7Days
                        ? getString('common.last7days')
                        : `${dateRange[0]?.toLocaleDateString()} - ${dateRange[1]?.toLocaleDateString()}`
                    }
                    dateRangePickerProps={{
                      defaultValue: dateRange
                    }}
                    onChange={onDateChange}
                    renderButtonText={selectedDates =>
                      `${selectedDates[0].toLocaleDateString()} - ${selectedDates[1].toLocaleDateString()}`
                    }
                  />
                  <ExpandingSearchInput
                    throttle={300}
                    alwaysExpanded
                    onChange={setSearch}
                    placeholder={getString('pipeline.webhooks.searchEventId')}
                    defaultValue={search}
                    width={300}
                  />
                </Layout.Horizontal>
                {loading ? (
                  <ContainerSpinner flex={{ align: 'center-center' }} />
                ) : hasData ? (
                  <>
                    <TableV2<GitXWebhookEventResponse>
                      columns={syncDrawerColumns}
                      data={data?.content as GitXWebhookEventResponse[]}
                      className={css.table}
                      getRowClassName={row => (row.original === selectedRow ? css.rowSelected : '')}
                      onRowClick={row => {
                        setSelectedRow(row)
                        handlePayloadDetailsClick(defaultTo(row.payload, ''))
                      }}
                    />
                    <div className={css.footer}>
                      <Pagination {...paginationProps} hidePageNumbers />
                    </div>
                  </>
                ) : (
                  <Container
                    flex={{ align: 'center-center' }}
                    border={{ width: 1, color: Color.GREY_500 }}
                    height={'100%'}
                  >
                    <Layout.Vertical flex={{ alignItems: 'center' }}>
                      <img src={EmptyContentImg} width={300} height={150} />
                      <Heading level={2} padding={{ top: 'xxlarge' }} margin={{ bottom: 'large' }}>
                        {getString('pipeline.webhookEvents.noEvents')}
                      </Heading>
                    </Layout.Vertical>
                  </Container>
                )}
              </>
            </>
          )}
        </Layout.Vertical>
        <Layout.Vertical padding={'xxlarge'} width={613}>
          <Text font={{ variation: FontVariation.H5 }} padding={{ bottom: 'large' }}>
            {getString('pipeline.webhookEvents.payloadDetails')}
          </Text>
          {!isEmpty(payload) ? (
            <YamlBuilder
              fileName={getString('pipeline.webhookEvents.payloadDetails')}
              isReadOnlyMode={true}
              isEditModeSupported={false}
              hideErrorMesageOnReadOnlyMode={true}
              existingJSON={parsedPayload}
              showCopyIcon={false}
              width={548}
              height={'calc(100vh - 158px'}
              customCss={css.builder}
            />
          ) : (
            <Container flex={{ align: 'center-center' }} border={{ width: 1, color: Color.GREY_500 }} height={'100%'}>
              <Layout.Vertical flex={{ alignItems: 'center' }}>
                <img src={EmptyContentImg} width={300} height={150} />
                <Heading level={2} padding={{ top: 'xxlarge' }} margin={{ bottom: 'large' }}>
                  {getString('pipeline.webhookEvents.selectEventPayload')}
                </Heading>
              </Layout.Vertical>
            </Container>
          )}
        </Layout.Vertical>
      </Layout.Horizontal>
    </Drawer>
  )
}
