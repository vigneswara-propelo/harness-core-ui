/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Icon, Layout, Page, PageError, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import moment from 'moment'
import cx from 'classnames'
import { Popover, PopoverInteractionKind, PopoverPosition } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import { isEmpty } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetMSSecondaryEventsDetails } from 'services/cv'
import { convertToDays } from '@cv/pages/monitored-service/components/ServiceHealth/components/ReportsTable/ReportDrawer/ReportDrawer.utils'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import type { TimelineDataPoint } from '../../TimelineRow.types'
import { DATE_FORMAT, SLO_WIDGETS } from '../../TimelineRow.constants'
import { getInitialPositionOfWidget } from '../../TimelineRow.utils'
import css from '../../TimelineRow.module.scss'
import impactCss from './ImpactAnalysis.module.scss'

export interface ImpactAnalysisProps {
  widget: TimelineDataPoint
  index: number
  onlyContent?: boolean
}

export const ImpactAnalysis = (props: ImpactAnalysisProps): JSX.Element => {
  const { widget, index, onlyContent = false } = props
  const { getString } = useStrings()
  const { accountId } = useParams<ProjectPathProps>()
  const { icon, leftOffset: position, startTime, endTime, identifiers = [] } = widget

  const { data, loading, error } = useGetMSSecondaryEventsDetails({
    queryParams: {
      accountId,
      secondaryEventType: SLO_WIDGETS.SRM_ANALYSIS_IMPACT,
      identifiers
    },
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    }
  })

  const { height, width, url } = icon
  const { analysisDuration, analysisStatus } = data?.data?.details || {}
  const initialPosition = getInitialPositionOfWidget(position, height, width)

  let content = <></>

  if (error) {
    content = (
      <Container flex={{ justifyContent: 'center', alignItems: 'center' }} height={124} data-testid="error">
        <PageError message={getErrorMessage(error)} />
      </Container>
    )
  } else if (loading) {
    content = (
      <Container className={cx(css.widgetContainer, { [impactCss.contentContainer]: onlyContent })}>
        <Container flex={{ justifyContent: 'center', alignItems: 'center' }} height={124} data-testid="loading">
          <Icon name="spinner" color={Color.GREY_400} size={30} />
        </Container>
      </Container>
    )
  } else if (!isEmpty(data?.data?.details)) {
    content = (
      <Container className={cx(css.widgetContainer, { [impactCss.contentContainer]: onlyContent })}>
        <Layout.Vertical>
          <Layout.Horizontal>
            <Text className={css.widgetTextElements} padding={{ bottom: 'xsmall', right: 'small' }}>
              {getString('cv.analyzeDeploymentImpact.duration')}:
            </Text>
            <Text className={css.widgetTextElements}>{convertToDays(getString, analysisDuration as number)}</Text>
          </Layout.Horizontal>
          <Layout.Horizontal>
            <Text className={css.widgetTextElements} padding={{ bottom: 'xsmall', right: 'small' }}>
              {getString('pipeline.startTime')}:
            </Text>
            <Text className={css.widgetTextElements}>{moment(new Date(startTime)).format(DATE_FORMAT)}</Text>
          </Layout.Horizontal>
          <Layout.Horizontal>
            <Text className={css.widgetTextElements} padding={{ bottom: 'xsmall', right: 'small' }}>
              {getString('common.endTime')}:
            </Text>
            <Text className={css.widgetTextElements}>{moment(new Date(endTime)).format(DATE_FORMAT)}</Text>
          </Layout.Horizontal>
          <Layout.Horizontal>
            <Text className={css.widgetTextElements} padding={{ bottom: 'xsmall', right: 'small' }}>
              {getString('status')}:
            </Text>
            <Text className={css.widgetTextElements}>{analysisStatus}</Text>
          </Layout.Horizontal>
        </Layout.Vertical>
      </Container>
    )
  } else {
    content = <Page.NoDataCard message={getString('noDetails')} />
  }

  return onlyContent ? (
    content
  ) : (
    <Container key={`${startTime}-${position}-${index}`} className={css.event} style={initialPosition}>
      <Popover
        interactionKind={PopoverInteractionKind.CLICK}
        popoverClassName={css.widgetsPopover}
        position={PopoverPosition.TOP}
        content={content}
      >
        <svg height={height} width={width} className={css.widgetIcon} data-testid="dataCollectionFailureIcon">
          <image href={url} height={height} width={width} />
        </svg>
      </Popover>
    </Container>
  )
}
