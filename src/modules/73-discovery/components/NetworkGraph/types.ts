/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { LayoutOptions } from 'elkjs/lib/elk.bundled'
import type { Node, Edge } from 'reactflow'
import type {
  ApiCustomServiceConnection,
  DatabaseConnection,
  DatabaseK8SCustomServiceCollection,
  DatabaseNetworkMapEntity
} from 'services/servicediscovery'

export interface LayoutedGraph {
  nodes: Node<unknown, string | undefined>[]
  edges: Edge<EdgeData>[]
  options?: LayoutOptions
}

export interface EdgeData {
  parentNode?: string
}

export type ServiceNodeData = DatabaseK8SCustomServiceCollection
export type ServiceEdgeData = EdgeData & ApiCustomServiceConnection

export type NetworkMapNodeData = DatabaseNetworkMapEntity
export type NetworkMapEdgeData = EdgeData & DatabaseConnection
