/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useFormikContext } from 'formik'
import { Container, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import { TimeSeries, useGetSampleMetricData, useGetSampleRawRecord } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { CommonCustomMetricFormikInterface } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { CommonQueryViewer } from '@cv/components/CommonQueryViewer/CommonQueryViewer'
import type { CommonCustomMetricFormContainerProps } from './CommonCustomMetricFormContainer.types'
import CommonChart from '../../CommonChart/CommonChart'
import {
  getRecordsRequestBody,
  shouldAutoBuildChart,
  shouldShowChartComponent
} from './CommonCustomMetricFormContainer.utils'

export default function CommonCustomMetricFormContainer(props: CommonCustomMetricFormContainerProps): JSX.Element {
  const { values } = useFormikContext<CommonCustomMetricFormikInterface>()
  const {
    sourceData: { product, sourceType }
  } = useContext(SetupSourceTabsContext)
  const { connectorIdentifier, isTemplate, expressions, isConnectorRuntimeOrExpression, customMetricsConfig } = props

  const [records, setRecords] = useState<Record<string, any>[]>([])
  const [isQueryExecuted, setIsQueryExecuted] = useState(false)
  const [healthSourceTimeSeriesData, setHealthSourceTimeSeriesData] = useState<TimeSeries[] | undefined>()

  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const chartConfig = customMetricsConfig?.metricsChart
  const providerType = `${sourceType?.toUpperCase()}_${product?.value}`
  const query = useMemo(() => (values?.query?.length ? values.query : ''), [values])
  const isQueryRuntimeOrExpression = getMultiTypeFromValue(query) !== MultiTypeInputType.FIXED

  const {
    mutate: queryHealthSource,
    loading: fetchingSampleRecordLoading,
    error
  } = useGetSampleRawRecord({
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier
  })

  const {
    mutate: fetchHealthSourceTimeSeriesData,
    loading: timeSeriesDataLoading,
    error: timeseriesDataError
  } = useGetSampleMetricData({
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier
  })

  useEffect(() => {
    if (values?.identifier) {
      // Whenever metric changes resetting the records and charts
      setIsQueryExecuted(false)
      setRecords([])
      setHealthSourceTimeSeriesData([])

      // Fetch the records for latest query
      if (query && !isConnectorRuntimeOrExpression && !isQueryRuntimeOrExpression) {
        handleFetchRecords()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values?.identifier])

  const handleBuildChart = async (): Promise<void> => {
    const fetchMetricsRecordsRequestBody = getRecordsRequestBody(connectorIdentifier, providerType, query)
    fetchHealthSourceTimeSeriesData(fetchMetricsRecordsRequestBody).then(data => {
      setHealthSourceTimeSeriesData(data?.resource?.timeSeriesData)
    })
  }

  const handleFetchRecords = async (): Promise<void> => {
    setIsQueryExecuted(true)
    const fetchRecordsRequestBody = getRecordsRequestBody(connectorIdentifier, providerType, query)
    const recordsData = await queryHealthSource(fetchRecordsRequestBody)
    if (recordsData) {
      setRecords(recordsData?.resource?.rawRecords as Record<string, any>[])
      if (shouldAutoBuildChart(chartConfig)) {
        handleBuildChart()
      }
    }
  }

  return (
    <Container padding={'small'} margin={'small'}>
      <CommonQueryViewer
        isQueryExecuted={isQueryExecuted}
        records={records}
        fetchRecords={handleFetchRecords}
        loading={fetchingSampleRecordLoading}
        error={error}
        query={query}
        dataTooltipId={'healthSourceQuery'}
        isTemplate={isTemplate}
        expressions={expressions}
        isConnectorRuntimeOrExpression={isConnectorRuntimeOrExpression}
      />
      {/* Field Mappings component Can be added here along with build chart/ get message button */}
      {shouldShowChartComponent(chartConfig, records, fetchingSampleRecordLoading) ? (
        <CommonChart
          timeSeriesDataLoading={timeSeriesDataLoading}
          timeseriesDataError={timeseriesDataError}
          healthSourceTimeSeriesData={healthSourceTimeSeriesData}
        />
      ) : null}
      {/* Logs Table Can be added here */}
    </Container>
  )
}
