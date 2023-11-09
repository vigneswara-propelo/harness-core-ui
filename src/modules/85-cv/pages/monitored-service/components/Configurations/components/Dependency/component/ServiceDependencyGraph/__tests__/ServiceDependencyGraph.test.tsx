/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@modules/10-common/utils/testUtils'
import { MonitoredServiceForm } from '@cv/pages/monitored-service/components/Configurations/components/Service/Service.types'
import { MonitoredServicePlatformResponse } from 'services/cv'
import { ServiceDependencyGraph } from '../ServiceDependencyGraph'
import { value } from './ServiceDependencyGraph.mock'
import { monitoredServiceList } from '../../../__tests__/Dependency.mock'

describe('ServiceDependencyGraph', () => {
  test('should render ServiceDependencyGraph', () => {
    const { getByText } = render(
      <TestWrapper>
        <ServiceDependencyGraph
          value={value as unknown as MonitoredServiceForm}
          identifier={value.identifier}
          monitoredServiceList={monitoredServiceList.data.content as MonitoredServicePlatformResponse[]}
          dependencyMap={
            new Map([
              ['datadoglogs_version1', { monitoredServiceIdentifier: 'datadoglogs_version1' }],
              ['dynatrace_version1', { monitoredServiceIdentifier: 'dynatrace_version1' }],
              [
                'dummy',
                {
                  monitoredServiceIdentifier: 'dummy',
                  type: 'KUBERNETES',
                  dependencyMetaData: {
                    namespace: 'custom-metrics',
                    supportedChangeSourceTypes: ['K8sCluster'],
                    type: 'KUBERNETES',
                    workload: 'custom-metrics-stackdriver-adapter'
                  }
                }
              ]
            ])
          }
        />
      </TestWrapper>
    )
    expect(getByText('dummy')).toBeInTheDocument()
    expect(getByText('User Login')).toBeInTheDocument()
    expect(getByText('dummy')).toBeInTheDocument()
  })
})
