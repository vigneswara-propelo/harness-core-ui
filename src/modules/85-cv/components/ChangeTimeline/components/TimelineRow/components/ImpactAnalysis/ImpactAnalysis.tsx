/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Icon, Layout, Page, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import cx from 'classnames'
import { IDrawerProps, Popover, PopoverInteractionKind, PopoverPosition } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import { isEmpty, noop } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetMSSecondaryEventsDetails } from 'services/cv'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { useDrawer } from '@cv/hooks/useDrawerHook/useDrawerHook'
import ReportDrawer from '@cv/pages/monitored-service/components/ServiceHealth/components/ReportsTable/ReportDrawer/ReportDrawer'
import { ReportStatusCard } from '@modules/85-cv/pages/monitored-service/components/ServiceHealth/components/ReportsTable/ReportsTable.utils'
import type { TimelineDataPoint } from '../../TimelineRow.types'
import { SLO_WIDGETS } from '../../TimelineRow.constants'
import { getInitialPositionOfWidget } from '../../TimelineRow.utils'
import { AnalyseStepDateTime, AnalyseStepName, AnalyseStepDetails } from './components'
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
  const { stepName, analysisDuration, analysisStatus } = data?.data?.details || {}
  const initialPosition = getInitialPositionOfWidget(position, height, width)

  const drawerOptions = {
    size: '800px',
    onClose: noop
  } as IDrawerProps

  const { showDrawer: showReportDrawer } = useDrawer({
    createDrawerContent: drawerProps => <ReportDrawer {...drawerProps} />,
    drawerOptions,
    showConfirmationDuringClose: false
  })

  let content = <></>

  if (error) {
    content = (
      <Container className={cx(css.widgetContainer, { [impactCss.contentContainer]: onlyContent })} data-testid="error">
        <Text className={css.widgetTextElements} padding={{ bottom: 'xsmall', right: 'small' }} color={Color.RED_400}>
          {getErrorMessage(error)}
        </Text>
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
          {!onlyContent && <AnalyseStepDateTime startTime={startTime} />}
          <AnalyseStepName getString={getString} name={stepName} />
          <Container margin="small">
            <ReportStatusCard status={analysisStatus} />
          </Container>
          <AnalyseStepDetails
            endTime={endTime}
            getString={getString}
            startTime={startTime}
            analysisDuration={analysisDuration}
          />
          <Text
            className={impactCss.openReportButton}
            onClick={(e: React.MouseEvent<Element, MouseEvent>) => {
              e.stopPropagation()
              const identifierIndex = identifiers.length === 1 ? 0 : index
              showReportDrawer({ executionDetailIdentifier: identifiers[identifierIndex] })
            }}
          >
            {getString('cv.analyzeDeploymentImpact.openReportButton')}
          </Text>
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
