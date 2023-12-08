/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { NGTemplateInfoConfig } from 'services/template-ng'

export const templateValueMock = {
  identifier: 'MSTemplate1',
  name: 'MS Template 1',
  orgIdentifier: 'cvng',
  projectIdentifier: 'project1',
  versionLabel: '1'
} as NGTemplateInfoConfig

export const reconcileStatusAPIMock = {
  metaData: {},
  resource: {
    totalPages: 1,
    totalItems: 2,
    pageItemCount: 2,
    pageSize: 10,
    content: [
      {
        orgIdentifier: 'cvng',
        projectIdentifier: 'templatetesting2',
        accountIdentifier: '-k53qRQAQ1O7DBLb9ACnjQ',
        identifier: 'dummy_version7',
        serviceIdentifier: 'dummy',
        environmentIdentifiers: ['version7'],
        lastReconciledTimestamp: 1701688455424,
        reconciliationStatus: 'INPUT_REQUIRED_FOR_RECONCILIATION'
      },
      {
        orgIdentifier: 'cvng',
        projectIdentifier: 'templatetesting2',
        accountIdentifier: '-k53qRQAQ1O7DBLb9ACnjQ',
        identifier: 'dummy_version6',
        serviceIdentifier: 'dummy',
        environmentIdentifiers: ['version6'],
        lastReconciledTimestamp: 1701697124288,
        reconciliationStatus: 'NO_RECONCILIATION_REQUIRED'
      },
      {
        orgIdentifier: 'cvng',
        projectIdentifier: 'templatetesting2',
        accountIdentifier: '-k53qRQAQ1O7DBLb9ACnjQ',
        identifier: 'dummy_version8',
        serviceIdentifier: 'dummy',
        environmentIdentifiers: ['version8'],
        lastReconciledTimestamp: 1701697124288,
        reconciliationStatus: 'NO_INPUT_REQUIRED_FOR_RECONCILIATION'
      }
    ],
    pageIndex: 0,
    empty: false
  },
  responseMessages: []
}

export const resolvedTemplateAPIMOck = {
  status: 'SUCCESS',
  data: 'type: Application\nserviceRef: dummy\nenvironmentRef: version7\nsources:\n  healthSources:\n    - identifier: AppD\n      type: AppDynamics\n      spec:\n        applicationName: Local\n        tierName: manager-iterator\n',
  correlationId: '85004d2c-607d-42db-8cb8-1a411edb0723'
}

export const templateInputsAPIMock = {
  status: 'SUCCESS',
  data: 'type: Application\nserviceRef: <+input>\nenvironmentRef: <+input>\nsources:\n  healthSources:\n    - identifier: AppD\n      type: AppDynamics\n      spec:\n        applicationName: <+input>\n        tierName: <+input>\n    - identifier: AppD_2\n      type: AppDynamics\n      spec:\n        applicationName: <+input>\n        tierName: <+input>\n        metricDefinitions:\n          - identifier: Metric_1\n            completeMetricPath: <+input>\n',
  metaData: null,
  correlationId: 'cf08b39c-159c-4671-9ef8-6f7ee47793a4'
}

export const templateMockValue = {
  name: 'MS Temp 2',
  identifier: 'MS_Temp_2',
  versionLabel: '1',
  type: 'MonitoredService',
  projectIdentifier: 'templatetesting2',
  orgIdentifier: 'cvng',
  tags: {},
  spec: {
    serviceRef: '<+input>',
    environmentRef: '<+input>',
    type: 'Application',
    sources: {
      healthSources: [
        {
          name: 'AppD',
          identifier: 'AppD',
          type: 'AppDynamics',
          spec: {
            applicationName: '<+input>',
            tierName: '<+input>',
            metricData: { Errors: true, Performance: true },
            metricDefinitions: [],
            feature: 'Application Monitoring',
            connectorRef: 'org.appdtestforautomation',
            metricPacks: [
              { identifier: 'Errors', metricThresholds: [] },
              { identifier: 'Performance', metricThresholds: [] }
            ]
          }
        },
        {
          name: 'AppD 2',
          identifier: 'AppD_2',
          type: 'AppDynamics',
          spec: {
            applicationName: '<+input>',
            tierName: '<+input>',
            metricData: { Errors: true, Performance: true },
            metricDefinitions: [
              {
                identifier: 'Metric_1',
                metricName: 'Metric 1',
                completeMetricPath: '<+input>',
                groupName: 'Group 1',
                sli: { enabled: true },
                analysis: {
                  riskProfile: {},
                  liveMonitoring: { enabled: false },
                  deploymentVerification: { enabled: false }
                }
              }
            ],
            feature: 'Application Monitoring',
            connectorRef: 'org.appdtestforautomation',
            metricPacks: [
              { identifier: 'Errors', metricThresholds: [] },
              { identifier: 'Performance', metricThresholds: [] }
            ]
          }
        }
      ]
    }
  }
} as NGTemplateInfoConfig

