/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getLayoutedElements } from '../getLayoutedElements'
import { mockEdges, mockElkGraph, mockNodes } from '../../__tests__/mockData'

describe('getLayoutedElements', () => {
  test('test function wih mock data', async () => {
    const graph = await getLayoutedElements({ nodes: mockNodes, edges: mockEdges })
    expect(graph).toStrictEqual(mockElkGraph)
  })
})
