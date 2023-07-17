/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState, useEffect } from 'react'
import { defaultTo } from 'lodash-es'
import { Divider } from '@blueprintjs/core'
import { Card, Container, Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import moment from 'moment'
import type { ChangeEventDTO, HarnessSRMAnalysisEventMetadata } from 'services/cv'
import { useStrings } from 'framework/strings'
import ChangeEventServiceHealth from '@cv/pages/monitored-service/components/ServiceHealth/components/ChangesAndServiceDependency/components/ChangesTable/components/ChangeCard/components/ChangeEventServiceHealth/ChangeEventServiceHealth'
import SLOAndErrorBudget from '@cv/pages/monitored-service/components/ServiceHealth/components/ChangesAndServiceDependency/components/ChangesTable/components/ChangeCard/components/SLOAndErrorBudget/SLOAndErrorBudget'
import { useGetExecutionDetailV2 } from 'services/pipeline-ng'
import type { PipelineType, ExecutionPathProps } from '@common/interfaces/RouteInterfaces'
import { UserLabel } from '@common/exports'
import { ChangeSourceTypes } from '@cv/pages/ChangeSource/ChangeSourceDrawer/ChangeSourceDrawer.constants'
import type { ChangeTitleData, ChangeDetailsDataInterface } from '../../../ChangeEventCard.types'
import { createChangeTitleData, createChangeDetailsData } from '../../../ChangeEventCard.utils'
import ChangeDetails from '../../ChangeDetails/ChangeDetails'
import DeploymentTimeDuration from '../../DeploymentTimeDuration/DeploymentTimeDuration'
import { TWO_HOURS_IN_MILLISECONDS } from '../../../ChangeEventCard.constant'
import { durationAsString } from '../../DeploymentTimeDuration/DeploymentTimeDuration.utils'
import ChangeTitleWithRedirectButton from '../../ChangeTitleWithRedirectButton/ChangeTitleWithRedirectButton'
import { TIME_FORMAT } from '../../DeploymentTimeDuration/DeploymentTimeDuration.constant'
import StatusChip from '../../ChangeDetails/components/StatusChip/StatusChip'
import { statusToColorMapping } from '../../ChangeDetails/ChangeDetails.utils'
import css from '../../../ChangeEventCard.module.scss'

export default function SRMStepAnalysis({ data }: { data: ChangeEventDTO }): JSX.Element {
  const { getString } = useStrings()
  const [timeStamps, setTimestamps] = useState<[number, number]>([0, 0])
  const changeDetailsData: ChangeDetailsDataInterface = useMemo(() => createChangeDetailsData(data), [])
  const metadata: HarnessSRMAnalysisEventMetadata = defaultTo(data.metadata, {})
  const { artifactType = '', artifactTag = '', verifyStepSummaries } = metadata
  const changeInfoData = { artifactType, artifactTag }

  const { orgIdentifier, projectIdentifier, accountId } = useParams<PipelineType<ExecutionPathProps>>()

  const { data: executionDetails, loading } = useGetExecutionDetailV2({
    planExecutionId: defaultTo(metadata.planExecutionId, ''),
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      stageNodeId: metadata.stageStepId
    }
  })

  const { pipelineExecutionSummary } = defaultTo(executionDetails?.data, {})
  const { name: pipelineName, runSequence } = defaultTo(pipelineExecutionSummary, {})

  const changeTitleData: ChangeTitleData = useMemo(
    () => createChangeTitleData(data, pipelineName, runSequence, metadata.analysisStatus),
    [pipelineExecutionSummary]
  )

  const timePassed = useMemo(() => {
    /* istanbul ignore else */ if (metadata.analysisStartTime && metadata.analysisEndTime) {
      return durationAsString(metadata.analysisEndTime, moment().valueOf())
    }
    return ''
  }, [metadata.analysisStartTime, metadata.analysisEndTime])

  const { triggeredBy, triggerType } = defaultTo(pipelineExecutionSummary?.executionTriggerInfo, {})
  const { identifier, extraInfo } = defaultTo(triggeredBy, {})

  const { color, backgroundColor } = statusToColorMapping(metadata.analysisStatus, data.type) || {}

  useEffect(() => {
    if (data.type === ChangeSourceTypes.SrmStepAnalysis) {
      setTimestamps([
        data.metadata.analysisStartTime - TWO_HOURS_IN_MILLISECONDS,
        data.metadata.analysisEndTime + TWO_HOURS_IN_MILLISECONDS
      ])
    }
  }, [data.type])

  return (
    <Card className={css.main}>
      {!loading && <ChangeTitleWithRedirectButton changeTitleData={changeTitleData} />}
      <Container margin={{ top: 'medium', bottom: 'medium' }} height={1} background={Color.GREY_200} />

      <ChangeDetails
        ChangeDetailsData={{
          ...changeDetailsData,
          details: changeInfoData,
          executedBy: {
            shouldVisible: true,
            component: (
              <>
                <Layout.Vertical width="100%">
                  <Layout.Horizontal
                    flex={{ justifyContent: 'flex-start', alignItems: 'center' }}
                    spacing="small"
                    margin={{ bottom: 'medium' }}
                  >
                    <UserLabel
                      name={identifier || extraInfo?.email}
                      email={extraInfo?.email}
                      iconProps={{ size: 16 }}
                      textProps={{ font: { size: 'small' }, color: Color.BLACK_100 }}
                    />
                    <Divider className={css.verticalDivider} />
                    <Text font={{ size: 'small' }} margin={{ left: 'small', right: 'small' }} color={Color.BLACK_100}>
                      {triggerType}
                    </Text>

                    <Text
                      icon={'calendar'}
                      iconProps={{ size: 12, color: Color.PRIMARY_7 }}
                      font={{ size: 'small' }}
                      color={Color.BLACK_100}
                    >
                      {timePassed}
                      {getString('cv.changeSource.changeSourceCard.ago')}
                    </Text>
                  </Layout.Horizontal>
                  <DeploymentTimeDuration
                    startTime={data.metadata.analysisStartTime}
                    endTime={data.metadata.analysisEndTime}
                    type={data.type}
                  />
                </Layout.Vertical>
              </>
            )
          },
          deploymentImpactAnalysis: {
            shouldVisible: true,
            component: (
              <Layout.Vertical spacing="small">
                <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'center' }} spacing="small">
                  <Text font={{ size: 'small' }} margin={{ left: 'small', right: 'small' }} color={Color.BLACK_100}>
                    Analysis Duration: 2 Days
                  </Text>
                  <Text icon={'time'} iconProps={{ size: 12 }} font={{ size: 'small' }}>
                    {`${moment(metadata.analysisStartTime).format(TIME_FORMAT)} to ${moment(
                      metadata.analysisStartTime
                    ).format(TIME_FORMAT)}`}
                  </Text>
                </Layout.Horizontal>
                {metadata.analysisStatus && (
                  <StatusChip status={metadata.analysisStatus} color={color} backgroundColor={backgroundColor} />
                )}
              </Layout.Vertical>
            )
          }
        }}
      />

      <Container margin={{ top: 'medium', bottom: 'medium' }} height={1} background={Color.GREY_200} />
      {data.eventTime && data.monitoredServiceIdentifier && (
        <>
          <ChangeEventServiceHealth
            monitoredServiceIdentifier={data.monitoredServiceIdentifier}
            startTime={data.metadata.analysisStartTime - TWO_HOURS_IN_MILLISECONDS}
            endTime={data.metadata.analysisEndTime + TWO_HOURS_IN_MILLISECONDS}
            eventType={data.type}
            timeStamps={timeStamps}
            setTimestamps={setTimestamps}
            title={getString('cv.monitoredServices.monitoredServiceTabs.serviceHealth')}
            verifyStepSummaries={verifyStepSummaries}
          />
          <SLOAndErrorBudget
            monitoredServiceIdentifier={data.monitoredServiceIdentifier}
            startTime={data.metadata.analysisStartTime - TWO_HOURS_IN_MILLISECONDS}
            endTime={data.metadata.analysisEndTime + TWO_HOURS_IN_MILLISECONDS}
            eventTime={data.metadata.analysisStartTime}
            eventType={data.type}
          />
        </>
      )}
    </Card>
  )
}
