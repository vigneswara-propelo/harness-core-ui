/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { ConnectionLineType, Edge, Node, MarkerType } from 'reactflow'

export enum NodeTypes {
  Hexagon = 'hexagon',
  Group = 'group',
  NetworkMapHexagon = 'networkMapHexagon'
}

export const connectionLineType = ConnectionLineType.Straight

export const edgeOptions: Partial<Edge> = {
  animated: true,
  type: connectionLineType,
  markerEnd: { type: MarkerType.ArrowClosed }
}

export const nodeOptions: Omit<Node<unknown, NodeTypes>, 'id' | 'data'> = {
  position: { x: 0, y: 0 },
  width: 150,
  height: 150,
  type: NodeTypes.Hexagon,
  expandParent: true
}

export const nodeGroupOptions: Omit<Node<unknown, NodeTypes>, 'id' | 'data'> = {
  position: { x: 0, y: 0 },
  type: NodeTypes.Group,
  style: {
    border: '2px dashed var(--purple-600)',
    background: 'rgba(246, 241, 255, 0.30)'
  }
}
