/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { Views } from '@harness/uicore'
import { TestWrapper } from '@modules/10-common/utils/testUtils'
import GraphListToggle from '../GraphListToggle'

describe('GraphListToggle', () => {
  test('should render list view', () => {
    const { getByTestId, getByText } = render(
      <TestWrapper>
        <GraphListToggle onSwitch={jest.fn()} initialView={Views.LIST} />
      </TestWrapper>
    )
    expect(getByTestId('GraphListToggleIcon')).toBeInTheDocument()
    expect(getByText('cv.monitoredServices.listAndGridViewLabel.gridView')).toBeInTheDocument()
  })

  test('should render graph view', () => {
    const { getByTestId, getByText } = render(
      <TestWrapper>
        <GraphListToggle onSwitch={jest.fn()} initialView={Views.GRID} />
      </TestWrapper>
    )
    expect(getByTestId('GraphListToggleIcon')).toBeInTheDocument()
    expect(getByText('dashboards.switchToListView')).toBeInTheDocument()
  })

  test('should able to toggle view', () => {
    const onSwitch = jest.fn()
    const { getByTestId, getByText } = render(
      <TestWrapper>
        <GraphListToggle onSwitch={onSwitch} initialView={Views.GRID} />
      </TestWrapper>
    )
    expect(getByTestId('GraphListToggleSwitch')).toBeInTheDocument()
    expect(getByText('dashboards.switchToListView')).toBeInTheDocument()
    fireEvent.click(getByTestId('GraphListToggleSwitch'))
    expect(onSwitch).toHaveBeenCalledWith(Views.LIST)
    expect(getByText('cv.monitoredServices.listAndGridViewLabel.gridView')).toBeInTheDocument()
    fireEvent.click(getByTestId('GraphListToggleSwitch'))
    expect(onSwitch).toHaveBeenCalledWith(Views.GRID)
    expect(getByText('dashboards.switchToListView')).toBeInTheDocument()
  })
})
