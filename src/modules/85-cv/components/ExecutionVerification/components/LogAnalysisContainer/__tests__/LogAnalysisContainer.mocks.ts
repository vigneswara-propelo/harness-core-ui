/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { RestResponseLogAnalysisRadarChartListWithCountDTO } from 'services/cv'
import { ExecutionNode } from 'services/pipeline-ng'

export const mockedLogAnalysisData: RestResponseLogAnalysisRadarChartListWithCountDTO = {
  metaData: {},
  resource: {
    totalClusters: 1,
    eventCounts: [
      {
        clusterType: 'KNOWN_EVENT',
        count: 1,
        displayName: 'Known'
      },
      {
        clusterType: 'UNEXPECTED_FREQUENCY',
        count: 0,
        displayName: 'Unexpected Frequency'
      },
      {
        clusterType: 'UNKNOWN_EVENT',
        count: 0,
        displayName: 'Unknown'
      },
      {
        clusterType: 'BASELINE',
        count: 1,
        displayName: 'Baseline'
      }
    ],
    logAnalysisRadarCharts: {
      totalPages: 1,
      totalItems: 1,
      pageItemCount: 1,
      pageSize: 10,
      content: [
        {
          message: 'test data - host1 - log1',
          clusterId: '29659f5a-f6ad-308c-97dc-d54d0ac07c1c',
          label: 0,
          risk: 'HEALTHY',
          clusterType: 'KNOWN_EVENT',
          count: 8,

          testHostFrequencyData: [
            {
              frequencies: [
                {
                  timeStamp: 1672845420,
                  count: 1.0
                },
                {
                  timeStamp: 1672845480,
                  count: 0.0
                },
                {
                  timeStamp: 1672845540,
                  count: 0.0
                },
                {
                  timeStamp: 1672845600,
                  count: 0.0
                },
                {
                  timeStamp: 1672845660,
                  count: 0.0
                }
              ],
              host: 'host1'
            },
            {
              frequencies: [
                {
                  timeStamp: 1672845420,
                  count: 2.0
                },
                {
                  timeStamp: 1672845480,
                  count: 0.0
                },
                {
                  timeStamp: 1672845540,
                  count: 0.0
                },
                {
                  timeStamp: 1672845600,
                  count: 0.0
                },
                {
                  timeStamp: 1672845660,
                  count: 0.0
                }
              ],
              host: 'host2'
            },
            {
              frequencies: [
                {
                  timeStamp: 1672845420,
                  count: 0.0
                },
                {
                  timeStamp: 1672845480,
                  count: 0.0
                },
                {
                  timeStamp: 1672845540,
                  count: 0.0
                },
                {
                  timeStamp: 1672845600,
                  count: 2.0
                },
                {
                  timeStamp: 1672845660,
                  count: 2.0
                }
              ],
              host: 'host3'
            },
            {
              frequencies: [
                {
                  timeStamp: 1672845420,
                  count: 0.0
                },
                {
                  timeStamp: 1672845480,
                  count: 0.0
                },
                {
                  timeStamp: 1672845540,
                  count: 0.0
                },
                {
                  timeStamp: 1672845600,
                  count: 4.0
                },
                {
                  timeStamp: 1672845660,
                  count: 4.0
                }
              ],
              host: 'host4'
            }
          ],
          totalTestFrequencyData: [
            {
              timeStamp: 1672845420,
              count: 3.0
            },
            {
              timeStamp: 1672845480,
              count: 0.0
            },
            {
              timeStamp: 1672845540,
              count: 0.0
            },
            {
              timeStamp: 1672845600,
              count: 6.0
            },
            {
              timeStamp: 1672845660,
              count: 6.0
            }
          ],
          averageControlFrequencyData: [
            {
              timeStamp: 1672845060,
              count: 1
            },
            {
              timeStamp: 1672845120,
              count: 2
            },
            {
              timeStamp: 1672845180,
              count: 1
            },
            {
              timeStamp: 1672845240,
              count: 3
            },
            {
              timeStamp: 1672845300,
              count: 10
            }
          ]
        }
      ],
      pageIndex: 0,
      empty: false
    }
  },
  responseMessages: []
}

