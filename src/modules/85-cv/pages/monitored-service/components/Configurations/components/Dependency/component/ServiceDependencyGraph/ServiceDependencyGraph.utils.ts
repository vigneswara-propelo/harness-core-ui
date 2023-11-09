/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { SelectOption } from '@harness/uicore'
import { getIconForServiceNode } from '@modules/85-cv/components/DependencyGraph/DependencyGraph.utils'
import { Node } from '@cv/components/DependencyGraph/DependencyGraph.types'
import { MonitoredServiceDependency } from './ServiceDependencyGraph.types'
import { MonitoredServiceForm } from '../../../Service/Service.types'

export const getDependencyLinks = (
  data: MonitoredServiceDependency[],
  identifier: string,
  newNodes: string[]
): { to: string; from: string }[] => {
  data.forEach(service => {
    if (service.identifier === identifier) {
      service.dependencies?.splice(0, service.dependencies?.length)
      newNodes.forEach(newNode => {
        service.dependencies?.push({ monitoredServiceIdentifier: newNode })
      })
    } else {
      service.dependencies = []
    }
  })

  const dependencyLinks: { to: string; from: string }[] = []
  data.forEach(service => {
    service?.dependencies
      ?.filter(dep => [...newNodes].includes(dep.monitoredServiceIdentifier || ''))
      ?.forEach(dep => {
        dependencyLinks.push({ from: dep.monitoredServiceIdentifier || '', to: service.identifier || '' })
      })
  })

  return dependencyLinks
}

export const getNodes = (data: MonitoredServiceDependency[], identifier: string, newNodes: string[]): Node[] => {
  const filteredServices = data
    ?.filter(service => [...newNodes, identifier].includes(service.identifier || ''))
    .map(service => {
      return {
        id: service.identifier || '',
        serviceRef: service.serviceRef || '',
        environmentRef: service.environmentRefs?.[0] || '',
        status: 'NO_DATA' as Node['status'],
        icon: getIconForServiceNode(service),
        name: service?.serviceName || service.serviceRef || '',
        type: service?.type
      }
    })

  return filteredServices
}

export const getEnvironmentRef = (identifier: string, value: MonitoredServiceForm): string[] => {
  const envlistArray =
    value.type === 'Application'
      ? [(value?.environmentRef as unknown as SelectOption)?.value as string]
      : (value?.environmentRef as unknown as SelectOption[])?.map(item => item.value as string)

  if (identifier) {
    if (value.environmentRefList?.length) {
      return value.environmentRefList
    } else {
      return value.type === 'Application' ? [value?.environmentRef as string] : envlistArray ?? []
    }
  } else {
    return value.type === 'Application' ? [value?.environmentRef as string] : envlistArray ?? []
  }
}
