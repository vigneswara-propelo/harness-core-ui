/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Container, NoDataCard } from '@harness/uicore'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import {
  useGetVerifyStepDeploymentRadarChartLogAnalysisClusters,
  useGetVerifyStepDeploymentLogAnalysisRadarChartResult,
  useGetVerifyStepNodeNames,
  GetVerifyStepDeploymentRadarChartLogAnalysisClustersQueryParams
} from 'services/cv'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import noDataImage from '@cv/assets/noData.svg'
import { useQueryParams } from '@common/hooks'
import { useStrings } from 'framework/strings'
import LogAnalysis from './LogAnalysis'
import { pageSize, initialPageNumber, POLLING_INTERVAL, StepStatus, EventTypeFullName } from './LogAnalysis.constants'
import type { ClusterTypes, LogAnalysisQueryParams, MinMaxAngleState } from './LogAnalysisView.container.types'
import type { LogAnalysisContainerProps, LogAnalysisProps } from './LogAnalysis.types'
import { getActivityId } from '../../ExecutionVerificationView.utils'
import { getInitialNodeName } from './LogAnalysis.utils'
import { getQueryParamForHostname, getQueryParamFromFilters } from '../DeploymentMetrics/DeploymentMetrics.utils'
import { RadarChartAngleLimits } from './LogAnalysisView.container.constants'
import ClusterTypeFiltersForLogs from './components/ClusterTypeFiltersForLogs'
import { getInitialClustersFilterValue } from './LogAnalysisView.container.utils'
import css from './LogAnalysisView.container.module.scss'
import logAnalysisStyles from './LogAnalysis.module.scss'

