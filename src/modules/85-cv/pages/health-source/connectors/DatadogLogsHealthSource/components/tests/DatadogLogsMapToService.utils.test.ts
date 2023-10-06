import { DatadogLogsInfo } from '../../DatadogLogsHealthSource.type'
import { getCanShowServiceInstanceNames, getServiceInstanceFieldValue } from '../DatadogLogsMapToService.utils'

describe('DatadogLogsMapToService.utils.ts', () => {
  test('getCanShowServiceInstanceNames should return true when all condition matches', () => {
    const result = getCanShowServiceInstanceNames({ query: '*', serviceInstanceIdentifierTag: 'test' })

    expect(result).toBe(true)
  })

  test('getServiceInstanceFieldValue should give correct selected value', () => {
    const result = getServiceInstanceFieldValue({ serviceInstanceIdentifierTag: 'test' } as DatadogLogsInfo, [])

    expect(result).toEqual({ label: 'test', value: 'test' })
  })

  test('getServiceInstanceFieldValue should give correct selected value', () => {
    const result = getServiceInstanceFieldValue({ serviceInstanceIdentifierTag: 'test1' } as DatadogLogsInfo, [
      {
        label: 'test1',
        value: 'test1'
      }
    ])

    expect(result).toEqual({ label: 'test1', value: 'test1' })
  })
})
