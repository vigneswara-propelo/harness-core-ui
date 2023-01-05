import type { StringKeys } from 'framework/strings'
import { CHART_VISIBILITY_ENUM, ThresholdTypes } from '../CommonHealthSource.constants'

export const expectedHealthSourceData = {
  applicationName: 'PR-git-experiment',
  connectorRef: 'TestAppD',
  identifier: 'AppD_Single',
  isEdit: true,
  customMetricsMap: new Map(),
  metricPacks: [
    {
      identifier: 'Performance',
      metricThresholds: [
        {
          metricType: 'Performance',
          groupName: undefined,
          metricName: undefined,
          type: ThresholdTypes.IgnoreThreshold,
          spec: {
            action: 'Ignore'
          },
          criteria: {
            type: 'Absolute',
            spec: {
              greaterThan: 0,
              lessThan: 0
            }
          }
        }
      ]
    },
    {
      identifier: 'Errors',
      metricThresholds: [
        {
          metricType: 'Errors',
          groupName: undefined,
          metricName: undefined,
          type: ThresholdTypes.FailImmediately,
          spec: {
            action: 'FailImmediately',
            spec: {}
          },
          criteria: {
            type: 'Absolute',
            spec: {
              greaterThan: 0,
              lessThan: 0
            }
          }
        }
      ]
    }
  ],
  name: 'AppD Single',
  product: {
    label: 'Application Monitoring',
    value: 'Application Monitoring'
  },
  tierName: 'cvng',
  type: 'SumoLogic'
}

export const expectedThresholdsInitialData = {
  appDTier: 'cvng',
  appdApplication: 'PR-git-experiment',
  failFastThresholds: [
    {
      criteria: { spec: { greaterThan: 0, lessThan: 0 }, type: 'Absolute' },
      groupName: undefined,
      metricName: undefined,
      metricType: 'Errors',
      spec: { action: 'FailImmediately', spec: {} },
      type: 'FailImmediately'
    }
  ],
  ignoreThresholds: [
    {
      criteria: { spec: { greaterThan: 0, lessThan: 0 }, type: 'Absolute' },
      groupName: undefined,
      metricName: undefined,
      metricType: 'Performance',
      spec: { action: 'Ignore' },
      type: 'IgnoreThreshold'
    }
  ],
  metricData: { Errors: true, Performance: true },
  metricPacks: [
    {
      identifier: 'Performance',
      metricThresholds: [
        {
          criteria: { spec: { greaterThan: 0, lessThan: 0 }, type: 'Absolute' },
          groupName: undefined,
          metricName: undefined,
          metricType: 'Performance',
          spec: { action: 'Ignore' },
          type: 'IgnoreThreshold'
        }
      ]
    },
    {
      identifier: 'Errors',
      metricThresholds: [
        {
          criteria: { spec: { greaterThan: 0, lessThan: 0 }, type: 'Absolute' },
          groupName: undefined,
          metricName: undefined,
          metricType: 'Errors',
          spec: { action: 'FailImmediately', spec: {} },
          type: 'FailImmediately'
        }
      ]
    }
  ]
}

export const healthSourceMetricValue = {
  basePath: {
    basePathDropdown_0: {
      path: '',
      value: 'Overall Application Performance'
    },
    basePathDropdown_1: {
      path: 'Overall Application Performance',
      value: ''
    }
  },
  continuousVerification: true,
  completeMetricPath: 'Overall Application Performance|cvng|Calls per Minute',
  groupName: {
    label: 'Group 1',
    value: 'Group 1'
  },
  healthScore: true,
  higherBaselineDeviation: true,
  lowerBaselineDeviation: true,
  metricName: 'appdMetric',
  metricIdentifier: 'appdMetric',
  metricPath: {
    metricPathDropdown_0: {
      path: '',
      isMetric: true,
      value: 'Calls per Minute'
    },
    metricPathDropdown_1: {
      isMetric: false,
      path: 'Calls per Minute',
      value: ''
    }
  },
  riskCategory: 'Errors/ERROR',
  serviceInstanceMetricPath: 'Individual Nodes|*|Errors per Minute',
  sli: true
}

export const healthSourceConfig = {
  addQuery: {
    label: 'Metric',
    enableDefaultGroupName: false
  },
  customMetrics: {
    enabled: true,
    queryAndRecords: {
      enabled: true,
      titleStringKey: 'cv.monitoringSources.commonHealthSource.defineQuerySubDescription' as StringKeys
    },
    metricsChart: {
      enabled: true,
      chartVisibilityMode: CHART_VISIBILITY_ENUM.AUTO
    }
  },
  metricPacks: {
    enabled: false
  },
  sideNav: {
    shouldBeAbleToDeleteLastMetric: true
  },
  metricThresholds: {
    enabled: true
  }
}

export const mockedDefineHealthSourcedata = {
  product: {
    value: 'SUMOLOGIC_METRICS',
    label: 'SumoLogic Cloud Metrics'
  },
  sourceType: 'SumoLogic',
  healthSourceName: 'Health source 2 ',
  connectorRef: 'account.Sumologic_Metric_Test',
  healthSourceIdentifier: 'Health_source_2'
}