export const mockedLogChartsData = {
  metaData: {},
  resource: [
    {
      label: 0,
      message: 'projects/chi-play/logs/stdout',
      risk: 'HEALTHY',
      radius: 1.357564536113864,
      angle: 0.0,
      baseline: {
        label: 0,
        message: 'projects/chi-play/logs/stdout',
        risk: 'NO_ANALYSIS',
        radius: 0.5,
        angle: 0.0,
        baseline: null,
        clusterType: 'BASELINE',
        hasControlData: false
      },
      clusterType: 'KNOWN_EVENT',
      hasControlData: true
    },
    {
      label: 2,
      message: 'projects/chi-play/logs/stderr',
      risk: 'HEALTHY',
      radius: 1.8066135269309567,
      angle: 120.0,
      baseline: {
        label: 2,
        message: 'projects/chi-play/logs/stderr',
        risk: 'NO_ANALYSIS',
        radius: 0.2,
        angle: 120.0,
        baseline: null,
        clusterType: 'BASELINE',
        hasControlData: false
      },
      clusterType: 'KNOWN_EVENT',
      hasControlData: true
    },
    {
      label: 1,
      message: 'projects/chi-play/logs/events',
      risk: 'HEALTHY',
      radius: 1.480099986754282,
      angle: 240.0,
      baseline: {
        label: 1,
        message: 'projects/chi-play/logs/events',
        risk: 'NO_ANALYSIS',
        radius: 0.3698184595475662,
        angle: 240.0,
        baseline: null,
        clusterType: 'BASELINE',
        hasControlData: false
      },
      clusterType: 'KNOWN_EVENT',
      hasControlData: true
    }
  ],
  responseMessages: []
}

export const mockedHealthSourcesData = {
  data: {
    resource: [
      {
        identifier: 'GCO_Health_source',
        name: 'GCO Health source',
        type: 'STACKDRIVER_LOG'
      },
      {
        identifier: 'Appd_Health_source',
        name: 'Appd Health source',
        type: 'APP_DYNAMICS'
      }
    ]
  }
}

export const logsNodeNamesMock = {
  resource: ['V', 'W']
}

export const mockLogAnalysisDataWithNewEvent = {
  metaData: {},
  resource: {
    totalClusters: 1,
    eventCounts: [{ clusterType: 'NO_BASELINE_AVAILABLE', count: 1, displayName: 'No Baseline available' }],
    logAnalysisRadarCharts: {
      totalPages: 1,
      totalItems: 1,
      pageItemCount: 1,
      pageSize: 10,
      content: [
        {
          message: 'some other log message with NEW Event',
          clusterId: '67b09b91-6dcc-3731-be99-622ccaad5bb0',
          label: 0,
          risk: 'HEALTHY',
          previousRisk: 'HEALTHY',
          clusterType: 'NO_BASELINE_AVAILABLE',
          count: 6,
          testHostFrequencyData: [
            {
              frequencies: [
                { timeStamp: 1689152160, count: 0.0 },
                { timeStamp: 1689152220, count: 0.0 },
                { timeStamp: 1689152280, count: 0.0 },
                { timeStamp: 1689152340, count: 0.0 },
                { timeStamp: 1689152400, count: 6.0 }
              ],
              host: 'dummy'
            }
          ],
          totalTestFrequencyData: [
            { timeStamp: 1689152160, count: 0.0 },
            { timeStamp: 1689152220, count: 0.0 },
            { timeStamp: 1689152280, count: 0.0 },
            { timeStamp: 1689152340, count: 0.0 },
            { timeStamp: 1689152400, count: 6.0 }
          ],
          averageControlFrequencyData: [],
          hasControlData: false
        }
      ],
      pageIndex: 0,
      empty: false
    }
  },
  responseMessages: []
}

