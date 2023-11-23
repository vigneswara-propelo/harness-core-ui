/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { MonitoredServiceDTO } from 'services/cv'

export interface ServiceCardInterfaceProps {
  monitoredService: MonitoredServiceDTO
  dependencyMetaData?: DependencyMetaData
  onChange: (isChecked: boolean, dependencyMetaData?: DependencyMetaData) => void
  error?: Record<string, unknown>
}

export interface ServiceCardWithAccordianInterfaceProps {
  id: string
  summary: React.ReactNode
  details: JSX.Element
}

export interface DependencyMetaData {
  monitoredServiceIdentifier: string
  dependencyMetadata?: Record<string, unknown>
  type?: 'KUBERNETES'
}

export interface InfrastructureDependencyMetaData extends DependencyMetaData {
  dependencyMetadata: {
    namespace?: string
    workload?: string
    workloads?: string[]
  }
}
