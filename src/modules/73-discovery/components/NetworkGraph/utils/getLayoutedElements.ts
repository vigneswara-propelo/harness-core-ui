/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import ELK, { ElkExtendedEdge, ElkNode } from 'elkjs/lib/elk.bundled'
import type { Edge } from 'reactflow'
import type { LayoutedGraph } from '../types'
import { NodeTypes } from '../constants'

const elk = new ELK()

const options = {
  'elk.algorithm': 'stress'
}

export async function getLayoutedElements({ nodes, edges }: LayoutedGraph): Promise<LayoutedGraph> {
  // Generate elk graph node from reactflow node structure
  // Get the group nodes
  const groupNodes = nodes.filter(node => node.type === NodeTypes.Group)

  // Create parent elk nodes with it's children and edges
  const parentNodes = groupNodes.map(groupNode => {
    return {
      ...groupNode,
      children: nodes
        .filter(node => node.parentNode === groupNode.id)
        .map(node => ({
          ...node,
          // Adjust the target and source handle positions based on the layout
          // direction.
          targetPosition: 'top',
          sourcePosition: 'bottom',

          // Hardcode a width and height for elk to use when layouting.
          width: 100,
          height: 100
        })),
      edges: edges.filter(
        edge => /* istanbul ignore next */ edge.data?.parentNode === groupNode.id
      ) as unknown as ElkExtendedEdge[]
    }
  })

  const graph: ElkNode = {
    id: 'root',
    layoutOptions: options,
    children: parentNodes.map(node => ({
      ...node,
      // Hardcode a width and height for elk to use when layouting.
      width: 0,
      height: 0
    })),
    edges: edges as unknown as ElkExtendedEdge[]
  }

  const elkGraph = await elk.layout(graph)

  /* istanbul ignore next */
  const flattenedNodes = elkGraph?.children?.map(node => ({
    ...node,
    // React Flow expects a position property on the node instead of `x`
    // and `y` fields.
    position: { x: node.x, y: node.y }
  }))

  /* istanbul ignore next */
  elkGraph?.children?.map(node => {
    if (node.children) {
      /* istanbul ignore next */
      flattenedNodes?.push(
        ...node.children.map(n => ({
          ...n,
          // React Flow expects a position property on the node instead of `x`
          // and `y` fields.
          position: { x: n.x, y: n.y }
        }))
      )
    }
  })

  const layoutedGraph = {
    nodes: flattenedNodes,
    edges: elkGraph.edges as unknown as Edge<unknown>[]
  } as LayoutedGraph

  return layoutedGraph
}
