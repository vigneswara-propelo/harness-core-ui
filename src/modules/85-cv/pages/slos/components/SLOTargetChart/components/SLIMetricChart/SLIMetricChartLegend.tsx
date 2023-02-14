/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Text, Layout } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { ThresholdLegend, RatioLegend } from './SLIMetricChartLegend.types'
import css from './SLIMetricChart.module.scss'

export const Legend = ({
  hasMultipleMetric,
  legendData
}: {
  hasMultipleMetric: boolean
  legendData: ThresholdLegend | RatioLegend
}): JSX.Element => {
  const { getString } = useStrings()

  let legendElement = <></>

  if (hasMultipleMetric) {
    legendElement = (
      <>
        <Layout.Horizontal spacing={'small'}>
          <Text
            font={{ variation: FontVariation.SMALL }}
            icon="symbol-square"
            iconProps={{ color: Color.MAGENTA_700 }}
            color={Color.GREY_300}
          >
            {getString('cv.slos.goodRequests')}:
          </Text>
          <Text inline font={{ variation: FontVariation.FORM_HELP }}>
            {(legendData as RatioLegend).goodMetric.toFixed(1)}s
          </Text>
        </Layout.Horizontal>
        <Layout.Horizontal spacing={'small'}>
          <Text
            font={{ variation: FontVariation.SMALL }}
            icon="symbol-square"
            iconProps={{ color: Color.GREEN_700 }}
            color={Color.GREY_300}
          >
            {getString('cv.slos.validRequests')}:
          </Text>
          <Text inline font={{ variation: FontVariation.FORM_HELP }}>
            {(legendData as RatioLegend).validMetric.toFixed(1)}s
          </Text>
        </Layout.Horizontal>
      </>
    )
  } else {
    legendElement = (
      <>
        <Layout.Horizontal spacing={'small'}>
          <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_300}>
            {getString('cv.minimum')}:
          </Text>
          <Text inline font={{ variation: FontVariation.FORM_HELP }}>
            {(legendData as ThresholdLegend).max.toFixed(1)}s
          </Text>
        </Layout.Horizontal>
        <Layout.Horizontal spacing={'small'}>
          <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_300}>
            {getString('ce.perspectives.nodeDetails.aggregation.maximum')}:
          </Text>
          <Text inline font={{ variation: FontVariation.FORM_HELP }}>
            {(legendData as ThresholdLegend).min.toFixed(1)}s
          </Text>
        </Layout.Horizontal>
        <Layout.Horizontal spacing={'small'}>
          <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_300}>
            {getString('ce.perspectives.nodeDetails.aggregation.average')}:
          </Text>
          <Text inline font={{ variation: FontVariation.FORM_HELP }}>
            {(legendData as ThresholdLegend).avg.toFixed(1)}s
          </Text>
        </Layout.Horizontal>
      </>
    )
  }

  return (
    <Container>
      <Layout.Horizontal
        width={'fit-content'}
        className={css.sliMetricChart}
        background={Color.PRIMARY_1}
        margin={{ top: 'large' }}
        padding="small"
        spacing="large"
        border={{ radius: 10, width: 0 }}
      >
        {legendElement}
      </Layout.Horizontal>
    </Container>
  )
}
