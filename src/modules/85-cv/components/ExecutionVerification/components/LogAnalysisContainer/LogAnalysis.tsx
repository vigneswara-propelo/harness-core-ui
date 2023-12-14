/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo, useState } from 'react'
import { Container, Icon, NoDataCard, PageError, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { RestResponseLogAnalysisRadarChartListWithCountDTO } from 'services/cv'
import { useStrings } from 'framework/strings'
import noDataImage from '@cv/assets/noData.svg'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import type { LogAnalysisProps, LogAnalysisRowData } from './LogAnalysis.types'
import LogAnalysisRadarChartHeader from './components/LogAnalysisRadarChartHeader'
import LogAnalysisRadarChart from './components/LogAnalysisRadarChart'
import { getCanRenderLogsRadarChart, getLogAnalysisData } from './LogAnalysis.utils'
import { LogAnalysisRow } from './components/LogAnalysisRow/LogAnalysisRow'
import styles from './LogAnalysis.module.scss'

export default function LogAnalysis(props: LogAnalysisProps): JSX.Element {
  const {
    data,
    clusterChartData,
    goToPage,
    logsLoading,
    clusterChartLoading,
    handleAngleChange,
    filteredAngle,
    activityId,
    logsError,
    refetchLogAnalysis,
    clusterChartError,
    refetchClusterAnalysis,
    startTime,
    endTime,
    monitoredServiceIdentifier,
    isServicePage
  } = props
  const { getString } = useStrings()

  const logAnalysisData = useMemo((): LogAnalysisRowData[] => {
    return getLogAnalysisData(data)
  }, [data, isServicePage])

  const [selectedLog, setSelectedLog] = useState<string | null>(null)

  const handleLogSelection = useCallback((logClusterId: string): void => {
    setSelectedLog(logClusterId)
  }, [])

  const resetSelectedLog = useCallback(() => {
    setSelectedLog(null)
  }, [])

  const renderLogsData = useCallback(() => {
    if (logsLoading) {
      return (
        <Container className={styles.loading}>
          <Icon name="steps-spinner" color={Color.GREY_400} size={30} />
        </Container>
      )
    } else if (logsError) {
      return (
        <Container data-testid="LogAnalysisList_error">
          <PageError message={getErrorMessage(logsError)} onClick={refetchLogAnalysis} className={styles.noData} />
        </Container>
      )

      // adding clusterChartLoading here inorder to prevent this visible before cluster chart loads
      // this prevents showing two no data text and then change to one
    } else if (!logAnalysisData.length && !clusterChartLoading) {
      return (
        <Container className={styles.noData} data-testid="LogAnalysisList_NoData">
          <NoDataCard message={getString('cv.monitoredServices.noMatchingData')} image={noDataImage} />
        </Container>
      )
    } else {
      return (
        <LogAnalysisRow
          className={styles.logAnalysisRow}
          data={logAnalysisData}
          logResourceData={data?.resource?.logAnalysisRadarCharts}
          goToPage={goToPage}
          selectedLog={selectedLog}
          resetSelectedLog={resetSelectedLog}
          refetchLogAnalysis={refetchLogAnalysis}
          activityId={activityId}
          startTime={startTime}
          endTime={endTime}
          monitoredServiceIdentifier={monitoredServiceIdentifier}
        />
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logsLoading, logAnalysisData.length, selectedLog])

  const renderLogsRadarChart = (): JSX.Element => {
    if (
      !logsError &&
      !logsLoading &&
      !getCanRenderLogsRadarChart(data as RestResponseLogAnalysisRadarChartListWithCountDTO)
    ) {
      return (
        <Container
          data-testid="newBaselineEventMessage"
          padding="medium"
          margin={{ right: 'medium' }}
          background={Color.PRIMARY_1}
        >
          <Text color={Color.BLACK}>{getString('cv.logsNewBaselineEventMessage')}</Text>
        </Container>
      )
    }

    return (
      <LogAnalysisRadarChart
        clusterChartLoading={clusterChartLoading}
        clusterChartData={clusterChartData}
        handleAngleChange={handleAngleChange}
        filteredAngle={filteredAngle}
        onRadarPointClick={handleLogSelection}
        clusterChartError={clusterChartError}
        refetchClusterAnalysis={refetchClusterAnalysis}
        logsLoading={logsLoading}
        showBaseline
      />
    )
  }

  return (
    <Container className={styles.logsTab}>
      <Container className={styles.clusterChart}>
        {!clusterChartLoading && !logsError && (
          <LogAnalysisRadarChartHeader
            showHealthLegend
            totalClustersCount={data?.resource?.totalClusters}
            eventsCount={data?.resource?.eventCounts}
          />
        )}

        {renderLogsRadarChart()}
      </Container>
      <Container className={styles.tableContent}>{renderLogsData()}</Container>
    </Container>
  )
}