export const mockLogAnalysisDataWithAllEvent = {
  metaData: {},
  resource: {
    ...mockLogAnalysisDataWithNewEvent.resource,
    totalClusters: 1,
    eventCounts: [
      { clusterType: 'KNOWN_EVENT', count: 1, displayName: 'Known' },
      { clusterType: 'UNEXPECTED_FREQUENCY', count: 0, displayName: 'Unexpected Frequency' },
      { clusterType: 'UNKNOWN_EVENT', count: 0, displayName: 'Unknown' },
      { clusterType: 'NO_BASELINE_AVAILABLE', count: 0, displayName: 'No Baseline available' },
      { clusterType: 'BASELINE', count: 0, displayName: 'Baseline' }
    ]
  },
  responseMessages: []
}

export const defaultOverviewData = {
  spec: {
    analysedServiceIdentifier: 'svcqasignoffelasticsearch',
    analysedEnvIdentifier: 'envqasignoffelasticsearch',
    monitoredServiceType: 'DEFAULT',
    monitoredServiceIdentifier: 'svcqasignoffelasticsearch_envqasignoffelasticsearch',
    analysisType: 'AUTO',
    sensitivity: 'HIGH',
    durationInMinutes: 10,
    isFailOnNoAnalysis: true,
    baselineType: 'LAST'
  },
  appliedDeploymentAnalysisType: 'ROLLING',
  verificationStatus: 'ERROR',
  verificationProgressPercentage: 20,
  verificationStartTimestamp: 1689796661875,
  testNodes: {
    nodeType: 'POST_DEPLOYMENT',
    nodes: [
      {
        type: 'DEPLOYMENT_NODE',
        nodeIdentifier: 'cvng-qa-sign-off-appd-deployment-canary-58f5b67845-nrqcb',
        verificationResult: 'FAILED',
        failedMetrics: 0,
        failedLogClusters: 5
      },
      {
        type: 'DEPLOYMENT_NODE',
        nodeIdentifier: 'cvng-qa-sign-off-appd-deployment-canary-bccbf9dfb-t84mt',
        verificationResult: 'FAILED',
        failedMetrics: 0,
        failedLogClusters: 14
      },
      {
        type: 'DEPLOYMENT_NODE',
        nodeIdentifier: 'cvng-qa-sign-off-appd-deployment-canary-fbf5d4b79-j8fqx',
        verificationResult: 'FAILED',
        failedMetrics: 0,
        failedLogClusters: 4
      }
    ]
  },
  controlNodes: {
    nodeType: 'PRE_DEPLOYMENT',
    nodes: []
  },
  metricsAnalysis: {
    healthy: 0,
    warning: 0,
    unhealthy: 0,
    noAnalysis: 0
  },
  logClusters: {
    knownClustersCount: 0,
    unknownClustersCount: 14,
    unexpectedFrequencyClustersCount: 0
  },
  errorClusters: {
    knownClustersCount: 0,
    unknownClustersCount: 0,
    unexpectedFrequencyClustersCount: 0
  },
  controlDataStartTimestamp: 1689795960000,
  testDataStartTimestamp: 1689796620000
}

export const overviewDataWithBaselineData = {
  controlNodes: {
    nodeType: 'BASELINE_TEST',
    nodes: [
      {
        type: 'LOAD_TEST_NODE'
      }
    ]
  }
}

export const overviewDataWithBaselineDataWithTimestamp = {
  controlNodes: {
    nodeType: 'BASELINE_TEST',
    nodes: [
      {
        type: 'LOAD_TEST_NODE',
        testStartTimestamp: 1672845480000
      }
    ]
  }
}

export const initialRunningStepProps = {
  step: {
    status: 'Running',
    progressData: {
      activityId: 'activityId-1'
    }
  } as unknown as ExecutionNode,
  hostName: 'hostName-1'
}
