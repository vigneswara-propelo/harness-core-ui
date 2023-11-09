/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState, useEffect } from 'react'
import { clone } from 'lodash-es'
import { DependencyGraph } from '@modules/85-cv/components/DependencyGraph/DependencyGraph'
import { getDependencyGraphOptions } from '@modules/85-cv/pages/monitored-service/CVMonitoredService/components/MonitoredServiceGraphView/MonitoredServiceGraphView.utils'
import { getDependencyLinks, getEnvironmentRef, getNodes } from './ServiceDependencyGraph.utils'
import { MonitoredServiceDependency, ServiceDependencyGraphProps } from './ServiceDependencyGraph.types'

export const ServiceDependencyGraph = ({
  value,
  identifier,
  monitoredServiceList,
  dependencyMap
}: ServiceDependencyGraphProps): JSX.Element => {
  const [defaultNode, setDefaultNode] = useState<MonitoredServiceDependency>()
  const [savedNodes, setSavedNodes] = useState<Array<MonitoredServiceDependency>>([])

  const currentMonitoredServiceList = monitoredServiceList.find(item => item.identifier === identifier)

  useEffect(() => {
    const copyDependencies = clone(value.dependencies)
    if (currentMonitoredServiceList || !value.isEdit) {
      setDefaultNode({
        name: value.name,
        identifier: value.identifier,
        serviceRef: value.serviceRef,
        environmentRefs: getEnvironmentRef(identifier, value),
        serviceName: currentMonitoredServiceList?.serviceName || '',
        type: value.type,
        dependencies: copyDependencies
      })
    }
  }, [currentMonitoredServiceList])

  useEffect(() => {
    const dependenciesList = Array.from(dependencyMap.keys())
    if (dependenciesList.length && monitoredServiceList.length) {
      const filteredMS = monitoredServiceList.filter(service => dependenciesList.includes(service?.identifier || ''))

      const checkedNodes = filteredMS.map(service => {
        return {
          name: service.name,
          identifier: service.identifier,
          serviceRef: service.serviceRef,
          environmentRefs: service.environmentRefs,
          serviceName: service.serviceName,
          type: service.type,
          dependencies: []
        }
      })

      setSavedNodes(oldNodes => {
        const oldIds = oldNodes.map(item => item.identifier)
        const removedDuplicates = checkedNodes.filter(item => !oldIds.includes(item.identifier || ''))
        return [...oldNodes, ...(removedDuplicates as MonitoredServiceDependency[])]
      })
    }
  }, [Array.from(dependencyMap.keys()).join(' '), monitoredServiceList.length])

  const mslist = useMemo(() => {
    return [{ ...(defaultNode as MonitoredServiceDependency) }, ...savedNodes]
  }, [defaultNode, savedNodes])

  const graphData = useMemo(() => {
    return {
      data: getDependencyLinks(mslist, value.identifier, Array.from(dependencyMap.keys())) || [],
      nodes: getNodes(mslist, value.identifier, Array.from(dependencyMap.keys())) || []
    }
  }, [dependencyMap, mslist, value.identifier])

  return (
    <>
      {(Boolean(graphData.data.length) || Boolean(graphData.nodes.length)) && (
        <DependencyGraph dependencyData={graphData} options={getDependencyGraphOptions(() => void 0, 500)} />
      )}
    </>
  )
}
