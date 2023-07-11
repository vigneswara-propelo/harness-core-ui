/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  Node
} from 'reactflow'

import 'reactflow/dist/style.css'
import { getLayoutedElements } from './utils/getLayoutedElements'
import HexagonNode from './components/nodes/HexagonNode/HexagonNode'
import { connectionLineType, edgeOptions } from './constants'
import type { LayoutedGraph } from './types'
import NamespaceGroupNode from './components/nodes/NamspaceGroupNode/NamespaceGroupNode'

export type NetworkGraphProps = Omit<LayoutedGraph, 'options'> & {
  onNodeClick: (node: Node) => void
  isNodeConnectable?: boolean
}

const nodeTypes = {
  hexagon: HexagonNode,
  group: NamespaceGroupNode
}

const proOptions = { hideAttribution: true }

export default function NetworkGraph({
  nodes: initialNodes,
  edges: initialEdges,
  onNodeClick,
  isNodeConnectable = false
}: NetworkGraphProps): React.ReactElement {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const { fitView } = useReactFlow()

  // This line is being ignored as reactflow doesn't actually render the nodes and edges
  // in a test environment https://github.com/wbkd/react-flow/issues/716.
  // Due to his the user connections with mouse events can't be tested.
  /* istanbul ignore next */
  const onConnect = React.useCallback(
    params => setEdges(eds => addEdge({ ...params }, eds)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )
  const onLayout = React.useCallback(
    // These lines are being ignored as reactflow doesn't actually render the nodes and edges
    // in a test environment https://github.com/wbkd/react-flow/issues/716.
    // Because of this the nodes and edges after the initial render can't be mocked.
    /* istanbul ignore next */
    ({ useInitialNodes = false }) => {
      const ns = useInitialNodes ? initialNodes : nodes
      const es = useInitialNodes ? initialEdges : edges

      getLayoutedElements({ nodes: ns, edges: es }).then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
        setNodes(layoutedNodes)
        setEdges(layoutedEdges)

        window.requestAnimationFrame(() => fitView())
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nodes, edges]
  )

  // Calculate the initial layout on mount.
  React.useLayoutEffect(() => {
    onLayout({ useInitialNodes: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      nodesConnectable={isNodeConnectable}
      onConnect={onConnect}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      connectionLineType={connectionLineType}
      defaultEdgeOptions={edgeOptions}
      proOptions={proOptions}
      fitView
      // These lines are being ignored as reactflow doesn't actually render the nodes and edges
      // in a test environment https://github.com/wbkd/react-flow/issues/716.
      // Because of this the nodes click via jest can't be tested.
      onNodeClick={/* istanbul ignore next */ (_, node) => onNodeClick(node)}
    >
      <Controls />
      <MiniMap zoomable pannable />
      <Background variant={BackgroundVariant.Dots} color="#aaa" gap={16} size={1} />
    </ReactFlow>
  )
}
