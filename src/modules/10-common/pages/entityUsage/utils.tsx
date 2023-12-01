/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React, { useMemo } from 'react'
import { CellProps, Renderer } from 'react-table'
import { Link, useParams } from 'react-router-dom'
import { MultiSelectOption, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { defaultTo, isEmpty } from 'lodash-es'
import { ExecutionPathProps, ProjectPathProps, SecretsPathProps } from '@common/interfaces/RouteInterfaces'
import { Activity, ListActivitiesQueryParams } from 'services/cd-ng'
import { StringKeys } from 'framework/strings'
import { COMMON_PAGE_SIZE_OPTIONS } from '@modules/10-common/constants/Pagination'
import { getWindowLocationUrl } from 'framework/utils/WindowLocation'
import routes from '@common/RouteDefinitions'
import { EntityType } from './EntityConstants'

export const pageSize = COMMON_PAGE_SIZE_OPTIONS[1]

enum FilterScope {
  ACCOUNT = 'account',
  ORG = 'org',
  PROJECT = 'project'
}

enum UsageType {
  PipelineExecution = 'Pipeline Execution',
  TestConnection = 'Test Connection'
}
export const getScopeSelectOptions = (getString: (key: StringKeys) => string): MultiSelectOption[] => {
  const scopeList = [
    { label: getString('account'), value: FilterScope.ACCOUNT },
    { label: getString('orgLabel'), value: FilterScope.ORG },
    { label: getString('projectLabel'), value: FilterScope.PROJECT }
  ]
  return scopeList
}

export const useSecretRuntimeUsageTimeData = (): { threeMonthsBack: Date; currentDate: number } => {
  return useMemo(() => {
    const threeMonthsBack = new Date()
    threeMonthsBack.setMonth(threeMonthsBack.getMonth() - 3)
    const currentDate = Date.now()

    return {
      threeMonthsBack: threeMonthsBack,
      currentDate: currentDate
    }
  }, [])
}

export const useGetSecretRuntimeUsageQueryParams = (
  page: number,
  searchTerm: string | undefined,
  pageContentSize?: number
): ListActivitiesQueryParams => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { secretId } = useParams<SecretsPathProps>()
  return {
    accountIdentifier: accountId,
    projectIdentifier: projectIdentifier,
    orgIdentifier: orgIdentifier,
    identifier: secretId,
    pageIndex: page,
    pageSize: pageContentSize || pageSize,
    activityTypes: ['ENTITY_USAGE'],
    searchTerm: searchTerm,
    referredEntityType: EntityType.Secrets,
    endTime: useSecretRuntimeUsageTimeData().currentDate.valueOf(),
    startTime: useSecretRuntimeUsageTimeData().threeMonthsBack.valueOf()
  }
}

export const getOnlyValueTypeArray = (items: MultiSelectOption[]): string[] => {
  const valueItems = items.map(item => {
    return item.value
  })
  return valueItems as string[]
}

export const routeToEntityUrl = (targetUrl: string): void => {
  let baseUrl = getWindowLocationUrl()
  if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.substring(0, baseUrl.length - 1)
  }
  window.open(`${baseUrl}${targetUrl}`, '_blank')
}

export const filterData = (
  filterType: 'entity' | 'scope',
  items: MultiSelectOption[]
): {
  referredByEntityType?: string[]
  scopeFilter?: string[]
} => {
  const itemsWithOnlyValueType = getOnlyValueTypeArray(items)

  if (filterType === 'entity')
    return {
      referredByEntityType: [...itemsWithOnlyValueType]
    }
  if (filterType === 'scope')
    return {
      scopeFilter: [...itemsWithOnlyValueType]
    }
  else return {}
}

export const usageTypeToLabelMap = (usageDetail: any): Renderer<CellProps<Activity>> => {
  const usageType: UsageType = !isEmpty(usageDetail.usagetype) ? usageDetail.usagetype : ''
  switch (usageType) {
    case UsageType.PipelineExecution: {
      const pipelineExecutionUsageData = usageDetail?.pipelineexecutionusagedata

      const {
        identifier: pipelineIdentifier,
        accountidentifier: accountId,
        orgidentifier: orgIdentifier,
        projectidentifier: projectIdentifier
      } = defaultTo(usageDetail?.identifierref, {})

      const planExecutionId = pipelineExecutionUsageData?.planexecutionid
      const stageExecutionId = pipelineExecutionUsageData?.stageexecutionid
      const source: ExecutionPathProps['source'] = pipelineIdentifier ? 'executions' : 'deployments'

      return (
        <Link
          to={routes.toExecutionPipelineView({
            orgIdentifier,
            projectIdentifier,
            accountId,
            source,
            executionIdentifier: planExecutionId || '-1',
            stageExecId: stageExecutionId || '-1',
            pipelineIdentifier: pipelineIdentifier || '-1'
          })}
          target="_blank"
        >
          {usageType}
        </Link>
      )
    }
    case UsageType.TestConnection:
      return (
        <Text color={Color.GREY_400} lineClamp={1}>
          {usageType}
        </Text>
      )
    default:
      return ''
  }
}
