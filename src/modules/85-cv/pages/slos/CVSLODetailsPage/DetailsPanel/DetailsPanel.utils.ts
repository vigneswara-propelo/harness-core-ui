/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { UseStringsReturn } from 'framework/strings'
import type { SLODashboardWidget } from 'services/cv'
import { EvaluationType } from '../../components/CVCreateSLOV2/CVCreateSLOV2.types'
import { SLOType } from '../../components/CVCreateSLOV2/CVCreateSLOV2.constants'

export const getEvaluationTitleAndValue = (
  getString: UseStringsReturn['getString'],
  sloDashboardWidget?: SLODashboardWidget
): { title: string; value: string } => {
  return {
    title: getString('cv.slos.evaluationType'),
    value:
      sloDashboardWidget?.evaluationType === EvaluationType.WINDOW
        ? getString('cv.slos.slis.evaluationType.window')
        : getString('common.request')
  }
}

export const shouldShowDowntimeBanner = (
  showDowntimeBanner: boolean,
  calculatingSLI?: boolean,
  recalculatingSLI?: boolean,
  sloType?: string
): boolean => showDowntimeBanner && !calculatingSLI && !recalculatingSLI && sloType === SLOType.SIMPLE

export const getDownTimeStartTimeAndEndTime = (
  chartTimeRange?: { startTime: number; endTime: number },
  sloDashboardWidget?: SLODashboardWidget
): { downtimeStartTime: number; downtimeEndTime: number } => {
  const { currentPeriodStartTime = 0, currentPeriodEndTime = 0, sloPerformanceTrend } = sloDashboardWidget ?? {}
  const downtimeStartTime = chartTimeRange?.startTime || sloPerformanceTrend?.at(0)?.timestamp || currentPeriodStartTime
  const downtimeEndTime =
    chartTimeRange?.endTime || sloPerformanceTrend?.[sloPerformanceTrend?.length - 1]?.timestamp || currentPeriodEndTime
  return { downtimeStartTime, downtimeEndTime }
}
