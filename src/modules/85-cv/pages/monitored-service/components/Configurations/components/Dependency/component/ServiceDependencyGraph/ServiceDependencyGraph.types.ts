/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { MonitoredServiceDTO, MonitoredServicePlatformResponse, ServiceDependencyDTO } from 'services/cv'
import { MonitoredServiceForm } from '../../../Service/Service.types'
import { DependencyMetaData } from '../SelectServiceCard.types'

export interface MonitoredServiceDependency {
  name: string
  identifier: string
  serviceRef: string
  environmentRefs: string[]
  serviceName: string
  type: MonitoredServiceDTO['type']
  dependencies?: ServiceDependencyDTO[]
}

export interface ServiceDependencyGraphProps {
  value: MonitoredServiceForm
  identifier: string
  monitoredServiceList: MonitoredServicePlatformResponse[]
  dependencyMap: Map<string, DependencyMetaData>
}
