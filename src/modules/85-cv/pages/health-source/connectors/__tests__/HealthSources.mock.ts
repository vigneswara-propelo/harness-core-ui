/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const metricPackValue = [{ identifier: 'Performance', metricThresholds: [] }]
export const riskCategoryMock = {
  metaData: {},
  resource: [
    { identifier: 'Errors', displayName: 'Errors', timeSeriesMetricType: 'ERROR', cvMonitoringCategory: 'Errors' },
    {
      identifier: 'Infrastructure',
      displayName: 'Infrastructure',
      timeSeriesMetricType: 'INFRA',
      cvMonitoringCategory: 'Infrastructure'
    },
    {
      identifier: 'Performance_Throughput',
      displayName: 'Performance/Throughput',
      timeSeriesMetricType: 'THROUGHPUT',
      cvMonitoringCategory: 'Performance'
    },
    {
      identifier: 'Performance_Other',
      displayName: 'Performance/Other',
      timeSeriesMetricType: 'OTHER',
      cvMonitoringCategory: 'Performance'
    },
    {
      identifier: 'Performance_ResponseTime',
      displayName: 'Performance/Response Time',
      timeSeriesMetricType: 'RESP_TIME',
      cvMonitoringCategory: 'Performance'
    }
  ],
  responseMessages: []
}

export const metricPacks = {
  metaData: {},
  resource: [
    {
      uuid: 'siJ_QMwKT8GxQZv4UQrLkw',
      accountId: '-k53qRQAQ1O7DBLb9ACnjQ',
      orgIdentifier: 'cvng',
      projectIdentifier: 'MSListing',
      dataSourceType: 'DYNATRACE',
      identifier: 'Infrastructure',
      category: 'Infrastructure',
      metrics: [
        {
          name: 'IO time',
          metricIdentifier: 'io_time',
          type: 'INFRA',
          path: 'builtin:service.keyRequest.ioTime',
          validationPath: 'builtin:service.keyRequest.ioTime',
          thresholds: [],
          included: true
        },
        {
          name: 'CPU per request',
          metricIdentifier: 'cpu_per_request',
          type: 'INFRA',
          path: 'builtin:service.keyRequest.cpu.perRequest',
          validationPath: 'builtin:service.keyRequest.cpu.perRequest',
          thresholds: [],
          included: true
        },
        {
          name: 'Time spent in DB calls',
          metricIdentifier: 'time_spent_in_db_calls',
          type: 'INFRA',
          path: 'builtin:service.keyRequest.dbChildCallTime',
          validationPath: 'builtin:service.keyRequest.keyRequest.dbChildCallTime',
          thresholds: [],
          included: true
        }
      ]
    },
    {
      uuid: 'ITs9uvCnQbS1cpSVWRGY9w',
      accountId: '-k53qRQAQ1O7DBLb9ACnjQ',
      orgIdentifier: 'cvng',
      projectIdentifier: 'MSListing',
      dataSourceType: 'DYNATRACE',
      identifier: 'Performance',
      category: 'Performance',
      metrics: [
        {
          name: 'Method Response time',
          metricIdentifier: 'method_response_time',
          type: 'RESP_TIME',
          path: 'builtin:service.keyRequest.response.time',
          validationPath: 'builtin:service.keyRequest.response.time',
          thresholds: [],
          included: true
        },
        {
          name: 'Number of server side errors',
          metricIdentifier: 'number_of_server_side_errors',
          type: 'ERROR',
          path: 'builtin:service.keyRequest.errors.server.count',
          validationPath: 'builtin:service.keyRequest.errors.server.count',
          thresholds: [],
          included: true
        },
        {
          name: 'Request Count total',
          metricIdentifier: 'request_count_total',
          type: 'THROUGHPUT',
          path: 'builtin:service.keyRequest.count.total',
          validationPath: 'builtin:service.keyRequest.count.total',
          thresholds: [],
          included: true
        }
      ]
    }
  ],
  responseMessages: []
}
