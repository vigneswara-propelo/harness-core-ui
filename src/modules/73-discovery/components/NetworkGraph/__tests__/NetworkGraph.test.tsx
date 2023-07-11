/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { ReactFlowProvider } from 'reactflow'
import { TestWrapper } from '@common/utils/testUtils'
import NetworkGraph from '../NetworkGraph'
import { mockEdges, mockNodes } from './mockData'
import { mockReactFlow } from './mocks'

jest.mock('../utils/getLayoutedElements', () => ({
  getLayoutedElements: jest.fn().mockImplementation(() =>
    Promise.resolve({
      data: { nodes: mockNodes, edges: mockEdges }
    })
  )
}))

beforeEach(() => mockReactFlow())

describe('NetworkGraph', () => {
  test('render component with mock data', async () => {
    const { container } = render(
      <TestWrapper>
        <ReactFlowProvider>
          <NetworkGraph nodes={mockNodes} edges={mockEdges} onNodeClick={() => void 0} />
        </ReactFlowProvider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