// ⭐️ Verify step logs screen
export default function LogAnalysisContainer({
  step,
  hostName,
  overviewData,
  overviewLoading
}: LogAnalysisContainerProps): React.ReactElement {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const pageParams = useQueryParams<LogAnalysisQueryParams>()
  const [clusterTypeFilters, setClusterTypeFilters] = useState<ClusterTypes>([])

  const isMounted = useRef(false)
  const isFirstFilterCall = useRef(true)
  const isFirstFetchCall = useRef(true)
  const [selectedHealthSource] = useState<string>()
  const [pageNumber, setPageNumber] = useState<number>(0)
  const [pollingIntervalId, setPollingIntervalId] = useState<any>(-1)

  const [selectedNodeName, setSelectedNodeName] = useState(getInitialNodeName(hostName))

  const [minMaxAngle, setMinMaxAngle] = useState({ min: RadarChartAngleLimits.MIN, max: RadarChartAngleLimits.MAX })

  const activityId = useMemo(() => getActivityId(step), [step])

  const [logsDataQueryParams, setLogsDataQueryParams] =
    useState<GetVerifyStepDeploymentRadarChartLogAnalysisClustersQueryParams>(() => {
      return {
        accountId,
        pageNumber: initialPageNumber,
        pageSize,
        hostNames: getQueryParamForHostname(hostName),
        minAngle: minMaxAngle.min,
        maxAngle: minMaxAngle.max,
        clusterTypes: clusterTypeFilters?.length ? clusterTypeFilters : undefined,
        healthSources: selectedHealthSource ? [selectedHealthSource] : undefined
      }
    })

  const [radarChartDataQueryParams, setradarChartDataQueryParams] =
    useState<GetVerifyStepDeploymentRadarChartLogAnalysisClustersQueryParams>(() => {
      return {
        accountId,
        hostNames: getQueryParamForHostname(hostName),
        clusterTypes: clusterTypeFilters?.length ? clusterTypeFilters : undefined,
        healthSources: selectedHealthSource ? [selectedHealthSource] : undefined
      }
    })

  const {
    data: logsData,
    loading: logsLoading,
    error: logsError,
    refetch: fetchLogAnalysis
  } = useGetVerifyStepDeploymentLogAnalysisRadarChartResult({
    verifyStepExecutionId: activityId,
    queryParams: logsDataQueryParams,
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    },
    lazy: true
  })

  const {
    data: clusterChartData,
    loading: clusterChartLoading,
    error: clusterChartError,
    refetch: fetchClusterAnalysis
  } = useGetVerifyStepDeploymentRadarChartLogAnalysisClusters({
    verifyStepExecutionId: activityId,
    queryParams: radarChartDataQueryParams,
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    },
    lazy: true
  })

  const {
    data: nodeNames,
    loading: nodeNamesLoading,
    error: nodeNamesError
  } = useGetVerifyStepNodeNames({
    verifyStepExecutionId: activityId,
    queryParams: {
      accountId
    }
  })

  useEffect(() => {
    if (!overviewLoading) {
      setClusterTypeFilters(() =>
        getInitialClustersFilterValue({
          filterAnomalous: pageParams.filterAnomalous,
          getString,
          overviewData,
          overviewLoading
        })
      )
    }
  }, [overviewData, overviewLoading, pageParams.filterAnomalous])

  useEffect(() => {
    if (!overviewLoading) {
      fetchClusterAnalysis({ queryParams: radarChartDataQueryParams })
    }
  }, [overviewLoading, radarChartDataQueryParams])

  useEffect(() => {
    if (!overviewLoading) {
      fetchLogAnalysis({ queryParams: logsDataQueryParams })
    }
  }, [overviewLoading, logsDataQueryParams])

  const handleNodeNameChange = useCallback(selectedNodeNameFitlers => {
    setSelectedNodeName(selectedNodeNameFitlers)
  }, [])

  useEffect(() => {
    if (!isFirstFilterCall.current) {
      const nodeNameParams = selectedNodeName.map(item => item.value) as string[]

      const hostNames = getQueryParamFromFilters(nodeNameParams)

      const updatedLogsDataQueryParams = {
        ...logsDataQueryParams,
        hostNames
      }

      const updatedRadarChartDataQueryParams = {
        ...radarChartDataQueryParams,
        hostNames
      }

      setLogsDataQueryParams(updatedLogsDataQueryParams)
      setradarChartDataQueryParams(updatedRadarChartDataQueryParams)
      setMinMaxAngle({ min: RadarChartAngleLimits.MIN, max: RadarChartAngleLimits.MAX })
    }
  }, [selectedNodeName])

  useEffect(() => {
    if (!isFirstFilterCall.current) {
      const hostNames = getQueryParamForHostname(hostName)

      const updatedLogsDataQueryParams = {
        ...logsDataQueryParams,
        hostNames
      }

      const updatedRadarChartDataQueryParams = {
        ...radarChartDataQueryParams,
        hostNames
      }

      setLogsDataQueryParams(updatedLogsDataQueryParams)
      setradarChartDataQueryParams(updatedRadarChartDataQueryParams)
      setSelectedNodeName(getInitialNodeName(hostName))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hostName, activityId])

  // Fetching logs and cluster data for selected cluster type
  useEffect(() => {
    if (!isFirstFilterCall.current) {
      const updatedLogsDataParams = {
        ...logsDataQueryParams,
        clusterTypes: clusterTypeFilters?.length ? clusterTypeFilters : undefined
      }

      const updatedRadarChartDataParams = {
        ...radarChartDataQueryParams,
        clusterTypes: clusterTypeFilters?.length ? clusterTypeFilters : undefined
      }

      setLogsDataQueryParams(updatedLogsDataParams)
      setradarChartDataQueryParams(updatedRadarChartDataParams)
      setMinMaxAngle({ min: RadarChartAngleLimits.MIN, max: RadarChartAngleLimits.MAX })
    } else {
      isFirstFilterCall.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clusterTypeFilters])

  useEffect(() => {
    if (isMounted.current) {
      setLogsDataQueryParams({
        ...logsDataQueryParams,
        minAngle: minMaxAngle.min,
        maxAngle: minMaxAngle.max
      })
    } else {
      isMounted.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minMaxAngle])

  const handleRefreshData = useCallback(() => {
    Promise.all([
      fetchLogAnalysis({ queryParams: { ...logsDataQueryParams, pageNumber: 0 } }),
      fetchClusterAnalysis({ queryParams: radarChartDataQueryParams })
    ])
    setPageNumber(0)
  }, [fetchClusterAnalysis, fetchLogAnalysis, logsDataQueryParams, radarChartDataQueryParams])

  // Polling for Logs and Cluster Chart data
  useEffect(() => {
    let intervalId = pollingIntervalId
    clearInterval(intervalId)
    if (step?.status === StepStatus.Running || step?.status === StepStatus.AsyncWaiting) {
      intervalId = setInterval(() => {
        Promise.all([
          fetchLogAnalysis({ queryParams: logsDataQueryParams }),
          fetchClusterAnalysis({ queryParams: radarChartDataQueryParams })
        ])
      }, POLLING_INTERVAL)
      setPollingIntervalId(intervalId)
    }
    return () => clearInterval(intervalId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logsDataQueryParams, radarChartDataQueryParams, step?.status])

  const handleClustersFilterChange = useCallback((checked: boolean, filterName: EventTypeFullName): void => {
    setClusterTypeFilters(currentFilters => {
      if (checked) {
        return [...(currentFilters as EventTypeFullName[]), filterName]
      } else {
        return currentFilters?.filter((item: string) => item !== filterName)
      }
    })
  }, [])

  const handleMinMaxChange = useCallback((updatedAngle: MinMaxAngleState): void => {
    setMinMaxAngle({ ...updatedAngle })
  }, [])

  const fetchPaginatedLogAnalysisRowData = useCallback(() => {
    fetchLogAnalysis({
      queryParams: { ...logsDataQueryParams, pageNumber }
    })
  }, [pageNumber, fetchLogAnalysis, logsDataQueryParams])

  useEffect(() => {
    if (!isFirstFetchCall.current) {
      fetchPaginatedLogAnalysisRowData()
    }
    isFirstFetchCall.current = false
  }, [pageNumber])

  const goToLogsPage = useCallback(
    newPageNumber => setPageNumber(newPageNumber),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [logsDataQueryParams]
  )

  const renderContent = (): JSX.Element => {
    if (
      !logsData?.resource?.logAnalysisRadarCharts?.content?.length &&
      !clusterChartData?.resource?.length &&
      !clusterChartLoading &&
      !logsLoading &&
      !logsError &&
      !clusterChartError
    ) {
      return (
        <Container className={css.noDataContainer}>
          <Container className={logAnalysisStyles.noData} data-testid="LogAnalysis_common_noData">
            <NoDataCard message={getString('cv.monitoredServices.noMatchingData')} image={noDataImage} />
          </Container>
        </Container>
      )
    }

    const componentProps: LogAnalysisProps = {
      data: logsData,
      clusterChartData,
      filteredAngle: minMaxAngle,
      logsLoading,
      logsError,
      refetchLogAnalysis: fetchPaginatedLogAnalysisRowData,
      refetchClusterAnalysis: fetchClusterAnalysis,
      clusterChartError,
      clusterChartLoading,
      goToPage: goToLogsPage,
      activityId,
      handleAngleChange: handleMinMaxChange
    }

    return <LogAnalysis {...componentProps} />
  }

  return (
    <Container className={cx(css.main, css.logAnalysis)}>
      <ClusterTypeFiltersForLogs
        nodeNames={nodeNames}
        clusterTypeFilters={clusterTypeFilters}
        onFilterChange={handleClustersFilterChange}
        selectedNodeName={selectedNodeName}
        handleNodeNameChange={handleNodeNameChange}
        nodeNamesError={nodeNamesError}
        nodeNamesLoading={nodeNamesLoading}
        stepStatus={step?.status}
        onRefreshData={handleRefreshData}
      />
      {renderContent()}
    </Container>
  )
}
