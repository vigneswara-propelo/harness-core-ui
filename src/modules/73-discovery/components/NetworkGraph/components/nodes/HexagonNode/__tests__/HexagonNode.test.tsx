/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import { NodeProps, ReactFlowProvider } from 'reactflow'
import { TestWrapper } from '@common/utils/testUtils'
import HexagonNode from '../HexagonNode'

jest.mock('@discovery/components/ServiceDetails/ServiceDetails', () => ({
  ...jest.requireActual('@discovery/components/ServiceDetails/ServiceDetails'),
  __esModule: true,
  default: () => {
    return <div className={'service-details'}>Service Details</div>
  }
}))

const props: NodeProps = {
  id: 'a1',
  data: { name: 'a1' },
  isConnectable: true,
  dragging: false,
  selected: false,
  type: 'hexagon',
  xPos: 0,
  yPos: 0,
  zIndex: 1
}

describe('HexagonNode', () => {
  test('render component with mock data', async () => {
    const { container } = render(
      <TestWrapper>
        <ReactFlowProvider>
          <HexagonNode {...props} />
        </ReactFlowProvider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('render component with mock data with data field missing name', async () => {
    const newProps = { ...props, data: { id: 'a1' } }
    const { container } = render(
      <TestWrapper>
        <ReactFlowProvider>
          <HexagonNode {...newProps} />
        </ReactFlowProvider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('test node click', async () => {
    const { container } = render(
      <TestWrapper>
        <ReactFlowProvider>
          <HexagonNode {...props} />
        </ReactFlowProvider>
      </TestWrapper>
    )

    const nodeContainer = container.querySelector('.nodeContainer')
    if (!nodeContainer) {
      throw Error('no element found')
    }
    act(() => {
      fireEvent.click(nodeContainer)
    })

    expect(container).toMatchSnapshot()
  })
})
