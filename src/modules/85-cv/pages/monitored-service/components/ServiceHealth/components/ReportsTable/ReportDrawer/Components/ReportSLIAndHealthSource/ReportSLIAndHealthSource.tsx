/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState, useEffect } from 'react'
import { SRMAnalysisStepDetailDTO } from 'services/cv'
import { useStrings } from 'framework/strings'
import ChangeEventServiceHealth from '@cv/pages/monitored-service/components/ServiceHealth/components/ChangesAndServiceDependency/components/ChangesTable/components/ChangeCard/components/ChangeEventServiceHealth/ChangeEventServiceHealth'
import SLOAndErrorBudget from '@cv/pages/monitored-service/components/ServiceHealth/components/ChangesAndServiceDependency/components/ChangesTable/components/ChangeCard/components/SLOAndErrorBudget/SLOAndErrorBudget'
import { TWO_HOURS_IN_MILLISECONDS } from '../../ReportDrawer.constants'
import { calculateEndtime } from './ReportSLIAndHealthSource.utils'

export const ReportSLIAndHealthSource = (props: SRMAnalysisStepDetailDTO): JSX.Element => {
  const { getString } = useStrings()
  const { analysisStatus, analysisEndTime, analysisStartTime, monitoredServiceIdentifier, verifyStepSummaries } = props

  const [timeStamps, setTimestamps] = useState<[number, number]>([0, 0])

  const derivedEndTime = useMemo(() => calculateEndtime(analysisEndTime || 0), [analysisEndTime])

  useEffect(() => {
    if (analysisStartTime) {
      setTimestamps([analysisStartTime - TWO_HOURS_IN_MILLISECONDS, derivedEndTime])
    }
  }, [analysisStartTime, derivedEndTime])

  return (
    <>
      <ChangeEventServiceHealth
        monitoredServiceIdentifier={monitoredServiceIdentifier}
        startTime={analysisStartTime - TWO_HOURS_IN_MILLISECONDS}
        endTime={derivedEndTime}
        eventType={'DeploymentImpactAnalysis'}
        timeStamps={timeStamps}
        title={getString('cv.changeSource.changeSourceCard.deploymentHealth')}
        verifyStepSummaries={verifyStepSummaries}
        eventStatus={analysisStatus}
        eventEndTime={analysisEndTime}
      />
      <SLOAndErrorBudget
        monitoredServiceIdentifier={monitoredServiceIdentifier}
        startTime={timeStamps[0]}
        endTime={timeStamps[1]}
        eventType="DeploymentImpactAnalysis"
        eventTime={analysisStartTime}
        eventStatus={analysisStatus}
        eventEndTime={analysisEndTime}
      />
    </>
  )
}
