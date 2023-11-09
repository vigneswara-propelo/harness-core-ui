/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import routes from '@common/RouteDefinitions'
import { projectPathProps } from '@common/utils/routeUtils'
import type { TestWrapperProps } from '@common/utils/testUtils'
import type { MonitoredServiceForm } from '../../Service/Service.types'

export const pathParams = {
  accountId: 'account_id',
  orgIdentifier: 'org_identifier',
  projectIdentifier: 'project_identifier'
}

export const testWrapperProps: TestWrapperProps = {
  path: routes.toCVAddMonitoringServicesSetup({ ...projectPathProps }),
  pathParams
}

export const testWrapperEditProps: TestWrapperProps = {
  path: routes.toCVAddMonitoringServicesEdit({ ...projectPathProps, identifier: ':identifier' }),
  pathParams: {
    ...pathParams,
    identifier: 'manager_production'
  }
}

export const monitoredServiceList = {
  status: 'SUCCESS',
  data: {
    totalPages: 3,
    totalItems: 11,
    pageItemCount: 5,
    pageSize: 5,
    content: [
      {
        name: 'datadoglogs_version1',
        identifier: 'datadoglogs_version1',
        serviceRef: 'datadoglogs',
        environmentRefs: ['version1'],
        serviceName: 'datadoglogs',
        type: 'Application',
        tags: {},
        configuredChangeSources: 2,
        configuredHealthSources: 2
      },
      {
        name: 'User_Login_version1',
        identifier: 'User_Login_version1',
        serviceRef: 'User_Login',
        environmentRefs: ['version1'],
        serviceName: 'User Login',
        type: 'Application',
        tags: {},
        configuredChangeSources: 0,
        configuredHealthSources: 1
      },
      {
        name: 'dynatrace_version1',
        identifier: 'dynatrace_version1',
        serviceRef: 'dynatrace',
        environmentRefs: ['version1'],
        serviceName: 'dynatrace',
        type: 'Application',
        tags: {},
        configuredChangeSources: 0,
        configuredHealthSources: 1
      },
      {
        name: 'elk_version1',
        identifier: 'elk_version1',
        serviceRef: 'elk',
        environmentRefs: ['version1'],
        serviceName: 'elk',
        type: 'Application',
        tags: {},
        configuredChangeSources: 0,
        configuredHealthSources: 1
      },
      {
        name: 'dummy',
        identifier: 'dummy',
        serviceRef: 'dummy',
        environmentRefs: ['version1'],
        serviceName: 'dummy',
        type: 'Infrastructure',
        tags: {},
        configuredChangeSources: 1,
        configuredHealthSources: 0
      }
    ],
    pageIndex: 0,
    empty: false
  },
  correlationId: '9693d0bd-75f8-4eab-b763-a0a790371800'
}

export const filteredMonitoredList = {
  correlationId: '9693d0bd-75f8-4eab-b763-a0a790371800',
  data: {
    content: [
      {
        configuredChangeSources: 2,
        configuredHealthSources: 2,
        environmentRefs: ['version1'],
        identifier: 'datadoglogs_version1',
        name: 'datadoglogs_version1',
        serviceName: 'datadoglogs',
        serviceRef: 'datadoglogs',
        tags: {},
        type: 'Application'
      }
    ],
    empty: false,
    pageIndex: 0,
    pageItemCount: 5,
    pageSize: 5,
    totalItems: 11,
    totalPages: 3
  },
  status: 'SUCCESS'
}

export const monitoredServiceForm: MonitoredServiceForm = {
  isEdit: false,
  identifier: 'manager_production',
  name: 'manager_production',
  type: 'Application',
  description: '',
  serviceRef: 'manager',
  environmentRef: 'production',
  environmentRefList: ['production'],
  tags: {},
  sources: {
    healthSources: [],
    changeSources: [
      {
        name: 'Harness CD',
        identifier: 'harness_cd',
        type: 'HarnessCD',
        enabled: true,
        spec: {},
        category: 'Deployment'
      }
    ]
  },
  dependencies: []
}

export const monitoredServiceOfTypeInfrastructure: MonitoredServiceForm = {
  ...monitoredServiceForm,
  isEdit: true,
  environmentRef: 'production_one',
  environmentRefList: ['production_one', 'production_two']
}

export const monitoredService = {
  isEdit: true,
  orgIdentifier: 'default',
  projectIdentifier: 'Demo',
  identifier: 'monitoredservice101',
  name: 'Monitored Service 101',
  type: 'Application' as any,
  description: 'Monitored Service with change source and health source',
  serviceRef: 'ServiceRef102',
  environmentRef: 'EnvironmentRef102',
  tags: { tag1: '', tag2: '' },
  sources: {
    healthSources: [
      {
        name: 'Splunk 102',
        identifier: 'splunk102',
        type: 'Splunk' as any,
        spec: {
          connectorRef: 'Splunk_Conn',
          feature: 'Cloud Logs' as any,
          queries: [
            {
              name: 'SPLUNK Logs Query',
              query: 'error OR failed OR severe OR ( sourcetype=access_* ( 404 OR 500 OR 503 ) )',
              serviceInstanceIdentifier: '_sourcetype'
            }
          ]
        }
      }
    ],
    changeSources: [
      {
        name: 'PagerDuty 101',
        identifier: 'pagerduty',
        type: 'PagerDuty' as any,
        desc: 'Alert from PagerDuty',
        enabled: true,
        category: 'Alert' as any,
        spec: {
          connectorRef: 'PagerDutyConnector',
          pagerDutyServiceId: 'pagerDutyServiceId101'
        }
      }
    ]
  },
  dependencies: [
    {
      monitoredServiceIdentifier: 'service1'
    },
    {
      monitoredServiceIdentifier: 'service2'
    }
  ]
}

export const intialDependencies = [
  { monitoredServiceIdentifier: 'splunk_version1' },
  { monitoredServiceIdentifier: 'datadoglogs_version1' },
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
]
