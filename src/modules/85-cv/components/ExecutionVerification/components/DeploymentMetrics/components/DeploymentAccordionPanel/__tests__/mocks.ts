export const analysisRowMock = {
  controlData: [
    {
      points: [
        {
          x: 0,
          y: 83422
        }
      ],
      risk: 'WARNING',
      analysisReason: 'ML_ANALYSIS',
      name: 'prometheus',
      initialXvalue: 1687090620000,
      controlDataType: 'MINIMUM_DEVIATION'
    }
  ],
  testData: [
    {
      points: [
        {
          x: 0,
          y: 83470
        }
      ],
      risk: 'NO_ANALYSIS',
      analysisReason: 'ML_ANALYSIS',
      name: 'prometheus',
      initialXvalue: 1687091280000,
      controlDataType: 'MINIMUM_DEVIATION'
    }
  ],
  transactionName: 'G',
  metricName: 'Prometheus Metric',
  risk: 'NO_ANALYSIS',
  nodeRiskCount: {
    totalNodeCount: 1,
    anomalousNodeCount: 0,
    nodeRiskCounts: [
      {
        risk: 'UNHEALTHY',
        count: 0,
        displayName: 'Unhealthy'
      },
      {
        risk: 'NO_ANALYSIS',
        count: 1,
        displayName: 'Warning'
      },
      {
        risk: 'HEALTHY',
        count: 0,
        displayName: 'Healthy'
      }
    ]
  },
  thresholds: [],
  healthSource: {
    identifier: 'svcstageprometheus_envshsprometheus/publicprometheusserver',
    name: 'public-prometheus-server',
    type: 'Prometheus',
    providerType: 'METRICS'
  },
  deeplinkURL:
    'https://prometheus.demo.do.prometheus.io/graph?g0.step_input=60&g0.expr=prometheus_http_requests_total%09%7B%0A%0A%09%09job%3D%22prometheus%22%2C%0A%09%09job%3D%22prometheus%22%0A%0A%7D&g0.range_input=10m&g0.end_input=2023-06-18+12%3A38&g0.tab=0',
  selectedDataFormat: {
    label: 'Raw',
    value: 'raw'
  }
}
