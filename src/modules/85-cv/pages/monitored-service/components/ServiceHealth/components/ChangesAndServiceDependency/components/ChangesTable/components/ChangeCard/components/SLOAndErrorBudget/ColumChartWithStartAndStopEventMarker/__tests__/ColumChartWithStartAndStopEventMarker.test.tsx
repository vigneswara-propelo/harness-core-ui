/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import ColumChartWithStartAndStopEventMarker from '../ColumChartWithStartAndStopEventMarker'

describe('Should render ColumChartWithStartAndStopEventMarker', () => {
  test('with only start time', () => {
    const { container } = render(
      <TestWrapper>
        <ColumChartWithStartAndStopEventMarker startMarkerPosition={200} containerWidth={500} />
      </TestWrapper>
    )
    expect(container.querySelector('.eventMarkerCustom')).toBeInTheDocument()
    expect(container.querySelector('.overlay')).toBeInTheDocument()
    expect(container.querySelector('.overlay')).toHaveStyle({ width: '300px' })
    expect(container).toMatchSnapshot()
  })

  test('with start time and stop time', () => {
    const { container } = render(
      <TestWrapper>
        <ColumChartWithStartAndStopEventMarker
          isStopped
          startMarkerPosition={100}
          deployedOrStopMarkerPosition={300}
          containerWidth={500}
        />
      </TestWrapper>
    )
    expect(container.querySelectorAll('.eventMarkerCustom').length).toEqual(2)
    expect(container.querySelector('.overlay')).toBeInTheDocument()
    expect(container.querySelector('.overlay')).toHaveStyle({ width: '200px' })
    expect(container).toMatchSnapshot()
  })

  test('with start time and deployed time', () => {
    const { container } = render(
      <TestWrapper>
        <ColumChartWithStartAndStopEventMarker
          isStopped={false}
          startMarkerPosition={200}
          deployedOrStopMarkerPosition={300}
          containerWidth={500}
        />
      </TestWrapper>
    )
    expect(container.querySelectorAll('.eventMarkerCustom').length).toEqual(2)
    expect(container.querySelector('.overlay')).toBeInTheDocument()
    expect(container.querySelector('.overlay')).toHaveStyle({ width: '100px' })
    expect(container).toMatchSnapshot()
  })
})
