/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { sanitizeHTML } from '@common/utils/StringUtils'
import { formatDatetoLocale } from '@common/utils/dateUtils'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import { DatabaseInstallationCollection } from 'services/servicediscovery'

export interface ArgsType {
  PodName: string
  PodNamespace: string
}

export interface DAgentLogs {
  clusterLogs: string
  nodeLogs: string
}

/**
 * Data for a log unit/section
 */
export interface LogSectionData {
  /**
   * The log data
   */
  data: LogLineData[]
}

/**
 * Keys in the json from server
 */
export type TextKeys = 'level' | 'out' | 'time' | 'args'

export interface LogLineData {
  /**
   * Text for the line
   */
  text: Partial<Record<TextKeys, string | ArgsType>>
  /**
   * Indices of the search result with in the current line.
   * This will be a continous list
   *
   * If this values is `[3, 4]`, it means the result number 3 and 4 will be found in this line
   */
  searchIndices?: Partial<Record<TextKeys, number[]>>
}

const logger = loggerFor(ModuleName.CHAOS)

export function processLogsData(data: string): LogLineData[] {
  return String(data)
    .split('\n')
    .reduce<LogSectionData['data']>((accumulator, line) => {
      /* istanbul ignore else */
      if (line.length > 0) {
        try {
          const { level, time, out, args } = JSON.parse(line) as Record<string, string>
          accumulator.push({
            text: {
              level: sanitizeHTML(level),
              time: formatDatetoLocale(time),
              out: sanitizeHTML(out),
              args: args
            }
          })
        } catch (error) {
          logger.error(`Error while parsing logs: ${error}`)
        }
      }
      return accumulator
    }, [])
}

export function processAgentLogs(
  logData: string | undefined,
  installationList: DatabaseInstallationCollection | undefined
): DAgentLogs {
  const logsData = processLogsData(logData ?? '')
  let clusterLogs = ''
  let nodeLogs = ''
  const nodeNames: Array<string> = []
  installationList?.agentDetails?.node?.forEach(node => {
    if (node?.name) nodeNames.push(node?.name)
  })
  logsData.map(log => {
    if (installationList?.agentDetails?.cluster?.name === (log.text.args as ArgsType)?.PodName) {
      clusterLogs = clusterLogs + log.text.out + '\n'
    }
    if (nodeNames.includes((log.text.args as ArgsType)?.PodName)) {
      nodeLogs = nodeLogs + log.text.out + '\n'
    }
  })

  return {
    clusterLogs: clusterLogs.length ? clusterLogs : 'No cluster level logs found',
    nodeLogs: nodeLogs.length ? nodeLogs : 'No node level logs found'
  }
}
