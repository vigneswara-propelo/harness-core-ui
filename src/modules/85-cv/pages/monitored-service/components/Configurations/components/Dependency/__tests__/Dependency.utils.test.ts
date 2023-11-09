/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ServiceDependencyDTO } from 'services/cv'
import type { MonitoredServiceForm } from '../../Service/Service.types'
import { KUBERNETES_TYPE } from '../component/SelectServiceCard.constants'
import { DependencyMetaData } from '../component/SelectServiceCard.types'
import { updateMonitoredServiceWithDependencies, initializeDependencyMap } from '../Dependency.utils'
import { intialDependencies } from './Dependency.mock'

const dependencies = [
  { monitoredServiceIdentifier: '1234_iden' },
  {
    monitoredServiceIdentifier: '4345_iden',
    type: KUBERNETES_TYPE,
    dependencyMetadata: {
      namespace: 'namspace1',
      workload: 'workload1'
    }
  } as DependencyMetaData
]

const form: MonitoredServiceForm = {
  identifier: '2334_iden',
  name: 'monitoredService1',
  serviceRef: '1234_service',
  environmentRef: '1234_envRef',
  tags: {},
  type: 'Application',
  isEdit: false,
  dependencies: dependencies as ServiceDependencyDTO[]
}

describe('Validate utils', () => {
  test('Ensure updateMonitoredServiceWithDependencies works as expected', async () => {
    expect(updateMonitoredServiceWithDependencies(dependencies, form)).toEqual({
      dependencies: [
        {
          monitoredServiceIdentifier: '1234_iden'
        },
        {
          dependencyMetadata: {
            namespace: 'namspace1',
            workload: 'workload1'
          },
          type: KUBERNETES_TYPE,
          monitoredServiceIdentifier: '4345_iden'
        }
      ],
      environmentRef: '1234_envRef',
      identifier: '2334_iden',
      isEdit: false,
      name: 'monitoredService1',
      serviceRef: '1234_service',
      tags: {},
      type: 'Application'
    })
  })

  test('Ensure initializeDependencyMap works as intended', async () => {
    expect(initializeDependencyMap()).toEqual(new Map())
    expect(initializeDependencyMap(intialDependencies as any)).toEqual(
      new Map([
        ['datadoglogs_version1', { monitoredServiceIdentifier: 'datadoglogs_version1' }],
        [
          'dummy',
          {
            monitoredServiceIdentifier: 'dummy',
            type: KUBERNETES_TYPE,
            dependencyMetadata: {
              namespace: 'custom-metrics',
              supportedChangeSourceTypes: ['K8sCluster'],
              type: 'KUBERNETES',
              workload: 'custom-metrics-stackdriver-adapter'
            }
          }
        ],
        ['splunk_version1', { monitoredServiceIdentifier: 'splunk_version1' }]
      ])
    )
  })
})
