/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type {
  PageMetricsAnalysis,
  RestResponseTransactionMetricInfoSummaryPageDTO,
  VerificationOverview
} from 'services/cv'

export const transactionMetricInfoSummary: RestResponseTransactionMetricInfoSummaryPageDTO = {
  metaData: {},
  resource: {
    pageResponse: {
      totalPages: 3,
      totalItems: 25,
      pageItemCount: 10,
      pageSize: 10,
      content: [
        {
          transactionMetric: {
            transactionName: 'WebTransaction/WebServletPath/RequestLogin',
            metricName: 'Calls per Minute',
            score: 1.0933333333333335,
            risk: 'NO_ANALYSIS'
          },
          connectorName: 'new relic',
          dataSourceType: 'NEW_RELIC',
          nodes: [
            {
              hostName: 'dummypipeline-nr-deployment-canary-fdf55df6-z27gv',
              nearestControlHost: 'a',
              risk: 'NO_ANALYSIS',
              score: 1.0933333333333335,
              controlData: [30.666666666666668, 31.333333333333332, 27, 25.666666666666668, 28],
              testData: [30, 10, -1, -1, -1],
              anomalous: false
            }
          ]
        },
        {
          transactionMetric: {
            transactionName: 'WebTransaction/Servlet/RequestException',
            metricName: 'Calls per Minute',
            score: 0.8333333333333334,
            risk: 'NO_ANALYSIS'
          },
          connectorName: 'new relic',
          dataSourceType: 'NEW_RELIC',
          nodes: [
            {
              hostName: 'dummypipeline-nr-deployment-canary-fdf55df6-z27gv',
              risk: 'NO_ANALYSIS',
              score: 0.8333333333333334,
              controlData: [48.666666666666664, 48.333333333333336, 49, 49.333333333333336, 47],
              testData: [49, 17, -1, -1, -1],
              anomalous: false
            }
          ]
        },
        {
          transactionMetric: {
            transactionName: 'WebTransaction/Servlet/default',
            metricName: 'Calls per Minute',
            score: 0.8333333333333334,
            risk: 'NO_ANALYSIS'
          },
          connectorName: 'new relic',
          dataSourceType: 'NEW_RELIC',
          nodes: [
            {
              hostName: 'dummypipeline-nr-deployment-canary-fdf55df6-z27gv',
              risk: 'NO_ANALYSIS',
              score: 0.8333333333333334,
              controlData: [48.333333333333336, 48.666666666666664, 48.666666666666664, 49.666666666666664, 46.5],
              testData: [50, 18, -1, -1, -1],
              anomalous: false
            }
          ]
        },
        {
          transactionMetric: {
            transactionName: 'WebTransaction/JSP/inside/display.jsp',
            metricName: 'Calls per Minute',
            score: 0.3333333333333334,
            risk: 'NO_ANALYSIS'
          },
          connectorName: 'new relic',
          dataSourceType: 'NEW_RELIC',
          nodes: [
            {
              hostName: 'dummypipeline-nr-deployment-canary-fdf55df6-z27gv',
              risk: 'NO_ANALYSIS',
              score: 0.3333333333333334,
              controlData: [54.666666666666664, 43.333333333333336, 48.666666666666664, 46.666666666666664, 43],
              testData: [47, 16, -1, -1, -1],
              anomalous: false
            }
          ]
        },
        {
          transactionMetric: {
            transactionName: 'WebTransaction/Servlet/Display',
            metricName: 'Calls per Minute',
            score: 0.3333333333333334,
            risk: 'NO_ANALYSIS'
          },
          connectorName: 'new relic',
          dataSourceType: 'NEW_RELIC',
          nodes: [
            {
              hostName: 'dummypipeline-nr-deployment-canary-fdf55df6-z27gv',
              risk: 'NO_ANALYSIS',
              score: 0.3333333333333334,
              controlData: [54.666666666666664, 43.333333333333336, 48.666666666666664, 46.666666666666664, 43],
              testData: [47, 16, -1, -1, -1],
              anomalous: false
            }
          ]
        },
        {
          transactionMetric: {
            transactionName: 'WebTransaction/Servlet/RequestException',
            metricName: 'Apdex',
            score: 0,
            risk: 'HEALTHY'
          },
          connectorName: 'new relic',
          dataSourceType: 'NEW_RELIC',
          nodes: [
            {
              hostName: 'dummypipeline-nr-deployment-canary-fdf55df6-z27gv',
              risk: 'HEALTHY',
              score: 0,
              controlData: [0.06666666666666667, 0.06, 0.06666666666666667, 0.06666666666666667, 0.065],
              testData: [0.06, 0.06, -1, -1, -1],
              anomalous: false
            }
          ]
        },
        {
          transactionMetric: {
            transactionName: 'WebTransaction/JSP/index.jsp',
            metricName: 'Apdex',
            score: 0,
            risk: 'NO_ANALYSIS'
          },
          connectorName: 'new relic',
          dataSourceType: 'NEW_RELIC',
          nodes: [
            {
              hostName: 'harness-pr-cv-nextgen-prod-deployment-5b5f48c558-s94wf',
              risk: 'NO_ANALYSIS',
              score: 0,
              controlData: [0.3333333333333333, 0, 0, 0, 0],
              testData: [-1, 1, -1, -1, -1],
              anomalous: false
            }
          ]
        },
        {
          transactionMetric: {
            transactionName: 'WebTransaction/JSP/inside/display.jsp',
            metricName: 'Apdex',
            score: 0,
            risk: 'HEALTHY'
          },
          connectorName: 'new relic',
          dataSourceType: 'NEW_RELIC',
          nodes: [
            {
              hostName: 'dummypipeline-nr-deployment-canary-fdf55df6-z27gv',
              risk: 'HEALTHY',
              score: 0,
              controlData: [1, 1, 1, 1, 1],
              testData: [1, 1, -1, -1, -1],
              anomalous: false
            }
          ]
        },
        {
          transactionMetric: {
            transactionName: 'WebTransaction/Custom/load test/107',
            metricName: 'Apdex',
            score: 0,
            risk: 'NO_DATA'
          },
          connectorName: 'new relic',
          dataSourceType: 'NEW_RELIC',
          nodes: [
            {
              hostName: 'dummypipeline-nr-deployment-canary-fdf55df6-z27gv',
              risk: 'NO_DATA',
              score: 0,
              controlData: null as any,
              testData: [0, -1, -1, -1, -1],
              anomalous: false
            }
          ]
        },
        {
          transactionMetric: {
            transactionName: 'WebTransaction/Servlet/default',
            metricName: 'Apdex',
            score: 0,
            risk: 'HEALTHY'
          },
          connectorName: 'new relic',
          dataSourceType: 'NEW_RELIC',
          nodes: [
            {
              hostName: 'dummypipeline-nr-deployment-canary-fdf55df6-z27gv',
              risk: 'HEALTHY',
              score: 0,
              controlData: [0.6666666666666666, 0.5, 0.5, 0.5, 0.5],
              testData: [1, 1, -1, -1, -1],
              anomalous: false
            }
          ]
        }
      ],
      pageIndex: 0,
      empty: false
    },
    deploymentTimeRange: { startTime: '2021-11-02 16:01:00' as any, endTime: '2021-11-02 16:16:00' as any },
    deploymentStartTime: 1635868860000,
    deploymentEndTime: 1635869760000
  },
  responseMessages: []
}

