/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { Node, Edge } from 'reactflow'
import { NodeTypes, nodeGroupOptions, nodeOptions } from '@discovery/components/NetworkGraph/constants'
import type {
  ApiCreateNetworkMapRequest,
  ApiListDiscoveredServiceConnection,
  ApiListDiscoveredService
} from 'services/servicediscovery'
import type {
  NetworkMapEdgeData,
  NetworkMapNodeData,
  ServiceEdgeData,
  ServiceNodeData
} from '@discovery/components/NetworkGraph/types'

export function getGraphNodesFromServiceList(
  serviceList: ApiListDiscoveredService | null
): Node<ServiceNodeData, NodeTypes>[] {
  if (!serviceList) return []

  const namespaces = new Set<string>()
  const graphNodes: Node<ServiceNodeData, NodeTypes>[] = []
  serviceList.items?.map(service => {
    const namespace = service.spec.kubernetes?.namespace
    if (namespace && !namespaces.has(namespace)) {
      namespaces.add(namespace)
    }

    if (service.id)
      graphNodes.push({
        ...nodeOptions,
        id: service.id,
        data: { ...service, name: service.spec.kubernetes?.name ?? 'service' },
        parentNode: namespace
      })
  })

  namespaces.forEach(value => {
    graphNodes.push({
      ...nodeGroupOptions,
      id: value,
      data: { id: value, name: value }
    })
  })

  return graphNodes
}

export function getGraphEdgesFromServiceConnections(
  connectionList: ApiListDiscoveredServiceConnection | null
): Edge<ServiceEdgeData>[] {
  if (!connectionList) return []

  const graphEdges: Edge<ServiceEdgeData>[] = []

  connectionList.items?.map(connection => {
    if (connection.id && connection.sourceID && connection.destinationID)
      graphEdges.push({
        id: connection.id,
        source: connection.sourceID,
        target: connection.destinationID,
        data: { parentNode: connection.sourceNamespace, ...connection }
      })
  })

  return graphEdges
}

export function getGraphNodesFromNetworkMap(
  networkMap: ApiCreateNetworkMapRequest | undefined
): Node<NetworkMapNodeData, NodeTypes>[] {
  if (!networkMap) return []

  const namespaces = new Set<string>()
  const graphNodes: Node<NetworkMapNodeData, NodeTypes>[] = []

  networkMap.resources?.map(service => {
    const namespace = service.kubernetes?.namespace
    if (namespace && !namespaces.has(namespace)) {
      namespaces.add(namespace)
    }

    if (service.id)
      graphNodes.push({
        ...nodeOptions,
        type: NodeTypes.NetworkMapHexagon,
        id: service.id,
        data: service,
        parentNode: namespace
      })
  })

  namespaces.forEach(value => {
    graphNodes.push({
      ...nodeGroupOptions,
      id: value,
      data: { id: value, name: value, kind: 'discoveredservice' }
    })
  })

  return graphNodes
}

export function getGraphEdgesFromNetworkMap(
  networkMap: ApiCreateNetworkMapRequest | undefined
): Edge<NetworkMapEdgeData>[] {
  if (!networkMap) return []

  const graphEdges: Edge<NetworkMapEdgeData>[] = []

  networkMap.connections?.map(connection => {
    if (connection.from?.id && connection.to?.id)
      graphEdges.push({
        id: `${connection.from.id}-${connection.to.id}`,
        source: connection.from.id,
        target: connection.to.id,
        data: { ...connection, parentNode: connection.from.kubernetes?.namespace }
      })
  })

  return graphEdges
}