export const mockedSourceData = {
  connectorRef: 'account.Sumologic_Metric_Test',
  isEdit: true,
  healthSourceList: [
    {
      name: 'Health source 2 ',
      identifier: 'Health_source_2',
      type: 'NextGenHealthSource',
      spec: {
        connectorRef: 'account.Sumologic_Metric_Test',
        dataSourceType: 'SUMOLOGIC_METRICS',
        queryDefinitions: [
          {
            identifier: 'M1',
            name: 'M1',
            groupName: 'G1',
            liveMonitoringEnabled: false,
            continuousVerificationEnabled: false,
            sliEnabled: false,
            query: '*',
            metricThresholds: [],
            riskProfile: {
              category: 'Errors',
              metricType: 'INFRA',
              thresholdTypes: ['ACT_WHEN_LOWER']
            }
          }
        ]
      }
    },
    {
      name: 'Log',
      identifier: 'Log',
      type: 'NextGenHealthSource',
      spec: {
        connectorRef: 'SumoLogic',
        dataSourceType: 'SUMOLOGIC_LOG',
        queryDefinitions: [
          {
            identifier: 's1_e1/Log',
            name: 'Log 1',
            queryParams: {
              serviceInstanceField: '_sourcehost'
            },
            query: '*',
            metricThresholds: []
          }
        ]
      }
    },
    {
      name: 'H1',
      identifier: 'H1',
      type: 'NextGenHealthSource',
      spec: {
        connectorRef: 'SumoLogic',
        dataSourceType: 'SUMOLOGIC_METRICS',
        queryDefinitions: [
          {
            identifier: 'M3',
            name: 'M3',
            groupName: 'g2',
            liveMonitoringEnabled: false,
            continuousVerificationEnabled: false,
            sliEnabled: false,
            query: 'm3',
            metricThresholds: [],
            riskProfile: {
              category: 'Errors',
              metricType: 'INFRA',
              thresholdTypes: ['ACT_WHEN_LOWER']
            }
          },
          {
            identifier: 'M1',
            name: 'M1',
            groupName: 'g1',
            liveMonitoringEnabled: false,
            continuousVerificationEnabled: false,
            sliEnabled: false,
            query: 'm1',
            metricThresholds: [],
            riskProfile: {
              category: 'Errors',
              metricType: 'INFRA',
              thresholdTypes: ['ACT_WHEN_LOWER']
            }
          },
          {
            identifier: 'M2',
            name: 'M2',
            groupName: 'g1',
            liveMonitoringEnabled: false,
            continuousVerificationEnabled: false,
            sliEnabled: false,
            query: 'm2',
            metricThresholds: [],
            riskProfile: {
              category: 'Errors',
              metricType: 'INFRA',
              thresholdTypes: ['ACT_WHEN_LOWER']
            }
          }
        ]
      }
    },
    {
      name: 'a',
      identifier: 'a',
      type: 'NextGenHealthSource',
      spec: {
        connectorRef: 'account.Sumologic_Metric_Test',
        dataSourceType: 'SUMOLOGIC_METRICS',
        queryDefinitions: [
          {
            identifier: 'M1',
            name: 'M1',
            groupName: 'G1',
            queryParams: {
              serviceInstanceField: '_sourceHost'
            },
            liveMonitoringEnabled: false,
            continuousVerificationEnabled: false,
            sliEnabled: false,
            query: '*',
            metricThresholds: [],
            riskProfile: {
              category: 'Errors',
              metricType: 'INFRA',
              thresholdTypes: ['ACT_WHEN_LOWER']
            }
          }
        ]
      }
    },
    {
      name: 'AA',
      identifier: 'AA',
      type: 'NextGenHealthSource',
      spec: {
        connectorRef: 'SumoLogic',
        dataSourceType: 'SUMOLOGIC_METRICS',
        queryDefinitions: [
          {
            identifier: 'M2',
            name: 'M2',
            groupName: 'g1',
            queryParams: {
              serviceInstanceField: '_sourceHost'
            },
            liveMonitoringEnabled: false,
            continuousVerificationEnabled: false,
            sliEnabled: false,
            query: 'c new',
            metricThresholds: [],
            riskProfile: {
              category: 'Errors',
              metricType: 'INFRA',
              thresholdTypes: ['ACT_WHEN_LOWER']
            }
          },
          {
            identifier: 'M3',
            name: 'M3',
            groupName: 'g1',
            liveMonitoringEnabled: false,
            continuousVerificationEnabled: false,
            sliEnabled: false,
            query: 'a',
            metricThresholds: [],
            riskProfile: {
              category: 'Errors',
              metricType: 'INFRA',
              thresholdTypes: ['ACT_WHEN_LOWER']
            }
          },
          {
            identifier: 'M4',
            name: 'M4',
            groupName: 'g1',
            liveMonitoringEnabled: false,
            continuousVerificationEnabled: false,
            sliEnabled: false,
            query: 'm4',
            metricThresholds: [],
            riskProfile: {
              category: 'Errors',
              metricType: 'INFRA',
              thresholdTypes: ['ACT_WHEN_LOWER']
            }
          }
        ]
      }
    }
  ],
  serviceRef: 's1',
  environmentRef: 'e1',
  monitoredServiceRef: {
    name: 's1_e1',
    identifier: 's1_e1'
  },
  existingMetricDetails: {
    name: 'Health source 2 ',
    identifier: 'Health_source_2',
    type: 'NextGenHealthSource',
    spec: {
      connectorRef: 'account.Sumologic_Metric_Test',
      dataSourceType: 'SUMOLOGIC_METRICS',
      queryDefinitions: [
        {
          identifier: 'M1',
          name: 'M1',
          groupName: 'G1',
          liveMonitoringEnabled: false,
          continuousVerificationEnabled: false,
          sliEnabled: false,
          query: '*',
          metricThresholds: [],
          riskProfile: {
            category: 'Errors',
            metricType: 'INFRA',
            thresholdTypes: ['ACT_WHEN_LOWER']
          }
        }
      ]
    }
  },
  healthSourceName: 'Health source 2 ',
  healthSourceIdentifier: 'Health_source_2',
  sourceType: 'NextGenHealthSource',
  dataSourceType: null,
  product: {
    label: 'SumoLogic Cloud Metrics',
    value: 'SUMOLOGIC_METRICS'
  }
}
