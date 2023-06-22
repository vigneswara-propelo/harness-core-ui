import { ansiToJson } from 'anser'
import { flatten } from 'lodash-es'
import { State } from './LogsState/types'

export function getRawLogLines(state: State, filterByLogKey?: string): string[] {
  const filterFunc = (key: string): boolean => {
    return filterByLogKey ? key === filterByLogKey : true
  }

  return flatten(
    state.logKeys
      .filter(filterFunc)
      .map(key => {
        return state.dataMap[key]
      })
      .map(item => item.data)
  ).map(d => d.text?.out || '')
}

export function formatLogsForClipboard(data: string[]): string {
  return data
    .map(row => {
      return ansiToJson(row)
        .map(part => part.content)
        .join('')
    })
    .join('\n')
}
