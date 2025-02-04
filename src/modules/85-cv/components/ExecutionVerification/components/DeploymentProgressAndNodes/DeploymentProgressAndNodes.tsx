/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { Container, Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import moment from 'moment'
import cx from 'classnames'
import type { AnalysedNodeOverview, VerificationOverview } from 'services/cv'
import { useStrings } from 'framework/strings'
import { VerificationJobType } from '@cv/constants'
import { FeatureFlag } from '@common/featureFlags'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { VerificationStatus } from '@cv/pages/monitored-service/components/ServiceHealth/components/ChangesAndServiceDependency/components/ChangesTable/components/ChangeEventCard/ChangeEventCard.constant'
import CVProgressBar from './components/CVProgressBar/CVProgressBar'
import { PrimaryAndCanaryNodes } from '../ExecutionVerificationSummary/components/PrimaryandCanaryNodes/PrimaryAndCanaryNodes'
import VerificationStatusCard from './components/VerificationStatusCard/VerificationStatusCard'
import { DurationView } from './components/DurationView/DurationView'
import TestsSummaryView from './components/TestSummaryView/TestsSummaryView'
import PinBaslineButton from './components/PinBaslineButton/PinBaslineButton'
import { canShowBaselineElements, canShowExpiryDateDetails, getStatusMessage } from './DeploymentProgressAndNodes.utils'
import { StatusMessageDisplay } from './components/StatusMessageDisplay/StatusMessageDisplay'
import AbortVerification from './components/AbortVerification/AbortVerification'
import css from './DeploymentProgressAndNodes.module.scss'

export interface DeploymentProgressAndNodesProps {
  data: VerificationOverview | null
  onSelectNode?: (node?: AnalysedNodeOverview) => void
  className?: string
  isConsoleView?: boolean
  activityId?: string
}

export function DeploymentProgressAndNodes(props: DeploymentProgressAndNodesProps): JSX.Element {
  const { onSelectNode, className, isConsoleView, data, activityId } = props

  const isBaselineEnabled = useFeatureFlag(FeatureFlag.SRM_ENABLE_BASELINE_BASED_VERIFICATION)

  const {
    metricsAnalysis,
    verificationStartTimestamp,
    spec,
    verificationStatus,
    baselineOverview: baselineData
  } = data || {}

  const canShowAbortVerification = verificationStatus === VerificationStatus.IN_PROGRESS

  const { getString } = useStrings()

  const deploymentNodesData = useMemo(() => {
    if (data && spec?.analysisType !== VerificationJobType.TEST) {
      const { testNodes: after = [], controlNodes: before = [] } = data || {}
      const labelBefore = (before as AnalysedNodeOverview)?.nodeType
      const labelAfter = (after as AnalysedNodeOverview)?.nodeType

      return {
        before,
        after,
        labelBefore,
        labelAfter
      }
    }
  }, [data, spec?.analysisType])

  const baselineSummaryData = useMemo(() => {
    if (spec?.analysisType === VerificationJobType.TEST) {
      const testNodes = data?.testNodes || []
      const controlNodes = data?.controlNodes

      const currentTestName = (testNodes as AnalysedNodeOverview)?.nodes?.[0]?.deploymentTag
      const currentTestDate = (testNodes as AnalysedNodeOverview)?.nodes?.[0]?.testStartTimestamp
      const baselineTestName = (controlNodes as AnalysedNodeOverview)?.nodes?.[0]?.deploymentTag
      const baselineTestDate = (controlNodes as AnalysedNodeOverview)?.nodes?.[0]?.testStartTimestamp

      return {
        baselineTestName,
        baselineTestDate,
        currentTestName,
        currentTestDate
      }
    }
  }, [data?.controlNodes, data?.testNodes, spec?.analysisType])

  const renderContent = (): JSX.Element | undefined | null => {
    if (data?.verificationProgressPercentage === 0 && data?.verificationStatus === 'IN_PROGRESS') {
      return <Text className={css.waitAFew}>{getString('pipeline.verification.waitForAnalysis')}</Text>
    }

    if (spec?.analysisType === VerificationJobType.SIMPLE) {
      return null
    }

    if (deploymentNodesData) {
      return (
        <PrimaryAndCanaryNodes
          primaryNodes={(deploymentNodesData.before as AnalysedNodeOverview)?.nodes || []}
          canaryNodes={(deploymentNodesData.after as AnalysedNodeOverview)?.nodes || []}
          primaryNodeLabel={deploymentNodesData.labelBefore as string}
          canaryNodeLabel={deploymentNodesData.labelAfter as string}
          onSelectNode={onSelectNode}
          isConsoleView={isConsoleView}
        />
      )
    }

    if (baselineSummaryData) {
      return (
        <TestsSummaryView {...baselineSummaryData} isConsoleView={isConsoleView} data={data} activityId={activityId} />
      )
    }
  }

  const statusMessage = getStatusMessage({ getString, analysisType: spec?.analysisType, verificationStatus })

  return (
    <Container className={cx(css.main, className)}>
      {canShowAbortVerification && (
        <Layout.Horizontal flex={{ justifyContent: 'flex-end' }}>
          <AbortVerification activityId={activityId} />
        </Layout.Horizontal>
      )}
      {metricsAnalysis && (
        <Container
          className={cx(css.durationAndStatus, {
            [css.flexLayout]: !isConsoleView
          })}
        >
          <Container>
            {canShowBaselineElements({
              applicableForBaseline: baselineData?.applicableForBaseline,
              isConsoleView,
              isBaselineEnabled
            }) && (
              <>
                <PinBaslineButton data={data} activityId={activityId} />

                {canShowExpiryDateDetails(baselineData) && (
                  <>
                    <Text font={{ size: 'small' }} margin={{ top: 'small', bottom: 'xsmall' }}>
                      {getString('pipeline.verification.baselineExpiryLabel')}
                    </Text>
                    <Text
                      data-testid="expiredBaselineTime"
                      font={{ size: 'small' }}
                      color={Color.BLACK}
                      margin={{ top: 'xsmall', bottom: 'xlarge' }}
                    >
                      {moment(baselineData?.baselineExpiryTimestamp).format('MMM D, YYYY h:mm A')}
                    </Text>
                  </>
                )}
              </>
            )}

            <Text
              font={{ size: 'small' }}
              data-name={getString('pipeline.startedOn')}
              margin={{ top: 'xsmall', bottom: 'xsmall' }}
            >
              {getString('pipeline.startedOn')}: {moment(verificationStartTimestamp).format('MMM D, YYYY h:mm A')}
            </Text>
            <DurationView durationMs={(data?.spec?.durationInMinutes ? data?.spec?.durationInMinutes : 0) * 60000} />
          </Container>
          {metricsAnalysis && !isConsoleView && <VerificationStatusCard status={data?.verificationStatus} />}
        </Container>
      )}
      <CVProgressBar
        value={data?.verificationProgressPercentage ?? 0}
        status={data?.verificationStatus}
        className={css.progressBar}
      />
      {metricsAnalysis && isConsoleView && <VerificationStatusCard status={data?.verificationStatus} />}
      <StatusMessageDisplay message={statusMessage} messageTestId="statusMessageDisplay" />
      {renderContent()}
    </Container>
  )
}
