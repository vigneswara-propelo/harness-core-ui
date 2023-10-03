/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { BaseSyntheticEvent, useMemo } from 'react'
import {
  ExpandingSearchInput,
  Layout,
  Text,
  Button,
  ButtonVariation,
  TableV2,
  Page,
  Card,
  Container,
  Icon,
  Select,
  SelectOption
} from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { Link, useParams } from 'react-router-dom'
import { capitalize, defaultTo, get, isEmpty, map } from 'lodash-es'
import { Column } from 'react-table'
import { Radio, RadioGroup } from '@blueprintjs/core'
import ReactTimeago from 'react-timeago'
import { useStrings } from 'framework/strings'
import {
  NGTriggerEventHistoryResponse,
  useTriggerEventHistoryBuildSourceType,
  useTriggerHistoryEventCorrelationV2
} from 'services/pipeline-ng'
import { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useDefaultPaginationProps } from '@common/hooks/useDefaultPaginationProps'
import { usePrevious } from '@common/hooks/usePrevious'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { ExecutionStatus } from '@pipeline/utils/statusHelpers'
import ExecutionStatusLabel from '@pipeline/components/ExecutionStatusLabel/ExecutionStatusLabel'
import routes from '@common/RouteDefinitions'
import { ArtifactTitleIdByType } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { ArtifactType } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import {
  PAGE_TEMPLATE_DEFAULT_PAGE_INDEX,
  PageQueryParams,
  PageQueryParamsWithDefaults,
  usePageQueryParamOptions
} from '@common/constants/Pagination'
import { TriggerType } from '@triggers/components/Triggers/TriggerInterface'
import {
  CellType,
  PayloadDrawer,
  RenderColumnEventId,
  RenderColumnPayload,
  artifactTriggerTypes,
  isWebhookTrigger
} from '../utils/TriggerActivityUtils'
import TriggerExplorerEmptyState from '../TriggerLandingPage/images/trigger_explorer_empty_state.svg'
import { TriggerExplorerHelpPanel } from '../TriggerExplorerHelpPanel/TriggerExplorerHelpPanel'
import css from './TriggerExplorer.module.scss'

const RenderColumnMessage: CellType = ({ row }) => {
  return (
    <Text color={Color.BLACK} lineClamp={1} width="90%" tooltipProps={{ isDark: true }}>
      {row.original.message}
    </Text>
  )
}

const RenderColumnStatus: CellType = ({ row }) => {
  const data = row.original.triggerEventStatus
  const { status, message } = defaultTo(data, {})
  return (
    <Layout.Vertical flex={{ alignItems: 'flex-start' }}>
      <ExecutionStatusLabel status={capitalize(status) as ExecutionStatus} />
      <div className={css.statusMessage}>
        <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_500} lineClamp={1}>
          {message}
        </Text>
      </div>
    </Layout.Vertical>
  )
}

const RenderTrigger: CellType = ({ row }) => {
  const { accountId } = useParams<AccountPathProps>()
  const { orgIdentifier = '', projectIdentifier = '', targetIdentifier = '', triggerIdentifier = '' } = row.original
  return (
    <Layout.Horizontal>
      <Link
        to={routes.toTriggersActivityHistoryPage({
          accountId,
          orgIdentifier: orgIdentifier,
          projectIdentifier: projectIdentifier,
          pipelineIdentifier: targetIdentifier,
          triggerIdentifier: triggerIdentifier
        })}
        target="_blank"
      >
        <Text
          font={{ variation: FontVariation.LEAD }}
          color={Color.PRIMARY_7}
          tooltipProps={{ isDark: true }}
          lineClamp={1}
        >
          {triggerIdentifier}
        </Text>
      </Link>
    </Layout.Horizontal>
  )
}

