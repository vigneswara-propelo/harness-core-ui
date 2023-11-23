/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { DatadogLogsQueryDefinition } from '@cv/pages/health-source/connectors/DatadogLogsHealthSource/DatadogLogsHealthSource.type'

export const DatadogLogQueryMock: DatadogLogsQueryDefinition = {
  query: '*',
  serviceInstanceIdentifier: 'todolist',
  name: 'TestDatadogLogQuery',
  indexes: []
}
export const MockRecordsData = [
  {
    attributes: {
      tags: ['tag1', 'tag2', 'tag3']
    }
  },
  {
    attributes: {
      tags: ['tag1', 'tag2', 'tag3']
    }
  },
  {
    attributes: {
      tags: ['tag1', 'tag2', 'tag3']
    }
  }
]

export const queryParamsMock = {
  queryParams: {
    accountId: ':accountId',
    connectorIdentifier: undefined,
    orgIdentifier: ':orgIdentifier',
    projectIdentifier: ':projectIdentifier',
    tracingId: expect.any(String)
  }
}
