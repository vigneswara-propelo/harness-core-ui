/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import moment from 'moment'
import { defaultTo } from 'lodash-es'
import { UseStringsReturn } from 'framework/strings'
import { RestResponseSRMAnalysisStepDetailDTO, SRMAnalysisStepDetailDTO } from 'services/cv'
import { durationAsString } from '@cv/pages/monitored-service/components/ServiceHealth/components/ChangesAndServiceDependency/components/ChangesTable/components/ChangeEventCard/components/DeploymentTimeDuration/DeploymentTimeDuration.utils'
import { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { getCVMonitoringServicesSearchParam } from '@cv/utils/CommonUtils'
import { MonitoredServiceEnum } from '@cv/pages/monitored-service/MonitoredServicePage.constants'
import { AnalysisStatus } from './AnalyzeDeploymentImpact.constants'

interface CreateDetailsDataProps {
  data: RestResponseSRMAnalysisStepDetailDTO | null
  getString: UseStringsReturn['getString']
  params: ProjectPathProps
  activityId: string
}

interface CreateDetailsDataValue {
  detailsData: {
    label: string
    value: string
  }[]
  resource?: SRMAnalysisStepDetailDTO
  linkTo: string
  showStopAnalysis: boolean
}

export const createDetailsData = ({
  activityId,
  data,
  params,
  getString
}: CreateDetailsDataProps): CreateDetailsDataValue => {
  const { accountId, projectIdentifier, orgIdentifier } = params
  const {
    analysisStartTime,
    analysisDuration,
    analysisStatus,
    analysisEndTime,
    executionDetailIdentifier,
    monitoredServiceIdentifier
  } = data?.resource || {}

  const oneDay = 24 * 60 * 60
  const durationInDays = defaultTo(analysisDuration as number, 0) / oneDay
  const durationInDaysString =
    durationInDays === 1 ? `${durationInDays} ${getString('cv.day')}` : `${durationInDays} ${getString('cv.days')}`

  const isExecutionRunning = analysisStatus === AnalysisStatus.RUNNING
  const showStopAnalysis = isExecutionRunning && Boolean(executionDetailIdentifier)

  const linkTo = `${routes.toCVAddMonitoringServicesEdit({
    accountId,
    orgIdentifier,
    projectIdentifier,
    identifier: monitoredServiceIdentifier,
    module: 'cv'
  })}${getCVMonitoringServicesSearchParam({
    tab: MonitoredServiceEnum.ServiceHealth,
    reportId: activityId
  })}`

  const detailsData = [
    {
      label: getString('startedAt'),
      value: moment(analysisStartTime).format('MMM D, YYYY h:mm A')
    },
    {
      label: getString('cv.analyzeDeploymentImpact.duration'),
      value: durationInDaysString
    },
    {
      label: isExecutionRunning
        ? getString('cv.analyzeDeploymentImpact.remaining')
        : getString('cv.changeSource.changeSourceCard.finished'),
      value: isExecutionRunning
        ? durationAsString(moment().valueOf(), analysisEndTime as number)
        : moment(analysisEndTime).format('MMM D, YYYY h:mm A')
    }
  ]

  return { detailsData, resource: data?.resource, linkTo, showStopAnalysis }
}

export const calculateProgressPercentage = (data: RestResponseSRMAnalysisStepDetailDTO | null): number => {
  const { analysisStartTime, analysisEndTime } = data?.resource || {}
  if (analysisEndTime && analysisStartTime) {
    const hasTimePassed = analysisEndTime < Date.now()
    if (hasTimePassed) {
      return 100
    }
    return Number(((1 - (analysisEndTime - Date.now()) / (analysisEndTime - analysisStartTime)) * 100).toFixed(1))
  }
  return 0
}
