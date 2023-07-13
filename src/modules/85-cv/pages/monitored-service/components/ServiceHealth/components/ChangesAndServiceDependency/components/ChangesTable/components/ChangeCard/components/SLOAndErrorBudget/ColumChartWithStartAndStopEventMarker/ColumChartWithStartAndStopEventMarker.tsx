/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Color } from '@harness/design-system'
import { defaultTo } from 'lodash-es'
import StopImage from '@cv/assets/Stop.svg'
import SuccessImage from '@cv/assets/greenTick.svg'
import DeploymentImage from '@cv/assets/Deployment.svg'
import ColumnChartEventMarker from '@cv/components/ColumnChart/components/ColummnChartEventMarker/ColumnChartEventMarker'
import { ColumnChartOverlay } from './components/ColumnChartOverlay'

const DefaultColumnHeight = 110
interface ColumChartWithStartAndStopEventMarkerMarker {
  isStopped?: boolean
  deployedOrStopMarkerPosition?: number
  startMarkerPosition: number
  containerWidth: number
  columnHeight?: number
}

export default function ColumChartWithStartAndStopEventMarker({
  isStopped,
  columnHeight,
  containerWidth,
  startMarkerPosition,
  deployedOrStopMarkerPosition
}: ColumChartWithStartAndStopEventMarkerMarker): JSX.Element {
  const columnHeightDerived = defaultTo(columnHeight, DefaultColumnHeight)
  const shadowWidth = deployedOrStopMarkerPosition
    ? deployedOrStopMarkerPosition - startMarkerPosition
    : containerWidth - startMarkerPosition
  return (
    <div style={{ position: 'absolute', top: 20, display: 'flex' }}>
      <ColumnChartEventMarker
        data-testId="startMarker"
        columnHeight={columnHeightDerived}
        customMarker={DeploymentImage}
        leftOffset={startMarkerPosition}
        markerColor={Color.GREEN_400}
      />
      <ColumnChartOverlay isStopped={isStopped} startMarkerPosition={startMarkerPosition} width={shadowWidth} />
      {deployedOrStopMarkerPosition ? (
        <ColumnChartEventMarker
          data-testId="deployedOrStopMarker"
          columnHeight={columnHeightDerived}
          customMarker={isStopped ? StopImage : SuccessImage}
          leftOffset={deployedOrStopMarkerPosition}
          markerColor={isStopped ? Color.GREY_200 : Color.GREEN_400}
        />
      ) : null}
    </div>
  )
}
