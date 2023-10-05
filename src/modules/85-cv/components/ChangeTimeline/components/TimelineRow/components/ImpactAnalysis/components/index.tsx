/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Text } from '@harness/uicore'
import moment from 'moment'
import cx from 'classnames'
import { convertToDays } from '@cv/pages/monitored-service/components/ServiceHealth/components/ReportsTable/ReportDrawer/ReportDrawer.utils'
import { UseStringsReturn } from 'framework/strings'
import { DATE_FORMAT } from '../../../TimelineRow.constants'
import css from '../../../TimelineRow.module.scss'
import impactCss from '../ImpactAnalysis.module.scss'

interface AnalyseStepDetailsProps {
  getString: UseStringsReturn['getString']
  startTime: number
  endTime: number
  analysisDuration: number
}

export const AnalyseStepDateTime = ({ startTime }: { startTime: number }): JSX.Element => (
  <Text className={cx(impactCss.widgetTextLabels, impactCss.dividerClass)}>
    {moment(new Date(startTime)).format(DATE_FORMAT)}
  </Text>
)

export const AnalyseStepName = ({
  name,
  getString
}: {
  name: string
  getString: UseStringsReturn['getString']
}): JSX.Element => (
  <Layout.Vertical spacing="xsmall" margin={{ bottom: 'small' }}>
    <Text className={impactCss.widgetTextLabels}>{getString('cv.analyzeDeploymentImpact.stepName').toUpperCase()}</Text>
    <Text className={impactCss.widgetTextLabels}>{name}</Text>
  </Layout.Vertical>
)

export const AnalyseStepDetails = ({
  getString,
  startTime,
  endTime,
  analysisDuration
}: AnalyseStepDetailsProps): JSX.Element => (
  <Layout.Vertical spacing="small">
    <Layout.Horizontal>
      <Text className={css.widgetTextElements} padding={{ bottom: 'xsmall', right: 'small' }}>
        {getString('cv.analyzeDeploymentImpact.duration')}:
      </Text>
      <Text className={css.widgetTextElements} data-testid="duration">
        {convertToDays(getString, analysisDuration as number)}
      </Text>
    </Layout.Horizontal>
    <Layout.Horizontal>
      <Text className={css.widgetTextElements} padding={{ bottom: 'xsmall', right: 'small' }}>
        {getString('pipeline.startTime')}:
      </Text>
      <Text className={css.widgetTextElements} data-testid="startTime">
        {moment(new Date(startTime)).format(DATE_FORMAT)}
      </Text>
    </Layout.Horizontal>
    <Layout.Horizontal>
      <Text className={css.widgetTextElements} padding={{ bottom: 'xsmall', right: 'small' }}>
        {getString('common.endTime')}:
      </Text>
      <Text className={css.widgetTextElements} data-testid="endTime">
        {moment(new Date(endTime)).format(DATE_FORMAT)}
      </Text>
    </Layout.Horizontal>
  </Layout.Vertical>
)
