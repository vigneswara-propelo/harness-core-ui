/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import {
  Page,
  Heading,
  HarnessDocTooltip,
  Pagination,
  getErrorInfoFromErrorObject,
  Layout,
  Text,
  Container,
  DateRangePickerButton,
  DropDown,
  ExpandingSearchInput,
  MultiSelectDropDown,
  Icon
} from '@harness/uicore'
import type { MultiSelectOption, SelectOption } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import { useListGitxWebhookEventsQuery, useListGitxWebhooksQuery } from '@harnessio/react-ng-manager-client'
import { defaultTo, flatten, has, isEmpty, uniqBy } from 'lodash-es'
import { DateRange } from '@blueprintjs/datetime'
import { useStrings } from 'framework/strings'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { AccountPathProps, ModulePathParams } from '@common/interfaces/RouteInterfaces'
import { PAGE_TEMPLATE_DEFAULT_PAGE_INDEX } from '@common/constants/Pagination'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { useDefaultPaginationProps } from '@common/hooks/useDefaultPaginationProps'
import EmptyContentImg from '@common/images/EmptySearchResults.svg'
import { WebhookEventsQueryParams, useWebhookEventsQueryParamOptions } from '@pipeline/pages/utils/requestUtils'
import { DEFAULT_PAGE_INDEX } from '@modules/70-pipeline/utils/constants'
import WebhooksEventsList from './WebhooksEventsList'
import { STATUS, WebhookEventStatus, WebhookTabIds, getStatusList, stringsMap } from '../utils'
import NoData from '../NoData'
import WebhooksTabs from '../WebhooksTabs'
import css from '../Webhooks.module.scss'

