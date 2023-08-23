/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { IconName, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { HarnessSRMAnalysisEventMetadata, VerifyStepSummary } from 'services/cv'
import { useStrings } from 'framework/strings'
import type { PipelineExecutionSummary } from 'services/pipeline-ng'
import { AnalysisStatus } from '@cv/components/AnalyzeDeploymentImpact/AnalyzeDeploymentImpact.constants'
import css from './VerificationStatusCard.module.scss'

export default function VerificationStatusCard({
  status
}: {
  status:
    | VerifyStepSummary['verificationStatus']
    | PipelineExecutionSummary['status']
    | HarnessSRMAnalysisEventMetadata['analysisStatus']
}) {
  let statusMessage: string | undefined = undefined
  let color: Color | undefined = undefined
  let backgroundColor: Color | undefined = undefined
  let icon = ''
  let iconColor = ''
  let iconSize = 12
  const { getString } = useStrings()
  switch (status) {
    case 'NOT_STARTED':
      statusMessage = getString('cv.dashboard.notStarted')
      color = Color.PRIMARY_2
      backgroundColor = Color.PRIMARY_6
      break
    case 'IN_PROGRESS':
      statusMessage = getString('inProgress')
      color = Color.PRIMARY_2
      backgroundColor = Color.PRIMARY_6
      icon = 'deployment-inprogress-new'
      break
    case 'RUNNING':
      statusMessage = getString('pipeline.executionStatus.Running')
      color = Color.PRIMARY_2
      backgroundColor = Color.PRIMARY_6
      iconColor = Color.WHITE
      icon = 'loading'
      break
    case 'VERIFICATION_FAILED':
    case 'Failed':
    case 'IgnoreFailed':
      statusMessage = getString('failed')
      color = Color.RED_900
      backgroundColor = Color.RED_50
      icon = 'warning-sign'
      iconColor = Color.RED_900
      iconSize = 9
      break
    case 'ERROR':
    case 'Errored':
      statusMessage = getString('error')
      color = Color.RED_900
      backgroundColor = Color.RED_50
      icon = 'warning-sign'
      iconColor = Color.RED_900
      iconSize = 9
      break
    case 'VERIFICATION_PASSED':
      statusMessage = getString('passed')
      color = Color.GREEN_800
      backgroundColor = Color.GREEN_50
      icon = 'tick-circle'
      iconColor = Color.GREEN_800
      break
    case AnalysisStatus.COMPLETED:
      statusMessage = getString('success')
      color = Color.GREEN_700
      backgroundColor = Color.GREEN_100
      icon = 'success-tick'
      break
    case 'ABORTED':
      statusMessage = getString('ce.co.ruleState.stopped')
      color = Color.BLACK
      backgroundColor = Color.GREY_200
      icon = 'circle-stop'
      break
    default:
      statusMessage = status
  }
  if (!statusMessage) {
    return null
  }

  const iconColorProp = iconColor ? { color: iconColor } : {}
  return (
    <Text
      className={css.verificationStatusCard}
      icon={icon as IconName}
      background={backgroundColor}
      color={color}
      iconProps={{ ...iconColorProp, size: iconSize }}
    >
      {statusMessage}
    </Text>
  )
}
