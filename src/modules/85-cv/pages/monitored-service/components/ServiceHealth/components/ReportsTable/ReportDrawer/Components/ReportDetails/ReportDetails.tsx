/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import moment from 'moment'
import cx from 'classnames'
import { capitalize } from 'lodash-es'
import { Layout, Text, Icon, Container } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { GetDataError } from 'restful-react'
import { Classes } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { SRMAnalysisStepDetailDTO } from 'services/cv'
import { ReportStatusCard } from '../../../ReportsTable.utils'
import { convertToDays } from '../../ReportDrawer.utils'
import { TIME_FORMAT_STRING } from '../../ReportDrawer.constants'
import { ExecutedBy } from './Components/ExecutedBy'
import css from './ReportDetails.module.scss'

interface ReportDetailsProps extends SRMAnalysisStepDetailDTO {
  analysisError?: GetDataError<unknown> | null
  analysisLoading?: boolean
}
export const ReportDetails = (props: ReportDetailsProps): JSX.Element => {
  const {
    analysisStartTime,
    analysisEndTime,
    analysisDuration,
    analysisLoading,
    analysisStatus,
    planExecutionId,
    stageStepId,
    monitoredServiceIdentifier
  } = props
  const { getString } = useStrings()
  const loadingClassName = analysisLoading ? cx(Classes.SKELETON, css.loadingElement) : ''
  return (
    <Layout.Vertical spacing="small">
      <Text
        font={{ size: 'medium', weight: 'semi-bold' }}
        width="max-content"
        margin={{ right: 'medium' }}
        color={Color.BLACK_100}
      >
        {getString('details')}
      </Text>

      <Container className={css.gridContainer}>
        <Container className={css.gridLayout}>
          <Text font={{ size: 'small' }}>{getString('common.executedBy')}</Text>
          <ExecutedBy planExecutionId={planExecutionId} stageNodeId={stageStepId} />
        </Container>
        <Container className={css.gridLayout}>
          <Text font={{ size: 'small' }}>{getString('cv.monitoredServices.heading')}</Text>
          <Text className={loadingClassName} font={{ size: 'small' }}>
            {monitoredServiceIdentifier}
          </Text>
        </Container>
        <Container className={css.gridLayout}>
          <Text font={{ size: 'small' }}>{getString('cv.analyzeDeploymentImpact.duration')}</Text>
          <Text className={loadingClassName} font={{ size: 'small' }}>
            {convertToDays(getString, analysisDuration as number)}
          </Text>
        </Container>
        <Container className={css.gridLayout}>
          <Text font={{ size: 'small' }}>{getString('cv.slos.sloDetailsChart.startDate')}</Text>
          <Text className={loadingClassName} font={{ size: 'small' }}>{`${moment(analysisStartTime).format(
            TIME_FORMAT_STRING
          )}`}</Text>
        </Container>
        <Container className={css.gridLayout}>
          <Text font={{ size: 'small' }}>{getString('cv.slos.sloDetailsChart.endDate')}</Text>
          <Text className={loadingClassName} font={{ size: 'small' }}>{`${moment(analysisEndTime).format(
            TIME_FORMAT_STRING
          )}`}</Text>
        </Container>
        <Container className={css.gridLayout}>
          <Text font={{ size: 'small' }}>{capitalize(getString('status'))}</Text>
          {analysisLoading ? <Icon name="spinner" /> : <ReportStatusCard status={analysisStatus} />}
        </Container>
      </Container>
    </Layout.Vertical>
  )
}