export default function WebhookEvents(): JSX.Element {
  const { getString } = useStrings()
  const { module } = useParams<AccountPathProps & ModulePathParams>()
  const { updateQueryParams } = useUpdateQueryParams<WebhookEventsQueryParams>()
  const queryParamOptions = useWebhookEventsQueryParamOptions()
  const { page, size, dateFilter, webhookIdentifier, eventId, eventStatus } = useQueryParams(queryParamOptions)

  const start = new Date()
  start.setDate(start.getDate() - 7)
  start.setHours(0, 0, 0, 0)

  const end = new Date()
  end.setHours(23, 59, 59, 999)

  const { data: webhooksResponse, isInitialLoading: loadingWebhooksResponse } = useListGitxWebhooksQuery({
    queryParams: {
      limit: size,
      page: page ? page - 1 : 0
    }
  })
  const {
    data,
    isInitialLoading: loading,
    isFetching: _loading,
    error,
    refetch
  } = useListGitxWebhookEventsQuery({
    queryParams: {
      limit: size,
      page: page ? page - 1 : 0,
      webhook_identifier: webhookIdentifier,
      event_start_time: dateFilter.startTime,
      event_end_time: dateFilter.endTime,
      event_identifier: eventId,
      event_status: eventStatus
    },
    stringifyQueryParamsOptions: {
      arrayFormat: 'repeat'
    }
  })

  const isLoading = loading || _loading

  const state = useMemo<STATUS>(() => {
    if (error) {
      return STATUS.error
    } else if (isLoading) {
      return STATUS.loading
    }

    return STATUS.ok
  }, [error, isLoading])

  const handlePageIndexChange = /* istanbul ignore next */ (index: number): void =>
    updateQueryParams({ page: index + 1 })

  const paginationProps = useDefaultPaginationProps({
    itemCount: defaultTo(data?.pagination?.total, 0),
    pageSize: defaultTo(data?.pagination?.pageSize, 0),
    pageCount: defaultTo(data?.pagination?.pageCount, 0),
    pageIndex: defaultTo(data?.pagination?.pageNumber, 0),
    gotoPage: handlePageIndexChange,
    onPageSizeChange: newSize => updateQueryParams({ page: PAGE_TEMPLATE_DEFAULT_PAGE_INDEX, size: newSize })
  })
  const onDateChange = (selectedDates: [Date, Date]): void => {
    updateQueryParams({
      page: 0,
      dateFilter: {
        startTime: selectedDates[0].getTime(),
        endTime: selectedDates[1].getTime()
      }
    })
  }
  const onSearchChange = (eventIdentifier: string): void => {
    updateQueryParams({
      page: DEFAULT_PAGE_INDEX,
      eventId: eventIdentifier
    })
  }
  const getShowWebhooksDropdownList = (): SelectOption[] => {
    const webhooksList: SelectOption[] = []
    webhooksResponse?.content.forEach(webhook => {
      webhooksList.push({ label: webhook.webhook_name as string, value: webhook.webhook_identifier as string })
    })
    return webhooksList
  }

  const response = data
  const hasData = Boolean(!isLoading && response && !isEmpty(response.content))
  const noData = Boolean(!isLoading && response && isEmpty(response.content))
  const dateRange: DateRange = [new Date(Number(dateFilter.startTime)), new Date(Number(dateFilter.endTime))]
  const isLast7Days = dateRange[0]?.getTime() === start.getTime() && dateRange[1]?.getTime() === end.getTime()
  const actualValue = React.useMemo(
    () =>
      uniqBy(
        flatten(defaultTo(eventStatus, []))
          .filter(val => has(stringsMap, val))
          .map((val): MultiSelectOption => {
            const key = stringsMap[val as WebhookEventStatus]

            return { label: getString(key), value: val }
          }),
        row => row.label
      ),
    [getString, eventStatus]
  )

  return (
    <main className={css.layout}>
      <Page.Header
        title={
          <Heading level={3} font={{ variation: FontVariation.H4 }} data-tooltip-id={'ff_webhook_events_heading'}>
            {getString('common.webhooks')}
            <HarnessDocTooltip tooltipId={'ff_webhook_events_heading'} useStandAlone />
          </Heading>
        }
        breadcrumbs={<NGBreadcrumbs customPathParams={{ module }} />}
        className={css.header}
      />
      <Page.SubHeader className={css.subHeader}>
        <WebhooksTabs defaultTabId={WebhookTabIds.EventsTab} />
      </Page.SubHeader>
      <Page.SubHeader className={css.toolbar}>
        <Layout.Horizontal>
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
          <DropDown
            className={css.webhookIdentifierFilter}
            items={getShowWebhooksDropdownList()}
            filterable={false}
            addClearBtn={true}
            placeholder={` ${getString('common.webhooks')}: ${getString('all')} `}
            disabled={loadingWebhooksResponse}
            value={webhookIdentifier}
            width={170}
            onChange={selected => {
              updateQueryParams({
                page: 0,
                webhookIdentifier: selected.value ? (selected.value as any) : undefined
              })
            }}
          />
          <MultiSelectDropDown
            width={120}
            buttonTestId="status-select"
            value={actualValue}
            onChange={option => {
              updateQueryParams({
                eventStatus: (option.flatMap(item => item.value) as WebhookEventStatus[]) || null
              })
            }}
            items={getStatusList(getString)}
            usePortal={true}
            placeholder={getString('status')}
          />
        </Layout.Horizontal>
        <Layout.Horizontal>
          <ExpandingSearchInput
            throttle={300}
            alwaysExpanded
            onChange={onSearchChange}
            placeholder={getString('pipeline.webhooks.searchEventId')}
          />
        </Layout.Horizontal>
      </Page.SubHeader>
      <div className={css.content}>
        {state === STATUS.error && (
          <Page.Error message={getErrorInfoFromErrorObject(defaultTo(error, {}) as any)} onClick={refetch as any} />
        )}
        {state === STATUS.ok && !noData && (
          <Layout.Horizontal
            flex={{ justifyContent: 'space-between' }}
            padding={{ top: 'large', right: 'xlarge', left: 'xlarge' }}
          >
            <Text color={Color.GREY_800} iconProps={{ size: 14 }}>
              {getString('total')}: {data?.pagination?.total}
            </Text>
            <span className={css.reload}>
              <Icon name="command-rollback" onClick={() => refetch()} />
            </span>
          </Layout.Horizontal>
        )}
        {state === STATUS.ok ? (
          <>
            {noData && (
              <NoData
                hasFilters={false}
                emptyContent={
                  <>
                    <img src={EmptyContentImg} width={300} height={150} />
                    <Heading level={2} padding={{ top: 'xxlarge' }} margin={{ bottom: 'large' }}>
                      {getString('auditTrail.emptyStateMessage')}
                    </Heading>
                  </>
                }
              />
            )}
            {hasData ? (
              <Container padding={{ top: 'medium', right: 'xlarge', left: 'xlarge' }}>
                <WebhooksEventsList response={response} />
              </Container>
            ) : null}
          </>
        ) : null}
      </div>
      {state === STATUS.ok && (
        <div className={css.footer}>
          <Pagination {...paginationProps} />
        </div>
      )}

      {state === STATUS.loading && !error && (
        <div className={css.loading}>
          <ContainerSpinner />
        </div>
      )}
    </main>
  )
}
