/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container } from '@harness/uicore'
import { Color } from '@harness/design-system'
import css from './ColumnChartOverlay.module.scss'

export const ColumnChartOverlay = ({
  width,
  isStopped,
  startMarkerPosition
}: {
  startMarkerPosition: number
  width: number
  isStopped?: boolean
}): JSX.Element => (
  <Container
    width={width}
    className={css.overlay}
    style={{ left: startMarkerPosition }}
    background={isStopped ? Color.GREY_200 : Color.GREEN_200}
  />
)
