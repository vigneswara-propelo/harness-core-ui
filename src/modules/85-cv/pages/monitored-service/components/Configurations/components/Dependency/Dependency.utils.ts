/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { MonitoredServiceForm } from '../Service/Service.types'
import type { DependencyMetaData } from './component/SelectServiceCard.types'

export function updateMonitoredServiceWithDependencies(
  dependencies: DependencyMetaData[],
  monitoredService: MonitoredServiceForm
): MonitoredServiceForm {
  monitoredService.dependencies = []
  for (const dependency of dependencies || []) {
    monitoredService.dependencies.push(dependency)
  }

  return monitoredService
}

export function initializeDependencyMap(
  dependencies?: MonitoredServiceForm['dependencies']
): Map<string, DependencyMetaData> {
  const dependencyMap = new Map<string, DependencyMetaData>()
  if (!dependencies?.length) return dependencyMap

  for (const dependency of dependencies) {
    if (dependency?.monitoredServiceIdentifier) {
      dependencyMap.set(dependency.monitoredServiceIdentifier, dependency as DependencyMetaData)
    }
  }

  return dependencyMap
}

export const validateDependencyMap = (dependencies: DependencyMetaData[]): { [key: string]: string[] } => {
  const error: { [key: string]: string[] } = {}
  const infraTypeDependencies = dependencies.filter(item => item.type === 'KUBERNETES')
  const hasInfraDependency = infraTypeDependencies.length
  if (hasInfraDependency) {
    infraTypeDependencies.forEach(item => {
      const { dependencyMetadata = {}, monitoredServiceIdentifier } = item
      const missingKeys: string[] = []
      const metadataList = Object.entries(dependencyMetadata)
      metadataList.forEach(data => {
        const [key, value] = data
        if (!value || !(value as string[])?.length) {
          missingKeys.push(key)
        }
      })
      if (missingKeys.length) {
        error[monitoredServiceIdentifier] = missingKeys
      }
    })
    return error
  }
  return {}
}
