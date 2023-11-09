/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { MonitoredServiceDependency } from '../ServiceDependencyGraph.types'

export const value = {
  isEdit: true,
  name: 'User_Login_version1',
  identifier: 'User_Login_version1',
  description: '',
  tags: '{}',
  serviceRef: 'User_Login',
  type: 'Application',
  notificationRuleRefs: '[]',
  environmentRef: 'version1',
  environmentRefList: '["version1"]',
  sources: '{changeSources: Array(0), healthSources: Array(1)}',
  dependencies: [
    { monitoredServiceIdentifier: 'datadoglogs_version1' },
    { monitoredServiceIdentifier: 'dynatrace_version1' },
    {
      monitoredServiceIdentifier: 'dummy',
      type: 'KUBERNETES',
      dependencyMetadata: {
        namespace: 'custom-metrics',
        workload: 'custom-metrics-stackdriver-adapter',
        type: 'KUBERNETES',
        supportedChangeSourceTypes: ['K8sCluster']
      }
    }
  ],
  isMonitoredServiceEnabled: true
}

export const filteredList: MonitoredServiceDependency[] = [
  {
    name: 'Service 1',
    identifier: 'MS1',
    serviceRef: 'service1',
    environmentRefs: ['env1'],
    serviceName: 'Service 1',
    type: 'Application',
    dependencies: [{ monitoredServiceIdentifier: 'MS2' }]
  },
  {
    name: 'Service 2',
    identifier: 'MS2',
    serviceRef: 'service2',
    environmentRefs: ['env2'],
    serviceName: 'Service 2',
    type: 'Application',
    dependencies: []
  }
]

export const nodesList = [
  {
    environmentRef: 'env1',
    icon: 'dependency-default-icon',
    id: 'MS1',
    name: 'Service 1',
    serviceRef: 'service1',
    status: 'NO_DATA',
    type: 'Application'
  },
  {
    environmentRef: 'env2',
    icon: 'dependency-default-icon',
    id: 'MS2',
    name: 'Service 2',
    serviceRef: 'service2',
    status: 'NO_DATA',
    type: 'Application'
  }
]

export const emptyNode = {
  environmentRef: '',
  icon: 'dependency-default-icon',
  id: '',
  name: '',
  serviceRef: '',
  status: 'NO_DATA',
  type: undefined
}