export const transformMetricsExpectedResult = [
  {
    controlData: [],
    deeplinkURL: undefined,
    healthSource: {
      identifier: 'KQE5GbbKTD6w39T6_jwUog/Templatised_sumologic_metrics_health_source',
      name: 'Templatised sumologic metrics health source',
      providerType: 'METRICS',
      type: 'SumologicMetrics'
    },
    metricName: 'Performance metric',
    nodeRiskCount: {
      anomalousNodeCount: 0,
      nodeRiskCounts: [
        { count: 0, displayName: 'Unhealthy', risk: 'UNHEALTHY' },
        { count: 0, displayName: 'Warning', risk: 'WARNING' },
        { count: 0, displayName: 'Healthy', risk: 'HEALTHY' }
      ],
      totalNodeCount: 0
    },
    risk: undefined,
    selectedDataFormat: { label: 'Raw', value: 'raw' },
    testData: [],
    thresholds: [
      {
        action: 'Ignore',
        criteria: { lessThanThreshold: 0, measurementType: 'ratio' },
        id: '6L6gbC9oRlCS8ypbtCi0rA',
        isUserDefined: false,
        thresholdType: 'IGNORE'
      },
      {
        action: 'Ignore',
        criteria: { lessThanThreshold: 0, measurementType: 'delta' },
        id: 'Fh-N1OUnTmmrBWhqqWqJvQ',
        isUserDefined: false,
        thresholdType: 'IGNORE'
      }
    ],
    transactionName: undefined
  }
]

