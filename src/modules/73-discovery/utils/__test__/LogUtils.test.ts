/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { DatabaseInstallationCollection } from 'services/servicediscovery'
import { processAgentLogs, processLogsData } from '../LogUtils'
import { installations, mockLogData, mockLogDataResponse } from './mocks'

describe('LogUtils', () => {
  test('test function wih mock data', async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const logData = processLogsData(mockLogData)
    //deleting timestamp to remove flaky-ness
    logData.forEach(log => {
      delete log.text.time
    })
    expect(logData).toStrictEqual(mockLogDataResponse)
  })

  test('test function wih empty data', async () => {
    const logData = processLogsData('')
    expect(logData).toStrictEqual([])
  })
})

describe('processAgentLogs', () => {
  test('test function wih mock data', async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const logData = processAgentLogs(mockLogData, installations)
    expect(logData).toStrictEqual({
      clusterLogs: `{file:entry.go:41,func:github.com/wings-software/service-discovery/collector.Start,level:info,msg:go version go1.20.8,time:2023-10-04T04:30:15.872344691Z}
{file:entry.go:42,func:github.com/wings-software/service-discovery/collector.Start,level:info,msg:go os linux,time:2023-10-04T04:30:15.872758918Z}
`,
      nodeLogs: `{file:entry.go:42,func:github.com/wings-software/service-discovery/collector.Start,level:info,msg:go os linux,time:2023-10-04T04:30:15.872758918Z}
`
    })
  })

  test('test function wih empty data', async () => {
    const logData = processAgentLogs('', installations as DatabaseInstallationCollection)
    expect(logData).toStrictEqual({
      clusterLogs: 'No cluster level logs found',
      nodeLogs: 'No node level logs found'
    })
  })
})
