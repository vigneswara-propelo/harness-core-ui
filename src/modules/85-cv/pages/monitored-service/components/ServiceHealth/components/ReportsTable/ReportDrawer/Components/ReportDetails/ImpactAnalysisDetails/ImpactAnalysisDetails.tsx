/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import moment from 'moment'
import { Text, Container, Layout, Button, ButtonVariation } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { SRMAnalysisStepDetails } from 'services/cv'
import { ReportStatusCard } from '@cv/pages/monitored-service/components/ServiceHealth/components/ReportsTable/ReportsTable.utils'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { MonitoredServiceEnum } from '@cv/pages/monitored-service/MonitoredServicePage.constants'
import { getCVMonitoringServicesSearchParam } from '@cv/utils/CommonUtils'
import { TIME_FORMAT_STRING } from '../../../ReportDrawer.constants'
import { convertToDays } from '../../../ReportDrawer.utils'
import css from './ImpactAnalysisDetails.module.scss'

export const ImpactAnalysisDetails = ({ data }: { data: SRMAnalysisStepDetails[] }): JSX.Element => {
  const { getString } = useStrings()
  const { orgIdentifier, projectIdentifier, accountId } = useParams<ProjectPathProps & { identifier: string }>()

  const content = data.map(item => {
    const {
      stepName,
      analysisStatus,
      analysisEndTime,
      analysisDuration,
      analysisStartTime,
      executionDetailIdentifier,
      monitoredServiceIdentifier
    } = item

    const openReportInServiceHealth = (): void => {
      const linkTo = `${routes.toCVAddMonitoringServicesEdit({
        accountId,
        orgIdentifier,
        projectIdentifier,
        identifier: monitoredServiceIdentifier,
        module: 'cv'
      })}${getCVMonitoringServicesSearchParam({
        tab: MonitoredServiceEnum.ServiceHealth,
        reportId: executionDetailIdentifier
      })}`
      window.open(linkTo, '_blank')
    }

    return (
      <Container key={stepName} className={css.gridContainer} data-testid="ImpactAnalysisDetailsSection">
        <Container className={css.gridLayout}>
          <Text font={{ size: 'small' }}>{getString('cv.analyzeDeploymentImpact.cdCard.stepName')}:</Text>
          <Text font={{ size: 'small' }}>{stepName}</Text>
        </Container>

        <Container className={css.gridLayout}>
          <Text font={{ size: 'small' }}>{getString('cv.analyzeDeploymentImpact.cdCard.serviceAnalysed')}:</Text>
          <Text font={{ size: 'small' }}>{monitoredServiceIdentifier}</Text>
        </Container>

        <Container className={css.gridLayout}>
          <Text font={{ size: 'small' }}>{getString('cv.analyzeDeploymentImpact.duration')}:</Text>
          <Layout.Horizontal>
            <Text font={{ size: 'small' }} margin={{ left: '0', right: 'medium' }}>
              {convertToDays(getString, analysisDuration as number)}
            </Text>
            <Text data-testid="analysisDuration" icon={'time'} iconProps={{ size: 12 }} font={{ size: 'small' }}>
              {`${moment(analysisStartTime).format(TIME_FORMAT_STRING)} to ${moment(analysisEndTime).format(
                TIME_FORMAT_STRING
              )}`}
            </Text>
          </Layout.Horizontal>
        </Container>

        <Container className={css.gridLayout}>
          {analysisStatus ? <ReportStatusCard status={analysisStatus} /> : null}
          <Button className={css.viewReport} variation={ButtonVariation.LINK} onClick={openReportInServiceHealth}>
            {getString('cv.analyzeDeploymentImpact.cdCard.viewReport')}
          </Button>
        </Container>
      </Container>
    )
  })

  return <Layout.Vertical spacing="medium">{content}</Layout.Vertical>
}