export const transactionNameMock = {
  resource: ['A', 'B']
}

export const verifyStepNodeNameMock = {
  resource: ['V', 'W']
}

export const overviewDataMock: VerificationOverview = {
  spec: {
    analysedServiceIdentifier: 'svcgcpmetrics',
    analysedEnvIdentifier: 'envgcpmetrics',
    monitoredServiceType: 'DEFAULT',
    monitoredServiceIdentifier: 'svcgcpmetrics_envgcpmetrics',
    analysisType: 'SIMPLE',
    sensitivity: 'HIGH',
    durationInMinutes: 10,
    isFailOnNoAnalysis: true,
    baselineType: 'LAST'
  },
  appliedDeploymentAnalysisType: 'SIMPLE',
  verificationStatus: 'VERIFICATION_FAILED',
  verificationProgressPercentage: 100,
  verificationStartTimestamp: 1687172877165,
  testNodes: {
    nodeType: 'POST_DEPLOYMENT',
    nodes: [
      {
        type: 'DEPLOYMENT_NODE',
        nodeIdentifier: 'cv-nextgen-6f5c776f58-dl5q9',
        verificationResult: 'FAILED',
        failedMetrics: 1,
        failedLogClusters: 0
      }
    ]
  },
  controlNodes: {
    nodeType: 'PRE_DEPLOYMENT',
    nodes: [
      {
        type: 'DEPLOYMENT_NODE',
        nodeIdentifier: 'cv-nextgen-6f5c776f58-8d2p8'
      },
      {
        type: 'DEPLOYMENT_NODE',
        nodeIdentifier: 'cv-nextgen-76d9478db-lvs7j'
      }
    ]
  },
  metricsAnalysis: {
    healthy: 0,
    warning: 0,
    unhealthy: 1,
    noAnalysis: 0
  },
  logClusters: {
    knownClustersCount: 0,
    unknownClustersCount: 0,
    unexpectedFrequencyClustersCount: 0
  },
  errorClusters: {
    knownClustersCount: 0,
    unknownClustersCount: 0,
    unexpectedFrequencyClustersCount: 0
  },
  controlDataStartTimestamp: 1687172100000,
  testDataStartTimestamp: 1687172820000
}