const TriggerExplorer: React.FC = (): React.ReactElement => {
  const [searchId, setSearchId] = React.useState('')
  const { getRBACErrorMessage } = useRBACError()
  const previousSearchId = usePrevious(searchId)
  const { getString } = useStrings()
  const [showPayload, setShowPayload] = React.useState<boolean>(true)
  const [selectedPayloadRow, setSelectedPayloadRow] = React.useState<string | undefined>()
  const [triggerType, setTriggerType] = React.useState<TriggerType>('Webhook')
  const [showHelpPanel, setShowHelpPanel] = React.useState<boolean>(true)
  const [selectedArtifactTriggerTypeOption, setSelectedArtifactTriggerTypeOption] = React.useState<SelectOption>()
  const { accountId } = useParams<AccountPathProps>()
  const {
    data: webhookTriggerData,
    loading: webhookTriggerLoading,
    refetch: refetchWebhookTrigger,
    error: webhookTriggerError
  } = useTriggerHistoryEventCorrelationV2({
    eventCorrelationId: searchId,
    queryParams: {
      accountIdentifier: accountId
    },
    lazy: true
  })
  const {
    content: webhookTriggerContent,
    totalElements: webhookTriggerTotalElements,
    totalPages: webhookTriggerTotalPages,
    pageable: webhookTriggerPageable
  } = defaultTo(webhookTriggerData?.data, {})

  const webhookTriggerPaginationProps = useDefaultPaginationProps({
    itemCount: defaultTo(webhookTriggerTotalElements, 0),
    pageSize: 10,
    pageCount: defaultTo(webhookTriggerTotalPages, -1),
    pageIndex: get(webhookTriggerPageable, 'pageNumber', 0)
  })

  const { updateQueryParams } = useUpdateQueryParams<Partial<PageQueryParams>>()
  const queryParamOptions = usePageQueryParamOptions()
  const queryParams = useQueryParams<PageQueryParamsWithDefaults>(queryParamOptions)
  const { page, size } = queryParams
  const artifactTriggerQueryParams = {
    accountIdentifier: accountId,
    size: size,
    page: page ? page - 1 : 0,
    artifactType: selectedArtifactTriggerTypeOption?.value as string
  }
  const {
    data: artifactTriggerData,
    loading: artifactTriggerLoading,
    refetch: refetchArtifactTrigger,
    error: artifactTriggerError
  } = useTriggerEventHistoryBuildSourceType({
    queryParams: {
      ...artifactTriggerQueryParams
    },
    lazy: true
  })

  const {
    content: artifactTriggerContent,
    totalElements: artifactTriggerTotalElements,
    size: artifactTriggerSize,
    totalPages: artifactTriggerTotalPages,
    pageable: artifactTriggerPageable
  } = defaultTo(artifactTriggerData?.data, {})

  const handlePageIndexChange = /* istanbul ignore next */ (index: number): void =>
    updateQueryParams({ page: index + 1 })

  const paginationProps = useDefaultPaginationProps({
    itemCount: defaultTo(artifactTriggerTotalElements, 0),
    pageSize: defaultTo(artifactTriggerSize, 0),
    pageCount: defaultTo(artifactTriggerTotalPages, 0),
    pageIndex: defaultTo(artifactTriggerPageable?.pageNumber, 0),
    gotoPage: handlePageIndexChange,
    onPageSizeChange: newSize => updateQueryParams({ page: PAGE_TEMPLATE_DEFAULT_PAGE_INDEX, size: newSize })
  })

  React.useEffect(() => {
    if ((isWebhookTrigger(triggerType) && webhookTriggerContent) || artifactTriggerContent) {
      setShowHelpPanel(false)
    } else {
      setShowHelpPanel(true)
    }
  }, [artifactTriggerContent, triggerType, webhookTriggerContent])

  React.useEffect(() => {
    if (selectedArtifactTriggerTypeOption) {
      refetchArtifactTrigger({
        queryParams: {
          ...artifactTriggerQueryParams
        }
      })
    }
  }, [selectedArtifactTriggerTypeOption, page, size])

  const columns: Column<NGTriggerEventHistoryResponse>[] = useMemo(() => {
    const cols = [
      {
        Header: getString('triggers.activityHistory.eventCorrelationId'),
        id: 'eventCorrelationId',
        width: '22%',
        Cell: RenderColumnEventId
      },
      {
        Header: getString('common.triggerLabel'),
        id: 'name',
        width: '20%',
        Cell: RenderTrigger
      },
      {
        Header: getString('triggers.activityHistory.triggerStatus'),
        id: 'status',
        width: '18%',
        Cell: RenderColumnStatus
      },
      {
        Header: getString('message'),
        id: 'message',
        width: '35%',
        Cell: RenderColumnMessage
      },
      {
        Header: getString('common.payload'),
        width: '5%',
        id: 'payload',
        Cell: RenderColumnPayload,
        setShowPayload,
        setSelectedPayloadRow
      }
    ] as unknown as Column<NGTriggerEventHistoryResponse>[]

    if (!isWebhookTrigger(triggerType)) {
      cols.splice(
        0,
        1,
        {
          Header: getString('pipeline.artifactsSelection.artifactType'),
          id: 'artifactType',
          width: '14%',
          Cell: (
            <Text color={Color.BLACK} lineClamp={1} width="90%">
              {selectedArtifactTriggerTypeOption?.label}
            </Text>
          )
        },
        {
          Header: getString('timeLabel'),
          id: 'time',
          width: '11%',
          Cell: ({ row }: { row: { original: NGTriggerEventHistoryResponse } }) => {
            return (
              <Text color={Color.BLACK} lineClamp={1} width="90%">
                <ReactTimeago date={get(row.original, 'eventCreatedAt') as number} />
              </Text>
            )
          }
        }
      )
    }
    return cols
  }, [getString, triggerType, selectedArtifactTriggerTypeOption?.label])

  return (
    <Layout.Vertical padding={'xlarge'}>
      <Layout.Horizontal flex={{ justifyContent: 'flex-start' }}>
        <Text font={{ weight: 'semi-bold', variation: FontVariation.BODY }}>
          {getString('triggers.triggerExplorer.pageSubHeading')}
        </Text>
        <Button onClick={() => setShowHelpPanel(!showHelpPanel)} intent="none" minimal data-testid="panel">
          {showHelpPanel
            ? getString('triggers.triggerExplorer.hidePanel')
            : getString('triggers.triggerExplorer.showPanel')}
        </Button>
      </Layout.Horizontal>
      <Container padding={{ top: 'medium', bottom: 'medium' }}>
        {showHelpPanel && (
          <Card className={css.helpPanel} data-testid="helpPanelCard">
            <Layout.Horizontal>
              <Icon name="info-message" size={24} className={css.infoMessage} padding={{ right: 'xsmall' }} />
              <Text font={{ weight: 'semi-bold', variation: FontVariation.H5 }}>
                {getString('triggers.triggerExplorer.tabName')}
              </Text>
            </Layout.Horizontal>
            <TriggerExplorerHelpPanel triggerType={triggerType} />
          </Card>
        )}
      </Container>
      <Layout.Vertical border={{ radius: 8, color: Color.GREY_100 }} background={Color.WHITE} padding={'large'}>
        <Text font={{ weight: 'semi-bold', variation: FontVariation.H5 }} padding={{ bottom: 'medium' }}>
          {isWebhookTrigger(triggerType) && getString('triggers.triggerExplorer.searchWebhookTriggers')}
        </Text>
        <RadioGroup
          inline
          selectedValue={triggerType}
          onChange={(e: BaseSyntheticEvent) => {
            setTriggerType(e.target.value)
          }}
          label={getString('triggers.triggerExplorer.selectTriggerType')}
        >
          <Radio value={'Webhook'} label={getString('execution.triggerType.WEBHOOK')} />
          <Radio value={'Artifact'} label={getString('pipeline.artifactTriggerConfigPanel.artifact')} />
        </RadioGroup>
        <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} spacing={'medium'}>
          {isWebhookTrigger(triggerType) ? (
            <>
              <Text font={{ weight: 'semi-bold', variation: FontVariation.H6 }}>
                {getString('triggers.triggerExplorer.searchWebhookTriggerLabel')}
              </Text>
              <ExpandingSearchInput
                alwaysExpanded
                width={300}
                name="eventCorrelationIdSearch"
                placeholder={getString('triggers.triggerExplorer.searchPlaceholder')}
                onChange={text => {
                  setSearchId(text.trim())
                }}
                throttle={200}
              />
              <Button
                small
                variation={ButtonVariation.PRIMARY}
                data-testid="searchBasedOnEventCorrelationId"
                text={getString('search')}
                onClick={() => {
                  if (previousSearchId !== searchId) {
                    refetchWebhookTrigger()
                  }
                }}
                disabled={isEmpty(searchId)}
              />
            </>
          ) : (
            <Layout.Vertical>
              <Text padding={{ bottom: 'xlarge' }} font={{ weight: 'semi-bold', variation: FontVariation.H6 }}>
                {getString('triggers.triggerExplorer.searchArtifactTriggers')}
              </Text>
              <Layout.Horizontal>
                <Text font={{ weight: 'semi-bold', variation: FontVariation.H6 }} width={150}>
                  {getString('triggers.triggerExplorer.selectArtifactType')}
                </Text>
                <Select
                  name="artifactTriggerType"
                  items={map(artifactTriggerTypes, artifact => ({
                    label:
                      artifact === 'HelmChart'
                        ? getString('common.HelmChartLabel')
                        : getString(ArtifactTitleIdByType[artifact as ArtifactType]),
                    value: artifact as string
                  }))}
                  onChange={item => {
                    setSelectedArtifactTriggerTypeOption(item)
                    updateQueryParams({ page: PAGE_TEMPLATE_DEFAULT_PAGE_INDEX, size: artifactTriggerSize })
                  }}
                  value={selectedArtifactTriggerTypeOption}
                  className={css.selectArtifact}
                />
              </Layout.Horizontal>
            </Layout.Vertical>
          )}
        </Layout.Horizontal>
      </Layout.Vertical>

      {isWebhookTrigger(triggerType) ? (
        <Page.Body
          loading={webhookTriggerLoading}
          error={webhookTriggerError ? getRBACErrorMessage(webhookTriggerError) : ''}
          retryOnError={() => refetchWebhookTrigger()}
          noData={{
            when: () => Array.isArray(webhookTriggerContent) && isEmpty(webhookTriggerContent),
            image: TriggerExplorerEmptyState,
            messageTitle: getString('triggers.triggerExplorer.emptyStateMessage')
          }}
          className={css.pageBody}
        >
          {!isEmpty(webhookTriggerContent) && searchId && (
            <TableV2<NGTriggerEventHistoryResponse>
              className={css.table}
              columns={columns}
              data={webhookTriggerContent as NGTriggerEventHistoryResponse[]}
              name="TriggerExplorerView"
              pagination={webhookTriggerPaginationProps}
            />
          )}
        </Page.Body>
      ) : (
        <Page.Body
          loading={artifactTriggerLoading}
          error={artifactTriggerError ? getRBACErrorMessage(artifactTriggerError) : ''}
          retryOnError={() => refetchArtifactTrigger()}
          noData={{
            when: () => Array.isArray(artifactTriggerContent) && isEmpty(artifactTriggerContent),
            image: TriggerExplorerEmptyState,
            messageTitle: getString('triggers.noTriggersFound')
          }}
          className={css.pageBody}
        >
          {selectedArtifactTriggerTypeOption && !isEmpty(artifactTriggerContent) && (
            <TableV2<NGTriggerEventHistoryResponse>
              className={css.table}
              columns={columns}
              data={artifactTriggerContent as NGTriggerEventHistoryResponse[]}
              name="TriggerExplorerView"
              pagination={paginationProps}
            />
          )}
        </Page.Body>
      )}
      {showPayload && selectedPayloadRow && (
        <PayloadDrawer
          onClose={() => setShowPayload(false)}
          selectedPayloadRow={selectedPayloadRow}
          selectedTriggerType={triggerType}
        />
      )}
    </Layout.Vertical>
  )
}

export default TriggerExplorer