export const templateDataMock = {
  name: 'MS Temp 2',
  identifier: 'MS_Temp_2',
  versionLabel: '1',
  type: 'MonitoredService',
  projectIdentifier: 'templatetesting2',
  orgIdentifier: 'cvng',
  tags: {},
  spec: {
    serviceRef: '<+input>',
    environmentRef: '<+input>',
    type: 'Application',
    sources: {
      healthSources: [
        {
          name: 'AppD',
          identifier: 'AppD',
          type: 'AppDynamics',
          spec: {
            applicationName: '<+input>',
            tierName: '<+input>',
            metricData: { Errors: true, Performance: true },
            metricDefinitions: [],
            feature: 'Application Monitoring',
            connectorRef: 'org.appdtestforautomation',
            metricPacks: [
              { identifier: 'Errors', metricThresholds: [] },
              { identifier: 'Performance', metricThresholds: [] }
            ]
          }
        },
        {
          name: 'AppD 2',
          identifier: 'AppD_2',
          type: 'AppDynamics',
          spec: {
            applicationName: '<+input>',
            tierName: '<+input>',
            metricData: { Errors: true, Performance: true },
            metricDefinitions: [
              {
                identifier: 'Metric_1',
                metricName: 'Metric 1',
                completeMetricPath: '<+input>',
                groupName: 'Group 1',
                sli: { enabled: true },
                analysis: {
                  riskProfile: {},
                  liveMonitoring: { enabled: false },
                  deploymentVerification: { enabled: false }
                }
              }
            ],
            feature: 'Application Monitoring',
            connectorRef: 'org.appdtestforautomation',
            metricPacks: [
              { identifier: 'Errors', metricThresholds: [] },
              { identifier: 'Performance', metricThresholds: [] }
            ]
          }
        }
      ]
    }
  }
} as NGTemplateInfoConfig

export const mockTemplateInputs = {
  status: 'SUCCESS',
  data: 'type: Application\nserviceRef: <+input>\nenvironmentRef: <+input>\nsources:\n  healthSources:\n    - identifier: AppD\n      type: AppDynamics\n      spec:\n        applicationName: <+input>\n        tierName: <+input>\n    - identifier: AppD_2\n      type: AppDynamics\n      spec:\n        applicationName: <+input>\n        tierName: <+input>\n        metricDefinitions:\n          - identifier: Metric_1\n            completeMetricPath: <+input>\n',
  metaData: null,
  correlationId: 'e8b29ec4-3c69-4138-841e-3b4b0297bf96'
}
export const mockGetTeplates = {
  status: 'SUCCESS',
  data: {
    accountId: '-k53qRQAQ1O7DBLb9ACnjQ',
    orgIdentifier: 'cvng',
    projectIdentifier: 'templatetesting2',
    identifier: 'MS_Temp_2',
    name: 'MS Temp 2',
    description: '',
    tags: {},
    yaml: 'template:\n  name: MS Temp 2\n  identifier: MS_Temp_2\n  versionLabel: "1"\n  type: MonitoredService\n  projectIdentifier: templatetesting2\n  orgIdentifier: cvng\n  tags: {}\n  spec:\n    serviceRef: <+input>\n    environmentRef: <+input>\n    type: Application\n    sources:\n      healthSources:\n        - name: AppD\n          identifier: AppD\n          type: AppDynamics\n          spec:\n            applicationName: <+input>\n            tierName: <+input>\n            metricData:\n              Errors: true\n              Performance: true\n            metricDefinitions: []\n            feature: Application Monitoring\n            connectorRef: org.appdtestforautomation\n            metricPacks:\n              - identifier: Errors\n                metricThresholds: []\n              - identifier: Performance\n                metricThresholds: []\n        - name: AppD 2\n          identifier: AppD_2\n          type: AppDynamics\n          spec:\n            applicationName: <+input>\n            tierName: <+input>\n            metricData:\n              Errors: true\n              Performance: true\n            metricDefinitions:\n              - identifier: Metric_1\n                metricName: Metric 1\n                completeMetricPath: <+input>\n                groupName: Group 1\n                sli:\n                  enabled: true\n                analysis:\n                  riskProfile: {}\n                  liveMonitoring:\n                    enabled: false\n                  deploymentVerification:\n                    enabled: false\n            feature: Application Monitoring\n            connectorRef: org.appdtestforautomation\n            metricPacks:\n              - identifier: Errors\n                metricThresholds: []\n              - identifier: Performance\n                metricThresholds: []\n',
    versionLabel: '1',
    templateEntityType: 'MonitoredService',
    childType: 'Application',
    templateScope: 'project',
    version: 12,
    gitDetails: {
      objectId: null,
      branch: null,
      repoIdentifier: null,
      rootFolder: null,
      filePath: null,
      repoName: null,
      commitId: null,
      fileUrl: null,
      repoUrl: null,
      parentEntityConnectorRef: null,
      parentEntityRepoName: null
    },
    entityValidityDetails: {
      valid: true,
      invalidYaml: null
    },
    lastUpdatedAt: 1701688506230,
    storeType: 'INLINE',
    yamlVersion: '0',
    stableTemplate: true
  },
  metaData: null,
  correlationId: 'e9beb501-c5ab-4822-93e0-98f894656a0c'
}