export const metricDataMock: PageMetricsAnalysis = {
  totalPages: 1,
  totalItems: 1,
  pageItemCount: 1,
  pageSize: 10,
  content: [
    {
      metricIdentifier: 'q1',
      metricName: 'q1',
      transactionGroup: 'g1',
      metricType: 'PERFORMANCE_THROUGHPUT',
      healthSource: {
        identifier: 'abc_azure_metrics/azure_metrics_verify_step',
        name: 'azure metrics verify step',
        type: 'AzureMetrics',
        providerType: 'METRICS'
      },
      thresholds: [
        {
          id: 'aaa',
          thresholdType: 'IGNORE',
          isUserDefined: false,
          action: 'Ignore',
          criteria: {
            measurementType: 'ratio',
            lessThanThreshold: 10
          }
        }
      ],
      analysisResult: 'NO_ANALYSIS',
      testDataNodes: [
        {
          nodeIdentifier: 'bbb',
          analysisResult: 'NO_ANALYSIS',
          analysisReason: 'NO_CONTROL_DATA',
          controlNodeIdentifier: 'bbb',
          appliedThresholds: ['aaa'],
          controlData: [
            {
              timestampInMillis: 1691065800000,
              value: 11.786666666666667
            },
            {
              timestampInMillis: 1691066040000,
              value: 11.856666666666667
            },
            {
              timestampInMillis: 1691065860000,
              value: 11.853333333333333
            },
            {
              timestampInMillis: 1691065920000,
              value: 11.75
            },
            {
              timestampInMillis: 1691065980000,
              value: 12.133333333333333
            },
            {
              timestampInMillis: 1691066280000,
              value: 12.3
            },
            {
              timestampInMillis: 1691066100000,
              value: 12.116666666666667
            },
            {
              timestampInMillis: 1691066340000,
              value: 12.093333333333332
            },
            {
              timestampInMillis: 1691066160000,
              value: 12.043333333333333
            },
            {
              timestampInMillis: 1691066220000,
              value: 12.04
            }
          ],
          testData: [
            {
              timestampInMillis: 1691066700000,
              value: 12.26
            },
            {
              timestampInMillis: 1691066940000,
              value: 12.173333333333334
            },
            {
              timestampInMillis: 1691067000000,
              value: 12.103333333333333
            }
          ],
          normalisedControlData: [
            {
              timestampInMillis: 1691066400000,
              value: 12.093333333333332
            }
          ],
          normalisedTestData: [
            {
              timestampInMillis: 1691067060000,
              value: 12.103333333333333
            }
          ]
        },
        {
          nodeIdentifier: 'ccc',
          analysisResult: 'NO_ANALYSIS',
          analysisReason: 'NO_CONTROL_DATA',
          controlNodeIdentifier: 'ccc',
          appliedThresholds: ['aaa'],
          controlData: [
            {
              timestampInMillis: 1691065800000,
              value: 14.683333333333334
            },
            {
              timestampInMillis: 1691066040000,
              value: 15.823333333333336
            },
            {
              timestampInMillis: 1691065860000,
              value: 15.083333333333334
            },
            {
              timestampInMillis: 1691065920000,
              value: 15.126666666666663
            },
            {
              timestampInMillis: 1691065980000,
              value: 15.01
            },
            {
              timestampInMillis: 1691066280000,
              value: 15.186666666666664
            },
            {
              timestampInMillis: 1691066100000,
              value: 14.843333333333334
            },
            {
              timestampInMillis: 1691066340000,
              value: 15.336666666666664
            },
            {
              timestampInMillis: 1691066160000,
              value: 14.923333333333336
            },
            {
              timestampInMillis: 1691066220000,
              value: 14.666666666666666
            }
          ],
          testData: [
            {
              timestampInMillis: 1691066520000,
              value: 15.396666666666667
            },
            {
              timestampInMillis: 1691066580000,
              value: 14.780000000000001
            },
            {
              timestampInMillis: 1691066640000,
              value: 14.99
            },
            {
              timestampInMillis: 1691066460000,
              value: 14.719999999999999
            },
            {
              timestampInMillis: 1691066760000,
              value: 14.393333333333334
            },
            {
              timestampInMillis: 1691066820000,
              value: 14.730000000000002
            },
            {
              timestampInMillis: 1691066880000,
              value: 14.806666666666667
            },
            {
              timestampInMillis: 1691066700000,
              value: 14.806666666666667
            },
            {
              timestampInMillis: 1691066940000,
              value: 15.246666666666666
            },
            {
              timestampInMillis: 1691067000000,
              value: 14.646666666666667
            }
          ],
          normalisedControlData: [
            {
              timestampInMillis: 1691065890000,
              value: 14.964444444444444
            },
            {
              timestampInMillis: 1691066070000,
              value: 15.225555555555557
            },
            {
              timestampInMillis: 1691066250000,
              value: 14.925555555555556
            },
            {
              timestampInMillis: 1691066400000,
              value: 15.336666666666664
            }
          ],
          normalisedTestData: [
            {
              timestampInMillis: 1691066550000,
              value: 14.965555555555556
            },
            {
              timestampInMillis: 1691066730000,
              value: 14.729999999999999
            },
            {
              timestampInMillis: 1691066910000,
              value: 14.927777777777777
            },
            {
              timestampInMillis: 1691067060000,
              value: 14.646666666666667
            }
          ]
        },
        {
          nodeIdentifier: 'ddd',
          analysisResult: 'NO_ANALYSIS',
          analysisReason: 'NO_CONTROL_DATA',
          controlNodeIdentifier: 'ccc',
          appliedThresholds: ['aaa'],
          controlData: [
            {
              timestampInMillis: 1691065800000,
              value: 14.683333333333334
            },
            {
              timestampInMillis: 1691066040000,
              value: 15.823333333333336
            },
            {
              timestampInMillis: 1691065860000,
              value: 15.083333333333334
            },
            {
              timestampInMillis: 1691065920000,
              value: 15.126666666666663
            },
            {
              timestampInMillis: 1691065980000,
              value: 15.01
            },
            {
              timestampInMillis: 1691066280000,
              value: 15.186666666666664
            },
            {
              timestampInMillis: 1691066100000,
              value: 14.843333333333334
            },
            {
              timestampInMillis: 1691066340000,
              value: 15.336666666666664
            },
            {
              timestampInMillis: 1691066160000,
              value: 14.923333333333336
            },
            {
              timestampInMillis: 1691066220000,
              value: 14.666666666666666
            }
          ],
          testData: [
            {
              timestampInMillis: 1691066520000,
              value: 14.563333333333336
            },
            {
              timestampInMillis: 1691066580000,
              value: 14.066666666666666
            },
            {
              timestampInMillis: 1691066640000,
              value: 13.716666666666667
            },
            {
              timestampInMillis: 1691066460000,
              value: 10.986666666666668
            },
            {
              timestampInMillis: 1691066760000,
              value: 13.81
            },
            {
              timestampInMillis: 1691066820000,
              value: 13.873333333333337
            },
            {
              timestampInMillis: 1691066880000,
              value: 14.116666666666665
            },
            {
              timestampInMillis: 1691066700000,
              value: 13.75
            },
            {
              timestampInMillis: 1691066940000,
              value: 13.783333333333333
            },
            {
              timestampInMillis: 1691067000000,
              value: 14.31
            }
          ],
          normalisedControlData: [
            {
              timestampInMillis: 1691065890000,
              value: 14.964444444444444
            },
            {
              timestampInMillis: 1691066070000,
              value: 15.225555555555557
            },
            {
              timestampInMillis: 1691066250000,
              value: 14.925555555555556
            },
            {
              timestampInMillis: 1691066400000,
              value: 15.336666666666664
            }
          ],
          normalisedTestData: [
            {
              timestampInMillis: 1691066550000,
              value: 13.205555555555557
            },
            {
              timestampInMillis: 1691066730000,
              value: 13.75888888888889
            },
            {
              timestampInMillis: 1691066910000,
              value: 13.924444444444445
            },
            {
              timestampInMillis: 1691067060000,
              value: 14.31
            }
          ]
        }
      ]
    }
  ],
  pageIndex: 0,
  empty: false
}

