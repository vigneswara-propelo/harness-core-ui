/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { merge } from 'lodash-es'
import { Container, Icon, Text, PageError, NoDataCard, Layout } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { TimeSeriesAreaChart } from '@common/components'
import NoChartDataImage from '@cv/assets/noChartData.svg'
import { SLIMetricTypes } from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.types'
import { getDefaultChartOptions } from './SLOTargetChart.utils'
import type { SLOTargetChartProps, SLOTargetChartWithAPIGetSliGraphProps } from './SLOTargetChart.types'
import { convertServiceLevelIndicatorToSLIFormData } from '../CVCreateSLOV2/CVCreateSLOV2.utils'
import { SliMetricGraph } from './components/SLIMetricChart/SLIMetricChart'
import css from './SLOTargetChart.module.scss'

export const SLOTargetChart: React.FC<SLOTargetChartProps> = ({
  topLabel,
  bottomLabel,
  dataPoints,
  customChartOptions
}) => {
  const finalChartOptions = useMemo(() => merge(getDefaultChartOptions(), customChartOptions), [customChartOptions])

  const seriesData: Omit<Highcharts.SeriesColumnOptions, 'type'>[] = [
    {
      data: dataPoints,
      showInLegend: false
    }
  ]

  return (
    <div>
      {topLabel}
      <TimeSeriesAreaChart customChartOptions={finalChartOptions} seriesData={seriesData} />
      {bottomLabel}
    </div>
  )
}

const SLOTargetChartWithAPIGetSliGraph: React.FC<SLOTargetChartWithAPIGetSliGraphProps> = ({
  topLabel,
  bottomLabel,
  customChartOptions,
  serviceLevelIndicator,
  monitoredServiceIdentifier,
  sliGraphData,
  loading,
  error,
  retryOnError,
  showMetricChart
}) => {
  const dataPoints = useMemo(
    () => sliGraphData?.dataPoints?.map(point => [Number(point.timeStamp) || 0, Number(point.value) || 0]),
    [sliGraphData?.dataPoints]
  )

  const containerHeight = showMetricChart ? '250px' : '100%'

  if (loading) {
    return (
      <Container flex={{ justifyContent: 'center' }} height={containerHeight}>
        <Icon name="steps-spinner" color={Color.GREY_400} size={30} />
      </Container>
    )
  }

  if (error) {
    return (
      <Container flex={{ justifyContent: 'center' }} height={containerHeight}>
        <PageError
          width={400}
          message={error}
          onClick={() => retryOnError(serviceLevelIndicator, monitoredServiceIdentifier)}
        />
      </Container>
    )
  }

  return (
    <SLOTargetChart
      topLabel={topLabel}
      bottomLabel={bottomLabel}
      customChartOptions={customChartOptions}
      dataPoints={dataPoints}
    />
  )
}

const SLOTargetChartWrapper: React.FC<SLOTargetChartWithAPIGetSliGraphProps> = props => {
  const { getString } = useStrings()
  const { serviceLevelIndicator, monitoredServiceIdentifier, showMetricChart = false } = props

  const {
    healthSourceRef,
    SLIType,
    SLIMetricType,
    validRequestMetric,
    objectiveValue = -1,
    objectiveComparator,
    SLIMissingDataType,
    eventType,
    goodRequestMetric
  } = convertServiceLevelIndicatorToSLIFormData(serviceLevelIndicator)

  const emptyState = (
    <Container flex={{ justifyContent: 'center' }} width={'100%'}>
      <NoDataCard
        image={NoChartDataImage}
        containerClassName={css.noData}
        message={getString('cv.pleaseFillTheRequiredFieldsToSeeTheSLIData')}
      />
    </Container>
  )

  if (
    monitoredServiceIdentifier &&
    healthSourceRef &&
    SLIType &&
    SLIMetricType &&
    validRequestMetric &&
    objectiveValue >= 0 &&
    objectiveComparator &&
    SLIMissingDataType
  ) {
    if (SLIMetricType === SLIMetricTypes.RATIO) {
      if (!eventType || !goodRequestMetric || validRequestMetric === goodRequestMetric || objectiveValue > 100) {
        return emptyState
      }
    }

    return showMetricChart ? (
      <Layout.Vertical spacing="small">
        <Layout.Vertical spacing="xsmall" margin={{ bottom: 'xlarge' }}>
          <Text color={Color.PRIMARY_10} font={{ size: 'normal', weight: 'semi-bold' }}>
            {getString(
              SLIMetricType === SLIMetricTypes.RATIO
                ? 'cv.slos.sliMetricChartRatioBasedHeader'
                : 'cv.slos.slis.ratioMetricType.validRequestsMetrics'
            )}
          </Text>
          <Text margin={{ bottom: 'large' }} font={{ size: 'normal', weight: 'light' }}>
            {getString('cv.slos.sliMetricChartSubHeader')}
          </Text>
          <SliMetricGraph {...props} />
        </Layout.Vertical>
        <Layout.Vertical spacing="small">
          <Text color={Color.PRIMARY_10} font={{ size: 'normal', weight: 'semi-bold' }} margin={{ bottom: 'small' }}>
            {getString('cv.slos.slis.SLIChartTitle')}
          </Text>
          <SLOTargetChartWithAPIGetSliGraph {...props} />
        </Layout.Vertical>
      </Layout.Vertical>
    ) : (
      <Layout.Vertical spacing="small">
        <Text color={Color.PRIMARY_10} font={{ size: 'normal', weight: 'semi-bold' }} margin={{ bottom: 'small' }}>
          {getString('cv.slos.slis.SLIChartTitle')}
        </Text>
        <SLOTargetChartWithAPIGetSliGraph {...props} />
      </Layout.Vertical>
    )
  }

  return emptyState
}

export default SLOTargetChartWrapper
