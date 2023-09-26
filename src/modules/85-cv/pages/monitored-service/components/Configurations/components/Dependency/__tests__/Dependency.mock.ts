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
import { KUBERNETES_TYPE } from '../component/SelectServiceCard.constants'

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
    totalPages: 1,
    totalItems: 3,
    pageItemCount: 3,
    pageSize: 10,
    content: [
      {
        createdAt: 1631728213634,
        lastModifiedAt: 1631773309201,
        monitoredService: {
          orgIdentifier: 'the_monopoly',
          projectIdentifier: 'conglomerate',
          identifier: 'delegate_production',
          name: 'delegate_production',
          type: 'Infrastructure',
          description: '',
          serviceRef: 'delegate',
          environmentRef: 'production',
          tags: {},
          sources: {
            healthSources: [],
            changeSources: [
              {
                name: 'asd',
                identifier: 'asd',
                type: 'K8sCluster',
                enabled: false,
                spec: { connectorRef: 'kube' },
                category: 'Infrastructure'
              }
            ]
          },
          dependencies: []
        }
      },
      {
        createdAt: 1631731888732,
        lastModifiedAt: 1631731888732,
        monitoredService: {
          orgIdentifier: 'the_monopoly',
          projectIdentifier: 'conglomerate',
          identifier: 'manager_production',
          name: 'manager_production',
          type: 'Application',
          description: '',
          serviceRef: 'manager',
          environmentRef: 'production',
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
      },
      {
        createdAt: 1631728798205,
        lastModifiedAt: 1632176646039,
        monitoredService: {
          orgIdentifier: 'the_monopoly',
          projectIdentifier: 'conglomerate',
          identifier: 'todolist_production',
          name: 'todolist_production',
          type: 'Application',
          description: '',
          serviceRef: 'todolist',
          environmentRef: 'production',
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
          dependencies: [
            {
              monitoredServiceIdentifier: 'delegate_production',
              type: KUBERNETES_TYPE,
              dependencyMetadata: {
                namespace: 'le-ng-harness',
                workload: 'sampleledelegate-kmpysm',
                supportedChangeSourceTypes: ['K8sCluster']
              }
            },
            { monitoredServiceIdentifier: 'manager_production', dependencyMetadata: null }
          ]
        }
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: 'f4f7d62c-18ec-40cd-8350-c4c4fb82cea7'
}

export const filteredMonitoredList = {
  correlationId: 'f4f7d62c-18ec-40cd-8350-c4c4fb82cea7',
  data: {
    content: [
      {
        createdAt: 1631728213634,
        lastModifiedAt: 1631773309201,
        monitoredService: {
          dependencies: [],
          description: '',
          environmentRef: 'production',
          identifier: 'delegate_production',
          name: 'delegate_production',
          orgIdentifier: 'the_monopoly',
          projectIdentifier: 'conglomerate',
          serviceRef: 'delegate',
          sources: {
            changeSources: [
              {
                category: 'Infrastructure',
                enabled: false,
                identifier: 'asd',
                name: 'asd',
                spec: {
                  connectorRef: 'kube'
                },
                type: 'K8sCluster'
              }
            ],
            healthSources: []
          },
          tags: {},
          type: 'Infrastructure'
        }
      },
      {
        createdAt: 1631731888732,
        lastModifiedAt: 1631731888732,
        monitoredService: {
          dependencies: [],
          description: '',
          environmentRef: 'production',
          identifier: 'manager_production',
          name: 'manager_production',
          orgIdentifier: 'the_monopoly',
          projectIdentifier: 'conglomerate',
          serviceRef: 'manager',
          sources: {
            changeSources: [
              {
                category: 'Deployment',
                enabled: true,
                identifier: 'harness_cd',
                name: 'Harness CD',
                spec: {},
                type: 'HarnessCD'
              }
            ],
            healthSources: []
          },
          tags: {},
          type: 'Application'
        }
      },
      {
        createdAt: 1631728798205,
        lastModifiedAt: 1632176646039,
        monitoredService: {
          dependencies: [
            {
              dependencyMetadata: {
                namespace: 'le-ng-harness',
                supportedChangeSourceTypes: ['K8sCluster'],

                workload: 'sampleledelegate-kmpysm'
              },
              type: KUBERNETES_TYPE,
              monitoredServiceIdentifier: 'delegate_production'
            },
            {
              dependencyMetadata: null,
              monitoredServiceIdentifier: 'manager_production'
            }
          ],
          description: '',
          environmentRef: 'production',
          identifier: 'todolist_production',
          name: 'todolist_production',
          orgIdentifier: 'the_monopoly',
          projectIdentifier: 'conglomerate',
          serviceRef: 'todolist',
          sources: {
            changeSources: [
              {
                category: 'Deployment',
                enabled: true,
                identifier: 'harness_cd',
                name: 'Harness CD',
                spec: {},
                type: 'HarnessCD'
              }
            ],
            healthSources: []
          },
          tags: {},
          type: 'Application'
        }
      }
    ],
    empty: false,
    pageIndex: 0,
    pageItemCount: 3,
    pageSize: 10,
    totalItems: 3,
    totalPages: 1
  },
  metaData: null,
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
