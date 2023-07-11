/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { NodeProps, ReactFlowProvider } from 'reactflow'
import { TestWrapper } from '@common/utils/testUtils'
import NamespaceGroupNode from '../NamespaceGroupNode'

const props: NodeProps = {
  id: 'ns1',
  data: { name: 'ns1' },
  isConnectable: true,
  dragging: false,
  selected: false,
  type: 'group',
  xPos: 0,
  yPos: 0,
  zIndex: 0
}

describe('NamespaceGroupNode', () => {
  test('render component with mock data', async () => {
    const { container } = render(
      <TestWrapper>
        <ReactFlowProvider>
          <NamespaceGroupNode {...props} />
        </ReactFlowProvider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