export const dateDetailsMock = {
  controlDataStartTimestamp: 0,
  testDataStartTimestamp: 1691066460000,
  durationInMinutes: 10
}

export const selectedDateFormatMock = {
  label: 'Raw',
  value: 'raw'
}

export const expetedPointsData = [
  {
    controlData: [
      {
        analysisReason: 'NO_CONTROL_DATA',
        appliedThresholds: undefined,
        initialXvalue: 1691065800000,
        name: 'bbb',
        points: [],
        risk: 'NO_ANALYSIS'
      },
      {
        analysisReason: 'NO_CONTROL_DATA',
        appliedThresholds: undefined,
        initialXvalue: 1691065800000,
        name: 'ccc',
        points: [],
        risk: 'NO_ANALYSIS'
      },
      {
        analysisReason: 'NO_CONTROL_DATA',
        appliedThresholds: undefined,
        initialXvalue: 1691065800000,
        name: 'ccc',
        points: [],
        risk: 'NO_ANALYSIS'
      }
    ],
    deeplinkURL: undefined,
    healthSource: {
      identifier: 'abc_azure_metrics/azure_metrics_verify_step',
      name: 'azure metrics verify step',
      providerType: 'METRICS',
      type: 'AzureMetrics'
    },
    metricName: 'q1',
    nodeRiskCount: {
      anomalousNodeCount: 0,
      nodeRiskCounts: [
        { count: 0, displayName: 'Unhealthy', risk: 'UNHEALTHY' },
        { count: 0, displayName: 'Warning', risk: 'WARNING' },
        { count: 0, displayName: 'Healthy', risk: 'HEALTHY' }
      ],
      totalNodeCount: 3
    },
    risk: 'NO_ANALYSIS',
    selectedDataFormat: { label: 'Raw', value: 'raw' },
    testData: [
      {
        analysisReason: 'NO_CONTROL_DATA',
        appliedThresholds: ['aaa'],
        initialXvalue: 1691066700000,
        name: 'bbb',
        points: [
          { x: 240000, y: 12.26 },
          { x: 480000, y: 12.173333333333334 },
          { x: 540000, y: 12.103333333333333 }
        ],
        risk: 'NO_ANALYSIS'
      },
      {
        analysisReason: 'NO_CONTROL_DATA',
        appliedThresholds: ['aaa'],
        initialXvalue: 1691066460000,
        name: 'ccc',
        points: [
          { x: 0, y: 14.719999999999999 },
          { x: 60000, y: 15.396666666666667 },
          { x: 120000, y: 14.780000000000001 },
          { x: 180000, y: 14.99 },
          { x: 240000, y: 14.806666666666667 },
          { x: 300000, y: 14.393333333333334 },
          { x: 360000, y: 14.730000000000002 },
          { x: 420000, y: 14.806666666666667 },
          { x: 480000, y: 15.246666666666666 },
          { x: 540000, y: 14.646666666666667 }
        ],
        risk: 'NO_ANALYSIS'
      },
      {
        analysisReason: 'NO_CONTROL_DATA',
        appliedThresholds: ['aaa'],
        initialXvalue: 1691066460000,
        name: 'ddd',
        points: [
          { x: 0, y: 10.986666666666668 },
          { x: 60000, y: 14.563333333333336 },
          { x: 120000, y: 14.066666666666666 },
          { x: 180000, y: 13.716666666666667 },
          { x: 240000, y: 13.75 },
          { x: 300000, y: 13.81 },
          { x: 360000, y: 13.873333333333337 },
          { x: 420000, y: 14.116666666666665 },
          { x: 480000, y: 13.783333333333333 },
          { x: 540000, y: 14.31 }
        ],
        risk: 'NO_ANALYSIS'
      }
    ],
    thresholds: [
      {
        action: 'Ignore',
        criteria: { lessThanThreshold: 10, measurementType: 'ratio' },
        id: 'aaa',
        isUserDefined: false,
        thresholdType: 'IGNORE'
      }
    ],
    transactionName: 'g1'
  }
]
