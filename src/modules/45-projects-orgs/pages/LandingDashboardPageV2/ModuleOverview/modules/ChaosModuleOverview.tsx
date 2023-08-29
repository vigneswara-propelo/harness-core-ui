/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { defaultTo } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { Color } from '@harness/design-system'
import { Container, Icon } from '@harness/uicore'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import { numberFormatter } from '@common/utils/utils'
import { getGroupByFromTimeRange } from '@projects-orgs/utils/utils'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { getGMTEndDateTime, getGMTStartDateTime } from '@common/utils/momentUtils'
import { getDateLabelToDisplayText } from '@common/components/TimeRangePicker/TimeRangePicker'
import { GetChaosExperimentStatsQueryParams, useGetChaosExperimentStats } from 'services/chaos'
import ErrorCard from '../../ErrorCard/ErrorCard'
import DefaultFooter from '../EmptyState/DefaultFooter'
import ModuleColumnChart from '../../ModuleColumnChart/ModuleColumnChart'
import type { ModuleOverviewBaseProps } from '../Grid/ModuleOverviewGrid'
import EmptyStateExpandedView from '../EmptyState/EmptyStateExpandedView'
import EmptyStateCollapsedView from '../EmptyState/EmptyStateCollapsedView'

const ChaosModuleOverview: React.FC<ModuleOverviewBaseProps> = ({ isExpanded, isEmptyState, timeRange }) => {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()

  const { data, loading, error, refetch } = useGetChaosExperimentStats({
    queryParams: {
      accountIdentifier: accountId,
      startTime: getGMTStartDateTime(timeRange?.from),
      endTime: getGMTEndDateTime(timeRange?.to),
      groupBy: getGroupByFromTimeRange(timeRange) as GetChaosExperimentStatsQueryParams['groupBy']
    }
  })

  const stats = data?.data

  const experimentRunStats = useMemo(() => {
    const successData: number[] = []
    const failureData: number[] = []

    stats?.experimentRunStats?.map(dailyStat => {
      successData.push(defaultTo(dailyStat.success, 0))
      failureData.push(defaultTo(dailyStat.failed, 0))
    })
    const successCount = successData.reduce((sum, i) => sum + i, 0)
    const failureCount = failureData.reduce((sum, i) => sum + i, 0)
    const successArr = {
      name: `Success (${successCount})`,
      data: successData,
      color: '#5FB34E'
    }
    const failureArr = {
      name: `Failed (${failureCount})`,
      data: failureData,
      color: '#EE5F54'
    }
    return [successArr, failureArr]
  }, [stats?.experimentRunStats])

  if (isEmptyState) {
    if (isExpanded) {
      return (
        <EmptyStateExpandedView
          title={'common.moduleDetails.chaos.expanded.title'}
          description={[
            'common.moduleDetails.chaos.expanded.list.one',
            'common.moduleDetails.chaos.expanded.list.two',
            'common.moduleDetails.chaos.expanded.list.three'
          ]}
          footer={
            <DefaultFooter
              learnMoreLink="https://docs.harness.io/category/zgffarnh1m-ci-category"
              getStartedLink={routes.toChaos({ accountId })}
            />
          }
        />
      )
    }

    return <EmptyStateCollapsedView description={'common.moduleDetails.chaos.collapsed.title'} />
  }

  if (loading) {
    return (
      <Container flex={{ justifyContent: 'center' }} height="100%">
        <Icon name="spinner" size={24} color={Color.PRIMARY_7} />
      </Container>
    )
  }

  if (error) {
    return (
      <ErrorCard
        onRetry={() => {
          refetch()
        }}
      />
    )
  }

  return (
    <ModuleColumnChart
      count={numberFormatter(stats?.totalExperimentRuns) || '0'}
      countChangeInfo={{
        countChange: stats?.totalExperimentChange
      }}
      timeRange={stats?.experimentRunStats?.map(dailyStat => dailyStat.time || 0)}
      data={experimentRunStats || []}
      isExpanded={isExpanded}
      timeRangeLabel={
        timeRange.type
          ? getString('common.moduleDetails.chaos.overviewStatsGraphXAxis', {
              value: getDateLabelToDisplayText(getString)[timeRange.type]
            }).toUpperCase()
          : undefined
      }
      yAxisLabel={getString('common.moduleDetails.chaos.overviewStatsGraphYAxis')}
    />
  )
}

export default ChaosModuleOverview
