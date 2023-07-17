/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { GetDataError } from 'restful-react'
import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type { RiskData } from 'services/cv'

export type ColumnData = {
  timeRange: {
    startTime: number
    endTime: number
  }
  color: string
  healthScore?: number
  riskStatus: RiskData['riskStatus']
  height: number
}

export interface ColumnChartProps {
  data: ColumnData[]
  leftOffset?: number
  columnWidth?: number
  isLoading?: boolean
  error?: GetDataError<unknown> | null
  duration?: SelectOption
  refetchOnError?: () => void
  columnHeight?: number
  hasTimelineIntegration?: boolean
  timestampMarker?: {
    timestamp: number
    color: string
  }
  multiTimeStampMarker?: {
    markerStartTime: {
      timestamp: number
      color: string
    }
    markerEndTime?: {
      timestamp: number
      color: string
    }
  }
}
