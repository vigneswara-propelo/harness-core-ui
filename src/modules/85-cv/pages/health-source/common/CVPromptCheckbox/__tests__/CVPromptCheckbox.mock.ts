import { CommonFormTypesForMetricThresholds } from '../../MetricThresholds/MetricThresholds.types'

export const formikMockValues: CommonFormTypesForMetricThresholds = {
  failFastThresholds: [],
  ignoreThresholds: [
    {
      metricType: 'Performance',
      groupName: 'testP2',
      metricName: 'a',
      type: 'IgnoreThreshold',
      spec: {
        action: 'Ignore'
      },
      criteria: {
        type: 'Percentage',
        spec: {
          lessThan: 1
        }
      }
    }
  ]
}
